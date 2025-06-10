import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './account.entity';
import { CLIENT, EventSource, Types } from '@/Constants';
import { EventGateway, WebSocketEvent } from '@/events/event.gateway';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private accountRepo: Repository<Account>,
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

  async findAll() {
    return this.accountRepo.find();
  }

  async create(account: Partial<Account>) {
    const created = await this.accountRepo.save({
      name: account.name,
      balance: account.balance,
      month: account.month
    });
    this.eventsGateway.broadcastEvent(EventSource.ACCOUNTS, {
      client: CLIENT,
      type: Types.CREATE,
      data: created,
    });
    return created;
  }

  async delete(id: number) {
    const result = await this.accountRepo.delete(id);
    this.eventsGateway.broadcastEvent(EventSource.ACCOUNTS, {
      client: CLIENT,
      type: Types.DELETE,
      data: id,
    });
    return result;
  }

  async update(id: number, data: Partial<Account>) {
    await this.accountRepo.update({ id: id }, data);
    const updated = await this.accountRepo.findOneBy({ id });
    this.eventsGateway.broadcastEvent(EventSource.ACCOUNTS, {
      client: CLIENT,
      type: Types.UPDATE,
      data: updated,
    });
    return updated;
  }

  findByMonthId(monthId: number) {
    return this.accountRepo.find({ where: { month: { id: monthId } } });
  }
}
