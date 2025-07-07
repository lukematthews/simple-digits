import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { MonthService } from '@/month/month.service';
import { CreateMonthDto } from './dto/create-month.dto';
import { UpdateMonthDto } from './dto/update-month.dto';
import { CreateTransactionDto } from '@/transaction/dto/create-transaction.dto';
import { instanceToPlain } from 'class-transformer';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/user/user.entity';

@Controller('month')
@UseGuards(AuthGuard('jwt'))
export class MonthController {
  constructor(private readonly monthService: MonthService) {}

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.monthService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: number, @CurrentUser() user: User) {
    return this.monthService.findOne(id, user.id);
  }

  @Get(':id/account')
  getAccountsForMonth(@Param('id') id: number, @CurrentUser() user: User) {
    return this.monthService.getAccounts(user.id, id);
  }

  @Get('/position/:position')
  getMonthAtPosition(
    @Param('position') position: number,
    @CurrentUser() user: User,
  ) {
    return this.monthService.getMonthAtPosition(user.id, position);
  }

  @Post()
  create(@Body() month: CreateMonthDto, @CurrentUser() user: User) {
    return this.monthService.createWithOptions(user.id, month, {
      copyAccounts: true,
    });
  }

  @Put(':id')
  update(@CurrentUser()user: User, @Param('id') id: string, @Body() body: Partial<UpdateMonthDto>) {
    return this.monthService.update(user.id, 'api', Number(id), instanceToPlain(body));
  }

  @Delete(':id')
  delete(@CurrentUser()user: User, @Param('id') id: string) {
    return this.monthService.delete(user.id, 'api', Number(id));
  }

  @Post(':id/transaction')
  addTransaction(@CurrentUser()user: User, @Param('id') id: number, @Body() body: CreateTransactionDto) {
    return this.monthService.addTransaction(user.id, id, body);
  }
}
