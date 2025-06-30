import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Budget } from './budget.entity';
import { Repository } from 'typeorm';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { Month } from '@/month/month.entity';
import { BudgetSummaryDto } from './dto/budgetSummary.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BaseEntityService } from '@/common/base-entity.service';
import { BudgetDto } from './dto/budget.dto';
import { WsEventBusService } from '@/events/ws-event-bus.service';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { MonthSummary } from './dto/MonthSummary.dto';

@Injectable()
export class BudgetService extends BaseEntityService<Budget, BudgetDto> {
  constructor(
    @InjectRepository(Budget)
    private budgetRepo: Repository<Budget>,
    @InjectRepository(Month)
    private monthRepo: Repository<Month>,
    eventEmitter: EventEmitter2,
    bus: WsEventBusService,
  ) {
    super(budgetRepo, eventEmitter, 'month', bus, BudgetDto);
  }

  override getDefaultRelations(): Record<string, any> {
    return {
      months: { transactions: true, accounts: true },
    };
  }

  protected denormalizeDto(dto: BudgetDto, entity: Budget): BudgetDto {
      return dto;
  }

  async findBudget(id: number) {
    const budget = await this.budgetRepo.findOne({
      where: { id },
      relations: {
        months: {
          transactions: { month: true },
          accounts: { month: true },
        },
      },
    });
    return plainToInstance(BudgetDto, budget, {
      excludeExtraneousValues: true,
    });
  }

  async list(): Promise<BudgetSummaryDto[]> {
    const budgets = await this.budgetRepo.find();
    return budgets.map((b) => {
      return { id: b.id, name: b.name, shortCode: b.shortCode, monthSummaries: [] as MonthSummary[]};
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
        shortCode: budget.shortCode,
        months,
      });
    }
    return await this.budgetRepo.save({ name: budget.name, shortCode: budget.shortCode, months: [] });
  }
}
