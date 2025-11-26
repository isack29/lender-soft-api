import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role, User } from '@prisma/client';
import { Auth } from 'src/common/decorator/auth.decorator';
import { ResponseMessage } from 'src/common/decorator/response.message.decorator';
import { ActiveUser } from 'src/common/decorator/session.decorator';
import { CreatePaymentDto } from '../application/dto/create-payment.dto';
import { CreatePaymentUseCase } from '../application/use-cases/create-payment.use-case';
import { GetPaymentByIdUseCase } from '../application/use-cases/get-paymentById.use-case';
import { GetAllPaymentsByLoanIdUseCase } from '../application/use-cases/get-allPayments-byLoanId.use-case';
import { GetAllPaymentsByLenderIdUseCase } from '../application/use-cases/get-allPayments-byLenderId.use-case';
import { DeletePaymentUseCase } from '../application/use-cases/delete-payment.use-case';
import { UploadProofOfPaymentUseCase } from '../application/use-cases/upload-proof-of-payment.use-case';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('payments')
export class PaymentController {
  constructor(
    private readonly createPaymentUseCase: CreatePaymentUseCase,
    private readonly getPaymentByIdUseCase: GetPaymentByIdUseCase,
    private readonly getAllPaymentsByLoanIdUseCase: GetAllPaymentsByLoanIdUseCase,
    private readonly getAllPaymentsByLenderIdUseCase: GetAllPaymentsByLenderIdUseCase,
    private readonly deletePaymentUseCase: DeletePaymentUseCase,
    private readonly uploadProofOfPaymentUseCase: UploadProofOfPaymentUseCase,
  ) {}

  @Post()
  @ResponseMessage('payment created successfully')
  @Auth([Role.LENDER])
  async createPayment(
    @Body() createPaymentDto: CreatePaymentDto,
    @ActiveUser() user: User,
  ) {
    return await this.createPaymentUseCase.createPayment(
      createPaymentDto,
      user,
    );
  }

  @Get(':paymentId')
  @ResponseMessage('payment retrieved successfully')
  @Auth([Role.LENDER])
  async getPaymentById(
    @Param('paymentId') paymentId: string,
    @ActiveUser() user: User,
  ) {
    return await this.getPaymentByIdUseCase.getPaymentById(paymentId, user);
  }

  @Get('loan/:loanId')
  @ResponseMessage('payments retrieved successfully')
  @Auth([Role.LENDER])
  async getPaymentsByLoanId(
    @Param('loanId') loanId: string,
    @Query() paginationDto: PaginationDto,
    @ActiveUser() user: User,
  ) {
    return await this.getAllPaymentsByLoanIdUseCase.getAllPaymentsByLoanId(
      loanId,
      paginationDto,
      user,
    );
  }

  @Get()
  @ResponseMessage('payments retrieved successfully')
  @Auth([Role.LENDER])
  async getPaymentsByLenderId(
    @ActiveUser() user: User,
    @Query() paginationDto: PaginationDto,
  ) {
    return await this.getAllPaymentsByLenderIdUseCase.getAllPaymentsByLenderId(
      user,
      paginationDto,
    );
  }

  @Delete(':paymentId')
  @ResponseMessage('payment deleted successfully')
  @Auth([Role.LENDER])
  async deletePayment(
    @Param('paymentId') paymentId: string,
    @ActiveUser() user: User,
  ) {
    return await this.deletePaymentUseCase.deletePayment(paymentId, user);
  }

  @Post(':paymentId/proof')
  @ResponseMessage('proof of payment uploaded successfully')
  @Auth([Role.LENDER])
  @UseInterceptors(FileInterceptor('file'))
  async uploadProof(
    @Param('paymentId') paymentId: string,
    @ActiveUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.uploadProofOfPaymentUseCase.uploadProof(
      paymentId,
      user.id,
      file,
    );
  }

  @Get(':paymentId/proof')
  @ResponseMessage('proof of payment url retrieved successfully')
  @Auth([Role.LENDER])
  async getProofUrl(
    @Param('paymentId') paymentId: string,
    @ActiveUser() user: User,
  ) {
    return await this.uploadProofOfPaymentUseCase.getProofUrl(
      paymentId,
      user.id,
    );
  }

  @Delete(':paymentId/proof')
  @ResponseMessage('proof of payment deleted successfully')
  @Auth([Role.LENDER])
  async deleteProof(
    @Param('paymentId') paymentId: string,
    @ActiveUser() user: User,
  ) {
    return await this.uploadProofOfPaymentUseCase.deleteProof(
      paymentId,
      user.id,
    );
  }
}
