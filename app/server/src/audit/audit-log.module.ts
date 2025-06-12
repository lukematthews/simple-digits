import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './audit-log.entity';
import { AuditLogService } from './audit-log.service';
import { AuditLogListener } from './audit-log.listener';
import { DiffModule } from '../diff/diff.module';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog]), DiffModule],
  providers: [AuditLogService, AuditLogListener],
  exports: [AuditLogService],
})
export class AuditLogModule {}
