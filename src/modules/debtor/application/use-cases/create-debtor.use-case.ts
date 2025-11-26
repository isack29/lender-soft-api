import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { IDebtorRepository } from '../../domain/debtor.respository';
import { CreateDebtorDto } from '../dto/create-debtor.dto';
import { User } from '@prisma/client';

@Injectable()
export class CreateDebtorUseCase {
  constructor(
    @Inject('IDebtorRepository')
    private readonly iDebtorRepository: IDebtorRepository,
  ) {}

  async createDebtor(createDebtorDto: CreateDebtorDto, lender: User) {
    const existingDebtorByEmail =
      await this.iDebtorRepository.findDebtorByEmail(createDebtorDto.email);

    if (existingDebtorByEmail) {
      throw new ConflictException('Email already in use');
    }

    const existingDebtorByDocument =
      await this.iDebtorRepository.findDebtorByDocument(
        createDebtorDto.document,
      );

    if (existingDebtorByDocument) {
      throw new ConflictException('document already in use');
    }

    const existingDebtorByPhone =
      await this.iDebtorRepository.findDebtorByPhone(createDebtorDto.phone);

    if (existingDebtorByPhone) {
      throw new ConflictException('phone already in use');
    }

    const createDebtor = await this.iDebtorRepository.createDebtor(
      lender,
      createDebtorDto,
    );

    return createDebtor;
  }
}
