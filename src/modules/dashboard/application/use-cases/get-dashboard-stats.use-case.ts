import { Injectable, Inject } from '@nestjs/common';
import { IDashboardRepository } from 'src/modules/dashboard/domain/dashboard.repository';

export interface DashboardStats {
  readonly totalLent: number;
  readonly totalCollected: number;
  readonly pendingAmount: number;
  readonly activeLoansCount: number;
  readonly totalLoansCount: number;
  readonly totalDebtorsCount: number;
}

@Injectable()
export class GetDashboardStatsUseCase {
  constructor(
    @Inject('IDashboardRepository')
    private readonly dashboardRepository: IDashboardRepository,
  ) {}

  async execute(lenderId: string): Promise<DashboardStats> {
    const promises: [
      Promise<number>,
      Promise<number>,
      Promise<number>,
      Promise<number>,
      Promise<number>,
    ] = [
      this.dashboardRepository.getTotalLent(lenderId),
      this.dashboardRepository.getTotalCollected(lenderId),
      this.dashboardRepository.getActiveLoansCount(lenderId),
      this.dashboardRepository.getTotalLoansCount(lenderId),
      this.dashboardRepository.getTotalDebtorsCount(lenderId),
    ];

    const [
      totalLent,
      totalCollected,
      activeLoansCount,
      totalLoansCount,
      totalDebtorsCount,
    ]: [number, number, number, number, number] = await Promise.all(promises);

    const pendingAmount: number = totalLent - totalCollected;

    const stats: DashboardStats = {
      totalLent,
      totalCollected,
      pendingAmount,
      activeLoansCount,
      totalLoansCount,
      totalDebtorsCount,
    };

    return stats;
  }
}
