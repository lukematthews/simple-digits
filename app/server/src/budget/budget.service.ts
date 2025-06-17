import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Budget } from './budget.entity';
import { Repository } from 'typeorm';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { Month } from '@/month/month.entity';
import { BudgetSummaryDto } from './dto/budgetSummary.dto';

@Injectable()
export class BudgetService {
  constructor(
    @InjectRepository(Budget)
    private budgetRepo: Repository<Budget>,
    @InjectRepository(Month)
    private monthRepo: Repository<Month>,
  ) {}

  async findAll() {
    return await this.budgetRepo.find();
  }

  async findBudget(id: number) {
    return await this.budgetRepo.findOne({ where: { id: id } });
  }

  async list() {
    const budgets = await this.budgetRepo.find();
    return budgets.map((b) => {
      return { id: b.id, name: b.name, shortCode: b.shortCode };
    });
  }

  async createBudget(budget: CreateBudgetDto) {
    if (budget.months) {
      const months = await Promise.all(
        budget.months.map((dtoMonth) =>
          this.monthRepo.findOne({ where: { id: dtoMonth.id } }),
        ),
      );
      return await this.budgetRepo.save({
        name: budget.name,
        months,
      });
    }
    return await this.budgetRepo.save({ name: budget.name, months: [] });
  }
}
