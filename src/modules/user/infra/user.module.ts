import { Module } from '@nestjs/common';
import { UserController } from '../presentation/user.controller';
import { UserRepository } from './prisma-user.repository';
import { CreateUserUseCase } from '../application/use-cases/create-user.use-case';
import { PrismaModule } from 'src/infraestructure/database/prisma/prisma.module';
import { UpdateUserUseCase } from '../application/use-cases/update-user.use-case';
import { GetUserByIdUseCase } from '../application/use-cases/get-userById.use-case';
import { DeleteUserUseCase } from '../application/use-cases/delete-user.use-case';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
    CreateUserUseCase,
    UpdateUserUseCase,
    GetUserByIdUseCase,
    DeleteUserUseCase,
  ],
  exports: ['IUserRepository'],
})
export class UserModule {}
