import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { BudgetService } from './budget.service';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/user/user.entity';

@Controller('budget')
@UseGuards(AuthGuard('jwt'))
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Post()
  createBudget(@CurrentUser() user: User, @Body() budget: CreateBudgetDto) {
    return this.budgetService.createBudget(user.id, budget);
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.budgetService.findAll(user.id);
  }

  @Get('/list')
  list(@CurrentUser() user: User) {
    return this.budgetService.list(user.id);
  }

  @Get(':id')
  findBudget(@CurrentUser() user: User, @Param('id') id: number) {
    return this.budgetService.findBudget(user.id, id);
  }
}
