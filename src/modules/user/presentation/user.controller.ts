import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateUserUseCase } from '../application/use-cases/create-user.use-case';
import { CreateUserDto } from '../application/dto/create-user.dto';
import { UpdateUserDto } from '../application/dto/update-user.dto';
import { UpdateUserUseCase } from '../application/use-cases/update-user.use-case';
import { GetUserByIdUseCase } from '../application/use-cases/get-userById.use-case';
import { DeleteUserUseCase } from '../application/use-cases/delete-user.use-case';
import { ResponseMessage } from 'src/common/decorator/response.message.decorator';
import { Role } from '@prisma/client';
import { Auth } from 'src/common/decorator/auth.decorator';

@Controller('users')
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Post()
  @ResponseMessage('User created successfully')
  @Auth([Role.ADMIN])
  async createUser(@Body() createUserDto: CreateUserDto) {
    return await this.createUserUseCase.createUser(createUserDto);
  }

  @Patch(':userId')
  @ResponseMessage('User updated successfully')
  @Auth([Role.ADMIN])
  async updateUser(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.updateUserUseCase.updateUser(userId, updateUserDto);
  }

  @Get(':userId')
  @ResponseMessage('User retrieved successfully')
  @Auth([Role.ADMIN])
  async findUserById(@Param('userId') userId: string) {
    return await this.getUserByIdUseCase.getUserById(userId);
  }

  @Delete(':userId')
  @ResponseMessage('User deleted successfully')
  @Auth([Role.ADMIN])
  async deleteUserById(@Param('userId') userId: string) {
    return await this.deleteUserUseCase.deleteUser(userId);
  }
}
