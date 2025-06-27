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
  @Transform(({ obj }) => String(obj.month?.id))
  monthId: string;

  @Expose()
  get month() {
    return this.monthId ? { id: +this.monthId } : undefined;
  }
}
