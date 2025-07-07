import { Month } from '@/month/month.entity';
import { Expose, Transform } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class AccountDto {
  @Expose()
  @Transform(({ obj }) => String(obj.id))
  id: string;

  @IsString()
  @Expose()
  name: string;

  @IsNumber()
  @Expose()
  balance: number;

  @Expose()
  @Transform(({ obj }) => String(obj.month?.id))
  monthId: string;

  @Expose()
  @Transform(({ obj }) => String(obj.month?.budget?.id))
  budgetId: string;
}
