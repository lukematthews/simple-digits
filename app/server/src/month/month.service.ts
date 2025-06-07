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
    @Inject()
    private transactionService: TransactionService,
    @Inject(forwardRef(() => EventGateway))
    private readonly eventsGateway: EventGateway,
  ) {}

  async handleEvent(event: WebSocketEvent) {
    if (event.type === Types.CREATE) {
      await this.create(event.data);
    } else if (event.type === Types.UPDATE) {
      await this.update(event.data.id, event.data);
    } else if (event.type === Types.DELETE) {
      await this.delete(event.data);
    }
  }

  async findAll(): Promise<MonthDto[]> {
    const months = await this.monthRepo.find({
      relations: ['transactions', 'nextMonth', 'previousMonth', 'accounts'],
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

  async create(month: CreateMonthDto): Promise<MonthDto> {
    const previousMonth = month.previousMonth
      ? await this.monthRepo.findOneBy({
          id: month.previousMonth,
        })
      : undefined;
    const nextMonth = month.nextMonth
      ? await this.monthRepo.findOneBy({
          id: month.nextMonth,
        })
      : undefined;
    const created = await this.monthRepo.save({
      name: month.name,
      balance: month.balance,
      started: month.started,
      previousMonth: previousMonth,
      nextMonth: nextMonth,
    });
    this.eventsGateway.broadcast({
      type: Types.CREATE,
      data: created,
    } as MonthEvent);

    return plainToInstance(MonthDto, created, {
      excludeExtraneousValues: true,
    });
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
    const monthToUpdate: any = {};
    monthToUpdate.id = id;
    if (month.name) {
      monthToUpdate.name = month.name;
    }
    if (month.started) {
      monthToUpdate.started = month.started;
    }
    if (month.accounts) {
      monthToUpdate.accounts = month.accounts;
    }
    if (month.position) {
      monthToUpdate.position = month.position;
    }
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
}
