import { IsEnum, IsNotEmpty } from 'class-validator';
import { LoanStatus } from '@prisma/client';

export class UpdateLoanStatusDto {
  @IsEnum(LoanStatus)
  @IsNotEmpty()
  status: LoanStatus;
}
