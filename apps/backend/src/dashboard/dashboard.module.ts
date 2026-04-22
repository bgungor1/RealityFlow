import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
    Transaction,
    TransactionSchema,
} from '../transaction/schemas/transaction.schema.js';
import { DashboardService } from './dashboard.service.js';
import { DashboardController } from './dashboard.controller.js';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Transaction.name, schema: TransactionSchema },
        ]),
    ],
    controllers: [DashboardController],
    providers: [DashboardService],
})
export class DashboardModule { }
