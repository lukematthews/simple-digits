// budget-membership/budget-access.service.ts
import { BudgetMembershipService } from '@/budget/budget-membership.service';
import {
  Injectable,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { BudgetService } from './budget.service';

@Injectable()
export class BudgetAccessService {
  constructor(
    private readonly membershipService: BudgetMembershipService,
    @Inject(forwardRef(() => BudgetService))
    private readonly budgetService: BudgetService,
  ) {}
  
  async assertIsMember(userId: string, budgetId: number) {
    const isMember = await this.membershipService.isUserMemberOfBudget(
      userId,
      budgetId,
    );
    if (!isMember) {
      throw new ForbiddenException('User is not a member of this budget');
    }
  }

  async assertHasRole(
    userId: string,
    target: {
      budgetId?: number;
      monthId?: number;
      accountId?: number;
      transactionId?: number;
    },
    roles: string[],
  ) {
    let budgetId = target.budgetId;

    if (!budgetId) {
      if (target.monthId) {
        const budget = await this.budgetService.findBudgetByMonthId(
          target.monthId,
        );
        budgetId = budget.id;
      } else if (target.accountId) {
        const budget = await this.budgetService.findBudgetByAccountId(
          target.accountId,
        );
        budgetId = budget.id;
      } else if (target.transactionId) {
        const budget = await this.budgetService.findBudgetByTransactionId(
          target.accountId,
        );
        budgetId = budget.id;
      }
    }

    if (!budgetId) {
      throw new ForbiddenException('Budget context could not be resolved');
    }

    const membership = await this.membershipService.findMembership(
      userId,
      budgetId,
    );

    if (!membership) {
      throw new ForbiddenException('User is not a member of this budget');
    }

    if (!roles.includes(membership.role)) {
      throw new ForbiddenException(
        `User must have one of roles: ${roles.join(', ')}`,
      );
    }
  }

  async getUserRole(
    userId: string,
    budgetId: number,
  ): Promise<'OWNER' | 'EDITOR' | 'VIEWER' | null> {
    const membership = await this.membershipService.findMembership(
      userId,
      budgetId,
    );
    return membership?.role ?? null;
  }
}
