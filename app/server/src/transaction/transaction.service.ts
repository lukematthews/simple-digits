import { Injectable } from '@nestjs/common';
import { Transaction } from './transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Month } from '../month/month.entity';
import { TransactionDto } from './dto/transaction.dto.';
import { BaseEntityService, WsEvent } from '@/common/base-entity.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WsEventBusService } from '@/events/ws-event-bus.service';
import { Types } from '@/Constants';
import { instanceToPlain, plainToInstance } from 'class-transformer';

@Injectable()
export class TransactionService extends BaseEntityService<
  Transaction,
  TransactionDto
> {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    @InjectRepository(Month)
    private monthRepo: Repository<Month>,
    eventEmitter: EventEmitter2,
    bus: WsEventBusService,
  ) {
    super(transactionRepo, eventEmitter, 'transaction', bus, TransactionDto);
  }

  onModuleInit() {
    this.bus.subscribe('transaction', this.handleTransactionMessage.bind(this));
  }

  override getDefaultRelations() {
    return { month: true };
  }

  protected denormalizeDto(
    dto: TransactionDto,
    entity: Transaction,
  ): TransactionDto {
    dto.monthId = String(entity.month?.id);
    return dto;
  }

  handleTransactionMessage(message: WsEvent<TransactionDto>, userId: string) {
    const handler = async (message: WsEvent<TransactionDto>) => {
      console.log('handled transaction message in TransactionService');
      if (message.operation === Types.CREATE) {
        await this.create(userId, 'api', {
          description: message.payload.description,
          userId: userId,
          amount: message.payload.amount,
          date: message.payload.date,
          paid: message.payload.paid,
          month: { id: Number(message.payload.monthId) },
        });
      } else if (message.operation === Types.UPDATE) {
        await this.update(
          userId,
          'api',
          Number(message.payload.id),
          instanceToPlain({
            description: message.payload.description,
            amount: message.payload.amount,
            date: message.payload.date,
            paid: message.payload.paid,
          }),
        );
      } else if (message.operation === Types.DELETE) {
        this.delete(userId, 'api', Number(message.payload.id));
      }
    };
    handler(message);
  }

  async createTransactions(
    budgetId: number,
    userId: string,
    transactions: CreateTransactionDto[],
  ) {
    const transactionDtos: TransactionDto[] = [];
    const unmatchedTransactions: CreateTransactionDto[] = [];

    // Load months only for the specified budget
    const allMonths = await this.monthRepo.find({
      where: { budget: { id: budgetId }, userId },
    });

    for (const t of transactions) {
      const txDate = new Date(t.date);

      const month = allMonths.find((m) => {
        const from = new Date(m.fromDate);
        const to = new Date(m.toDate);
        return txDate >= from && txDate <= to;
      });

      if (!month) {
        unmatchedTransactions.push(t);
        continue;
      }

      const newTransaction = await this.transactionRepo.save({
        description: t.description,
        amount: t.amount,
        date: t.date,
        paid: t.paid,
        month,
        userId: userId
      });

      transactionDtos.push(plainToInstance(TransactionDto, newTransaction));
    }

    return {
      created: transactionDtos.length,
      unmatched: {
        count: unmatchedTransactions.length,
        transactions: unmatchedTransactions,
      },
    };
  }

  async addTransaction(month: Month, userId: string, transaction: CreateTransactionDto) {
    const created = await this.transactionRepo.save({
      amount: transaction.amount,
      date: transaction.date,
      description: transaction.description,
      paid: transaction.paid,
      month: month,
      userId
    });
    return created;
  }
}
