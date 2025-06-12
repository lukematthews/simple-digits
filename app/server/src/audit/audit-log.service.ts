import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';
import { DiffService } from '../diff/diff.service';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repo: Repository<AuditLog>,
    private readonly diffService: DiffService,
  ) {}

  async record(
    actor: string,
    entity: string,
    entityId: string,
    operation: 'create' | 'update' | 'delete',
    before?: any,
    after?: any,
  ) {
    let changes = [];

    if (operation === 'update') {
      const rawDiffs = this.diffService.compare(before, after) || [];
      changes = rawDiffs.map((d) => ({
        path: d.path?.join('.') ?? '',
        before: d.lhs,
        after: d.rhs,
      }));
    } else if (operation === 'create') {
      changes = Object.entries(after || {}).map(([k, v]) => ({
        path: k,
        before: null,
        after: v,
      }));
    } else if (operation === 'delete') {
      changes = Object.entries(before || {}).map(([k, v]) => ({
        path: k,
        before: v,
        after: null,
      }));
    }

    const audit = this.repo.create({
      actor,
      entity,
      entityId: String(entityId),
      operation,
      changes,
    });

    await this.repo.save(audit);
  }
}
