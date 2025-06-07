// src/account/dto/update-account.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateBudgetDto } from './create-budget.dto';

export class UpdateMonthDto extends PartialType(CreateBudgetDto) {}
