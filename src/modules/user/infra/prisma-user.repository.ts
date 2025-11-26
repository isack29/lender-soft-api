import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../domain/user.repository';
import { PrismaService } from 'src/infraestructure/database/prisma/prisma.service';
import { CreateUserDto } from '../application/dto/create-user.dto';
import { User } from '@prisma/client';
import { UpdateUserDto } from '../application/dto/update-user.dto';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(createdUserDto: CreateUserDto): Promise<User> {
    const newUser = await this.prismaService.user.create({
      data: {
        username: createdUserDto.email,
        password: createdUserDto.password,
        firstname: createdUserDto.firstname,
        lastname: createdUserDto.lastname,
        phone: createdUserDto.phone,
        email: createdUserDto.email,
        address: createdUserDto.email,
        document: createdUserDto.document,
        role: createdUserDto.role,
      },
    });
    return newUser;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await this.prismaService.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
        deleted: false,
      },
    });
  }

  async findUserByPhone(phone: string): Promise<User | null> {
    return await this.prismaService.user.findFirst({
      where: {
        phone,
        deleted: false,
      },
    });
  }

  async findUserByDocument(document: string): Promise<User | null> {
    return await this.prismaService.user.findFirst({
      where: {
        document,
        deleted: false,
      },
    });
  }

  async findById(userId: string): Promise<User | null> {
    return await this.prismaService.user.findFirst({
      where: {
        id: userId,
        deleted: false,
      },
    });
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return await this.prismaService.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async deleteUser(userId: string): Promise<User | null> {
    return await this.prismaService.user.update({
      where: { id: userId },
      data: { deleted: true },
    });
  }
}
