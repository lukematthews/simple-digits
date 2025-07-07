import { MonthDto } from '@/month/dto/month.dto';
import { Expose, Type } from 'class-transformer';

export class BudgetDto {
  userId: string;

  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  shortCode: string;

  @Expose()
  @Type(() => MonthDto)
  months: MonthDto[];

  @Expose()
  userRole: 'OWNER' | 'EDITOR' | 'VIEWER';
}
