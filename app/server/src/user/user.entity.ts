import { BudgetMember } from '@/budget/budget-member.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  picture?: string;

  @OneToMany(() => BudgetMember, member => member.user)
budgetMemberships: BudgetMember[];
}
