import { BadRequestException, Body, Controller, Get, Post, Put, Query } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  async findAll() {
    return this.transactionService.findAll();
  }

  @Put(':id')
  async updateTransaction(@Body() body: UpdateTransactionDto) {}

  @Post('batch')
  async createTransactionsBatch(
    @Query('budgetId') budgetId: string,
    @Body() transactions: CreateTransactionDto[],
  ) {
    if (!budgetId) {
      throw new BadRequestException('budgetId query parameter is required');
    }

    const budgetIdNum = Number(budgetId);
    if (isNaN(budgetIdNum)) {
      throw new BadRequestException('budgetId must be a valid number');
    }

    return this.transactionService.createTransactions(
      budgetIdNum,
      transactions,
    );
  }
}
