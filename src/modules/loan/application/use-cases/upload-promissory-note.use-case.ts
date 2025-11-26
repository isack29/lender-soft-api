import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ILoanRepository } from '../../domain/loan.repository';
import { S3Service } from 'src/infraestructure/storage/s3.service';
import { PrismaService } from 'src/infraestructure/database/prisma/prisma.service';

interface UploadedFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}

interface PromissoryNoteWithKey {
  id: string;
  key: string;
  url: string;
  loanId: string;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UploadPromissoryNoteUseCase {
  constructor(
    @Inject('ILoanRepository')
    private readonly iLoanRepository: ILoanRepository,
    private readonly s3Service: S3Service,
    private readonly prismaService: PrismaService,
  ) {}

  private isValidPromissoryNote(note: unknown): note is PromissoryNoteWithKey {
    return (
      note !== null &&
      typeof note === 'object' &&
      'key' in note &&
      typeof (note as PromissoryNoteWithKey).key === 'string' &&
      'deleted' in note &&
      typeof (note as PromissoryNoteWithKey).deleted === 'boolean'
    );
  }

  async uploadPromissoryNote(
    loanId: string,
    lenderId: string,
    file: UploadedFile | undefined,
  ) {
    // Validar que el archivo existe
    if (!file) {
      throw new BadRequestException('file is required');
    }

    // 1. Verificar que el préstamo existe
    const loan = await this.iLoanRepository.findLoanById(loanId);

    if (!loan) {
      throw new NotFoundException('loan not found');
    }

    // 2. Verificar que el préstamo pertenece al lender autenticado
    if (loan.userId !== lenderId) {
      throw new UnauthorizedException(
        "you can't upload promissory note for this loan",
      );
    }

    // 3. Si ya existe un pagaré, eliminarlo de S3
    const existingNote = await this.prismaService.promissoryNote.findUnique({
      where: { loanId },
    });

    if (this.isValidPromissoryNote(existingNote) && !existingNote.deleted) {
      await this.s3Service.deleteFile(existingNote.key);
    }

    // 4. Subir el nuevo archivo a S3
    const uploadResult = await this.s3Service.uploadFile(
      {
        buffer: file.buffer,
        mimetype: file.mimetype,
        originalname: file.originalname,
        folder: 'promissory-notes',
      },
      [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/msword', // .doc
      ],
    );

    // 5. Guardar o actualizar el pagaré en la base de datos (guardamos URL normal)
    if (existingNote && !existingNote.deleted) {
      // Actualizar
      await this.prismaService.promissoryNote.update({
        where: { id: existingNote.id },
        data: {
          key: uploadResult.key,
          url: uploadResult.url,
          deleted: false,
        },
      });
    } else if (existingNote && existingNote.deleted) {
      // Reactivar pagaré eliminado
      await this.prismaService.promissoryNote.update({
        where: { id: existingNote.id },
        data: {
          key: uploadResult.key,
          url: uploadResult.url,
          deleted: false,
        },
      });
    } else {
      // Crear
      await this.prismaService.promissoryNote.create({
        data: {
          key: uploadResult.key,
          url: uploadResult.url,
          loanId: loanId,
        },
      });
    }

    // 6. Retornar URL firmada (1 hora) para consumo inmediato
    const signedUrl = await this.s3Service.getSignedUrl(uploadResult.key, 3600);

    return {
      key: uploadResult.key,
      url: signedUrl,
    };
  }

  async deletePromissoryNote(loanId: string, lenderId: string) {
    // 1. Verificar que el préstamo existe
    const loan = await this.iLoanRepository.findLoanById(loanId);

    if (!loan) {
      throw new NotFoundException('loan not found');
    }

    // 2. Verificar que el préstamo pertenece al lender autenticado
    if (loan.userId !== lenderId) {
      throw new UnauthorizedException(
        "you can't delete promissory note for this loan",
      );
    }

    // 3. Verificar que existe un pagaré
    const existingNote = await this.prismaService.promissoryNote.findUnique({
      where: { loanId },
    });

    if (!this.isValidPromissoryNote(existingNote) || existingNote.deleted) {
      throw new NotFoundException('promissory note not found');
    }

    // 4. Eliminar de S3
    await this.s3Service.deleteFile(existingNote.key);

    // 5. Marcar como eliminado en la base de datos (soft delete)
    await this.prismaService.promissoryNote.update({
      where: { id: existingNote.id },
      data: { deleted: true },
    });

    return { message: 'promissory note deleted successfully' };
  }

  async getPromissoryNoteUrl(loanId: string, lenderId: string) {
    // 1. Verificar que el préstamo existe
    const loan = await this.iLoanRepository.findLoanById(loanId);

    if (!loan) {
      throw new NotFoundException('loan not found');
    }

    // 2. Verificar que el préstamo pertenece al lender autenticado
    if (loan.userId !== lenderId) {
      throw new UnauthorizedException("you can't access this promissory note");
    }

    // 3. Obtener el pagaré
    const note = await this.prismaService.promissoryNote.findUnique({
      where: { loanId },
    });

    if (!this.isValidPromissoryNote(note) || note.deleted) {
      throw new NotFoundException('promissory note not found');
    }

    // 4. Generar URL firmada válida por 1 hora
    const signedUrl = await this.s3Service.getSignedUrl(note.key, 3600);

    return {
      url: signedUrl,
      key: note.key,
    };
  }
}
