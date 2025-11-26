import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IPaymentRepository } from '../../domain/payment.repository';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { User } from '@prisma/client';

@Injectable()
export class GetAllPaymentsByLenderIdUseCase {
  constructor(
    @Inject('IPaymentRepository')
    private readonly iPaymentRepository: IPaymentRepository,
  ) {}

  async getAllPaymentsByLenderId(user: User, paginationDto: PaginationDto) {
    const payments = await this.iPaymentRepository.findAllPaymentsByLenderId(
      user.id,
      paginationDto,
    );

    if (!payments) {
      throw new NotFoundException('payments not found');
    }

    return payments;
  }
}
