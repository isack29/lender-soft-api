import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '../../domain/user.repository';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly iUserRepository: IUserRepository,
  ) {}

  async deleteUser(userId: string) {
    const existingUser = await this.iUserRepository.findById(userId);

    if (!existingUser || existingUser.deleted) {
      throw new NotFoundException('User not found or already deleted');
    }
    return await this.iUserRepository.deleteUser(userId);
  }
}
