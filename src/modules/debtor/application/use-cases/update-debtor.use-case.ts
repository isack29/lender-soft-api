import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { IDebtorRepository } from '../../domain/debtor.respository';
import { UpdateDebtorDto } from '../dto/update-debtor.dto';
import { User } from '@prisma/client';

@Injectable()
export class UpdateDebtorUseCase {
  constructor(
    @Inject('IDebtorRepository')
    private readonly iDebtorRepository: IDebtorRepository,
  ) {}

  async updateDeptor(
    debtorId: string,
    updateDeptorDto: UpdateDebtorDto,
    user: User,
  ) {
    const existingDeptor =
      await this.iDebtorRepository.findDebtorById(debtorId);
    if (!existingDeptor) {
      throw new NotFoundException('User not found or has been deleted');
    }

    if (existingDeptor.userId !== user.id) {
      throw new UnauthorizedException("u can't access to this debtor");
    }

    if (updateDeptorDto.email) {
      const debtorByEmail = await this.iDebtorRepository.findDebtorByEmail(
        updateDeptorDto.email,
      );
      if (debtorByEmail && debtorByEmail.id !== debtorId) {
        throw new ConflictException('Email already in use');
      }
    }
    if (updateDeptorDto.phone) {
      const debtorByPhone = await this.iDebtorRepository.findDebtorByPhone(
        updateDeptorDto.phone,
      );
      if (debtorByPhone && debtorByPhone.id !== debtorId) {
        throw new ConflictException('Phone already in use');
      }
    }

    if (updateDeptorDto.document) {
      const debtorByDocument =
        await this.iDebtorRepository.findDebtorByDocument(
          updateDeptorDto.document,
        );
      if (debtorByDocument && debtorByDocument.id !== debtorId) {
        throw new ConflictException('Document already in use');
      }
    }

    const newDebtorUpdated = await this.iDebtorRepository.updateDebtor(
      debtorId,
      updateDeptorDto,
    );

    return newDebtorUpdated;
  }
}
