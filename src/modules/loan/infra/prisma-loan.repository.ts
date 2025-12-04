import { Loan, LoanStatus } from '@prisma/client';
import { CreateLoanDto } from '../application/dto/create-loan.dto';
import { UpdateLoanDto } from '../application/dto/update-loan.dto';
import { UpdateLoanStatusDto } from '../application/dto/update-loan-status.dto';
import {
  ILoanRepository,
  LoanWithInstallments,
  LoanWithRelations,
} from '../domain/loan.repository';
import { PrismaService } from 'src/infraestructure/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class LoanRepository implements ILoanRepository {
  constructor(private readonly prismaService: PrismaService) {}
  async findAllLoansByLenderId(
    lenderId: string,
    paginationDto: PaginationDto,
  ): Promise<Loan[] | null> {
    const {
      page = 1,
      limit = 10,
      status,
      dateInit,
      dateEnd,
      search,
    } = paginationDto;

    // Construir filtros dinámicos
    const where: {
      userId: string;
      deleted: boolean;
      status?: LoanStatus;
      createdAt?: {
        gte?: Date;
        lte?: Date;
      };
      debtor?: {
        OR?: Array<{
          firstName?: { contains: string; mode?: 'insensitive' };
          lastName?: { contains: string; mode?: 'insensitive' };
          email?: { contains: string; mode?: 'insensitive' };
        }>;
        deleted: boolean;
      };
    } = {
      userId: lenderId,
      deleted: false,
    };

    // Filtro por estado
    if (status) {
      where.status = status as LoanStatus;
    }

    // Filtro por rango de fechas
    if (dateInit || dateEnd) {
      where.createdAt = {};
      if (dateInit) {
        where.createdAt.gte = new Date(dateInit);
      }
      if (dateEnd) {
        where.createdAt.lte = new Date(dateEnd);
      }
    }

    // Filtro de búsqueda por nombre o correo del deudor
    if (search && search.trim()) {
      where.debtor = {
        deleted: false,
        OR: [
          {
            firstName: {
              contains: search.trim(),
              mode: 'insensitive',
            },
          },
          {
            lastName: {
              contains: search.trim(),
              mode: 'insensitive',
            },
          },
          {
            email: {
              contains: search.trim(),
              mode: 'insensitive',
            },
          },
        ],
      };
    } else {
      // Si no hay búsqueda, solo filtrar por deudores no eliminados
      where.debtor = {
        deleted: false,
      };
    }

    return await this.prismaService.loan.findMany({
      where,
      include: {
        installments: {
          orderBy: {
            dueDate: 'asc',
          },
        },
        payments: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  async createLoan(
    debtorId: string,
    createLoanDto: CreateLoanDto,
    lenderId: string,
    totalWithInterest: number,
  ): Promise<Loan> {
    return await this.prismaService.loan.create({
      data: {
        amount: createLoanDto.amount,
        interestRate: createLoanDto.interestRate,
        totalWithInterest: totalWithInterest,
        term: createLoanDto.term,
        startDate: createLoanDto.startDate,
        dueDate: createLoanDto.dueDate,
        debtorId: debtorId,
        userId: lenderId,
      },
    });
  }
  async findLoanById(loanId: string): Promise<LoanWithInstallments | null> {
    const loan = await this.prismaService.loan.findFirst({
      where: {
        id: loanId,
        deleted: false,
      },
      include: {
        installments: {
          orderBy: {
            dueDate: 'asc',
          },
        },
        payments: true,
      },
    });

    return loan;
  }
  async findLoanWithRelations(
    loanId: string,
  ): Promise<LoanWithRelations | null> {
    const loan = await this.prismaService.loan.findFirst({
      where: {
        id: loanId,
        deleted: false,
      },
      include: {
        user: true,
        debtor: true,
        installments: {
          orderBy: {
            dueDate: 'asc',
          },
        },
        payments: true,
      },
    });

    return loan;
  }
  async findAllLoansByDebtorId(
    debtorId: string,
    paginationDto: PaginationDto,
  ): Promise<Loan[] | null> {
    const { page = 1, limit = 10, status, dateInit, dateEnd } = paginationDto;

    // Construir filtros dinámicos
    const where: {
      debtorId: string;
      deleted: boolean;
      status?: LoanStatus;
      createdAt?: {
        gte?: Date;
        lte?: Date;
      };
    } = {
      debtorId: debtorId,
      deleted: false,
    };

    // Filtro por estado
    if (status) {
      where.status = status as LoanStatus;
    }

    // Filtro por rango de fechas
    if (dateInit || dateEnd) {
      where.createdAt = {};
      if (dateInit) {
        where.createdAt.gte = new Date(dateInit);
      }
      if (dateEnd) {
        where.createdAt.lte = new Date(dateEnd);
      }
    }

    return await this.prismaService.loan.findMany({
      where,
      include: {
        installments: {
          orderBy: {
            dueDate: 'asc',
          },
        },
        payments: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  async updateLoan(
    loanId: string,
    updateLoanDto: UpdateLoanDto,
  ): Promise<Loan> {
    return await this.prismaService.loan.update({
      where: {
        id: loanId,
      },
      data: updateLoanDto,
      include: {
        installments: {
          orderBy: {
            dueDate: 'asc',
          },
        },
        payments: true,
      },
    });
  }
  async updateLoanStatus(
    loanId: string,
    updateLoanStatusDto: UpdateLoanStatusDto,
  ): Promise<Loan> {
    return await this.prismaService.loan.update({
      where: {
        id: loanId,
      },
      data: {
        status: updateLoanStatusDto.status,
      },
      include: {
        installments: {
          orderBy: {
            dueDate: 'asc',
          },
        },
        payments: true,
      },
    });
  }
  async deleteLoanById(loanId: string): Promise<Loan | null> {
    return await this.prismaService.loan.update({
      where: {
        id: loanId,
      },
      data: {
        deleted: true,
      },
    });
  }
}
