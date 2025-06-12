export interface AuditEntry {
  timestamp: Date;
  actor: string; // e.g. user ID or system
  entity: string; // e.g. 'account', 'transaction'
  entityId: string | number;
  operation: 'create' | 'update' | 'delete';
  changes?: {
    path: string;
    before: any;
    after: any;
  }[];
}
