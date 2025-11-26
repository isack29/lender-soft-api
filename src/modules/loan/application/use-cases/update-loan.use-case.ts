import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ILoanRepository } from '../../domain/loan.repository';
import { UpdateLoanDto } from '../dto/update-loan.dto';

@Injectable()
export class UpdateLoanUseCase {
  constructor(
    @Inject('ILoanRepository')
    private readonly iLoanRepository: ILoanRepository,
  ) {}

  async updateLoan(
    loanId: string,
    updateLoanDto: UpdateLoanDto,
    lenderId: string,
  ) {
    // Verificar que el préstamo existe
    const loan = await this.iLoanRepository.findLoanById(loanId);

    if (!loan) {
      throw new NotFoundException('loan not found');
    }

    // Verificar que el préstamo pertenece al lender
    if (loan.userId !== lenderId) {
      throw new UnauthorizedException("you can't update this loan");
    }

    // Validar que no tenga pagos asociados
    if (loan.payments.length > 0) {
      throw new BadRequestException(
        'Cannot update loan with associated payments',
      );
    }

    // Validar que no tenga cuotas generadas
    if (loan.installments.length > 0) {
      throw new BadRequestException(
        'Cannot update loan with generated installments',
      );
    }

    // Actualizar el préstamo
    return await this.iLoanRepository.updateLoan(loanId, updateLoanDto);
  }
}
