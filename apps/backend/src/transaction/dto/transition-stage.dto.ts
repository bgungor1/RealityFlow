import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionStage } from '../../common/constants/stage-transitions.js';

export class TransitionStageDto {
    @ApiProperty({ 
        enum: TransactionStage, 
        example: TransactionStage.EARNEST_MONEY,
        description: 'The lifecycle stage to move the transaction to' 
    })
    @IsEnum(TransactionStage)
    @IsNotEmpty()
    targetStage: TransactionStage;
}
