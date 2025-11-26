import { Injectable } from '@nestjs/common';
import { Installment } from '@prisma/client';
import { PrismaService } from 'src/infraestructure/database/prisma/prisma.service';
import { IInstallmentRepository } from '../domain/installment.repository';

@Injectable()
export class PrismaInstallmentRepository implements IInstallmentRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createInstallment(
    loanId: string,
    dueDate: Date,
    amountDue: number,
  ): Promise<Installment> {
    return await this.prismaService.installment.create({
      data: {
        loanId,
        dueDate,
        amountDue,
      },
    });
  }

  async findInstallmentById(
    installmentId: string,
  ): Promise<Installment | null> {
    return await this.prismaService.installment.findFirst({
      where: {
        id: installmentId,
        deleted: false,
      },
    });
  }

  async findInstallmentsByLoanId(loanId: string): Promise<Installment[]> {
    return await this.prismaService.installment.findMany({
      where: {
        loanId,
      },
      orderBy: {
        dueDate: 'asc',
      },
    });
  }
}
