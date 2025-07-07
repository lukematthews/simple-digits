// budget-membership/budget-membership.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BudgetMember } from './budget-member.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BudgetMembershipService {
  constructor(
    @InjectRepository(BudgetMember)
    private readonly repo: Repository<BudgetMember>,
  ) {}

  /**
   * Returns true if the user is a member of the budget.
   */
  async isUserMemberOfBudget(userId: string, budgetId: number): Promise<boolean> {
    const count = await this.repo.count({
      where: {
        user: { id: userId },
        budget: { id: budgetId },
      },
    });
    return count > 0;
  }

  /**
   * Returns the membership record for the user and budget, or null.
   */
  async findMembership(userId: string, budgetId: number): Promise<BudgetMember | null> {
    return await this.repo.findOne({
      where: {
        user: { id: userId },
        budget: { id: budgetId },
      },
      relations: ['user', 'budget'], // optional if you need user/budget info
    });
  }

  /**
   * Optional: create a membership
   */
  async addMember(userId: string, budgetId: number, role: 'OWNER' | 'EDITOR' | 'VIEWER') {
    const membership = this.repo.create({
      user: { id: userId },
      budget: { id: budgetId },
      role,
    });
    return await this.repo.save(membership);
  }

  /**
   * Optional: update a user's role
   */
  async updateRole(userId: string, budgetId: number, newRole: 'OWNER' | 'EDITOR' | 'VIEWER') {
    const membership = await this.findMembership(userId, budgetId);
    if (!membership) return null;
    membership.role = newRole;
    return await this.repo.save(membership);
  }

  /**
   * Optional: remove a membership
   */
  async removeMember(userId: string, budgetId: number) {
    await this.repo.delete({
      user: { id: userId },
      budget: { id: budgetId },
    });
  }
}
