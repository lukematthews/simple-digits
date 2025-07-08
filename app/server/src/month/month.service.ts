import { Types } from '@/Constants';
import { AccountService } from '@/account/account.service';
import { BudgetAccessService } from '@/budget/budget-access.service';
import { BaseEntityService, WsEvent } from '@/common/base-entity.service';
import { WsEventBusService } from '@/events/ws-event-bus.service';
import { CreateTransactionDto } from '@/transaction/dto/create-transaction.dto';
import { TransactionService } from '@/transaction/transaction.service';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { isValid } from 'date-fns';
import { camelCase } from 'lodash';
import { Repository } from 'typeorm';
import { CreateMonthDto } from './dto/create-month.dto';
import { MonthDto } from './dto/month.dto';
import { Month } from './month.entity';

@Injectable()
export class MonthService extends BaseEntityService<Month, MonthDto> {
  private readonly logger = new Logger(MonthService.name);
  private readonly budgetAccessService: BudgetAccessService;

  constructor(
    @InjectRepository(Month)
    private monthRepo: Repository<Month>,
    @Inject()
    private accountService: AccountService,
    @Inject()
    private transactionService: TransactionService,
    eventEmitter: EventEmitter2,
    bus: WsEventBusService,
    budgetAccessService: BudgetAccessService,
  ) {
    super(monthRepo, eventEmitter, 'month', bus, MonthDto);
    this.budgetAccessService = budgetAccessService;
  }

  onModuleInit() {
    this.bus.subscribe('month', this.handleMonthMessage.bind(this));
    this.bus.subscribe('month', this.handleMonthCreateMessage.bind(this));
  }

  override getDefaultRelations(): Record<string, any> {
    return {
      // budget: true,
      transactions: true,
      accounts: true,
    };
  }

  protected denormalizeDto(dto: MonthDto, entity: Month): MonthDto {
    for (const transaction of dto.transactions ?? []) {
      transaction.monthId = String(entity.id);
    }
    for (const account of dto.accounts ?? []) {
      account.monthId = String(entity.id);
    }
    return dto;
  }

  handleMonthMessage(message: WsEvent<MonthDto>, userId: string) {
    if (message.operation === Types.CREATE) {
      return;
    }

    (async (message: WsEvent<MonthDto>) => {
      this.logger.log('handled month message in MonthService');
      const month = plainToInstance(Month, message.payload);

      await this.budgetAccessService.assertHasRole(
        userId,
        { monthId: month.id },
        ['OWNER', 'EDITOR'],
      );

      if (message.operation === Types.UPDATE) {
        await this.update('api', month.id, month);
      } else if (message.operation === Types.DELETE) {
        await this.delete(userId, 'api', month.id);
      }
    })(message);
  }

  handleMonthCreateMessage(
    message: WsEvent<{
      month: CreateMonthDto;
      options: { copyAccounts: boolean };
    }>,
    userId: string,
  ) {
    (async (message: any) => {
      if (message.operation === Types.CREATE) {
        const month = plainToInstance(Month, message.payload);
        await this.budgetAccessService.assertHasRole(
          userId,
          { budgetId: message.payload.month.budget },
          ['OWNER', 'EDITOR'],
        );
        await this.createWithOptions(
          userId,
          message.payload.month,
          message.payload.options,
        );
      }
    })(message);
  }

  @OnEvent('*.create')
  @OnEvent('*.update')
  @OnEvent('*.delete')
  handleAllEntityChanges(payload: any) {
    // this.logger.log(
    //   `MonthService Handled internal event: ${JSON.stringify(payload)}`,
    // );
  }

  async getMonthAtPosition(userId: string, position: number) {
    return await this.monthRepo.findOne({
      where: { position: position, userId },
    });
  }

  async getAccounts(userId: string, id: number) {
    const month = await this.monthRepo.findOne({ where: { id, userId } });
    return month.accounts;
  }

  async addTransaction(id: number, transaction: CreateTransactionDto) {
    const month = await this.monthRepo.findOneBy({ id: id });
    if (month) {
      transaction.month = id;
      const createdTransaction = await this.transactionService.addTransaction(
        month,
        transaction,
      );
      month.transactions.push(createdTransaction);
      return await this.monthRepo.save(month);
    }
    return null;
  }

