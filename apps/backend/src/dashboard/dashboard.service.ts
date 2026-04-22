import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
    Transaction,
    TransactionDocument,
} from '../transaction/schemas/transaction.schema.js';
import { TransactionStage } from '../common/constants/stage-transitions.js';

interface TopAgentResult {
    agentId: string;
    agentName: string;
    totalEarnings: number;
    transactionCount: number;
}

@Injectable()
export class DashboardService {
    constructor(
        @InjectModel(Transaction.name)
        private readonly transactionModel: Model<TransactionDocument>,
    ) { }

    async getDashboard() {
        const [
            totalTransactions,
            byStage,
            revenueData,
            recentTransactions,
            topAgents,
        ] = await Promise.all([
            this.getTotalTransactions(),
            this.getByStage(),
            this.getRevenueData(),
            this.getRecentTransactions(),
            this.getTopAgents(),
        ]);

        return {
            totalTransactions,
            byStage,
            totalRevenue: revenueData.totalRevenue,
            agencyRevenue: revenueData.agencyRevenue,
            recentTransactions,
            topAgents,
        };
    }

    private async getTotalTransactions(): Promise<number> {
        return this.transactionModel.countDocuments().exec();
    }

    private async getByStage(): Promise<Record<string, number>> {
        const stages = Object.values(TransactionStage);
        const counts = await Promise.all(
            stages.map(async (stage) => ({
                stage,
                count: await this.transactionModel.countDocuments({ stage }).exec(),
            })),
        );

        return counts.reduce(
            (acc, { stage, count }) => {
                acc[stage] = count;
                return acc;
            },
            {} as Record<string, number>,
        );
    }

    private async getRevenueData(): Promise<{
        totalRevenue: number;
        agencyRevenue: number;
    }> {
        const result = await this.transactionModel
            .aggregate([
                { $match: { stage: TransactionStage.COMPLETED } },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: '$totalServiceFee' },
                        agencyRevenue: { $sum: '$commission.agencyAmount' },
                    },
                },
            ])
            .exec();

        return {
            totalRevenue: result[0]?.totalRevenue ?? 0,
            agencyRevenue: result[0]?.agencyRevenue ?? 0,
        };
    }

    private async getRecentTransactions(): Promise<TransactionDocument[]> {
        return this.transactionModel
            .find()
            .populate('listingAgentId', 'fullName email')
            .populate('sellingAgentId', 'fullName email')
            .sort({ createdAt: -1 })
            .limit(5)
            .exec();
    }

    private async getTopAgents(): Promise<TopAgentResult[]> {
        return this.transactionModel
            .aggregate([
                { $match: { stage: TransactionStage.COMPLETED } },
                { $unwind: '$commission.agentShares' },
                {
                    $group: {
                        _id: '$commission.agentShares.agentId',
                        agentName: { $first: '$commission.agentShares.agentName' },
                        totalEarnings: { $sum: '$commission.agentShares.amount' },
                        transactionCount: { $sum: 1 },
                    },
                },
                { $sort: { totalEarnings: -1 } },
                { $limit: 5 },
                {
                    $project: {
                        _id: 0,
                        agentId: '$_id',
                        agentName: 1,
                        totalEarnings: 1,
                        transactionCount: 1,
                    },
                },
            ])
            .exec();
    }
}

