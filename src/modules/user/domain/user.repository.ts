import { User } from '@prisma/client';
import { UpdateUserDto } from '../application/dto/update-user.dto';
import { CreateUserDto } from '../application/dto/create-user.dto';

export interface IUserRepository {
  createUser(createdUserDto: CreateUserDto): Promise<User>;
  findUserByEmail(email: string): Promise<User | null>;
  findUserByPhone(phone: string): Promise<User | null>;
  findUserByDocument(document: string): Promise<User | null>;
  findById(userId: string): Promise<User | null>;
  updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<User>;
  deleteUser(userId: string): Promise<User | null>;
}
