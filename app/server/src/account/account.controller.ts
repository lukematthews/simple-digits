import { Controller, Get, Post, Delete, Put, Body, Param } from '@nestjs/common';
import { AccountService } from './account.service';
import { Account } from './account.entity';
import { CreateAccountDto } from './dto/create-account.dto';

@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get()
  findAll() {
    return this.accountService.findAll();
  }

  @Post()
  create(@Body() account: CreateAccountDto) {
    return this.accountService.createFromDto(account);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<Account>) {
    return this.accountService.update('api', Number(id), body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.accountService.delete('api', Number(id));
  }
}