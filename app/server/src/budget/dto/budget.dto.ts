import { MonthDto } from '@/month/dto/month.dto';
import { Expose, Type } from 'class-transformer';

export class BudgetDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  @Type(() => MonthDto)
  months: MonthDto[];
}
