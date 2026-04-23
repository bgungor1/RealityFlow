import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Transaction, TransactionDocument } from './schemas/transaction.schema.js';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { CommissionService } from './commission.service.js';
import { UserService } from '../user/user.service.js';
import {
    TransactionStage,
    VALID_TRANSITIONS,
} from '../common/constants/stage-transitions.js';

@Injectable()
export class TransactionService {
    private readonly logger = new Logger(TransactionService.name);

    constructor(
        @InjectModel(Transaction.name)
        private readonly transactionModel: Model<TransactionDocument>,
        @InjectConnection()
        private readonly connection: Connection,
        private readonly commissionService: CommissionService,
        private readonly userService: UserService,
    ) { }

    async create(dto: CreateTransactionDto): Promise<TransactionDocument> {
        // Agent'ların var olduğunu doğrula
        await this.userService.findById(dto.listingAgentId);
        await this.userService.findById(dto.sellingAgentId);

        const transaction = await this.transactionModel.create({
            ...dto,
            stage: TransactionStage.AGREEMENT,
        });

        this.logger.log(`Transaction created: ${transaction._id}`);
        return transaction;
    }

    async findAll(stage?: TransactionStage): Promise<TransactionDocument[]> {
        const filter = stage ? { stage } : {};
        return this.transactionModel
            .find(filter)
            .populate('listingAgentId', 'fullName email')
            .populate('sellingAgentId', 'fullName email')
            .sort({ createdAt: -1 })
            .exec();
    }

    async findById(id: string): Promise<TransactionDocument> {
        const transaction = await this.transactionModel
            .findById(id)
            .populate('listingAgentId', 'fullName email')
            .populate('sellingAgentId', 'fullName email')
            .exec();

        if (!transaction) {
            throw new NotFoundException(`Transaction with id "${id}" not found`);
        }
        return transaction;
    }

    async transitionStage(
        id: string,
        targetStage: TransactionStage,
    ): Promise<TransactionDocument> {
        const transaction = await this.findById(id);
        const currentStage = transaction.stage;

        // İdempotency: zaten hedef stage'deyse mevcut state'i dön
        if (currentStage === targetStage) {
            return transaction;
        }

        // Config-driven validasyon
        const allowedNext = VALID_TRANSITIONS[currentStage];
        if (!allowedNext || allowedNext !== targetStage) {
            throw new BadRequestException(
                `Invalid transition: "${currentStage}" → "${targetStage}". ` +
                `Allowed next stage: "${allowedNext || 'none (already completed)'}"`,
            );
        }

        // Completed stage'e geçişte commission hesapla (MongoDB session ile atomik)
        if (targetStage === TransactionStage.COMPLETED) {
            return this.completeTransaction(transaction);
        }

        // Normal stage geçişi
        transaction.stage = targetStage;
        transaction.stageHistory.push({
            from: currentStage,
            to: targetStage,
            changedAt: new Date(),
        });

        await transaction.save();
        this.logger.log(`Transaction ${id}: ${currentStage} → ${targetStage}`);

        return this.findById(id);
    }

    private async completeTransaction(
        transaction: TransactionDocument,
    ): Promise<TransactionDocument> {
        // Defensive idempotency: commission zaten hesaplanmışsa tekrar hesaplama
        if (transaction.commission !== null) {
            return transaction;
        }

        const session = await this.connection.startSession();

        try {
            session.startTransaction();

            // Populate edilmiş (zaten verisi çekilmiş) objeleri doğrudan kullanıyoruz.
            // Eskiden burada .toString() yapıldığı için "[object Object]" hatası veriyordu.
            const listingAgent: any = transaction.listingAgentId;
            const sellingAgent: any = transaction.sellingAgentId;

            const commission = this.commissionService.calculate({
                totalServiceFee: transaction.totalServiceFee,
                listingAgent: {
                    id: listingAgent._id.toString(),
                    fullName: listingAgent.fullName,
                },
                sellingAgent: {
                    id: sellingAgent._id.toString(),
                    fullName: sellingAgent.fullName,
                },
            });

            transaction.stage = TransactionStage.COMPLETED;
            transaction.commission = commission;
            transaction.stageHistory.push({
                from: TransactionStage.TITLE_DEED,
                to: TransactionStage.COMPLETED,
                changedAt: new Date(),
            });

            await transaction.save({ session });
            await session.commitTransaction();

            this.logger.log(
                `Transaction ${transaction._id} completed. Commission calculated atomically.`,
            );

            return this.findById(transaction._id.toString());
        } catch (error) {
            await session.abortTransaction();
            this.logger.error('Failed to complete transaction, aborted session', error);
            throw error;
        } finally {
            session.endSession();
        }
    }
}
