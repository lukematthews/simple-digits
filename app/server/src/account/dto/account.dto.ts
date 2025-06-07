import { Month } from '@/month/month.entity';
import { Expose } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class AccountDto {
  @IsNumber()
  @Expose()
  id: number;

  @IsString()
  @Expose()
  name: string;

  @IsNumber()
  @Expose()
  balance: number;

  @Expose()
  month: Month;
}
