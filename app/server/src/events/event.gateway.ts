// events.gateway.ts
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { AccountService } from '../account/account.service';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { EventSource, Types } from '@/Constants';
import { TransactionService } from '@/transaction/transaction.service';
import { MonthService } from '@/month/month.service';

export type WebSocketEvent = {
  source: EventSource;
  client: string;
  type: Types;
  options?: any;
  data: any;
};

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class EventGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(forwardRef(() => AccountService))
    private readonly accountService: AccountService,
    @Inject(forwardRef(() => TransactionService))
    private readonly transactionService: TransactionService,
    @Inject(forwardRef(() => MonthService))
    private readonly monthService: MonthService,
  ) {}

  @SubscribeMessage(EventSource.ACCOUNTS)
  async handleAccountMessage(@MessageBody() data: any) {
    console.log(`handle account message: ${JSON.stringify(data)}`);
    this.accountService.handleEvent(data);
  }

  @SubscribeMessage(EventSource.TRANSACTION)
  async handleTransactionMessage(@MessageBody() data: any) {
    console.log(`handle transaction message: ${JSON.stringify(data)}`);
    this.transactionService.handleEvent(data);
  }

  @SubscribeMessage(EventSource.MONTH)
  async handleMonthMessage(@MessageBody() data: any) {
    console.log(`handle month message: ${JSON.stringify(data)}`);
    this.monthService.handleEvent(data);
  }

  async handleCreate(@MessageBody() data: any) {
    await this.accountService.create(data.account);
  }

  async handleUpdate(@MessageBody() { id, ...data }: any) {
    await this.accountService.update(id, data.data);
  }

  async handleDelete(@MessageBody() data: any) {
    await this.accountService.delete(data.id);
  }

  broadcastEvent(event: string, payload: any) {
    this.server.emit(event, payload);
  }

  broadcast(event: WebSocketEvent) {
    this.server.emit(event.source, {
      client: event.client,
      type: event.type,
      data: event.data,
    });
  }
}
