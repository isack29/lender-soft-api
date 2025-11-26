import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { IDebtorRepository } from '../../domain/debtor.respository';
import { User } from '@prisma/client';

@Injectable()
export class DeleteDebtorUseCase {
  constructor(
    @Inject('IDebtorRepository')
    private readonly iDebtorRepository: IDebtorRepository,
  ) {}

  async deleteDebtor(debtorId: string, user: User) {
    const debtorById = await this.iDebtorRepository.findDebtorById(debtorId);

    if (!debtorById) {
      throw new NotFoundException('debtor not found');
    }

    if (debtorById.userId !== user.id) {
      throw new UnauthorizedException("u can't access to this debtor");
    }

    const deletedDebtor = await this.iDebtorRepository.deleteDebtor(
      debtorById.id,
    );

    return deletedDebtor;
  }
}
