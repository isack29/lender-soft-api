import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infraestructure/database/prisma/prisma.service';
import { IDashboardRepository } from '../domain/dashboard.repository';

@Injectable()
export class DashboardRepository implements IDashboardRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getTotalLent(lenderId: string): Promise<number> {
    const result = await this.prismaService.loan.aggregate({
      where: {
        userId: lenderId,
        deleted: false,
      },
      _sum: {
        amount: true,
      },
    });

    return result._sum.amount || 0;
  }

  async getTotalCollected(lenderId: string): Promise<number> {
    const result = await this.prismaService.payment.aggregate({
      where: {
        loan: {
          userId: lenderId,
          deleted: false,
        },
        deleted: false,
      },
      _sum: {
        amountPaid: true,
      },
    });

    return result._sum.amountPaid || 0;
  }

  async getActiveLoansCount(lenderId: string): Promise<number> {
    return await this.prismaService.loan.count({
      where: {
        userId: lenderId,
        status: 'ACTIVE',
        deleted: false,
      },
    });
  }

  async getTotalLoansCount(lenderId: string): Promise<number> {
    return await this.prismaService.loan.count({
      where: {
        userId: lenderId,
        deleted: false,
      },
    });
  }

  async getTotalDebtorsCount(lenderId: string): Promise<number> {
    return await this.prismaService.debtor.count({
      where: {
        userId: lenderId,
        deleted: false,
      },
    });
  }
}
