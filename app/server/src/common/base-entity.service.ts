import { DeepPartial, Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { emitAuditEvent } from '../audit/audit-emitter.util';
import { WsEventBusService } from '@/events/ws-event-bus.service';
import { plainToInstance } from 'class-transformer';

export abstract class BaseEntityService<T extends { id: any }, Dto = T> {
  protected constructor(
    protected readonly repo: Repository<T>,
    protected readonly eventEmitter: EventEmitter2,
    private readonly entityName: string,
    protected readonly bus?: WsEventBusService,
    protected readonly dtoClass?: new (...args: any[]) => Dto,
  ) {}

  protected toDto(entity: T): Dto {
    const dto = this.dtoClass
      ? plainToInstance(this.dtoClass!, entity, {
          excludeExtraneousValues: true,
        })
      : (entity as unknown as Dto);

    return this.denormalizeDto(dto, entity);
  }

  protected abstract denormalizeDto(dto: Dto, entity: T): Dto;

  async create(actor: string, data: DeepPartial<T>): Promise<Dto> {
    const entity = this.repo.create(data);
    const saved = await this.repo.save(entity);
    const reloaded = await this.repo.findOneOrFail({
      where: { id: saved.id } as any,
      relations: this.getDefaultRelations(),
    });
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
      payload: this.toDto(reloaded),
    });

    return this.toDto(reloaded);
  }

  async update(
    actor: string,
    id: T['id'],
    updates: DeepPartial<T>,
  ): Promise<Dto> {
    const before = await this.repo.findOneOrFail({
      where: { id: id } as any,
      relations: this.getDefaultRelations(),
    });
    const { id: _, ...safeUpdates } = updates as any;
    const merged = this.repo.merge(before, safeUpdates);
    const saved = await this.repo.save(merged);

    emitAuditEvent({
      eventEmitter: this.eventEmitter,
      actor,
      entity: this.entityName,
      entityId: id,
      operation: 'update',
      before,
      after: saved,
    });

    this.emitSocketEvent({
      source: 'api',
      entity: this.entityName,
      operation: 'update',
      id: id,
      payload: this.toDto(saved),
    });

    return this.toDto(saved);
  }
  async delete(actor: string, id: T['id']): Promise<void> {
    const relations = this.getDefaultRelations();

    const entity = await this.repo.findOneOrFail({
      where: { id } as any,
      relations,
    });
    await this.repo.remove(entity);
    entity.id = id;

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
      payload: this.toDto(entity),
    });
  }

  protected emitSocketEvent(event: WsEvent<Dto>) {
    if (this.bus) {
      console.log(
        `emitting event ${this.entityName}.${event.operation}: ${JSON.stringify(event)}`,
      );
      this.bus.emit('budgetEvent', event);
    }
  }

  async findOne(id: T['id']): Promise<Dto | null> {
    const relations = this.getDefaultRelations();
    const entity = await this.repo.findOne({
      where: { id } as any,
      relations,
    });

    return entity ? this.toDto(entity) : null;
  }

  getDefaultRelations(): Record<string, any> {
    return {
      // transactions: true,
      // accounts: true,
    };
  }

  async findAll(): Promise<Dto[]> {
    const entities = await this.repo.find();
    console.log(`entities ${JSON.stringify(entities)}`);
    console.log(`dtoClass: ${this.dtoClass}`);
    return entities.map((entity) => this.toDto(entity));
  }
}

export type WsEvent<T> = {
  source: 'api' | 'frontend';
  entity: string;
  operation: 'create' | 'update' | 'delete';
  id: string | number;
  payload: T;
};