  async createWithOptions(
    userId: string,
    monthData: Partial<CreateMonthDto> & { id?: number },
    options: { copyAccounts: boolean },
  ): Promise<Month> {
    const targetPosition = monthData.position;
    const queryRunner = this.monthRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let existingMonth: Month | undefined;
      if (monthData.id != null) {
        // Reordering existing month
        existingMonth = await queryRunner.manager.findOne(Month, {
          where: {
            id: monthData.id,
            budget: instanceToPlain(monthData.budget),
            userId,
          },
        });

        if (!existingMonth) {
          throw new Error(`Month with id ${monthData.id} not found.`);
        }

        const currentPosition = existingMonth.position ?? 0;

        if (targetPosition === currentPosition) {
          await queryRunner.rollbackTransaction();
          return existingMonth;
        }

        if (targetPosition < currentPosition) {
          // Moving up: shift down months between target and current
          await queryRunner.manager
            .createQueryBuilder()
            .update(Month)
            .set({ position: () => `"position" + 1` })
            .where('"budgetId" = :budgetId', { budgetId: monthData.budget.id })
            .andWhere('"position" >= :target AND "position" < :current', {
              target: targetPosition,
              current: currentPosition,
            })
            .andWhere('userId = :userId', { userId })
            .execute();
        } else {
          // Moving down: shift up months between current and target
          await queryRunner.manager
            .createQueryBuilder()
            .update(Month)
            .set({ position: () => `"position" - 1` })
            .where('"budgetId" = :budgetId', { budgetId: monthData.budget.id })
            .andWhere('"position" <= :target AND "position" > :current', {
              target: targetPosition,
              current: currentPosition,
            })
            .execute();
        }

        existingMonth.position = targetPosition;
        const updatedMonth = await queryRunner.manager.save(existingMonth);

        await queryRunner.commitTransaction();
        return updatedMonth;
      } else {
        // Inserting new month
        await queryRunner.manager
          .createQueryBuilder()
          .update(Month)
          .set({ position: () => `"position" + 1` })
          .where('"budgetId" = :budgetId', { budgetId: monthData.budget.id })
          .andWhere('"position" >= :position', { position: targetPosition })
          .andWhere('userId = :userId', { userId })
          .execute();

        const newMonth = plainToInstance(Month, monthData);
        newMonth.shortCode = camelCase(monthData.name);
        newMonth.position = targetPosition;
        this.monthRepo.create(newMonth);

        const saved = await queryRunner.manager.save(newMonth);

        if (options.copyAccounts && saved.position > 1) {
          const previousMonth = await this.monthRepo.findOne({
            where: { 
              position: saved.position - 1, 
              budget: {
                id: monthData.budget.id
              }
            },
          });
          if (previousMonth) {
            const previousAccounts = await this.accountService.findByMonthId(
              previousMonth.id,
            );
            await Promise.all(
              previousAccounts.map((account) =>
                this.accountService.create('api', {
                  name: account.name,
                  balance: account.balance,
                  month: saved,
                }),
              ),
            );
          }
        }

        await queryRunner.commitTransaction();

        this.emitSocketEvent({
          source: 'api',
          entity: 'month',
          operation: 'create',
          id: saved.id,
          payload: this.toDto(saved),
        });
        return saved;
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async calculateBalances(months: Month[]) {
    const balances: MonthDto[] = months.map((month) => {
      return plainToInstance(MonthDto, month, {
        excludeExtraneousValues: true,
      });
    });

    balances.forEach((item, index) => {
      if (item.started === true) {
        this.calculateBalancesForStartedMonth(item);
      } else {
        this.calculateBalancesForNonStartedMonth(item, balances, index);
      }
    });
    return balances;
  }

  private calculateBalancesForStartedMonth(item: MonthDto) {
    const startingBalance = item.accounts.reduce(
      (sum, acc) => sum + +acc.balance,
      0,
    );
    item.startingBalance = startingBalance;
    item.closingBalance =
      startingBalance +
      item.transactions
        .filter((t) => t.paid === false)
        .reduce((sum, trxn) => sum + trxn.amount, 0);
  }

  private calculateBalancesForNonStartedMonth(
    item: MonthDto,
    balances: MonthDto[],
    index: number,
  ) {
    const startingBalance = balances[index - 1].closingBalance;
    item.startingBalance = startingBalance;
    item.closingBalance =
      startingBalance +
      item.transactions
        .filter((t) => t.paid === false)
        .reduce((sum, trxn) => sum + trxn.amount, 0);
  }

  sanitizeMonthPayload(payload: any): Partial<Month> {
    const { startingBalance, closingBalance, fromDate, toDate, ...rest } =
      payload;

    return {
      ...rest,
      startingBalance:
        typeof startingBalance === 'number' ? +startingBalance.toFixed(2) : 0,
      closingBalance:
        typeof closingBalance === 'number' ? +closingBalance.toFixed(2) : 0,
      fromDate: isValid(new Date(fromDate)) ? new Date(fromDate) : null,
      toDate: isValid(new Date(toDate)) ? new Date(toDate) : null,
    };
  }
}
