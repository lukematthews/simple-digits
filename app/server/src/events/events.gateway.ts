// events/events.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsEventBusService } from './ws-event-bus.service';
import { Transaction } from '@/transaction/transaction.entity';
import { WsEvent } from '@/common/base-entity.service';
import { AuthService } from '@/auth/auth.service';
import { Logger, UnauthorizedException } from '@nestjs/common';

@WebSocketGateway({ cors: true })
export class EventsGateway implements OnGatewayInit, OnGatewayConnection  {
  @WebSocketServer()
  server: Server;
  private readonly logger = new Logger(EventsGateway.name);

  constructor(
    private readonly bus: WsEventBusService,
    private readonly authService: AuthService,
  ) {}

  afterInit() {
    this.bus.bindEmitter((event, data) => {
      this.server.emit(event, data);
    });
  }

  emitToAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth.token ||
        parseCookie(client.handshake.headers.cookie)?.access_token;

      if (!token) {
        this.logger.warn('No token found in connection');
        return;
      }

      const user = await this.authService.verifyToken(token);
      client.data.userId = user.sub;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        client.emit('auth_error', { message: error.message });
        client.disconnect();
      } else {
        this.logger.error('Unexpected error verifying token:', error);
        client.disconnect();
      }
      this.logger.error('WebSocket connection error:', error);
      client.disconnect(true);
    }
  }

  @SubscribeMessage('budgetEvent')
  handleTransactionMessage(
    @MessageBody() data: WsEvent<Transaction>,
    @ConnectedSocket() client: Socket,
  ) {
    if (!data?.entity) return;
    this.logger.log(
      `received budgetEvent message - dispatching on bus: ${JSON.stringify(data)}`,
    );
    this.bus.dispatch(data.entity, data, client);
  }
}

export function parseCookie(cookieHeader = '') {
  return Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const [k, v] = c.trim().split('=');
      return [k, decodeURIComponent(v)];
    }),
  );
}
