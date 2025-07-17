import { Account } from '@/account/account.entity';
import { Budget } from '@/budget/budget.entity';
import { OwnedEntity } from '@/common/owned.entity';
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

@Entity()
export class Month implements OwnedEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  userId!: string;

  @ManyToOne(() => Budget, (budget) => budget.months, {
    onDelete: 'CASCADE',
  })
  budget: Budget;

  @OneToMany(() => Transaction, (txn) => txn.month, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  transactions: Transaction[];

  @OneToMany(() => Account, (account) => account.month, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  accounts: Account[];

  @Column()
  name: string;

  @Column()
  started: boolean;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  startingBalance: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  closingBalance: number;

  @Column({ nullable: true })
  position: number;

  @Column()
  shortCode: string;

  @Column({ nullable: true })
  fromDate: Date;

  @Column({ nullable: true })
  toDate: Date;
}
