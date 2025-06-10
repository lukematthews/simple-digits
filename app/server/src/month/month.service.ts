import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventGateway, WebSocketEvent } from '@/events/event.gateway';
import { Repository } from 'typeorm';
import { Month } from './month.entity';
import { CreateMonthDto } from './dto/create-month.dto';
import { UpdateMonthDto } from './dto/update-month.dto';
import { plainToInstance } from 'class-transformer';
import { MonthDto } from './dto/month.dto';
import { TransactionService } from '@/transaction/transaction.service';
import { CreateTransactionDto } from '@/transaction/dto/create-transaction.dto';
import { CLIENT, EventSource, Types } from '@/Constants';
import { AccountService } from '@/account/account.service';
import { Transaction } from '@/transaction/transaction.entity';

interface MonthEvent {
  client: 'api';
  source: EventSource.MONTH;
  type: Types;
  data: unknown;
}

@Injectable()
export class MonthService {
  constructor(
    @InjectRepository(Month)
    private monthRepo: Repository<Month>,
    @Inject(forwardRef(() => AccountService))
    private accountService: AccountService,
    @Inject()
    private transactionService: TransactionService,
    @Inject(forwardRef(() => EventGateway))
    private readonly eventsGateway: EventGateway,
  ) {}

  async handleEvent(event: WebSocketEvent) {
    if (event.type === Types.CREATE) {
      await this.create(event.data, event.options);
    } else if (event.type === Types.UPDATE) {
      await this.update(event.data.id, event.data);
    } else if (event.type === Types.DELETE) {
      await this.delete(event.data);
    }
  }

  async findAll(): Promise<MonthDto[]> {
    const months = await this.monthRepo.find({
      relations: ['transactions', 'accounts'],
      order: { position: 'ASC' },
    });

    return months.map((month) =>
      plainToInstance(MonthDto, month, { excludeExtraneousValues: true }),
    );
  }

  async getMonthAtPosition(position: number) {
    return await this.monthRepo.findOne({ where: { position: position } });
  }

  async getAccounts(id: number) {
    const month = await this.monthRepo.findOne({ where: { id: id } });
    return month.accounts;
  }

  async delete(id: number) {
    const result = await this.monthRepo.delete(id);
    this.eventsGateway.broadcast({
      type: Types.DELETE,
      data: result.affected,
    } as MonthEvent);
    return result;
  }

  async update(id: number, month: UpdateMonthDto): Promise<MonthDto> {
    const monthToUpdate: any = { ...month, id };
    monthToUpdate.id = id;
    await this.monthRepo.save(monthToUpdate);
    const updated = await this.monthRepo.findOne({
      where: { id },
      relations: ['transactions', 'accounts'],
    });
    const dto = plainToInstance(MonthDto, updated, {
      excludeExtraneousValues: true,
    });
    this.eventsGateway.broadcast({
      type: Types.UPDATE,
      data: dto,
    } as MonthEvent);

    console.log(JSON.stringify(dto));
    return dto;
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
      this.eventsGateway.broadcast({
        type: Types.UPDATE,
        data: plainToInstance(MonthDto, month, {
          excludeExtraneousValues: true,
        }),
      } as MonthEvent);
      this.eventsGateway.broadcastEvent(EventSource.TRANSACTION, {
        client: CLIENT,
        type: Types.CREATE,
        data: createdTransaction,
      });
      return await this.monthRepo.save(month);
    }
    return null;
  }

  async create(
    monthData: Partial<CreateMonthDto> & { id?: number },
    options: { copyAccounts: boolean },
  ): Promise<Month> {
    const budgetId = 1;

    const targetPosition = monthData.position;

    const queryRunner = this.monthRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const budgetRef = { id: budgetId };

      let existingMonth: Month | undefined;
      if (monthData.id != null) {
        // Reordering existing month
        existingMonth = await queryRunner.manager.findOne(Month, {
          where: { id: monthData.id, budget: budgetRef },
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
            .where('"budgetId" = :budgetId', { budgetId })
            .andWhere('"position" >= :target AND "position" < :current', {
              target: targetPosition,
              current: currentPosition,
            })
            .execute();
        } else {
          // Moving down: shift up months between current and target
          await queryRunner.manager
            .createQueryBuilder()
            .update(Month)
            .set({ position: () => `"position" - 1` })
            .where('"budgetId" = :budgetId', { budgetId })
            .andWhere('"position" <= :target AND "position" > :current', {
              target: targetPosition,
              current: currentPosition,
            })
            .execute();
        }

        existingMonth.position = targetPosition;
        const updatedMonth = await queryRunner.manager.save(existingMonth);

        await queryRunner.commitTransaction();
        this.eventsGateway.broadcast({
          client: CLIENT,
          type: Types.UPDATE,
          data: updatedMonth,
        } as MonthEvent);

        return updatedMonth;
      } else {
        // Inserting new month
        await queryRunner.manager
          .createQueryBuilder()
          .update(Month)
          .set({ position: () => `"position" + 1` })
          .where('"budgetId" = :budgetId', { budgetId })
          .andWhere('"position" >= :position', { position: targetPosition })
          .execute();

        const newMonth = this.monthRepo.create({
          ...monthData,
          budget: budgetRef,
          position: targetPosition,
        });

        const saved = await queryRunner.manager.save(newMonth);

        await queryRunner.commitTransaction();

        // create accounts.
        if (options.copyAccounts && saved.position > 1) {
          const previousMonth = await this.monthRepo.findOne({
            where: { position: saved.position - 1 },
          });
          const previousAccounts = await this.accountService.findByMonthId(
            previousMonth.id,
          );
          await Promise.all(
            previousAccounts.map((account) =>
              this.accountService.create({ ...account, month: saved }),
            ),
          );
        }
        this.eventsGateway.broadcast({
          client: CLIENT,
          type: Types.CREATE,
          data: saved,
        } as MonthEvent);

        return saved;
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async calculateBalances() {
    const months = await this.monthRepo.find({ order: { position: 'ASC' } });
    const balances: {
      month: Month;
      startingBalance: number;
      closingBalance: number;
    }[] = months.map((month) => {
      return { month: month, startingBalance: 0, closingBalance: 0 };
    });

    balances.forEach((item, index) => {
      if (item.month.started === true) {
        this.calculateBalancesForStartedMonth(item);
      } else {
        this.calculateBalancesForNonStartedMonth(item, balances, index);
      }
    });
    return balances;
  }

  private calculateBalancesForStartedMonth(item: {
    month: Month;
    startingBalance: number;
    closingBalance: number;
  }) {
    const startingBalance = item.month.accounts.reduce(
      (sum, acc) => sum + +acc.balance,
      0,
    );
    item.startingBalance = startingBalance;
    item.closingBalance =
      startingBalance +
      item.month.transactions
        .filter((t) => t.paid === false)
        .reduce((sum, trxn) => sum + trxn.amount, 0);
  }

  private calculateBalancesForNonStartedMonth(
    item: {
      month: Month;
      startingBalance: number;
      closingBalance: number;
    },
    balances: {
      month: Month;
      startingBalance: number;
      closingBalance: number;
    }[],
    index: number,
  ) {
    const startingBalance = balances[index-1].closingBalance;
    item.startingBalance = startingBalance;
    item.closingBalance =
      startingBalance +
      item.month.transactions
        .filter((t) => t.paid === false)
        .reduce((sum, trxn) => sum + trxn.amount, 0);
  }
}
