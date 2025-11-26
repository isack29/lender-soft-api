import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/infraestructure/database/prisma/prisma.module';
import { StorageModule } from 'src/infraestructure/storage/storage.module';
import { PaymentRepository } from './prisma-payment.repository';
import { PaymentController } from '../presentation/payment.controller';
import { CreatePaymentUseCase } from '../application/use-cases/create-payment.use-case';
import { GetPaymentByIdUseCase } from '../application/use-cases/get-paymentById.use-case';
import { GetAllPaymentsByLoanIdUseCase } from '../application/use-cases/get-allPayments-byLoanId.use-case';
import { GetAllPaymentsByLenderIdUseCase } from '../application/use-cases/get-allPayments-byLenderId.use-case';
import { DeletePaymentUseCase } from '../application/use-cases/delete-payment.use-case';
import { UploadProofOfPaymentUseCase } from '../application/use-cases/upload-proof-of-payment.use-case';
import { LoanModule } from 'src/modules/loan/infra/loan.module';
import { InstallmentModule } from 'src/modules/installment/infra/installment.module';

@Module({
  imports: [PrismaModule, LoanModule, InstallmentModule, StorageModule],
  controllers: [PaymentController],
  providers: [
    {
      provide: 'IPaymentRepository',
      useClass: PaymentRepository,
    },
    CreatePaymentUseCase,
    GetPaymentByIdUseCase,
    GetAllPaymentsByLoanIdUseCase,
    GetAllPaymentsByLenderIdUseCase,
    DeletePaymentUseCase,
    UploadProofOfPaymentUseCase,
  ],
  exports: ['IPaymentRepository'],
})
export class PaymentModule {}
