import { Injectable } from '@nestjs/common';
import { IDebtorRepository } from '../domain/debtor.respository';
import { PrismaService } from 'src/infraestructure/database/prisma/prisma.service';
import { Debtor, User } from '@prisma/client';
import { CreateDebtorDto } from '../application/dto/create-debtor.dto';
import { UpdateDebtorDto } from '../application/dto/update-debtor.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class DebtorRepository implements IDebtorRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createDebtor(
    lender: User,
    createDebtorDto: CreateDebtorDto,
  ): Promise<Debtor> {
    return await this.prismaService.debtor.create({
      data: {
        document: createDebtorDto.document,
        firstName: createDebtorDto.firstName,
        lastName: createDebtorDto.lastName,
        phone: createDebtorDto.phone,
        email: createDebtorDto.email,
        address: createDebtorDto.address,
        userId: lender.id,
      },
    });
  }

  async findDebtorById(debtorId: string): Promise<Debtor | null> {
    return await this.prismaService.debtor.findFirst({
      where: {
        id: debtorId,
        deleted: false,
      },
    });
  }

  async findAllBebtorsByLenderId(
    lenderId: string,
    paginationDto: PaginationDto,
  ): Promise<{
    docs: Debtor[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const { page = 1, limit = 10, search, dateInit, dateEnd } = paginationDto;

    // Construir filtros dinámicos
    const where: {
      userId: string;
      deleted: boolean;
      createdAt?: {
        gte?: Date;
        lte?: Date;
      };
      OR?: Array<{
        firstName?: { contains: string; mode: 'insensitive' };
        lastName?: { contains: string; mode: 'insensitive' };
        email?: { contains: string; mode: 'insensitive' };
        document?: { contains: string; mode: 'insensitive' };
      }>;
    } = {
      userId: lenderId,
      deleted: false,
    };

    // Filtro por búsqueda (nombre, apellido, email, documento)
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { document: { contains: search, mode: 'insensitive' } },
      ];
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

    // Obtener el total de registros que cumplen con los filtros
    const total = await this.prismaService.debtor.count({ where });

    // Obtener los registros paginados
    const docs = await this.prismaService.debtor.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calcular el total de páginas
    const totalPages = Math.ceil(total / limit);

    return {
      docs,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }
  async findDebtorByEmail(email: string): Promise<Debtor | null> {
    return await this.prismaService.debtor.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
        deleted: false,
      },
    });
  }
  async findDebtorByPhone(phone: string): Promise<Debtor | null> {
    return await this.prismaService.debtor.findFirst({
      where: {
        phone: phone,
        deleted: false,
      },
    });
  }
  async findDebtorByDocument(document: string): Promise<Debtor | null> {
    return await this.prismaService.debtor.findFirst({
      where: {
        document: document,
        deleted: false,
      },
    });
  }

  async updateDebtor(
    debtorId: string,
    updateDeptorDto: UpdateDebtorDto,
  ): Promise<Debtor> {
    return await this.prismaService.debtor.update({
      where: {
        id: debtorId,
      },
      data: updateDeptorDto,
    });
  }
  async deleteDebtor(debtorId: string): Promise<Debtor | null> {
    return await this.prismaService.debtor.update({
      where: { id: debtorId },
      data: { deleted: true },
    });
  }
}
