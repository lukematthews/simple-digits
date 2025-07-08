import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from './account.entity';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BaseEntityService, WsEvent } from '../common/base-entity.service';
import { WsEventBusService } from '@/events/ws-event-bus.service';
import { Types } from '@/Constants';
import { AccountDto } from './dto/account.dto';
import { CreateAccountDto } from './dto/create-account.dto';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { BudgetAccessService } from '@/budget/budget-access.service';

@Injectable()
export class AccountService extends BaseEntityService<Account, AccountDto> {
  private readonly logger = new Logger(AccountService.name);
  private readonly budgetAccessService: BudgetAccessService;

  constructor(
    @InjectRepository(Account)
    repo: Repository<Account>,
    eventEmitter: EventEmitter2,
    bus: WsEventBusService,
    budgetAccessService: BudgetAccessService,
  ) {
    super(repo, eventEmitter, 'account', bus, AccountDto);
    this.budgetAccessService = budgetAccessService;
  }

  onModuleInit() {
    this.bus.subscribe('account', this.handleAccountMessage.bind(this));
  }

  override getDefaultRelations(): Record<string, any> {
    return {
      month: true,
    };
  }

  createFromDto(dto: CreateAccountDto) {
    const account = this.repo.create({
      ...dto,
      month: { id: dto.monthId },
    });
    this.repo.save(account);
  }

  protected denormalizeDto(dto: AccountDto, entity: Account): AccountDto {
    dto.monthId = String(entity.month?.id);
    return dto;
  }

  handleAccountMessage(message: WsEvent<AccountDto>, userId: string) {
    (async (message: WsEvent<AccountDto>) => {
      this.logger.log('handled transaction message in AccountService');
      try {
        if (message.operation === Types.CREATE) {
          const account = plainToInstance(Account, message.payload);
          await this.budgetAccessService.assertHasRole(
            userId,
            { accountId: account.id },
            ['OWNER', 'EDITOR'],
          );
          await this.create('api', {
            name: message.payload.name,
            balance: message.payload.balance,
            month: { id: Number(message.payload.monthId) },
          });
        } else if (message.operation === Types.UPDATE) {
          const account = plainToInstance(Account, message.payload);
          await this.budgetAccessService.assertHasRole(
            userId,
            { accountId: account.id },
            ['OWNER', 'EDITOR'],
          );
          await this.update(
            'api',
            Number(message.payload.id),
            instanceToPlain(message.payload),
          );
        } else if (message.operation === Types.DELETE) {
          const account = plainToInstance(Account, message.payload);
          await this.budgetAccessService.assertHasRole(
            userId,
            { accountId: account.id },
            ['OWNER', 'EDITOR'],
          );
          this.delete(userId, 'api', Number(message.payload.id));
        }
      } catch (e) {}
    })(message);
  }

  async findByMonthId(id: number) {
    return await this.repo.findBy({ id: id });
  }
}
