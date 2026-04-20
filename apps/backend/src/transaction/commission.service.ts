import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { Commission } from './schemas/transaction.schema.js';

interface AgentInfo {
    id: string;
    fullName: string;
}

interface CalculateInput {
    totalServiceFee: number;
    listingAgent: AgentInfo;
    sellingAgent: AgentInfo;
}

/**
 * CommissionService — İzole commission hesaplama servisi.
 *
 * Kurallar (ai-rules.md):
 * - %50 agency, %50 agentlara
 * - Aynı agent → agent payının %100'ü tek kişiye
 * - Farklı agentlar → agent payı eşit bölünür (%25 + %25)
 */
@Injectable()
export class CommissionService {
    calculate(input: CalculateInput): Commission {
        const { totalServiceFee, listingAgent, sellingAgent } = input;

        const agencyPercentage = 50;
        const agencyAmount = totalServiceFee * (agencyPercentage / 100);
        const agentPool = totalServiceFee - agencyAmount;

        const isSameAgent = listingAgent.id === sellingAgent.id;

        const agentShares = isSameAgent
            ? [
                {
                    agentId: new Types.ObjectId(listingAgent.id),
                    agentName: listingAgent.fullName,
                    role: 'both' as const,
                    amount: agentPool,
                    percentage: 50,
                },
            ]
            : [
                {
                    agentId: new Types.ObjectId(listingAgent.id),
                    agentName: listingAgent.fullName,
                    role: 'listing' as const,
                    amount: agentPool / 2,
                    percentage: 25,
                },
                {
                    agentId: new Types.ObjectId(sellingAgent.id),
                    agentName: sellingAgent.fullName,
                    role: 'selling' as const,
                    amount: agentPool / 2,
                    percentage: 25,
                },
            ];

        return {
            totalPool: totalServiceFee,
            agencyAmount,
            agencyPercentage,
            agentShares,
            calculatedAt: new Date(),
        };
    }
}