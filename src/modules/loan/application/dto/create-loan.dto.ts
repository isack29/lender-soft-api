import { LoanStatus } from '@prisma/client';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLoanDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsNumber()
  @IsNotEmpty()
  interestRate: number;

  @IsNumber()
  @IsNotEmpty()
  term: number;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  dueDate: Date;

  @IsString()
  @IsUUID()
  @IsNotEmpty()
  debtorId: string;

  @IsOptional()
  @IsEnum(LoanStatus)
  status?: LoanStatus;
}
