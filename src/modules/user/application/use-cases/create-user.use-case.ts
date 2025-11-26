import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { IUserRepository } from '../../domain/user.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { IHashService } from '../../../../common/interfaces/hash-service.interface';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly iUserRepository: IUserRepository,
    @Inject('IHashService')
    private readonly hashService: IHashService,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const existingUserByEmail = await this.iUserRepository.findUserByEmail(
      createUserDto.email,
    );
    if (existingUserByEmail) {
      throw new ConflictException('Email already in use');
    }

    const existingUserByPhone = await this.iUserRepository.findUserByPhone(
      createUserDto.phone,
    );
    if (existingUserByPhone) {
      throw new ConflictException('Phone already in use');
    }

    if (createUserDto.document) {
      const existingUserByDocument =
        await this.iUserRepository.findUserByDocument(createUserDto.document);
      if (existingUserByDocument) {
        throw new ConflictException('Document already in use');
      }
    }

    const hashedPassword = await this.hashService.hashPassword(
      createUserDto.password,
    );

    const newUser = await this.iUserRepository.createUser({
      ...createUserDto,
      password: hashedPassword,
    });

    return newUser;
  }
}
