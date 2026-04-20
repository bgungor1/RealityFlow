import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Transaction, TransactionSchema } from './schemas/transaction.schema.js';
import { TransactionService } from './transaction.service.js';
import { TransactionController } from './transaction.controller.js';
import { CommissionService } from './commission.service.js';
import { UserModule } from '../user/user.module.js';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Transaction.name, schema: TransactionSchema },
        ]),
        UserModule,
    ],
    controllers: [TransactionController],
    providers: [TransactionService, CommissionService],
    exports: [TransactionService],
})
export class TransactionModule { }
