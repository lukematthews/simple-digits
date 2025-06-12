import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { MonthService } from '@/month/month.service';
import { CreateMonthDto } from './dto/create-month.dto';
import { UpdateMonthDto } from './dto/update-month.dto';
import { CreateTransactionDto } from '@/transaction/dto/create-transaction.dto';

@Controller('month')
export class MonthController {
  constructor(private readonly monthService: MonthService) {}

  @Get()
  findAll() {
    return this.monthService.findAll();
  }

  @Get(':id/account')
  getAccountsForMonth(@Param('id') id: number) {
    return this.monthService.getAccounts(id);
  }

  @Get('/position/:position')
  getMonthAtPosition(@Param('position') position: number) {
    return this.monthService.getMonthAtPosition(position);
  }
  
  @Post()
  create(@Body() month: CreateMonthDto) {
    return this.monthService.createWithOptions(month, {copyAccounts: true});
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<UpdateMonthDto>) {
    return this.monthService.update('api', Number(id), body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.monthService.delete('api', Number(id));
  }

  @Post(':id/transaction')
  addTransaction(@Param('id') id: number, @Body() body: CreateTransactionDto) {
    return this.monthService.addTransaction(id, body);
  }
}
