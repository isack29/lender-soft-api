import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ILoanRepository } from '../../domain/loan.repository';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class GetAllLoansByLenderIdUseCase {
  constructor(
    @Inject('ILoanRepository')
    private readonly iloanRepository: ILoanRepository,
  ) {}

  async getLoansByLenderId(lenderId: string, paginationDto: PaginationDto) {
    const loans = await this.iloanRepository.findAllLoansByLenderId(
      lenderId,
      paginationDto,
    );

    if (!loans) {
      throw new NotFoundException('loans not found');
    }
    return loans;
  }
}
