import { Account } from '@/account/account.entity';
import { OwnedEntity } from '@/common/owned.entity';
import { BudgetInvite } from '@/invites/entities/budget-invite.entity';
import { Month } from '@/month/month.entity';
import { Transaction } from '@/transaction/transaction.entity';
import { User } from '@/user/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BudgetMember } from './budget-member.entity';

@Entity()
export class Budget implements OwnedEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  userId!: string;

  @Column()
  name: string;

  @Column()
  shortCode: string;

  @OneToMany(() => Month, (month) => month.budget, {
    cascade: true,
    eager: true,
  })
  months: Month[];

  @OneToMany(() => BudgetMember, (member) => member.budget, {
    cascade: true,
    eager: true,
  })
  members: BudgetMember[];

  @OneToMany(() => BudgetInvite, (invite) => invite.budget, { cascade: true })
  invites: BudgetInvite[];
}
