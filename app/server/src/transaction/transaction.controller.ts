import { Body, Controller, Get, Post, Put } from '@nestjs/common';
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
    async updateTransaction(@Body() body: UpdateTransactionDto) {

    }

    @Post()
    async createTransactions(@Body() body: CreateTransactionDto[]) {
        return this.transactionService.createTransactions(body);
    }
}
