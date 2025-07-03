import { BadRequestException, Body, Controller, Get, Post, Put, Query, UseGuards } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/user/user.entity';

@Controller('transaction')
@UseGuards(AuthGuard('jwt'))
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  async findAll(@CurrentUser() user: User) {
    return this.transactionService.findAll(user.id);
  }

  @Put(':id')
  async updateTransaction(@Body() body: UpdateTransactionDto) {}

  @Post('batch')
  async createTransactionsBatch(
    @Query('budgetId') budgetId: string,
    @CurrentUser() user: User,
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
      user.id,
      transactions,
    );
  }
}
