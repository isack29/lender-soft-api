import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ILoanRepository } from '../../domain/loan.repository';
import { UpdateLoanStatusDto } from '../dto/update-loan-status.dto';

@Injectable()
export class UpdateLoanStatusUseCase {
  constructor(
    @Inject('ILoanRepository')
    private readonly iLoanRepository: ILoanRepository,
  ) {}

  async updateLoanStatus(
    loanId: string,
    updateLoanStatusDto: UpdateLoanStatusDto,
    lenderId: string,
  ) {
    // Verificar que el préstamo existe
    const loan = await this.iLoanRepository.findLoanById(loanId);

    if (!loan) {
      throw new NotFoundException('loan not found');
    }

    // Verificar que el préstamo pertenece al lender
    if (loan.userId !== lenderId) {
      throw new UnauthorizedException("you can't update this loan status");
    }

    // Actualizar solo el estado
    return await this.iLoanRepository.updateLoanStatus(
      loanId,
      updateLoanStatusDto,
    );
  }
}
