import { MonthDto } from '@/month/dto/month.dto';
import { Expose } from 'class-transformer';

export class TransactionDto {
  @Expose()
  id: number;
  
  @Expose()
  description!: string;

  @Expose()
  date!: string;

  @Expose()
  amount!: number;

  @Expose()
  paid!: boolean;

  @Expose()
  monthId!: number;
}
