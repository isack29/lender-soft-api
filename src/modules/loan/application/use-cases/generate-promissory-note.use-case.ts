import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ILoanRepository } from '../../domain/loan.repository';
import { PromissoryNoteService } from 'src/infraestructure/document-generator/promissory-note.service';

@Injectable()
export class GeneratePromissoryNoteUseCase {
  constructor(
    @Inject('ILoanRepository')
    private readonly iLoanRepository: ILoanRepository,
    private readonly promissoryNoteService: PromissoryNoteService,
  ) {}

  async generatePromissoryNote(loanId: string, lenderId: string) {
    // Buscar el préstamo con sus relaciones
    const loan = await this.iLoanRepository.findLoanWithRelations(loanId);

    if (!loan) {
      throw new NotFoundException('loan not found');
    }

    // Verificar que el préstamo pertenece al lender autenticado
    if (loan.userId !== lenderId) {
      throw new UnauthorizedException(
        "you can't generate promissory note for this loan",
      );
    }

    // Generar el documento
    const buffer =
      await this.promissoryNoteService.generatePromissoryNote(loan);

    return buffer;
  }
}
