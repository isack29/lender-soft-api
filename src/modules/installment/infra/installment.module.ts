import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/infraestructure/database/prisma/prisma.module';
import { PrismaInstallmentRepository } from './prisma-installment.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: 'IInstallmentRepository',
      useClass: PrismaInstallmentRepository,
    },
  ],
  exports: ['IInstallmentRepository'],
})
export class InstallmentModule {}
