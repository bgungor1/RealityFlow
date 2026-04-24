import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import { Transaction, TransactionDocument } from './schemas/transaction.schema.js';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { CommissionService } from './commission.service.js';
import { UserService } from '../user/user.service.js';
import { BusinessException } from '../common/exceptions/business.exception.js';
import {
    TransactionStage,
    VALID_TRANSITIONS,
} from '../common/constants/stage-transitions.js';

interface PopulatedAgent {
    _id: Types.ObjectId;
    fullName: string;
    email: string;
}

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

    private isPopulated(agent: any): agent is PopulatedAgent {
        return agent && typeof agent === 'object' && 'fullName' in agent;
    }

    async create(dto: CreateTransactionDto): Promise<TransactionDocument> {
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
            .populate('listingAgent', 'fullName email')
            .populate('sellingAgent', 'fullName email')
            .sort({ createdAt: -1 })
            .exec();
    }

    async findById(id: string): Promise<TransactionDocument> {
        const transaction = await this.transactionModel
            .findById(id)
            .populate('listingAgent', 'fullName email')
            .populate('sellingAgent', 'fullName email')
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

        if (currentStage === targetStage) {
            return transaction;
        }

        const allowedNext = VALID_TRANSITIONS[currentStage];
        if (!allowedNext || allowedNext !== targetStage) {
            throw new BadRequestException(
                `Invalid transition: "${currentStage}" → "${targetStage}". ` +
                `Allowed next stage: "${allowedNext || 'none (already completed)'}"`,
            );
        }

        if (targetStage === TransactionStage.COMPLETED) {
            return this.completeTransaction(transaction);
        }

        transaction.stage = targetStage;
        transaction.stageHistory.push({
            from: currentStage,
            to: targetStage,
            changedAt: new Date(),
        });

        await transaction.save();
        this.logger.log(`Transaction ${id}: ${currentStage} → ${targetStage}`);

        return transaction;
    }

    private async completeTransaction(
        transaction: TransactionDocument,
    ): Promise<TransactionDocument> {
        if (transaction.commission !== null) {
            return transaction;
        }

        const session = await this.connection.startSession();

        try {
            session.startTransaction();

            if (
                !this.isPopulated(transaction.listingAgent) ||
                !this.isPopulated(transaction.sellingAgent)
            ) {
                throw new BusinessException(
                    'Agent data not populated for commission calculation',
                );
            }

            const commission = this.commissionService.calculate({
                totalServiceFee: transaction.totalServiceFee,
                listingAgent: {
                    id: transaction.listingAgent._id.toString(),
                    fullName: transaction.listingAgent.fullName,
                },
                sellingAgent: {
                    id: transaction.sellingAgent._id.toString(),
                    fullName: transaction.sellingAgent.fullName,
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

            return transaction;
        } catch (error) {
            await session.abortTransaction();
            if (error instanceof BusinessException) {
                this.logger.warn(`Business rule violation: ${error.message}`);
            } else {
                this.logger.error('Failed to complete transaction, aborted session', error);
            }
            throw error;
        } finally {
            session.endSession();
        }
    }
}
