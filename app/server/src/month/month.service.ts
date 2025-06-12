import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Month } from './month.entity';
import { CreateMonthDto } from './dto/create-month.dto';
import { plainToInstance } from 'class-transformer';
import { MonthDto } from './dto/month.dto';
import { TransactionService } from '@/transaction/transaction.service';
import { CreateTransactionDto } from '@/transaction/dto/create-transaction.dto';
import { Types } from '@/Constants';
import { AccountService } from '@/account/account.service';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { BaseEntityService } from '@/common/base-entity.service';
import { WsEventBusService } from '@/events/ws-event-bus.service';

@Injectable()
export class MonthService extends BaseEntityService<Month> {
  constructor(
    @InjectRepository(Month)
    private monthRepo: Repository<Month>,
    @Inject()
    private accountService: AccountService,
    @Inject()
    private transactionService: TransactionService,
    eventEmitter: EventEmitter2,
    bus: WsEventBusService,
  ) {
    super(monthRepo, eventEmitter, 'month', bus);
  }

  onModuleInit() {
    this.bus.subscribe('month', this.handleMonthMessage.bind(this));
  }

  handleMonthMessage(message: any) {
    const handler = async (payload: {
      operation: 'create' | 'update' | 'delete';
      data: Partial<Month>;
    }) => {
      console.log('handled month message in MonthService');
      if (payload.operation === Types.CREATE) {
        // await this.create('api', payload.data);
      } else if (payload.operation === Types.UPDATE) {
        await this.update('api', payload.data.id, payload.data);
      } else if (payload.operation === Types.DELETE) {
        this.delete('api', payload.data.id);
      }
    };
    handler(message);
  }

  @OnEvent('*.create')
  @OnEvent('*.update')
  @OnEvent('*.delete')
  handleAllEntityChanges(payload: any) {
    console.log(`MonthService Handled internal event: ${JSON.stringify(payload)}`);
  }

  // async findAll(): Promise<MonthDto[]> {
  //   const months = await this.monthRepo.find({
  //     relations: ['transactions', 'accounts'],
  //     order: { position: 'ASC' },
  //   });
  //   return this.calculateBalances(
  //     await this.monthRepo.find({ order: { position: 'ASC' } }),
  //   );
  // }

  async getMonthAtPosition(position: number) {
    return await this.monthRepo.findOne({ where: { position: position } });
  }

  async getAccounts(id: number) {
    const month = await this.monthRepo.findOne({ where: { id: id } });
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
      // this.eventsGateway.broadcast({
      //   type: Types.UPDATE,
      //   data: plainToInstance(MonthDto, month, {
      //     excludeExtraneousValues: true,
      //   }),
      // } as MonthEvent);
      // this.eventsGateway.broadcastEvent(EventSource.TRANSACTION, {
      //   client: CLIENT,
      //   type: Types.CREATE,
      //   data: createdTransaction,
      // });
      return await this.monthRepo.save(month);
    }
    return null;
  }

  async createWithOptions(
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
        // this.eventsGateway.broadcast({
        //   client: CLIENT,
        //   type: Types.UPDATE,
        //   data: updatedMonth,
        // } as MonthEvent);

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
              this.accountService.create('api', { ...account, month: saved }),
            ),
          );
        }
        // this.eventsGateway.broadcast({
        //   client: CLIENT,
        //   type: Types.CREATE,
        //   data: saved,
        // } as MonthEvent);

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
}
