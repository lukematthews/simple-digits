import { IsString, IsNumber, IsBoolean, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTransactionDto {
  @IsString()
  description!: string;

  @IsString()
  date!: string;

  @Type(() => Number)
  @IsNumber()
  amount!: number;

  @Type(() => Boolean)
  @IsBoolean()
  paid!: boolean;

  @Type(() => Number)
  @IsNumber()
  month!: number;
}
