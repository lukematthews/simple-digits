import { PartialType } from '@nestjs/mapped-types';
import { CreateTransactionDto } from './create-transaction.dto';
import { IsNumber } from 'class-validator';

export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {
    @IsNumber()
    id: number;
}
