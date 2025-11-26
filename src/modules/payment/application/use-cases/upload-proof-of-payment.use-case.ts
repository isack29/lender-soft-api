import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { IPaymentRepository } from '../../domain/payment.repository';
import { S3Service } from 'src/infraestructure/storage/s3.service';
import { PrismaService } from 'src/infraestructure/database/prisma/prisma.service';

interface UploadedFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}

interface ProofOfPaymentWithKey {
  id: string;
  key: string;
  url: string;
  paymentId: string;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UploadProofOfPaymentUseCase {
  constructor(
    @Inject('IPaymentRepository')
    private readonly iPaymentRepository: IPaymentRepository,
    private readonly s3Service: S3Service,
    private readonly prismaService: PrismaService,
  ) {}

  private isValidProof(proof: unknown): proof is ProofOfPaymentWithKey {
    return (
      proof !== null &&
      typeof proof === 'object' &&
      'key' in proof &&
      typeof (proof as ProofOfPaymentWithKey).key === 'string' &&
      'deleted' in proof &&
      typeof (proof as ProofOfPaymentWithKey).deleted === 'boolean'
    );
  }

  async uploadProof(
    paymentId: string,
    lenderId: string,
    file: UploadedFile | undefined,
  ) {
    // Validar que el archivo existe
    if (!file) {
      throw new BadRequestException('file is required');
    }
    // 1. Verificar que el pago existe y obtener el loan
    const payment = await this.iPaymentRepository.findPaymentById(paymentId);

    if (!payment) {
      throw new NotFoundException('payment not found');
    }

    // 2. Verificar que el pago pertenece al lender autenticado
    // Necesitamos obtener el loan para verificar el userId
    const loan = await this.prismaService.loan.findUnique({
      where: { id: payment.loanId },
    });

    if (!loan) {
      throw new NotFoundException('loan not found');
    }

    if (loan.userId !== lenderId) {
      throw new UnauthorizedException(
        "you can't upload proof for this payment",
      );
    }

    // 3. Si ya existe un comprobante, eliminarlo de S3
    const existingProof = await this.prismaService.proofOfPayment.findUnique({
      where: { paymentId },
    });

    if (this.isValidProof(existingProof) && !existingProof.deleted) {
      await this.s3Service.deleteFile(existingProof.key);
    }

    // 4. Subir el nuevo archivo a S3
    const uploadResult = await this.s3Service.uploadFile(
      {
        buffer: file.buffer,
        mimetype: file.mimetype,
        originalname: file.originalname,
        folder: 'proofs-of-payment',
      },
      ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
    );

    // 5. Guardar o actualizar el comprobante en la base de datos (guardar URL normal)
    if (existingProof && !existingProof.deleted) {
      // Actualizar
      await this.prismaService.proofOfPayment.update({
        where: { id: existingProof.id },
        data: {
          key: uploadResult.key,
          url: uploadResult.url,
          deleted: false,
        },
      });
    } else if (existingProof && existingProof.deleted) {
      // Reactivar comprobante eliminado
      await this.prismaService.proofOfPayment.update({
        where: { id: existingProof.id },
        data: {
          key: uploadResult.key,
          url: uploadResult.url,
          deleted: false,
        },
      });
    } else {
      // Crear
      await this.prismaService.proofOfPayment.create({
        data: {
          key: uploadResult.key,
          url: uploadResult.url,
          paymentId: paymentId,
        },
      });
    }

    // 6. Generar y retornar URL firmada (1 hora)
    const signedUrl = await this.s3Service.getSignedUrl(uploadResult.key, 3600);

    return {
      key: uploadResult.key,
      url: signedUrl,
    };
  }

  async deleteProof(paymentId: string, lenderId: string) {
    // 1. Verificar que el pago existe
    const payment = await this.iPaymentRepository.findPaymentById(paymentId);

    if (!payment) {
      throw new NotFoundException('payment not found');
    }

    // 2. Verificar que el pago pertenece al lender autenticado
    const loan = await this.prismaService.loan.findUnique({
      where: { id: payment.loanId },
    });

    if (!loan) {
      throw new NotFoundException('loan not found');
    }

    if (loan.userId !== lenderId) {
      throw new UnauthorizedException(
        "you can't delete proof for this payment",
      );
    }

    // 3. Verificar que existe un comprobante
    const existingProof = await this.prismaService.proofOfPayment.findUnique({
      where: { paymentId },
    });

    if (!this.isValidProof(existingProof) || existingProof.deleted) {
      throw new NotFoundException('proof of payment not found');
    }

    // 4. Eliminar de S3
    await this.s3Service.deleteFile(existingProof.key);

    // 5. Marcar como eliminado en la base de datos (soft delete)
    await this.prismaService.proofOfPayment.update({
      where: { id: existingProof.id },
      data: { deleted: true },
    });

    return { message: 'proof of payment deleted successfully' };
  }

  async getProofUrl(paymentId: string, lenderId: string) {
    // 1. Verificar que el pago existe
    const payment = await this.iPaymentRepository.findPaymentById(paymentId);

    if (!payment) {
      throw new NotFoundException('payment not found');
    }

    // 2. Verificar que el pago pertenece al lender autenticado
    const loan = await this.prismaService.loan.findUnique({
      where: { id: payment.loanId },
    });

    if (!loan) {
      throw new NotFoundException('loan not found');
    }

    if (loan.userId !== lenderId) {
      throw new UnauthorizedException("you can't access this proof");
    }

    // 3. Obtener el comprobante
    const proof = await this.prismaService.proofOfPayment.findUnique({
      where: { paymentId },
    });

    if (!this.isValidProof(proof) || proof.deleted) {
      throw new NotFoundException('proof of payment not found');
    }

    // 4. Generar URL firmada válida por 1 hora
    const signedUrl = await this.s3Service.getSignedUrl(proof.key, 3600);

    return {
      url: signedUrl,
      key: proof.key,
    };
  }
}
