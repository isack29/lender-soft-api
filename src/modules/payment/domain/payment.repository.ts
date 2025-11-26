import { Payment } from '@prisma/client';
import { CreatePaymentDto } from '../application/dto/create-payment.dto';
import { UpdatePaymentDto } from '../application/dto/update-payment.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export interface IPaymentRepository {
  createPayment(createPaymentDto: CreatePaymentDto): Promise<Payment>;
  findPaymentById(paymentId: string): Promise<Payment | null>;
  findAllPaymentsByLoanId(
    loanId: string,
    paginationDto: PaginationDto,
  ): Promise<Payment[] | null>;
  findAllPaymentsByLenderId(
    lenderId: string,
    paginationDto: PaginationDto,
  ): Promise<Payment[] | null>;
  updatePayment(
    paymentId: string,
    updatePaymentDto: UpdatePaymentDto,
  ): Promise<Payment>;
  deletePayment(paymentId: string): Promise<Payment | null>;
}
