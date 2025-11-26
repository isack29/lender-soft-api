import { Injectable } from '@nestjs/common';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  HeadingLevel,
  UnderlineType,
} from 'docx';
import type { User, Debtor, LoanStatus } from '@prisma/client';

interface LoanWithRelations {
  id: string;
  amount: number;
  interestRate: number;
  totalWithInterest: number;
  term: number;
  startDate: Date;
  dueDate: Date;
  userId: string;
  debtorId: string;
  status: LoanStatus;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  debtor: Debtor;
}

@Injectable()
export class PromissoryNoteService {
  async generatePromissoryNote(loan: LoanWithRelations): Promise<Buffer> {
    // Configuración de fuente y espaciado por defecto
    const defaultFont = 'Arial';
    const defaultSize = 24; // 12pt
    const lineSpacing = 360; // 1.5 interlineado

    const doc = new Document({
      styles: {
        default: {
          document: {
            run: {
              font: defaultFont,
              size: defaultSize,
            },
            paragraph: {
              spacing: {
                line: lineSpacing,
              },
            },
          },
        },
      },
      sections: [
        {
          properties: {},
          children: [
            // Título
            new Paragraph({
              text: 'PAGARÉ',
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: {
                after: 400,
                line: lineSpacing,
              },
            }),

            // Número de pagaré
            new Paragraph({
              children: [
                new TextRun({
                  text: `No. ${loan.id}`,
                  bold: true,
                  font: defaultFont,
                  size: defaultSize,
                }),
              ],
              alignment: AlignmentType.RIGHT,
              spacing: {
                after: 200,
                line: lineSpacing,
              },
            }),

            // Monto
            new Paragraph({
              children: [
                new TextRun({
                  text: 'MONTO: ',
                  bold: true,
                  font: defaultFont,
                  size: defaultSize,
                }),
                new TextRun({
                  text: `$${loan.totalWithInterest.toFixed(2)}`,
                  bold: true,
                  font: defaultFont,
                  size: 28,
                }),
              ],
              spacing: {
                after: 300,
                line: lineSpacing,
              },
            }),

            // Cuerpo del pagaré
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Por medio del presente pagaré, yo ',
                  font: defaultFont,
                  size: defaultSize,
                }),
                new TextRun({
                  text: `${loan.debtor.firstName} ${loan.debtor.lastName}`,
                  bold: true,
                  font: defaultFont,
                  size: defaultSize,
                  underline: {
                    type: UnderlineType.SINGLE,
                  },
                }),
                new TextRun({
                  text: ', identificado(a) con documento ',
                  font: defaultFont,
                  size: defaultSize,
                }),
                new TextRun({
                  text: loan.debtor.document,
                  bold: true,
                  font: defaultFont,
                  size: defaultSize,
                }),
                new TextRun({
                  text: ', con domicilio en ',
                  font: defaultFont,
                  size: defaultSize,
                }),
                new TextRun({
                  text: loan.debtor.address,
                  bold: true,
                  font: defaultFont,
                  size: defaultSize,
                }),
                new TextRun({
                  text: ', me comprometo a pagar incondicionalmente a la orden de ',
                  font: defaultFont,
                  size: defaultSize,
                }),
                new TextRun({
                  text: `${loan.user.firstname} ${loan.user.lastname}`,
                  bold: true,
                  font: defaultFont,
                  size: defaultSize,
                  underline: {
                    type: UnderlineType.SINGLE,
                  },
                }),
                new TextRun({
                  text: ', identificado(a) con documento ',
                  font: defaultFont,
                  size: defaultSize,
                }),
                new TextRun({
                  text: loan.user.document,
                  bold: true,
                  font: defaultFont,
                  size: defaultSize,
                }),
                new TextRun({
                  text: ', la suma de ',
                  font: defaultFont,
                  size: defaultSize,
                }),
                new TextRun({
                  text: `$${loan.totalWithInterest.toFixed(2)}`,
                  bold: true,
                  font: defaultFont,
                  size: defaultSize,
                }),
                new TextRun({
                  text: '.',
                  font: defaultFont,
                  size: defaultSize,
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
              spacing: {
                after: 300,
                line: lineSpacing,
              },
            }),

            // Detalles del préstamo
            new Paragraph({
              text: 'CONDICIONES DEL PRÉSTAMO:',
              heading: HeadingLevel.HEADING_2,
              spacing: {
                before: 300,
                after: 200,
                line: lineSpacing,
              },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: '• Monto del préstamo (capital): ',
                  font: defaultFont,
                  size: defaultSize,
                }),
                new TextRun({
                  text: `$${loan.amount.toFixed(2)}`,
                  bold: true,
                  font: defaultFont,
                  size: defaultSize,
                }),
              ],
              spacing: {
                after: 100,
                line: lineSpacing,
              },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: '• Tasa de interés: ',
                  font: defaultFont,
                  size: defaultSize,
                }),
                new TextRun({
                  text: `${loan.interestRate}%`,
                  bold: true,
                  font: defaultFont,
                  size: defaultSize,
                }),
              ],
              spacing: {
                after: 100,
                line: lineSpacing,
              },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: '• Monto total a pagar (capital + intereses): ',
                  font: defaultFont,
                  size: defaultSize,
                }),
                new TextRun({
                  text: `$${loan.totalWithInterest.toFixed(2)}`,
                  bold: true,
                  font: defaultFont,
                  size: defaultSize,
                }),
              ],
              spacing: {
                after: 100,
                line: lineSpacing,
              },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: '• Plazo: ',
                  font: defaultFont,
                  size: defaultSize,
                }),
                new TextRun({
                  text: `${loan.term} meses`,
                  bold: true,
                  font: defaultFont,
                  size: defaultSize,
                }),
              ],
              spacing: {
                after: 100,
                line: lineSpacing,
              },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: '• Fecha de inicio: ',
                  font: defaultFont,
                  size: defaultSize,
                }),
                new TextRun({
                  text: new Date(loan.startDate).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }),
                  bold: true,
                  font: defaultFont,
                  size: defaultSize,
                }),
              ],
              spacing: {
                after: 100,
                line: lineSpacing,
              },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: '• Fecha de vencimiento: ',
                  font: defaultFont,
                  size: defaultSize,
                }),
                new TextRun({
                  text: new Date(loan.dueDate).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }),
                  bold: true,
                  font: defaultFont,
                  size: defaultSize,
                }),
              ],
              spacing: {
                after: 100,
                line: lineSpacing,
              },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: '• Cuota mensual aproximada: ',
                  font: defaultFont,
                  size: defaultSize,
                }),
                new TextRun({
                  text: `$${(loan.totalWithInterest / loan.term).toFixed(2)}`,
                  bold: true,
                  font: defaultFont,
                  size: defaultSize,
                }),
              ],
              spacing: {
                after: 300,
                line: lineSpacing,
              },
            }),

            // Cláusulas
            new Paragraph({
              text: 'CLÁUSULAS:',
              heading: HeadingLevel.HEADING_2,
              spacing: {
                before: 300,
                after: 200,
                line: lineSpacing,
              },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: '1. El pago se realizará en cuotas mensuales iguales durante el plazo establecido.',
                  font: defaultFont,
                  size: defaultSize,
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
              spacing: {
                after: 150,
                line: lineSpacing,
              },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: '2. En caso de mora, se aplicarán los intereses moratorios según la legislación vigente.',
                  font: defaultFont,
                  size: defaultSize,
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
              spacing: {
                after: 150,
                line: lineSpacing,
              },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: '3. El deudor se compromete a realizar los pagos en las fechas acordadas.',
                  font: defaultFont,
                  size: defaultSize,
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
              spacing: {
                after: 150,
                line: lineSpacing,
              },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: '4. Este pagaré es negociable y transferible.',
                  font: defaultFont,
                  size: defaultSize,
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
              spacing: {
                after: 400,
                line: lineSpacing,
              },
            }),

            // Información de contacto
            new Paragraph({
              text: 'INFORMACIÓN DE CONTACTO:',
              heading: HeadingLevel.HEADING_2,
              spacing: {
                before: 300,
                after: 200,
                line: lineSpacing,
              },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: 'Deudor - Teléfono: ',
                  bold: true,
                  font: defaultFont,
                  size: defaultSize,
                }),
                new TextRun({
                  text: loan.debtor.phone,
                  font: defaultFont,
                  size: defaultSize,
                }),
                new TextRun({
                  text: ' | Email: ',
                  bold: true,
                  font: defaultFont,
                  size: defaultSize,
                }),
                new TextRun({
                  text: loan.debtor.email,
                  font: defaultFont,
                  size: defaultSize,
                }),
              ],
              spacing: {
                after: 100,
                line: lineSpacing,
              },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: 'Acreedor - Teléfono: ',
                  bold: true,
                  font: defaultFont,
                  size: defaultSize,
                }),
                new TextRun({
                  text: loan.user.phone,
                  font: defaultFont,
                  size: defaultSize,
                }),
                new TextRun({
                  text: ' | Email: ',
                  bold: true,
                  font: defaultFont,
                  size: defaultSize,
                }),
                new TextRun({
                  text: loan.user.email,
                  font: defaultFont,
                  size: defaultSize,
                }),
              ],
              spacing: {
                after: 500,
                line: lineSpacing,
              },
            }),

            // Firmas
            new Paragraph({
              text: 'FIRMAS:',
              heading: HeadingLevel.HEADING_2,
              spacing: {
                before: 400,
                after: 300,
                line: lineSpacing,
              },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: '_'.repeat(40),
                  font: defaultFont,
                  size: defaultSize,
                }),
              ],
              spacing: {
                before: 400,
                after: 100,
                line: lineSpacing,
              },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `${loan.debtor.firstName} ${loan.debtor.lastName}`,
                  bold: true,
                  font: defaultFont,
                  size: defaultSize,
                }),
              ],
              spacing: {
                after: 50,
                line: lineSpacing,
              },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: 'DEUDOR',
                  font: defaultFont,
                  size: defaultSize,
                }),
              ],
              spacing: {
                after: 50,
                line: lineSpacing,
              },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `Doc: ${loan.debtor.document}`,
                  font: defaultFont,
                  size: defaultSize,
                }),
              ],
              spacing: {
                after: 400,
                line: lineSpacing,
              },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: '_'.repeat(40),
                  font: defaultFont,
                  size: defaultSize,
                }),
              ],
              spacing: {
                before: 200,
                after: 100,
                line: lineSpacing,
              },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `${loan.user.firstname} ${loan.user.lastname}`,
                  bold: true,
                  font: defaultFont,
                  size: defaultSize,
                }),
              ],
              spacing: {
                after: 50,
                line: lineSpacing,
              },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: 'ACREEDOR',
                  font: defaultFont,
                  size: defaultSize,
                }),
              ],
              spacing: {
                after: 50,
                line: lineSpacing,
              },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `Doc: ${loan.user.document}`,
                  font: defaultFont,
                  size: defaultSize,
                }),
              ],
              spacing: {
                after: 200,
                line: lineSpacing,
              },
            }),

            // Fecha de emisión
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Fecha de emisión: ',
                  font: defaultFont,
                  size: defaultSize,
                }),
                new TextRun({
                  text: new Date().toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }),
                  bold: true,
                  font: defaultFont,
                  size: defaultSize,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: {
                before: 300,
                line: lineSpacing,
              },
            }),
          ],
        },
      ],
    });

    // Convertir el documento a buffer
    const buffer = await Packer.toBuffer(doc);
    return buffer;
  }
}
