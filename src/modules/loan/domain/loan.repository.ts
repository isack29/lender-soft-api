import { Loan, Installment, Payment, User, Debtor } from '@prisma/client';
import { CreateLoanDto } from '../application/dto/create-loan.dto';
import { UpdateLoanDto } from '../application/dto/update-loan.dto';
import { UpdateLoanStatusDto } from '../application/dto/update-loan-status.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export type LoanWithInstallments = Loan & {
  installments: Installment[];
  payments: Payment[];
};

export type LoanWithRelations = Loan & {
  user: User;
  debtor: Debtor;
  installments: Installment[];
  payments: Payment[];
};

export interface ILoanRepository {
  createLoan(
    debtorId: string,
    createLoanDto: CreateLoanDto,
    lenderId: string,
    totalWithInterest: number,
  ): Promise<Loan>;
  findLoanById(loanId: string): Promise<LoanWithInstallments | null>;
  findLoanWithRelations(loanId: string): Promise<LoanWithRelations | null>;
  findAllLoansByDebtorId(
    debtorId: string,
    paginationDto: PaginationDto,
  ): Promise<Loan[] | null>;
  findAllLoansByLenderId(
    lenderId: string,
    paginationDto: PaginationDto,
  ): Promise<Loan[] | null>;
  updateLoan(loanId: string, updateLoanDto: UpdateLoanDto): Promise<Loan>;
  updateLoanStatus(
    loanId: string,
    updateLoanStatusDto: UpdateLoanStatusDto,
  ): Promise<Loan>;
  deleteLoanById(loanId: string): Promise<Loan | null>;
}
