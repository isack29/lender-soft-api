import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ILoanRepository } from '../../domain/loan.repository';

@Injectable()
export class GetLoanByIdUseCase {
  constructor(
    @Inject('ILoanRepository')
    private readonly iLoanRepository: ILoanRepository,
  ) {}

  async getLoanById(loanId: string) {
    const newLoan = await this.iLoanRepository.findLoanById(loanId);

    if (!newLoan) {
      throw new NotFoundException('loan not found');
    }

    return newLoan;
  }
}
