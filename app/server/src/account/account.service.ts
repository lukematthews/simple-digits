import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from './account.entity';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BaseEntityService } from '../common/base-entity.service';
import { WsEventBusService } from '@/events/ws-event-bus.service';
import { Types } from '@/Constants';

@Injectable()
export class AccountService extends BaseEntityService<Account> {
  constructor(
    @InjectRepository(Account)
    repo: Repository<Account>,
    eventEmitter: EventEmitter2,
    bus: WsEventBusService
  ) {
    super(repo, eventEmitter, 'account', bus);
  }

  onModuleInit() {
    this.bus.subscribe('account', this.handleAccountMessage.bind(this));
  }

  handleAccountMessage(message: any) {
    const handler = async (payload: {operation: "create" | "update" | "delete", data: Partial<Account>}) => {
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

  async findByMonthId(id: number) {
    return await this.repo.findBy({ id: id });
  }
}
