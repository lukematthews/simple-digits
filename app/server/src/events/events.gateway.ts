// events/events.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsEventBusService } from './ws-event-bus.service';
import { Transaction } from '@/transaction/transaction.entity';
import { WsEvent } from '@/common/base-entity.service';

@WebSocketGateway({ cors: true })
export class EventsGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  constructor(private readonly bus: WsEventBusService) {}

  afterInit() {
    this.bus.bindEmitter((event, data) => {
      this.server.emit(event, data);
    });
  }

  emitToAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  @SubscribeMessage('budgetEvent')
  handleTransactionMessage(
    @MessageBody() data: WsEvent<Transaction>,
    @ConnectedSocket() client: Socket,
  ) {
    if (!data?.entity) return;
    console.log(`received budgetEvent message - dispatching on bus: ${JSON.stringify(data)}`);
    this.bus.dispatch(data.entity, data, client);
  }
}
