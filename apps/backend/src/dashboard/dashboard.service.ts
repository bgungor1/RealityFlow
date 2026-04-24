import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
    Transaction,
    TransactionDocument,
} from '../transaction/schemas/transaction.schema.js';
import { TransactionStage } from '../common/constants/stage-transitions.js';

export interface TopAgentResult {
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
        const [aggregationResult, recentTransactions, allTransactions] = await Promise.all([
            this.transactionModel
                .aggregate([
                    {
                        $facet: {
                            totalCount: [{ $count: 'count' }],
                            byStage: [{ $group: { _id: '$stage', count: { $sum: 1 } } }],
                            revenue: [
                                { $match: { stage: TransactionStage.COMPLETED } },
                                {
                                    $group: {
                                        _id: null,
                                        totalRevenue: { $sum: '$totalServiceFee' },
                                        agencyRevenue: { $sum: '$commission.agencyAmount' },
                                    },
                                },
                            ],
                            topAgents: [
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
                            ],
                        },
                    },
                ])
                .exec(),
            this.getRecentTransactions(),
            this.getAllTransactions(),
        ]);

        const metrics = aggregationResult[0];

        return {
            totalTransactions: metrics.totalCount[0]?.count ?? 0,
            byStage: this.formatByStage(metrics.byStage),
            totalRevenue: metrics.revenue[0]?.totalRevenue ?? 0,
            agencyRevenue: metrics.revenue[0]?.agencyRevenue ?? 0,
            recentTransactions,
            allTransactions,
            topAgents: metrics.topAgents,
        };
    }

    private formatByStage(
        rawStages: { _id: string; count: number }[],
    ): Record<string, number> {
        const stages = Object.values(TransactionStage);
        return stages.reduce(
            (acc, stage) => {
                const found = rawStages.find((r) => r._id === stage);
                acc[stage] = found?.count ?? 0;
                return acc;
            },
            {} as Record<string, number>,
        );
    }

    private async getRecentTransactions(): Promise<TransactionDocument[]> {
        return this.transactionModel
            .find()
            .populate('listingAgent', 'fullName email')
            .populate('sellingAgent', 'fullName email')
            .sort({ createdAt: -1 })
            .limit(5)
            .exec();
    }

    private async getAllTransactions(): Promise<TransactionDocument[]> {
        return this.transactionModel
            .find()
            .populate('listingAgent', 'fullName email')
            .populate('sellingAgent', 'fullName email')
            .sort({ createdAt: -1 })
            .exec();
    }
}
