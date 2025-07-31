import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Budget } from './budget.entity';
import { In, Repository } from 'typeorm';
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
import { BudgetMember } from './budget-member.entity';
import { emitAuditEvent } from '@/audit/audit-emitter.util';
import { User } from '@/user/user.entity';

@Injectable()
export class BudgetService extends BaseEntityService<Budget, BudgetDto> {
  constructor(
    @InjectRepository(Budget)
    private budgetRepo: Repository<Budget>,
    @InjectRepository(Month)
    private monthRepo: Repository<Month>,
    @InjectRepository(Account) private accountRepo: Repository<Account>,
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    @InjectRepository(BudgetMember)
    private readonly budgetMemberRepo: Repository<BudgetMember>,
    eventEmitter: EventEmitter2,
    @Inject(forwardRef(() => BudgetAccessService))
    private budgetAccessService: BudgetAccessService,
    bus: WsEventBusService,
  ) {
    super(
      budgetRepo,
      eventEmitter,
      'budget',
      bus,
      BudgetDto,
      new Logger(BudgetService.name),
    );
  }

  onModuleInit() {
    this.bus.subscribe('budget', this.handleBudgetMessage.bind(this));
  }

  handleBudgetMessage(message: WsEvent<BudgetDto>, userId: string) {
    const handler = async (message: WsEvent<BudgetDto>) => {
      this.logger.log('handled budget message in BudgetService');
      const budget = plainToInstance(Budget, message.payload);
      if (message.operation === Types.CREATE) {
        budget.months?.forEach((month) => {
          month.userId = userId;
          month.shortCode = _.camelCase(month.name);
          month.startingBalance = 0;
          month.closingBalance = 0;
        });
        if (budget.months?.length > 0) {
          budget.months[0].started = true;
        }
        budget.userId = userId;
        const ownerMember = new BudgetMember();
        ownerMember.userId = userId;
        ownerMember.role = 'OWNER';

        budget.members = [ownerMember];

        await this.create('api', budget);
      } else if (message.operation === Types.UPDATE) {
        await this.budgetAccessService.assertHasRole(
          userId,
          { budgetId: budget.id },
          ['OWNER', 'EDITOR'],
        );
        await this.updateBudget(
          message.payload.id,
          plainToInstance(Budget, message.payload),
          userId,
        );
      } else if (message.operation === Types.DELETE) {
        this.delete('api', message.payload.id);
      }
    };
    handler(message);
  }

  override async create(actor: string, data: Partial<Budget>): Promise<any> {
    const entity = this.budgetRepo.create(data);
    const saved = await this.budgetRepo.save(entity);

    if (!saved.userId) {
      throw new Error('Budget must have a userId to create a BudgetMember.');
    }

    const reloaded = await this.budgetRepo.findOneOrFail({
      where: { id: saved.id },
      relations: this.getDefaultRelations(),
    });

    emitAuditEvent({
      eventEmitter: this.eventEmitter,
      actor,
      entity: 'budget',
      entityId: saved.id,
      operation: 'create',
      after: saved,
    });

    this.emitSocketEvent({
      source: 'api',
      entity: 'budget',
      operation: 'create',
      id: saved.id,
      payload: this.toDto(reloaded),
    });

    return this.toDto(reloaded);
  }

  async updateBudget(budgetId: number, data: Partial<Budget>, userId: string) {
    const existing = await this.budgetRepo.findOneByOrFail({ id: budgetId });

    if (existing.shortCode !== data.shortCode && data.shortCode) {
      existing.previousShortCodes = [
        ...(existing.previousShortCodes ?? []),
        existing.shortCode,
      ];
      existing.shortCode = data.shortCode;
    }

    existing.name = data.name ?? existing.name;

    const saved = await this.budgetRepo.save(existing);

    emitAuditEvent({
      eventEmitter: this.eventEmitter,
      actor: 'api',
      entity: 'budget',
      entityId: saved.id,
      operation: 'create',
      after: saved,
    });

    this.emitSocketEvent({
      source: 'api',
      entity: 'budget',
      operation: 'update',
      id: saved.id,
      payload: this.toDto(saved),
    });
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
    this.budgetAccessService.assertIsMember(userId, id);
    const budget = await this.budgetRepo.findOne({
      where: { id },
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

  async findBudgetForShortcodeAndMonth(
    user: User,
    budgetCode: string,
    monthCode: string,
  ) {
    return await this.budgetRepo.findOne({
      where: [
        { shortCode: budgetCode },
        { previousShortCodes: In([budgetCode]) },
      ],
    });
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
            where: { id: dtoMonth.id },
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

    return await this.findBudgetByMonthId((await account).month.id);
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
