// auth/guards/roles.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { BudgetRole } from '@/auth/decorators/roles.decorator';
import { JwtPayload } from '../types/jwt-payload';
import { BudgetAccessService } from '@/budget/budget-access.service';
import { User } from '@/user/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly budgetAccessService: BudgetAccessService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const requiredRoles =
      this.reflector.get<BudgetRole[]>('budgetRoles', ctx.getHandler()) ??
      this.reflector.get<BudgetRole[]>('budgetRoles', ctx.getClass());

    // No @Roles() decorator → allow through
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const req = ctx.switchToHttp().getRequest<Request>();
    const user = req.user as User;
    const budgetId =
      req.params.budgetId || req.body.budgetId || req.query.budgetId;

    if (!budgetId) {
      throw new ForbiddenException('budgetId not provided');
    }

    await this.budgetAccessService.assertHasRole(
      user.id,
      { budgetId },
      requiredRoles,
    );

    return true;
  }
}
