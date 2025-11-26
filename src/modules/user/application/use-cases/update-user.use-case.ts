import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IUserRepository } from '../../domain/user.repository';
import { UpdateUserDto } from '../dto/update-user.dto';
import { IHashService } from '../../../../common/interfaces/hash-service.interface';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly iUserRepository: IUserRepository,
    @Inject('IHashService')
    private readonly hashService: IHashService,
  ) {}

  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    const existingUser = await this.iUserRepository.findById(userId);
    if (!existingUser) {
      throw new NotFoundException('User not found or has been deleted');
    }

    if (updateUserDto.email) {
      const userByEmail = await this.iUserRepository.findUserByEmail(
        updateUserDto.email,
      );
      if (userByEmail && userByEmail.id !== userId) {
        throw new ConflictException('Email already in use');
      }
    }
    if (updateUserDto.phone) {
      const userByPhone = await this.iUserRepository.findUserByPhone(
        updateUserDto.phone,
      );
      if (userByPhone && userByPhone.id !== userId) {
        throw new ConflictException('Phone already in use');
      }
    }

    if (updateUserDto.document) {
      const userByDocument = await this.iUserRepository.findUserByDocument(
        updateUserDto.document,
      );
      if (userByDocument && userByDocument.id !== userId) {
        throw new ConflictException('Document already in use');
      }
    }

    // Si se está actualizando la contraseña, hashearla primero
    let dataToUpdate = updateUserDto;
    if (updateUserDto.password) {
      const hashedPassword = await this.hashService.hashPassword(
        updateUserDto.password,
      );
      dataToUpdate = {
        ...updateUserDto,
        password: hashedPassword,
      };
    }

    const updatedUser = await this.iUserRepository.updateUser(
      userId,
      dataToUpdate,
    );
    return updatedUser;
  }
}
