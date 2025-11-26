import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { IPaymentRepository } from '../../domain/payment.repository';
import { ILoanRepository } from 'src/modules/loan/domain/loan.repository';
import { User } from '@prisma/client';

@Injectable()
export class DeletePaymentUseCase {
  constructor(
    @Inject('IPaymentRepository')
    private readonly iPaymentRepository: IPaymentRepository,
    @Inject('ILoanRepository')
    private readonly iLoanRepository: ILoanRepository,
  ) {}

  async deletePayment(paymentId: string, user: User) {
    // Verificar que el pago existe
    const payment = await this.iPaymentRepository.findPaymentById(paymentId);

    if (!payment) {
      throw new NotFoundException('payment not found');
    }

    // Verificar que el pago pertenece a un préstamo del lender
    const loan = await this.iLoanRepository.findLoanById(payment.loanId);

    if (!loan || loan.userId !== user.id) {
      throw new UnauthorizedException("you can't delete this payment");
    }

    return await this.iPaymentRepository.deletePayment(paymentId);
  }
}
