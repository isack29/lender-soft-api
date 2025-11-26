import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '../../domain/user.repository';

@Injectable()
export class GetUserByIdUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly iUserRepository: IUserRepository,
  ) {}

  async getUserById(userId: string) {
    const existingUser = await this.iUserRepository.findById(userId);

    if (!existingUser || existingUser.deleted === true) {
      throw new NotFoundException('User not found');
    }

    return existingUser;
  }
}
