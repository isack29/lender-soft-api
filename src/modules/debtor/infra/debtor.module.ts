import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/infraestructure/database/prisma/prisma.module';
import { DebtorController } from '../presentation/debtor.controller';
import { DebtorRepository } from './prisma-debtor.repository';
import { CreateDebtorUseCase } from '../application/use-cases/create-debtor.use-case';
import { UpdateDebtorUseCase } from '../application/use-cases/update-debtor.use-case';
import { GetDebtorByIdUseCase } from '../application/use-cases/get-debtorById.use-case';
import { DeleteDebtorUseCase } from '../application/use-cases/delete-debtor.use-case';
import { GetAllDebtorsUseCase } from '../application/use-cases/get-allDebtors.use-case';

@Module({
  imports: [PrismaModule],
  controllers: [DebtorController],
  providers: [
    {
      provide: 'IDebtorRepository',
      useClass: DebtorRepository,
    },
    CreateDebtorUseCase,
    UpdateDebtorUseCase,
    GetDebtorByIdUseCase,
    DeleteDebtorUseCase,
    GetAllDebtorsUseCase,
  ],
  exports: ['IDebtorRepository'],
})
export class DebtorModule {}
