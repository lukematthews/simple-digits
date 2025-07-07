import { forwardRef, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Budget } from './budget.entity';
import { Repository } from 'typeorm';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { Month } from '@/month/month.entity';
import { BudgetSummaryDto } from './dto/budgetSummary.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BaseEntityService, WsEvent } from '@/common/base-entity.service';
import { BudgetDto } from './dto/budget.dto';
import { WsEventBusService } from '@/events/ws-event-bus.service';
import { plainToInstance } from 'class-transformer';
import { MonthSummary } from './dto/MonthSummary.dto';
import { Types } from '@/Constants';
import _ from 'lodash';
import { Account } from '@/account/account.entity';
import { Transaction } from '@/transaction/transaction.entity';
import { BudgetAccessService } from './budget-access.service';

@Injectable()
export class BudgetService extends BaseEntityService<Budget, BudgetDto> {
  private readonly logger: Logger = new Logger(BudgetService.name);
  constructor(
    @InjectRepository(Budget)
    private budgetRepo: Repository<Budget>,
    @InjectRepository(Month)
    private monthRepo: Repository<Month>,
    @InjectRepository(Account) private accountRepo: Repository<Account>,
    @InjectRepository(Transaction) private transactionRepo: Repository<Transaction>,
    eventEmitter: EventEmitter2,
    @Inject(forwardRef(() => BudgetAccessService))
    private budgetAccessService: BudgetAccessService,
    bus: WsEventBusService,
  ) {
    super(budgetRepo, eventEmitter, 'month', bus, BudgetDto);
  }

  onModuleInit() {
    this.bus.subscribe('budget', this.handleBudgetMessage.bind(this));
  }

  handleBudgetMessage(message: WsEvent<BudgetDto>, userId: string) {
    const handler = async (message: WsEvent<BudgetDto>) => {
      this.logger.log('handled month message in BudgetService');
      if (message.operation === Types.CREATE) {
        const budget = plainToInstance(Budget, message.payload);
        budget.months?.forEach((month) => {
          month.userId = userId;
          month.shortCode = _.camelCase(month.name);
          month.startingBalance = 0;
          month.closingBalance = 0;
        });
        if (budget.months?.length > 0) {
          budget.months[0].started = true;
        }
        await this.create(userId, 'api', budget);
      } else if (message.operation === Types.UPDATE) {
        await this.update(
          userId,
          'api',
          message.payload.id,
          plainToInstance(Budget, message.payload),
        );
      } else if (message.operation === Types.DELETE) {
        this.delete(userId, 'api', message.payload.id);
      }
    };
    handler(message);
  }

  override getDefaultRelations(): Record<string, any> {
    return {
      months: { transactions: true, accounts: true },
    };
  }

  protected denormalizeDto(dto: BudgetDto, entity: Budget): BudgetDto {
    return dto;
  }

  async findBudget(userId: string, id: number) {
    const budget = await this.budgetRepo.findOne({
      where: { id, userId },
      relations: {
        months: {
          transactions: { month: true },
          accounts: { month: true },
        },
      },
    });
    const dto = plainToInstance(BudgetDto, budget, {
      excludeExtraneousValues: true,
    });
    dto.userRole = await this.budgetAccessService.getUserRole(userId, id);
    return dto;
  }

  async list(userId: string): Promise<BudgetSummaryDto[]> {
    const budgets = await this.budgetRepo.find({
      relations: ['members'],
      where: { members: { userId: userId } },
    });
    return budgets.map((b) => {
      return {
        id: b.id,
        name: b.name,
        shortCode: b.shortCode,
        monthSummaries: [] as MonthSummary[],
      };
    });
  }

  async createBudget(userId: string, budget: CreateBudgetDto) {
    if (budget.months) {
      const months = await Promise.all(
        budget.months.map((dtoMonth) =>
          this.monthRepo.findOne({
            where: { id: dtoMonth.id, user: { id: userId } },
          }),
        ),
      );
      return await this.budgetRepo.save({
        user: { id: userId },
        name: budget.name,
        shortCode: budget.shortCode,
        months,
      });
    }
    return await this.budgetRepo.save({
      user: { id: userId },
      name: budget.name,
      shortCode: budget.shortCode,
      months: [],
    });
  }

  async findBudgetByMonthId(monthId: number): Promise<Budget> {
    const month = await this.monthRepo.findOne({
      where: { id: monthId },
      relations: ['budget'],
    });

    if (!month || !month.budget) {
      throw new NotFoundException(`Budget not found for month ${monthId}`);
    }

    return month.budget;
  }

  async findBudgetByAccountId(accountId: number): Promise<Budget> {
    const account = this.accountRepo.findOne({
      where: { id: accountId },
      relations: ['month', 'month.budget'],
    });

    return await this.findBudgetByMonthId((await account).month.budget.id);
  }

  async findBudgetByTransactionId(txnId: number): Promise<Budget> {
    const txn = await this.transactionRepo.findOne({
      where: { id: txnId },
      relations: ['month', 'month.budget'],
    });

    const budget = txn?.month?.budget;
    if (!budget) {
      throw new NotFoundException(`Budget not found for transaction ${txnId}`);
    }
    return budget;
  }
}
