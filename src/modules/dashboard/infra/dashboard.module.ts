import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/infraestructure/database/prisma/prisma.module';
import { DashboardRepository } from './prisma-dashboard.repository';
import { GetDashboardStatsUseCase } from '../application/use-cases/get-dashboard-stats.use-case';
import { DashboardController } from '../presentation/dashboard.controller';

@Module({
  imports: [PrismaModule],
  controllers: [DashboardController],
  providers: [
    {
      provide: 'IDashboardRepository',
      useClass: DashboardRepository,
    },
    GetDashboardStatsUseCase,
  ],
})
export class DashboardModule {}
