import { Module } from '@nestjs/common';
import { AuthController } from '../presentation/auth.controller';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { UserModule } from '../../user/infra/user.module';
import { JwtInfrastructureModule } from '../../../infraestructure/auth/jwt.module';

@Module({
  imports: [JwtInfrastructureModule, UserModule],
  controllers: [AuthController],
  providers: [LoginUseCase],
  exports: [LoginUseCase],
})
export class AuthModule {}
