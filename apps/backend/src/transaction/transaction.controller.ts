import {
    Controller,
    Post,
    Get,
    Patch,
    Param,
    Body,
    Query,
    ParseEnumPipe,
} from '@nestjs/common';
import { TransactionService } from './transaction.service.js';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { TransitionStageDto } from './dto/transition-stage.dto.js';
import { TransactionStage } from '../common/constants/stage-transitions.js';
import { ParseMongoIdPipe } from '../common/pipes/parse-mongo-id.pipe.js';

@Controller('api/transactions')
export class TransactionController {
    constructor(private readonly transactionService: TransactionService) { }

    @Post()
    create(@Body() dto: CreateTransactionDto) {
        return this.transactionService.create(dto);
    }

    @Get()
    findAll(
        @Query('stage', new ParseEnumPipe(TransactionStage, { optional: true }))
        stage?: TransactionStage,
    ) {
        return this.transactionService.findAll(stage);
    }

    @Get(':id')
    findById(@Param('id', ParseMongoIdPipe) id: string) {
        return this.transactionService.findById(id);
    }

    @Patch(':id/transition')
    transitionStage(
        @Param('id', ParseMongoIdPipe) id: string,
        @Body() dto: TransitionStageDto,
    ) {
        return this.transactionService.transitionStage(id, dto.targetStage);
    }
}
