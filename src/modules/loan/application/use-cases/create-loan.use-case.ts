import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ILoanRepository } from '../../domain/loan.repository';
import { CreateLoanDto } from '../dto/create-loan.dto';
import { IDebtorRepository } from 'src/modules/debtor/domain/debtor.respository';
import { IInstallmentRepository } from 'src/modules/installment/domain/installment.repository';
import { User } from '@prisma/client';

@Injectable()
export class CreateLoanUseCase {
  constructor(
    @Inject('ILoanRepository')
    private readonly iLoanRepository: ILoanRepository,
    @Inject('IDebtorRepository')
    private readonly iDebtorRepository: IDebtorRepository,
    @Inject('IInstallmentRepository')
    private readonly iInstallmentRepository: IInstallmentRepository,
  ) {}

  async createLoan(createLoanDto: CreateLoanDto, user: User) {
    console.info(createLoanDto);
    const existingDebtor = await this.iDebtorRepository.findDebtorById(
      createLoanDto.debtorId,
    );

    if (!existingDebtor) {
      throw new NotFoundException('debtor not found');
    }

    // Calcular el monto total con intereses ANTES de crear el préstamo
    const totalWithInterest =
      createLoanDto.amount +
      (createLoanDto.amount * createLoanDto.interestRate) / 100;

    // Crear el préstamo con el total calculado
    const newLoan = await this.iLoanRepository.createLoan(
      createLoanDto.debtorId,
      createLoanDto,
      user.id,
      totalWithInterest,
    );

    // Monto total de cada cuota
    const installmentAmount = totalWithInterest / newLoan.term;

    // Crear las cuotas (installments)
    for (let i = 0; i < newLoan.term; i++) {
      // Calcular la fecha de vencimiento: startDate + (i + 1) meses
      const dueDate = new Date(newLoan.startDate);
      dueDate.setMonth(dueDate.getMonth() + (i + 1));
      await this.iInstallmentRepository.createInstallment(
        newLoan.id,
        dueDate,
        installmentAmount,
      );
    }

    // Obtener el préstamo con sus cuotas para retornarlo
    const loanWithInstallments = await this.iLoanRepository.findLoanById(
      newLoan.id,
    );

    return loanWithInstallments;
  }
}
