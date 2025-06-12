export interface AuditEvent {
  actor: string;
  entity: string;
  entityId: string | number;
  operation: 'create' | 'update' | 'delete';
  before?: any;
  after?: any;
}
