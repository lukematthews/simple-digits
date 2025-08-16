import { OwnedEntity } from '@/common/owned.entity';
import { BudgetInvite } from '@/invites/entities/budget-invite.entity';
import { Month } from '@/month/month.entity';
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

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  userId!: string;

  @Column()
  name: string;

  @Column()
  shortCode: string;

  @OneToMany(() => Month, (month) => month.budget, {
    cascade: ['insert', 'update', 'remove'],
    eager: true,
    onDelete: 'CASCADE',
  })
  months: Month[];

  @OneToMany(() => BudgetMember, (member) => member.budget, {
    cascade: ['insert', 'update', 'remove'],
    eager: true,
    onDelete: 'CASCADE',
  })
  members: BudgetMember[];

  @OneToMany(() => BudgetInvite, (invite) => invite.budget, {
    cascade: ['insert', 'update', 'remove'],
    onDelete: 'CASCADE',
  })
  invites: BudgetInvite[];

  @Column('text', { array: true, default: () => 'ARRAY[]::text[]' })
  previousShortCodes: string[];
}
