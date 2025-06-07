import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { BudgetService } from './budget.service';

@Controller('budget')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Post()
  createBudget(@Body() budget: CreateBudgetDto) {
    return this.budgetService.createBudget(budget);
  }

  @Get()
  findAll() {
    return this.budgetService.findAll();
  }
}
