import { Body, Controller, Get, Param, Post } from '@nestjs/common';
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

  @Get("/list")
  list() {
    return this.budgetService.list();
  }

  @Get(":id")
  findBudget(@Param("id") id: number) {
    return this.budgetService.findBudget(id);
  }
}
