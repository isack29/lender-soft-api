import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { Auth } from 'src/common/decorator/auth.decorator';
import { ResponseMessage } from 'src/common/decorator/response.message.decorator';
import { CreateDebtorDto } from '../application/dto/create-debtor.dto';
import { UpdateDebtorDto } from '../application/dto/update-debtor.dto';
import { ActiveUser } from 'src/common/decorator/session.decorator';
import { CreateDebtorUseCase } from '../application/use-cases/create-debtor.use-case';
import { GetDebtorByIdUseCase } from '../application/use-cases/get-debtorById.use-case';
import { UpdateDebtorUseCase } from '../application/use-cases/update-debtor.use-case';
import { DeleteDebtorUseCase } from '../application/use-cases/delete-debtor.use-case';
import { GetAllDebtorsUseCase } from '../application/use-cases/get-allDebtors.use-case';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('debtors')
export class DebtorController {
  constructor(
    private readonly createDebtorUseCase: CreateDebtorUseCase,
    private readonly getDebtorByIdUseCase: GetDebtorByIdUseCase,
    private readonly updateDebtorUseCase: UpdateDebtorUseCase,
    private readonly deleteDebtorUseCase: DeleteDebtorUseCase,
    private readonly getAllDebtorsUseCase: GetAllDebtorsUseCase,
  ) {}

  @Post()
  @ResponseMessage('Debtor created successfully')
  @Auth([Role.LENDER])
  async createDebtor(
    @Body() createDebtorDto: CreateDebtorDto,
    @ActiveUser() user: User,
  ) {
    return await this.createDebtorUseCase.createDebtor(createDebtorDto, user);
  }

  @Get(':debtorId')
  @ResponseMessage('Debtor retrieved successfully')
  @Auth([Role.LENDER])
  async getDebtorById(
    @Param('debtorId') debtorId: string,
    @ActiveUser() user: User,
  ) {
    return await this.getDebtorByIdUseCase.getDebtorById(debtorId, user);
  }

  @Get()
  @ResponseMessage('Debtors retrieved successfully')
  @Auth([Role.LENDER])
  async getAllDebtorsByLenderId(
    @ActiveUser() user: User,
    @Query() paginationDto: PaginationDto,
  ) {
    return await this.getAllDebtorsUseCase.getAllDebtorsByLenderId(
      user,
      paginationDto,
    );
  }
  @Patch(':debtorId')
  @ResponseMessage('Debtor updated successfully')
  @Auth([Role.LENDER])
  async updateDebtor(
    @Param('debtorId') debtorId: string,
    @Body() updateDebtorDto: UpdateDebtorDto,
    @ActiveUser() user: User,
  ) {
    return await this.updateDebtorUseCase.updateDeptor(
      debtorId,
      updateDebtorDto,
      user,
    );
  }

  @Delete(':debtorId')
  @ResponseMessage('Debtor deleted successfully')
  @Auth([Role.LENDER])
  async deleteDebtor(
    @Param('debtorId') debtorId: string,
    @ActiveUser() user: User,
  ) {
    return await this.deleteDebtorUseCase.deleteDebtor(debtorId, user);
  }
}
