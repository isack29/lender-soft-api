import { Module } from '@nestjs/common';
import { PromissoryNoteService } from './promissory-note.service';

@Module({
  providers: [PromissoryNoteService],
  exports: [PromissoryNoteService],
})
export class DocumentGeneratorModule {}
