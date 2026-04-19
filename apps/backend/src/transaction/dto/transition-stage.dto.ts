import { IsEnum, IsNotEmpty } from 'class-validator';
import { TransactionStage } from '../../common/constants/stage-transitions.js';

export class TransitionStageDto {
    @IsEnum(TransactionStage)
    @IsNotEmpty()
    targetStage: TransactionStage;
}
