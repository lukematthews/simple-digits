import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Body,
  Param,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { Account } from './account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/user/user.entity';

@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.accountService.findAll(user.id);
  }

  @Post()
  create(@Body() account: CreateAccountDto) {
    return this.accountService.createFromDto(account);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() body: Partial<Account>,
  ) {
    return this.accountService.update(user.id, 'api', Number(id), body);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: User) {
    return this.accountService.delete(user.id, 'api', Number(id));
  }
}
