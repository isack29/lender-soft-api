import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/infraestructure/database/prisma/prisma.module';
import { StorageModule } from 'src/infraestructure/storage/storage.module';
import { LoanRepository } from './prisma-loan.repository';
import { InstallmentModule } from 'src/modules/installment/infra/installment.module';
import { DebtorModule } from 'src/modules/debtor/infra/debtor.module';
import { DocumentGeneratorModule } from 'src/infraestructure/document-generator/document-generator.module';
import { CreateLoanUseCase } from '../application/use-cases/create-loan.use-case';
import { GetLoanByIdUseCase } from '../application/use-cases/get-loanById.use-case';
import { LoanController } from '../presentation/loan.controller';
import { GetAllLoansByDebtorIdUseCase } from '../application/use-cases/getAll-loans-byDebtorId.user-case.dto';
import { GetAllLoansByLenderIdUseCase } from '../application/use-cases/getAll-loans-byLenderId.use-case.dto';
import { DeleteLoanByIdUseCase } from '../application/use-cases/delete-loan.use-case';
import { UpdateLoanUseCase } from '../application/use-cases/update-loan.use-case';
import { UpdateLoanStatusUseCase } from '../application/use-cases/update-loan-status.use-case';
import { GeneratePromissoryNoteUseCase } from '../application/use-cases/generate-promissory-note.use-case';
import { UploadPromissoryNoteUseCase } from '../application/use-cases/upload-promissory-note.use-case';

@Module({
  imports: [
    PrismaModule,
    InstallmentModule,
    DebtorModule,
    DocumentGeneratorModule,
    StorageModule,
  ],
  controllers: [LoanController],
  providers: [
    {
      provide: 'ILoanRepository',
      useClass: LoanRepository,
    },
    CreateLoanUseCase,
    GetLoanByIdUseCase,
    GetAllLoansByDebtorIdUseCase,
    GetAllLoansByLenderIdUseCase,
    DeleteLoanByIdUseCase,
    UpdateLoanUseCase,
    UpdateLoanStatusUseCase,
    GeneratePromissoryNoteUseCase,
    UploadPromissoryNoteUseCase,
  ],
  exports: ['ILoanRepository'],
})
export class LoanModule {}
