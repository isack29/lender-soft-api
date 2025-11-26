import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/infra/user.module';
import { HashModule } from './infraestructure/hash/hash.module';
import { AuthModule } from './modules/auth/infra/auth.module';
import { LoggerConfiguredModule } from './infraestructure/logging/logger';
import { DebtorModule } from './modules/debtor/infra/debtor.module';
import { LoanModule } from './modules/loan/infra/loan.module';
import { PaymentModule } from './modules/payment/infra/payment.module';
import { DashboardModule } from './modules/dashboard/infra/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    HashModule,
    UserModule,
    AuthModule,
    DebtorModule,
    LoanModule,
    PaymentModule,
    DashboardModule,
    LoggerConfiguredModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
