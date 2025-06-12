// events/event.service.ts
import { Injectable } from '@nestjs/common';
import { EventsGateway } from './events.gateway';

@Injectable()
export class EventService {
  private gateway: EventsGateway;

  setGateway(gateway: EventsGateway) {
    this.gateway = gateway;
  }

  emitToAll(event: string, data: any) {
    this.gateway?.emitToAll(event, data);
  }

  // You can also add room or socket-specific methods here
}
