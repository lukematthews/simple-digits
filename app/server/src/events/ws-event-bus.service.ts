// events/ws-event-bus.service.ts
import { Injectable } from '@nestjs/common';

type MessageHandler = (data: any, client: any) => void;

@Injectable()
export class WsEventBusService {
  private handlers = new Map<string, MessageHandler[]>();
  private emitFn: ((event: string, data: any) => void) | null = null;

  subscribe(message: string, handler: MessageHandler) {
    if (!this.handlers.has(message)) {
      this.handlers.set(message, []);
    }
    this.handlers.get(message)!.push(handler);
  }

  emit(event: string, data: any) {
    if (this.emitFn) {
      this.emitFn(event, data);
    }
  }

  bindEmitter(emitFn: (event: string, data: any) => void) {
    this.emitFn = emitFn;
  }

  dispatch(message: string, data: any, client: any) {
    const handlers = this.handlers.get(message) ?? [];
    for (const handler of handlers) {
      handler(data, client);
    }
  }
}
