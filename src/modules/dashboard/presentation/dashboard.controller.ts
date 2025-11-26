import { Controller, Get } from '@nestjs/common';
import { User, Role } from '@prisma/client';
import { Auth } from 'src/common/decorator/auth.decorator';
import { ResponseMessage } from 'src/common/decorator/response.message.decorator';
import { ActiveUser } from 'src/common/decorator/session.decorator';
import { GetDashboardStatsUseCase } from '../application/use-cases/get-dashboard-stats.use-case';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly getDashboardStatsUseCase: GetDashboardStatsUseCase,
  ) {}

  @Get('stats')
  @ResponseMessage('Dashboard statistics retrieved successfully')
  @Auth([Role.LENDER])
  async getDashboardStats(@ActiveUser() user: User) {
    return await this.getDashboardStatsUseCase.execute(user.id);
  }
}
