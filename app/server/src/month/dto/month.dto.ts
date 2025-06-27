import { AccountDto } from '@/account/dto/account.dto';
import { BudgetDto } from '@/budget/dto/budget.dto';
import { TransactionDto } from '@/transaction/dto/transaction.dto.';
import { Expose, Transform, Type } from 'class-transformer';

export class MonthDto {
  @Expose()
  id: number;

  budget: BudgetDto;

  @Expose()
  name: string;

  @Expose()
  shortCode: string;

  @Expose()
  fromDate: Date;

  @Expose()
  toDate: Date;

  @Expose()
  started: boolean;

  @Expose()
  @Type(() => TransactionDto)
  transactions: TransactionDto[];

  @Expose()
  @Type(() => AccountDto)
  accounts: AccountDto[];

  @Expose()
  position: number;

  @Expose()
  startingBalance: number;

  @Expose()
  closingBalance: number;
}
