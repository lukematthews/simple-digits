import { SubscribeMessage } from '@nestjs/websockets';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Transaction } from './transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Month } from '../month/month.entity';
import { TransactionDto } from './dto/transaction.dto.';
import { BaseEntityService } from '@/common/base-entity.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WsEventBusService } from '@/events/ws-event-bus.service';
import { Types } from '@/Constants';

@Injectable()
export class TransactionService extends BaseEntityService<Transaction> {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    @InjectRepository(Month)
    private monthRepo: Repository<Month>,
    eventEmitter: EventEmitter2,
    bus: WsEventBusService,
  ) {
    super(transactionRepo, eventEmitter, 'transaction', bus);
  }

  onModuleInit() {
    this.bus.subscribe('transaction', this.handleTransactionMessage.bind(this));
  }

  handleTransactionMessage(message: any) {
    const handler = async (payload: {operation: "create" | "update" | "delete", data: Partial<Transaction>}) => {
      console.log('handled transaction message in TransactionService');
      if (payload.operation === Types.CREATE) {
        await this.create('api', payload.data);
      } else if (payload.operation === Types.UPDATE) {
        await this.update('api', payload.data.id, payload.data);
      } else if (payload.operation === Types.DELETE) {
        this.delete('api', payload.data.id);
      }
    };
    handler(message);
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
        monthId: newTransaction.month.id,
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
    // this.eventsGateway.broadcastEvent(EventSource.TRANSACTION, {
    //   client: CLIENT,
    //   type: Types.CREATE,
    //   data: created,
    // });
    return created;
  }
}
