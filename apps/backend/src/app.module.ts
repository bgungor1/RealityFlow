import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DATABASE_CONFIG } from './config/database.config.js';
import { UserModule } from './user/user.module.js';
import { TransactionModule } from './transaction/transaction.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync(DATABASE_CONFIG),
    UserModule,
    TransactionModule,
    DashboardModule,
  ],
})
export class AppModule {}
