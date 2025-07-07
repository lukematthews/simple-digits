// entities/budget-invite.entity.ts
import { Budget } from '@/budget/budget.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';

@Entity()
export class BudgetInvite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  role: 'OWNER' | 'EDITOR' | 'VIEWER';

  @Column()
  token: string;

  @Column({ default: 'PENDING' })
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED';

  @ManyToOne(() => Budget, budget => budget.invites)
  budget: Budget;

  @Column()
  budgetId: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  expiresAt: Date;
}
