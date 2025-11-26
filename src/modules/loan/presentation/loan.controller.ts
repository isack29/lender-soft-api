import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role, User } from '@prisma/client';
import { Response } from 'express';
import { Auth } from 'src/common/decorator/auth.decorator';
import { ResponseMessage } from 'src/common/decorator/response.message.decorator';
import { CreateLoanUseCase } from '../application/use-cases/create-loan.use-case';
import { CreateLoanDto } from '../application/dto/create-loan.dto';
import { GetLoanByIdUseCase } from '../application/use-cases/get-loanById.use-case';
import { ActiveUser } from 'src/common/decorator/session.decorator';
import { GetAllLoansByDebtorIdUseCase } from '../application/use-cases/getAll-loans-byDebtorId.user-case.dto';
import { GetAllLoansByLenderIdUseCase } from '../application/use-cases/getAll-loans-byLenderId.use-case.dto';
import { DeleteLoanByIdUseCase } from '../application/use-cases/delete-loan.use-case';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UpdateLoanUseCase } from '../application/use-cases/update-loan.use-case';
import { UpdateLoanDto } from '../application/dto/update-loan.dto';
import { UpdateLoanStatusUseCase } from '../application/use-cases/update-loan-status.use-case';
import { UpdateLoanStatusDto } from '../application/dto/update-loan-status.dto';
import { GeneratePromissoryNoteUseCase } from '../application/use-cases/generate-promissory-note.use-case';
import { UploadPromissoryNoteUseCase } from '../application/use-cases/upload-promissory-note.use-case';

@Controller('loans')
export class LoanController {
  constructor(
    private readonly createLoanUseCase: CreateLoanUseCase,
    private readonly getLoanByIdUseCase: GetLoanByIdUseCase,
    private readonly getAllLoansByDebtorIdUseCase: GetAllLoansByDebtorIdUseCase,
    private readonly getAllLoansByLenderIdUseCase: GetAllLoansByLenderIdUseCase,
    private readonly deleteLoanByIdUseCase: DeleteLoanByIdUseCase,
    private readonly updateLoanUseCase: UpdateLoanUseCase,
    private readonly updateLoanStatusUseCase: UpdateLoanStatusUseCase,
    private readonly generatePromissoryNoteUseCase: GeneratePromissoryNoteUseCase,
    private readonly uploadPromissoryNoteUseCase: UploadPromissoryNoteUseCase,
  ) {}

  @Post()
  @ResponseMessage('loan created successfully')
  @Auth([Role.LENDER])
  async createLoan(
    @Body() createLoanDto: CreateLoanDto,
    @ActiveUser() user: User,
  ) {
    return await this.createLoanUseCase.createLoan(createLoanDto, user);
  }

  @Get(':loanId')
  @ResponseMessage('loan retrieved successfully')
  @Auth([Role.LENDER])
  async getLoanById(@Param('loanId') loanId: string) {
    return await this.getLoanByIdUseCase.getLoanById(loanId);
  }

  @Get('debtor-loans/:debtorId')
  @ResponseMessage('loans retrieved successfully')
  @Auth([Role.LENDER])
  async getLoanByDebtorId(
    @Param('debtorId') debtorId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return await this.getAllLoansByDebtorIdUseCase.getAllLoansByDeptorId(
      debtorId,
      paginationDto,
    );
  }

  @Get()
  @ResponseMessage('loans retrieved successfully')
  @Auth([Role.LENDER])
  async getLoansByLenderId(
    @ActiveUser() user: User,
    @Query() paginationDto: PaginationDto,
  ) {
    return await this.getAllLoansByLenderIdUseCase.getLoansByLenderId(
      user.id,
      paginationDto,
    );
  }

  @Patch(':loanId')
  @ResponseMessage('loan updated successfully')
  @Auth([Role.LENDER])
  async updateLoan(
    @Param('loanId') loanId: string,
    @Body() updateLoanDto: UpdateLoanDto,
    @ActiveUser() user: User,
  ) {
    return await this.updateLoanUseCase.updateLoan(
      loanId,
      updateLoanDto,
      user.id,
    );
  }

  @Patch(':loanId/status')
  @ResponseMessage('loan status updated successfully')
  @Auth([Role.LENDER])
  async updateLoanStatus(
    @Param('loanId') loanId: string,
    @Body() updateLoanStatusDto: UpdateLoanStatusDto,
    @ActiveUser() user: User,
  ) {
    return await this.updateLoanStatusUseCase.updateLoanStatus(
      loanId,
      updateLoanStatusDto,
      user.id,
    );
  }

  @Delete(':loanId')
  @ResponseMessage('loan deleted successfully')
  @Auth([Role.LENDER])
  async deleteLoanById(
    @Param('loanId') loanId: string,
    @ActiveUser() user: User,
  ) {
    return await this.deleteLoanByIdUseCase.deleteLoanById(loanId, user.id);
  }

  @Get(':loanId/promissory-note/generate')
  @Auth([Role.LENDER])
  async generatePromissoryNote(
    @Param('loanId') loanId: string,
    @ActiveUser() user: User,
    @Res() res: Response,
  ) {
    const buffer =
      await this.generatePromissoryNoteUseCase.generatePromissoryNote(
        loanId,
        user.id,
      );

    // Configurar headers para descarga
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=pagare-${loanId}.docx`,
    );
    res.setHeader('Content-Length', buffer.length);

    res.send(buffer);
  }

  @Post(':loanId/promissory-note')
  @ResponseMessage('promissory note uploaded successfully')
  @Auth([Role.LENDER])
  @UseInterceptors(FileInterceptor('file'))
  async uploadPromissoryNote(
    @Param('loanId') loanId: string,
    @ActiveUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.uploadPromissoryNoteUseCase.uploadPromissoryNote(
      loanId,
      user.id,
      file,
    );
  }

  @Get(':loanId/promissory-note')
  @ResponseMessage('promissory note url retrieved successfully')
  @Auth([Role.LENDER])
  async getPromissoryNoteUrl(
    @Param('loanId') loanId: string,
    @ActiveUser() user: User,
  ) {
    return await this.uploadPromissoryNoteUseCase.getPromissoryNoteUrl(
      loanId,
      user.id,
    );
  }

  @Delete(':loanId/promissory-note')
  @ResponseMessage('promissory note deleted successfully')
  @Auth([Role.LENDER])
  async deletePromissoryNote(
    @Param('loanId') loanId: string,
    @ActiveUser() user: User,
  ) {
    return await this.uploadPromissoryNoteUseCase.deletePromissoryNote(
      loanId,
      user.id,
    );
  }
}
