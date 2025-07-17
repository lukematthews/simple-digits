// budgets/entities/budget-member.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
  JoinColumn,
} from 'typeorm';
import { Budget } from './budget.entity';
import { User } from '@/user/user.entity';

@Entity()
@Unique(['userId', 'budgetId']) // Prevent duplicate memberships
export class BudgetMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  budgetId: number;

  @Column({ type: 'enum', enum: ['OWNER', 'EDITOR', 'VIEWER'] })
  role: 'OWNER' | 'EDITOR' | 'VIEWER';

  @ManyToOne(() => User, (user) => user.budgetMemberships, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Budget, (budget) => budget.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'budgetId' })
  budget: Budget;
}
