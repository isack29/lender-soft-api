import { Installment } from '@prisma/client';

export interface IInstallmentRepository {
  createInstallment(
    loanId: string,
    dueDate: Date,
    amountDue: number,
  ): Promise<Installment>;
  findInstallmentById(installmentId: string): Promise<Installment | null>;
  findInstallmentsByLoanId(loanId: string): Promise<Installment[]>;
}
