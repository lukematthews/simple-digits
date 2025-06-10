import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Transaction } from './transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EventGateway, WebSocketEvent } from '@/events/event.gateway';
import { Repository } from 'typeorm';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Month } from '../month/month.entity';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { CLIENT, EventSource, Types } from '@/Constants';
import { TransactionDto } from './dto/transaction.dto.';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    @InjectRepository(Month)
    private monthRepo: Repository<Month>,
    @Inject(forwardRef(() => EventGateway))
    private readonly eventsGateway: EventGateway,
  ) {}

  async handleEvent(event: WebSocketEvent) {
    if (event.type === Types.CREATE) {
      const month = await this.monthRepo.findOneBy({ id: event.data.month });
      // console.log(`month: ${JSON.stringify(month)}`);
      const createdTransaction = await this.addTransaction(month, event.data);
      console.log(`created transaction ${JSON.stringify(createdTransaction)}`);
    } else if (event.type === Types.UPDATE) {
      console.log(`update transaction ${JSON.stringify(event)}`);
      const transaction = await this.transactionRepo.findOneBy({
        id: event.data.id,
      });
      const messageTransaction: Transaction = event.data;
      if (messageTransaction.description !== transaction.description) {
        transaction.description = messageTransaction.description;
      }
      if (messageTransaction.amount !== transaction.amount) {
        transaction.amount = messageTransaction.amount;
      }
      if (messageTransaction.paid !== transaction.paid) {
        transaction.paid = messageTransaction.paid;
      }
      if (messageTransaction.date !== transaction.date) {
        transaction.date = messageTransaction.date;
      }

      const updatedTransaction = await this.transactionRepo.save(transaction);
      this.eventsGateway.broadcastEvent(EventSource.TRANSACTION, {
        client: CLIENT,
        type: Types.UPDATE,
        data: updatedTransaction,
      });
    } else if (event.type === Types.DELETE) {
      console.log(`delete transaction: ${JSON.stringify(event)}`);
      this.delete(event.data);
    }
  }

  async findAll() {
    return await this.transactionRepo.find();
  }

  async createTransactions(transactions: CreateTransactionDto[]) {
    const transactionDtos: TransactionDto[] = [];
    for (const t of transactions) {
      const month = await this.monthRepo.findOne({ where: { id: t.month } });
      const newTransaction = await this.transactionRepo.save({
        description: t.description,
        amount: t.amount,
        date: t.date,
        paid: t.paid,
        month: month,
      });
      transactionDtos.push({
        id: newTransaction.id,
        month: newTransaction.month.id,
        description: newTransaction.description,
        date: newTransaction.date,
        amount: newTransaction.amount,
        paid: newTransaction.paid,
      });
    }
    return transactionDtos;
  }

  async addTransaction(month: Month, transaction: CreateTransactionDto) {
    const created = await this.transactionRepo.save({
      amount: transaction.amount,
      date: transaction.date,
      description: transaction.description,
      paid: transaction.paid,
      month: month,
    });
    this.eventsGateway.broadcastEvent(EventSource.TRANSACTION, {
      client: CLIENT,
      type: Types.CREATE,
      data: created,
    });
    return created;
  }

  async update(month: Month, transaction: UpdateTransactionDto) {
    const created = await this.transactionRepo.update(
      { id: transaction.id },
      {
        amount: transaction.amount,
        date: transaction.date,
        description: transaction.description,
        paid: transaction.paid,
        month: month,
      },
    );
    this.eventsGateway.broadcastEvent(EventSource.TRANSACTION, {
      client: CLIENT,
      type: Types.UPDATE,
      data: created,
    });
    return created;
  }

  async delete(id: number) {
    await this.transactionRepo.delete(id);
    this.eventsGateway.broadcastEvent(EventSource.TRANSACTION, {
      client: CLIENT,
      type: Types.DELETE,
      data: id,
    });
  }
}
