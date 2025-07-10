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
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { User } from '@/user/user.entity';
import { BudgetMemberGuard } from '@/auth/guards/budget-member.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';

@Controller('month')
@UseGuards(AuthGuard('jwt'), BudgetMemberGuard, RolesGuard)
export class MonthController {
  constructor(private readonly monthService: MonthService) {}

  // @Get()
  // findAll(@CurrentUser() user: User) {
  //   return this.monthService.findAll(user.id);
  // }

  @Get(':id')
  @Roles('OWNER', 'EDITOR', 'VIEWER')
  findOne(@Param('id') id: number, @CurrentUser() user: User) {
    return this.monthService.findOne(id, user.id);
  }

  @Get(':id/account')
  @Roles('OWNER', 'EDITOR', 'VIEWER')
  getAccountsForMonth(@Param('id') id: number, @CurrentUser() user: User) {
    return this.monthService.getAccounts(user.id, id);
  }

  // @Get('/position/:position')
  // getMonthAtPosition(
  //   @Param('position') position: number,
  //   @CurrentUser() user: User,
  // ) {
  //   return this.monthService.getMonthAtPosition(user.id, position);
  // }

  @Post()
  @Roles('OWNER', 'EDITOR')
  create(@Body() month: CreateMonthDto, @CurrentUser() user: User) {
    return this.monthService.createWithOptions(user.id, month, {
      copyAccounts: true,
    });
  }

  @Put(':id')
  @Roles('OWNER', 'EDITOR')
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() body: Partial<UpdateMonthDto>,
  ) {
    return this.monthService.update(
      'api',
      Number(id),
      instanceToPlain(body),
    );
  }

  @Delete(':id')
  @Roles('OWNER', 'EDITOR')
  delete(@CurrentUser() user: User, @Param('id') id: string) {
    this.monthService.checkAccess(+id, user.id);
    return this.monthService.delete('api', Number(id));
  }

  @Post(':id/transaction')
  @Roles('OWNER', 'EDITOR')
  addTransaction(
    @CurrentUser() user: User,
    @Param('id') id: number,
    @Body() body: CreateTransactionDto,
  ) {
    return this.monthService.addTransaction(id, body);
  }
}
