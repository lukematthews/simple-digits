// auth/guards/budget-member.guard.ts
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { BudgetMembershipService } from '@/budget/budget-membership.service';
import { User } from '@/user/user.entity';
import { BudgetAccessService } from '@/budget/budget-access.service';

@Injectable()
export class BudgetMemberGuard implements CanActivate {
  constructor(
    private readonly membershipService: BudgetMembershipService,
    private readonly budgetAccessService: BudgetAccessService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const user = req.user as User;

    const budgetId = req.params.id || req.body.budgetId || req.query.budgetId;

    if (!budgetId) {
      throw new ForbiddenException('Missing budgetId');
    }

    await this.budgetAccessService.assertIsMember(user.id, budgetId);

    return true;
  }
}
