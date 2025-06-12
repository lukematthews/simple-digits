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

  // @SubscribeMessage('*')
  @SubscribeMessage('transaction')
  handleMessage(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    if (!data?.type) return;
    this.bus.dispatch(data.type, data, client);
  }
}