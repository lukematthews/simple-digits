import { Expose, Transform } from 'class-transformer';

export class TransactionDto {
  @Expose()
  @Transform(({ value }) => String(value))
  id: string;

  @Expose()
  description!: string;

  @Expose()
  date!: string;

  @Expose()
  amount!: number;

  @Expose()
  paid!: boolean;

  @Expose()
  @Transform(({ obj, value }) => value ?? obj.month?.id?.toString())
  monthId: string;

  @Expose()
  @Transform(({ obj, value }) => value ?? (obj.monthId ? { id: obj.monthId.toString() } : undefined))
  month?: { id: string };
}
