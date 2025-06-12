import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { EventService } from './events.service';
import { WsEventBusService } from './ws-event-bus.service';

@Module({
  providers: [EventsGateway, EventService, WsEventBusService],
  exports: [EventService, WsEventBusService],
})
export class EventsModule {}