import { Body, Controller, Get, Put } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

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
}
