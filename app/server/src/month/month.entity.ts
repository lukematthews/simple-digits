import { Account } from '@/account/account.entity';
import { Budget } from '@/budget/budget.entity';
import { Transaction } from '@/transaction/transaction.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Month {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Budget, (budget) => budget.months, {
    onDelete: 'CASCADE',
  })
  budget!: Budget;

  @Column()
  name: string;

  @Column()
  started: boolean;

  @Column({ default: 0 })
  startingBalance: number;

  @Column({ default: 0 })
  closingBalance: number;

  @OneToMany(() => Transaction, (txn) => txn.month, {
    cascade: true,
    eager: true,
  })
  transactions: Transaction[];

  @OneToMany(() => Account, (account) => account.month, {
    cascade: ['insert', 'update'],
    eager: true,
  })
  accounts: Account[];

  @Column({ nullable: true })
  position: number;
}
