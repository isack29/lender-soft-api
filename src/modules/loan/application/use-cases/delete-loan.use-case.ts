import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ILoanRepository } from '../../domain/loan.repository';

@Injectable()
export class DeleteLoanByIdUseCase {
  constructor(
    @Inject('ILoanRepository')
    private readonly iloanRepository: ILoanRepository,
  ) {}

  async deleteLoanById(loanId: string, lenderId: string) {
    const loan = await this.iloanRepository.findLoanById(loanId);
    if (!loan) {
      throw new NotFoundException('loan not found');
    }

    if (loan.userId !== lenderId) {
      throw new UnauthorizedException("u can't delete this loan");
    }
    // Validar que no tenga pagos activos (no eliminados) asociados
    const activePayments = loan.payments.filter((payment) => !payment.deleted);
    if (activePayments.length > 0) {
      throw new BadRequestException(
        'Cannot delete loan with associated active payments',
      );
    }

    return await this.iloanRepository.deleteLoanById(loanId);
  }
}
