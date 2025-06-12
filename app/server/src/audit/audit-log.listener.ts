import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AuditEvent } from './audit-event.interface';
import { AuditLogService } from './audit-log.service';

@Injectable()
export class AuditLogListener {
  constructor(private readonly auditLogService: AuditLogService) {}

  @OnEvent('*.*')
  async handleAuditEvent(payload: AuditEvent) {

    if (!['create', 'update', 'delete'].includes(payload.operation)) return;

    await this.auditLogService.record(
      payload.actor,
      payload.entity,
      String(payload.entityId),
      payload.operation as 'create' | 'update' | 'delete',
      payload.before,
      payload.after,
    );
  }
}
