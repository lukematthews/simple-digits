import { DeepPartial, Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { emitAuditEvent } from '../audit/audit-emitter.util';
import { WsEventBusService } from '@/events/ws-event-bus.service';

export abstract class BaseEntityService<T extends { id: any }> {
  protected constructor(
    protected readonly repo: Repository<T>,
    protected readonly eventEmitter: EventEmitter2,
    private readonly entityName: string,
    protected readonly bus?: WsEventBusService,
  ) {}

  async create(actor: string, data: DeepPartial<T>): Promise<T> {
    const entity = this.repo.create(data);
    const saved = await this.repo.save(entity);

    emitAuditEvent({
      eventEmitter: this.eventEmitter,
      actor,
      entity: this.entityName,
      entityId: saved.id,
      operation: 'create',
      after: saved,
    });
    this.emitSocketEvent({
      source: 'api',
      entity: this.entityName,
      operation: 'create',
      id: saved.id,
      payload: saved,
    });

    return saved;
  }

  async update(
    actor: string,
    id: T['id'],
    updates: DeepPartial<T>,
  ): Promise<T> {
    const before = await this.repo.findOneByOrFail({ id } as any);
    const merged = this.repo.merge({ ...before }, updates);
    const saved = await this.repo.save(merged);

    emitAuditEvent({
      eventEmitter: this.eventEmitter,
      actor,
      entity: this.entityName,
      entityId: saved.id,
      operation: 'update',
      before,
      after: saved,
    });
    this.emitSocketEvent({
      source: 'api',
      entity: this.entityName,
      operation: 'update',
      id: saved.id,
      payload: saved,
    });
    return saved;
  }

  async delete(actor: string, id: T['id']): Promise<void> {
    const entity = await this.repo.findOneByOrFail({ id } as any);
    await this.repo.remove(entity);

    emitAuditEvent({
      eventEmitter: this.eventEmitter,
      actor,
      entity: this.entityName,
      entityId: id,
      operation: 'delete',
      before: entity,
    });
    this.emitSocketEvent({
      source: 'api',
      entity: this.entityName,
      operation: 'delete',
      id: id,
      payload: entity,
    });
  }

  protected emitSocketEvent(event: WsEvent<T>) {
    if (this.bus) {
      console.log(
        `emitting event ${this.entityName}.${event.operation}: ${JSON.stringify(event)}`,
      );
      this.bus.emit(`${this.entityName}.${event.operation}`, event);
    }
  }

  // Optional helper if needed
  async findOne(id: T['id']): Promise<T> {
    return this.repo.findOneByOrFail({ id } as any);
  }

  async findAll(): Promise<T[]> {
    return this.repo.find();
  }
}

type WsEvent<T> = {
  source: 'api' | 'frontend';
  entity: string;
  operation: 'create' | 'update' | 'delete';
  id: string | number;
  payload: T;
};
