// roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export type BudgetRole = 'OWNER' | 'EDITOR' | 'VIEWER';

/**
 * Accepts one or more roles that are allowed to access the route/handler.
 *
 * @example @Roles('OWNER', 'EDITOR')
 */
export const Roles = (...roles: BudgetRole[]) =>
  SetMetadata('budgetRoles', roles);
