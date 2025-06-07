import { Account } from '@/account/account.entity';
import { AccountDto } from '@/account/dto/account.dto';
import { TransactionDto } from '@/transaction/dto/transaction.dto.';
import { Expose, plainToInstance, Transform, Type } from 'class-transformer';

class RelatedMonthDto {
  @Expose()
  id: number;

  @Expose()
  name: string;
}

export class MonthDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  balance: number;

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
  @Type(() => RelatedMonthDto)
  previousMonth: RelatedMonthDto | null;

  @Expose()
  @Type(() => RelatedMonthDto)
  nextMonth: RelatedMonthDto | null;
}
