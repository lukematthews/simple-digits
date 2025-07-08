import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { Account } from './account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { User } from '@/user/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { BudgetMemberGuard } from '@/auth/guards/budget-member.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';

@Controller('accounts')
@UseGuards(AuthGuard('jwt'), BudgetMemberGuard, RolesGuard)
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.accountService.findAll(user.id);
  }

  @Post()
  @Roles('OWNER', 'EDITOR')
  create(@Body() account: CreateAccountDto) {
    return this.accountService.createFromDto(account);
  }

  @Put(':id')
  @Roles('OWNER', 'EDITOR')
  update(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() body: Partial<Account>,
  ) {
    return this.accountService.update('api', Number(id), body);
  }

  @Delete(':id')
  @Roles('OWNER', 'EDITOR')
  delete(@Param('id') id: string, @CurrentUser() user: User) {
    return this.accountService.delete(user.id, 'api', Number(id));
  }
}
