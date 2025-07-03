import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { EventService } from './events.service';
import { WsEventBusService } from './ws-event-bus.service';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';
import { UserModule } from '../user/user.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [UserModule],
  providers: [EventsGateway, EventService, WsEventBusService, AuthService, JwtService],
  exports: [EventService, WsEventBusService],
})
export class EventsModule {}