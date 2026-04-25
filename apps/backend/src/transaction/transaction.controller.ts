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

import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionController {
    constructor(private readonly transactionService: TransactionService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new real estate transaction' })
    @ApiResponse({ status: 201, description: 'Transaction successfully created.' })
    create(@Body() dto: CreateTransactionDto) {
        return this.transactionService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all transactions, optionally filtered by stage' })
    findAll(
        @Query('stage', new ParseEnumPipe(TransactionStage, { optional: true }))
        stage?: TransactionStage,
    ) {
        return this.transactionService.findAll(stage);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a specific transaction by its ID' })
    @ApiResponse({ status: 200, description: 'Returns the transaction details.' })
    @ApiResponse({ status: 404, description: 'Transaction not found.' })
    findById(@Param('id', ParseMongoIdPipe) id: string) {
        return this.transactionService.findById(id);
    }

    @Patch(':id/transition')
    @ApiOperation({ summary: 'Transition a transaction to the next lifecycle stage' })
    @ApiResponse({ status: 200, description: 'Stage successfully updated.' })
    @ApiResponse({ status: 400, description: 'Invalid stage transition.' })
    transitionStage(
        @Param('id', ParseMongoIdPipe) id: string,
        @Body() dto: TransitionStageDto,
    ) {
        return this.transactionService.transitionStage(id, dto.targetStage);
    }
}
