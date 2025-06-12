import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuditEvent } from './audit-event.interface';

type AuditOperation = 'create' | 'update' | 'delete';

interface EmitAuditOptions {
  eventEmitter: EventEmitter2;
  actor: string;
  entity: string;
  entityId: string | number;
  operation: AuditOperation;
  before?: any;
  after?: any;
}

/**
 * Emits a well-structured audit event for create/update/delete.
 */
export function emitAuditEvent(options: EmitAuditOptions) {
  const { eventEmitter, actor, entity, entityId, operation, before, after } = options;

  const eventPayload: AuditEvent = {
    actor,
    entity,
    entityId,
    operation,
    before: operation === 'delete' ? before : operation === 'update' ? before : null,
    after: operation === 'create' ? after : operation === 'update' ? after : null,
  };

  eventEmitter.emit(`${entity}.${operation}`, eventPayload);
}
