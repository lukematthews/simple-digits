import { AccountDto } from '@/account/dto/account.dto';
import { BudgetDto } from '@/budget/dto/budget.dto';
import { IsNumber, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateMonthDto {
  budget: BudgetDto;

  @IsString()
  name: string;

  @IsNumber()
  @IsOptional()
  balance?: number;

  @IsBoolean()
  started: boolean;

  position: number;

  accounts: AccountDto[];

  @IsOptional()
  previousMonth?: number;

  @IsOptional()
  nextMonth?: number;
}
