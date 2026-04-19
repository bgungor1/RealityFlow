import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { TransactionStage } from '../../common/constants/stage-transitions.js';


@Schema({ _id: false })
export class AgentShare {
    @Prop({ type: Types.ObjectId, required: true })
    agentId: Types.ObjectId;

    @Prop({ required: true })
    agentName: string;

    @Prop({ required: true, enum: ['listing', 'selling', 'both'] })
    role: string;

    @Prop({ required: true })
    amount: number;

    @Prop({ required: true })
    percentage: number;
}

export const AgentShareSchema = SchemaFactory.createForClass(AgentShare);

@Schema({ _id: false })
export class Commission {
    @Prop({ required: true })
    totalPool: number;

    @Prop({ required: true })
    agencyAmount: number;

    @Prop({ required: true, default: 50 })
    agencyPercentage: number;

    @Prop({ type: [AgentShareSchema], required: true })
    agentShares: AgentShare[];

    @Prop({ required: true })
    calculatedAt: Date;
}

export const CommissionSchema = SchemaFactory.createForClass(Commission);

@Schema({ _id: false })
export class StageHistoryEntry {
    @Prop({ required: true, enum: TransactionStage })
    from: string;

    @Prop({ required: true, enum: TransactionStage })
    to: string;

    @Prop({ required: true, default: () => new Date() })
    changedAt: Date;
}

export const StageHistoryEntrySchema = SchemaFactory.createForClass(StageHistoryEntry);

// --- Main Transaction Document (Aggregate Root) ---

export type TransactionDocument = HydratedDocument<Transaction>;

@Schema({ timestamps: true })
export class Transaction {
    @Prop({ required: true, trim: true })
    propertyAddress: string;

    @Prop({ required: true, enum: ['sale', 'rental'] })
    propertyType: string;

    @Prop({ required: true, min: 0 })
    totalServiceFee: number;

    @Prop({
        required: true,
        enum: TransactionStage,
        default: TransactionStage.AGREEMENT,
    })
    stage: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    listingAgentId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    sellingAgentId: Types.ObjectId;

    @Prop({ type: CommissionSchema, default: null })
    commission: Commission | null;

    @Prop({ type: [StageHistoryEntrySchema], default: [] })
    stageHistory: StageHistoryEntry[];
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
