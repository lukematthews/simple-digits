import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { BudgetService } from './budget.service';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { User } from '@/user/user.entity';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { BudgetMemberGuard } from '@/auth/guards/budget-member.guard';

@Controller('budget')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  createBudget(@CurrentUser() user: User, @Body() budget: CreateBudgetDto) {
    return this.budgetService.createBudget(user.id, budget);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll(@CurrentUser() user: User) {
    return this.budgetService.findAll(user.id);
  }

  @Get('/list')
  @UseGuards(AuthGuard('jwt'))
  list(@CurrentUser() user: User) {
    return this.budgetService.list(user.id);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), BudgetMemberGuard, RolesGuard)
  findBudget(@CurrentUser() user: User, @Param('id') id: number) {
    return this.budgetService.findBudget(user.id, id);
  }
}
