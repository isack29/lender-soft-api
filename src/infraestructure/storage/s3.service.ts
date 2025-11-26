import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

export interface UploadResult {
  key: string;
  url: string;
  bucket: string;
}

export interface FileToUpload {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  folder?: string;
}

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;
  private readonly logger = new Logger(S3Service.name);

  constructor(private readonly configService: ConfigService) {
    this.region = this.configService.get<string>('AWS_REGION', 'us-east-1');
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME', '');

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID', ''),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
          '',
        ),
      },
    });

    this.logger.log(`S3 Service initialized with bucket: ${this.bucketName}`);
  }

  /**
   * Genera una key única para el archivo
   */
  private generateFileKey(
    originalname: string,
    folder?: string,
  ): { key: string; extension: string } {
    const extension = originalname.split('.').pop() || '';
    const uniqueId = randomUUID();
    const timestamp = Date.now();
    const sanitizedName = originalname
      .split('.')[0]
      .replace(/[^a-zA-Z0-9]/g, '-')
      .toLowerCase();

    const filename = `${sanitizedName}-${timestamp}-${uniqueId}.${extension}`;
    const key = folder ? `${folder}/${filename}` : filename;

    return { key, extension };
  }

  /**
   * Valida el tipo de archivo
   */
  private validateFileType(mimetype: string, allowedTypes: string[]): boolean {
    return allowedTypes.some((type) => {
      if (type.endsWith('/*')) {
        const baseType = type.split('/')[0];
        return mimetype.startsWith(`${baseType}/`);
      }
      return mimetype === type;
    });
  }

  /**
   * Sube un archivo a S3
   */
  async uploadFile(
    file: FileToUpload,
    allowedMimeTypes: string[] = ['image/*', 'application/pdf'],
  ): Promise<UploadResult> {
    try {
      // Validar tipo de archivo
      if (!this.validateFileType(file.mimetype, allowedMimeTypes)) {
        throw new Error(
          `File type ${file.mimetype} is not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`,
        );
      }

      // Generar key única
      const { key } = this.generateFileKey(file.originalname, file.folder);

      // Preparar comando de subida
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        // Metadata adicional
        Metadata: {
          originalName: file.originalname,
          uploadDate: new Date().toISOString(),
        },
      });

      // Subir archivo
      await this.s3Client.send(command);

      // Construir URL pública (si el bucket es público) o generar URL firmada
      const url = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;

      this.logger.log(`File uploaded successfully: ${key}`);

      return {
        key,
        url,
        bucket: this.bucketName,
      };
    } catch (error) {
      this.logger.error('Error uploading file to S3', error);
      throw new Error(
        `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Genera una URL firmada para acceso temporal al archivo
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      this.logger.log(`Generated signed URL for: ${key}`);
      return signedUrl;
    } catch (error) {
      this.logger.error('Error generating signed URL', error);
      throw new Error(
        `Failed to generate signed URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Elimina un archivo de S3
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error('Error deleting file from S3', error);
      throw new Error(
        `Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Verifica si un archivo existe en S3
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      if (
        error instanceof Error &&
        'name' in error &&
        error.name === 'NotFound'
      ) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Sube múltiples archivos en paralelo
   */
  async uploadMultipleFiles(
    files: FileToUpload[],
    allowedMimeTypes: string[] = ['image/*', 'application/pdf'],
  ): Promise<UploadResult[]> {
    try {
      const uploadPromises = files.map((file) =>
        this.uploadFile(file, allowedMimeTypes),
      );

      const results = await Promise.all(uploadPromises);
      this.logger.log(`${files.length} files uploaded successfully`);

      return results;
    } catch (error) {
      this.logger.error('Error uploading multiple files', error);
      throw new Error(
        `Failed to upload files: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Elimina múltiples archivos en paralelo
   */
  async deleteMultipleFiles(keys: string[]): Promise<void> {
    try {
      const deletePromises = keys.map((key) => this.deleteFile(key));
      await Promise.all(deletePromises);
      this.logger.log(`${keys.length} files deleted successfully`);
    } catch (error) {
      this.logger.error('Error deleting multiple files', error);
      throw new Error(
        `Failed to delete files: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
