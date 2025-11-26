import { Debtor, User } from '@prisma/client';
import { CreateDebtorDto } from '../application/dto/create-debtor.dto';
import { UpdateDebtorDto } from '../application/dto/update-debtor.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export interface PaginatedDebtors {
  docs: Debtor[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface IDebtorRepository {
  createDebtor(lender: User, createDebtorDto: CreateDebtorDto): Promise<Debtor>;
  findDebtorById(debtorId: string): Promise<Debtor | null>;
  findAllBebtorsByLenderId(
    lenderId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedDebtors>;
  findDebtorByEmail(email: string): Promise<Debtor | null>;
  findDebtorByPhone(phone: string): Promise<Debtor | null>;
  findDebtorByDocument(document: string): Promise<Debtor | null>;
  updateDebtor(
    debtorId: string,
    updateDeptorDto: UpdateDebtorDto,
  ): Promise<Debtor>;
  deleteDebtor(debtorId: string): Promise<Debtor | null>;
}
