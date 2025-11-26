import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { PaymentMethod } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreatePaymentDto {
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  paymentDate: Date;

  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  amountPaid: number;

  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;

  @IsString()
  @IsUUID()
  @IsNotEmpty()
  loanId: string;

  @IsString()
  @IsUUID()
  installmentId: string;
}
