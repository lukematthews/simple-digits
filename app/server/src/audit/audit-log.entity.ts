import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  timestamp: Date;

  @Column()
  actor: string;

  @Column()
  entity: string;

  @Column()
  entityId: string;

  @Column()
  operation: string;

  @Column('jsonb', { nullable: true })
  changes: Array<{ path: string; before: any; after: any }>;
}
