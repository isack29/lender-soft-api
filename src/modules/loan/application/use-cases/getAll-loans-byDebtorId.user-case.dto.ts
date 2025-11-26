import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ILoanRepository } from '../../domain/loan.repository';
import { IDebtorRepository } from 'src/modules/debtor/domain/debtor.respository';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class GetAllLoansByDebtorIdUseCase {
  constructor(
    @Inject('ILoanRepository')
    private readonly iLoanRepository: ILoanRepository,
    @Inject('IDebtorRepository')
    private readonly iDebtorRepository: IDebtorRepository,
  ) {}

  async getAllLoansByDeptorId(debtorId: string, paginationDto: PaginationDto) {
    const existingDebtor =
      await this.iDebtorRepository.findDebtorById(debtorId);

    if (!existingDebtor) {
      throw new NotFoundException('debtor not found');
    }

    return await this.iLoanRepository.findAllLoansByDebtorId(
      debtorId,
      paginationDto,
    );
  }
}
