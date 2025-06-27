import { AccountDto } from '@/account/dto/account.dto';
import { BudgetDto } from '@/budget/dto/budget.dto';
import { Expose } from 'class-transformer';
import { IsNumber, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateMonthDto {
  budget: BudgetDto;

  @IsString()
  @Expose()
  name: string;

  @IsBoolean()
  @Expose()
  started: boolean;

  @Expose()
  position: number;

  @Expose()
  accounts: AccountDto[];

  @Expose()
  fromDate: Date;

  @Expose()
  toDate: Date;
}
