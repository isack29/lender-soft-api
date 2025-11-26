import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { IDebtorRepository } from '../../domain/debtor.respository';
import { User } from '@prisma/client';

@Injectable()
export class GetDebtorByIdUseCase {
  constructor(
    @Inject('IDebtorRepository')
    private readonly iDebtorRepository: IDebtorRepository,
  ) {}

  async getDebtorById(debtorId: string, user: User) {
    const debtorById = await this.iDebtorRepository.findDebtorById(debtorId);

    if (!debtorById) {
      throw new NotFoundException('debtor not found');
    }

    if (debtorById.userId !== user.id) {
      throw new UnauthorizedException("u can't access to this debtor");
    }

    return debtorById;
  }
}
