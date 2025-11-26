import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { IPaymentRepository } from '../../domain/payment.repository';
import { ILoanRepository } from 'src/modules/loan/domain/loan.repository';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { User } from '@prisma/client';

@Injectable()
export class GetAllPaymentsByLoanIdUseCase {
  constructor(
    @Inject('IPaymentRepository')
    private readonly iPaymentRepository: IPaymentRepository,
    @Inject('ILoanRepository')
    private readonly iLoanRepository: ILoanRepository,
  ) {}

  async getAllPaymentsByLoanId(
    loanId: string,
    paginationDto: PaginationDto,
    user: User,
  ) {
    // Verificar que el préstamo existe
    const loan = await this.iLoanRepository.findLoanById(loanId);

    if (!loan) {
      throw new NotFoundException('loan not found');
    }

    // Verificar que el préstamo pertenece al lender
    if (loan.userId !== user.id) {
      throw new UnauthorizedException(
        "you can't access payments for this loan",
      );
    }

    const payments = await this.iPaymentRepository.findAllPaymentsByLoanId(
      loanId,
      paginationDto,
    );

    if (!payments) {
      throw new NotFoundException('payments not found');
    }

    return payments;
  }
}
