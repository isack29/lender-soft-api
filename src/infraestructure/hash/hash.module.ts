import { Global, Module } from '@nestjs/common';
import { BcryptService } from './bcrypt.service';

/**
 * Módulo global para el servicio de hashing
 * @Global hace que el servicio esté disponible en toda la aplicación sin necesidad de importarlo
 */
@Global()
@Module({
  providers: [
    {
      provide: 'IHashService',
      useClass: BcryptService,
    },
  ],
  exports: ['IHashService'],
})
export class HashModule {}
