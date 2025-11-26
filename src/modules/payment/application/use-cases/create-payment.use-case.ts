import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { IPaymentRepository } from '../../domain/payment.repository';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { ILoanRepository } from 'src/modules/loan/domain/loan.repository';
import { IInstallmentRepository } from 'src/modules/installment/domain/installment.repository';
import { User, LoanStatus, InstallmentStatus } from '@prisma/client';
import { PrismaService } from 'src/infraestructure/database/prisma/prisma.service';

@Injectable()
export class CreatePaymentUseCase {
  constructor(
    @Inject('IPaymentRepository')
    private readonly iPaymentRepository: IPaymentRepository,
    @Inject('ILoanRepository')
    private readonly iLoanRepository: ILoanRepository,
    @Inject('IInstallmentRepository')
    private readonly iInstallmentRepository: IInstallmentRepository,
    private readonly prismaService: PrismaService,
  ) {}

  async createPayment(createPaymentDto: CreatePaymentDto, user: User) {
    // 1️⃣ Validar que el préstamo existe y está activo
    const loan = await this.iLoanRepository.findLoanById(
      createPaymentDto.loanId,
    );

    if (!loan) {
      throw new NotFoundException('loan not found');
    }

    // Verificar que el préstamo pertenece al lender autenticado
    if (loan.userId !== user.id) {
      throw new UnauthorizedException("you can't create payment for this loan");
    }

    // Validar que el préstamo no esté CANCELED o PAID
    if (loan.status === LoanStatus.CANCELED) {
      throw new BadRequestException(
        'cannot create payment for a canceled loan',
      );
    }

    if (loan.status === LoanStatus.PAID) {
      throw new BadRequestException('loan is already fully paid');
    }

    // 2️⃣ Validar el monto - No debe superar la deuda total pendiente
    const totalPaid: number = loan.payments.reduce(
      (sum, payment) => sum + payment.amountPaid,
      0,
    );

    if (
      typeof loan.totalWithInterest !== 'number' ||
      loan.totalWithInterest <= 0
    ) {
      throw new BadRequestException('loan total with interest is invalid');
    }

    const remainingDebt: number = loan.totalWithInterest - totalPaid;

    if (createPaymentDto.amountPaid > remainingDebt) {
      throw new BadRequestException(
        `payment amount (${createPaymentDto.amountPaid}) exceeds remaining debt (${remainingDebt})`,
      );
    }

    // 3️⃣ Determinar a qué cuota aplicar el pago
    let targetInstallmentId: string | null = null;

    if (createPaymentDto.installmentId) {
      // Si se especificó una cuota, validar que existe y pertenece al loan
      const installment = await this.iInstallmentRepository.findInstallmentById(
        createPaymentDto.installmentId,
      );

      if (!installment) {
        throw new NotFoundException('installment not found');
      }

      if (installment.loanId !== createPaymentDto.loanId) {
        throw new BadRequestException(
          'installment does not belong to this loan',
        );
      }

      // Validar que la cuota no esté completamente pagada
      if (installment.status === InstallmentStatus.PAID) {
        throw new BadRequestException('installment is already fully paid');
      }

      // Validar que el pago no exceda el monto restante de la cuota
      const remainingInInstallment =
        installment.amountDue - installment.amountPaid;
      if (createPaymentDto.amountPaid > remainingInInstallment) {
        throw new BadRequestException('amount exceeds installment amountDue');
      }

      targetInstallmentId = installment.id;
    } else {
      // Si no se especificó, buscar la primera cuota pendiente o parcial
      const pendingInstallment = loan.installments.find(
        (inst) =>
          inst.status === InstallmentStatus.PENDING ||
          inst.status === InstallmentStatus.PARTIAL,
      );

      if (pendingInstallment) {
        targetInstallmentId = pendingInstallment.id;
      }
    }

    // Si no hay cuota objetivo, no se puede crear el pago
    if (!targetInstallmentId) {
      throw new BadRequestException(
        'no pending or partial installment found to apply payment',
      );
    }

    // 4️⃣ Crear el pago
    const newPayment = await this.iPaymentRepository.createPayment({
      ...createPaymentDto,
      installmentId: targetInstallmentId,
    });

    // 5️⃣ Aplicar el monto al amountPaid de la cuota
    const installment =
      await this.iInstallmentRepository.findInstallmentById(
        targetInstallmentId,
      );

    if (!installment) {
      throw new NotFoundException(
        'installment not found after payment creation',
      );
    }

    const newAmountPaid = installment.amountPaid + createPaymentDto.amountPaid;
    let newInstallmentStatus: InstallmentStatus;

    // Determinar el nuevo estado de la cuota
    if (newAmountPaid >= installment.amountDue) {
      newInstallmentStatus = InstallmentStatus.PAID;
    } else if (newAmountPaid > 0) {
      newInstallmentStatus = InstallmentStatus.PARTIAL;
    } else {
      newInstallmentStatus = InstallmentStatus.PENDING;
    }

    // Actualizar la cuota
    await this.prismaService.installment.update({
      where: { id: targetInstallmentId },
      data: {
        amountPaid: newAmountPaid,
        status: newInstallmentStatus,
      },
    });

    // 6️⃣ Actualizar el estado del préstamo
    await this.updateLoanStatus(createPaymentDto.loanId);

    // Retornar el pago creado con la cuota actualizada
    return newPayment;
  }

  /**
   * Actualiza el estado del préstamo basándose en el estado de sus cuotas
   */
  private async updateLoanStatus(loanId: string): Promise<void> {
    // Obtener todas las cuotas del préstamo
    const installments =
      await this.iInstallmentRepository.findInstallmentsByLoanId(loanId);

    if (!installments || installments.length === 0) {
      return;
    }

    let newLoanStatus: LoanStatus;

    // Verificar si todas las cuotas están pagadas
    const allPaid = installments.every(
      (inst) => inst.status === InstallmentStatus.PAID,
    );

    if (allPaid) {
      newLoanStatus = LoanStatus.PAID;
    } else {
      // Verificar si alguna cuota está vencida (LATE)
      const hasLateInstallments = installments.some(
        (inst) => inst.status === InstallmentStatus.LATE,
      );

      if (hasLateInstallments) {
        newLoanStatus = LoanStatus.DEFAULTED;
      } else {
        // Si hay cuotas pendientes pero ninguna vencida, mantener ACTIVE
        newLoanStatus = LoanStatus.ACTIVE;
      }
    }

    // Actualizar el estado del préstamo
    await this.prismaService.loan.update({
      where: { id: loanId },
      data: { status: newLoanStatus },
    });
  }
}
