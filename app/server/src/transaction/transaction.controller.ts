import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { User } from '@/user/user.entity';
import { Roles } from '@/auth/decorators/roles.decorator';
import { BudgetMemberGuard } from '@/auth/guards/budget-member.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';

@Controller('transaction')
@UseGuards(AuthGuard('jwt'), BudgetMemberGuard, RolesGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  @Roles('OWNER', 'EDITOR', 'VIEWER')
  async findAll(@CurrentUser() user: User) {
    return this.transactionService.findAll(user.id);
  }

  @Put(':id')
  @Roles('OWNER', 'EDITOR')
  async updateTransaction(@Body() body: UpdateTransactionDto) {}

  @Post('batch')
  @Roles('OWNER', 'EDITOR')
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
