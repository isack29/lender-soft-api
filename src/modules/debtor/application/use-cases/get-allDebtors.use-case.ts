import { Inject, Injectable } from '@nestjs/common';
import { IDebtorRepository } from '../../domain/debtor.respository';
import { User } from '@prisma/client';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class GetAllDebtorsUseCase {
  constructor(
    @Inject('IDebtorRepository')
    private readonly iDebtorRepository: IDebtorRepository,
  ) {}

  async getAllDebtorsByLenderId(user: User, paginationDto: PaginationDto) {
    console.log(user.lastname);
    const result = await this.iDebtorRepository.findAllBebtorsByLenderId(
      user.id,
      paginationDto,
    );

    console.log(result);
    return result;
  }
}
