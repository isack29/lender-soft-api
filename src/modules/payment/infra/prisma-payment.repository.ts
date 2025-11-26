import { Injectable } from '@nestjs/common';
import { Payment, PaymentMethod } from '@prisma/client';
import { PrismaService } from 'src/infraestructure/database/prisma/prisma.service';
import { IPaymentRepository } from '../domain/payment.repository';
import { CreatePaymentDto } from '../application/dto/create-payment.dto';
import { UpdatePaymentDto } from '../application/dto/update-payment.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class PaymentRepository implements IPaymentRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createPayment(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    return await this.prismaService.payment.create({
      data: {
        paymentDate: createPaymentDto.paymentDate,
        amountPaid: createPaymentDto.amountPaid,
        paymentMethod: createPaymentDto.paymentMethod,
        loanId: createPaymentDto.loanId,
        installmentId: createPaymentDto.installmentId,
      },
    });
  }

  async findPaymentById(paymentId: string): Promise<Payment | null> {
    return await this.prismaService.payment.findFirst({
      where: {
        id: paymentId,
        deleted: false,
      },
    });
  }

  async findAllPaymentsByLoanId(
    loanId: string,
    paginationDto: PaginationDto,
  ): Promise<Payment[] | null> {
    const { page = 1, limit = 10, dateInit, dateEnd } = paginationDto;

    const where: {
      loanId: string;
      deleted: boolean;
      paymentDate?: {
        gte?: Date;
        lte?: Date;
      };
    } = {
      loanId: loanId,
      deleted: false,
    };

    // Filtro por rango de fechas
    if (dateInit || dateEnd) {
      where.paymentDate = {};
      if (dateInit) {
        where.paymentDate.gte = new Date(dateInit);
      }
      if (dateEnd) {
        where.paymentDate.lte = new Date(dateEnd);
      }
    }

    return await this.prismaService.payment.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        paymentDate: 'desc',
      },
    });
  }

  async findAllPaymentsByLenderId(
    lenderId: string,
    paginationDto: PaginationDto,
  ): Promise<Payment[] | null> {
    const { page = 1, limit = 10, dateInit, dateEnd, status } = paginationDto;

    const where: {
      loan: {
        userId: string;
      };
      deleted: boolean;
      paymentDate?: {
        gte?: Date;
        lte?: Date;
      };
      paymentMethod?: PaymentMethod;
    } = {
      loan: {
        userId: lenderId,
      },
      deleted: false,
    };

    // Filtro por método de pago (usando el campo status del DTO)
    if (status) {
      where.paymentMethod = status as PaymentMethod;
    }

    // Filtro por rango de fechas
    if (dateInit || dateEnd) {
      where.paymentDate = {};
      if (dateInit) {
        where.paymentDate.gte = new Date(dateInit);
      }
      if (dateEnd) {
        where.paymentDate.lte = new Date(dateEnd);
      }
    }

    return await this.prismaService.payment.findMany({
      where,
      include: {
        loan: {
          select: {
            id: true,
            amount: true,
            debtor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        installment: {
          select: {
            id: true,
            dueDate: true,
            amountDue: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        paymentDate: 'desc',
      },
    });
  }

  async updatePayment(
    paymentId: string,
    updatePaymentDto: UpdatePaymentDto,
  ): Promise<Payment> {
    return await this.prismaService.payment.update({
      where: {
        id: paymentId,
      },
      data: updatePaymentDto,
    });
  }

  async deletePayment(paymentId: string): Promise<Payment | null> {
    return await this.prismaService.payment.update({
      where: {
        id: paymentId,
      },
      data: {
        deleted: true,
      },
    });
  }
}
