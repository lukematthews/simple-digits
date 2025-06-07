import { Account } from '@/account/account.entity';
import { Budget } from '@/budget/budget.entity';
import { Transaction } from '@/transaction/transaction.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
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

  @Column('decimal', {
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: {
      to: (value: number) => value,
      from: (value: string): number => parseFloat(value),
    },
  })
  balance?: number;

  @Column('decimal', {
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: {
      to: (value: number) => value,
      from: (value: string): number => parseFloat(value),
    },
  })
  closingBalance?: number;

  @Column()
  started: boolean;

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

  @OneToOne(() => Month, { nullable: true })
  @JoinColumn()
  previousMonth?: Month;

  @OneToOne(() => Month, { nullable: true })
  @JoinColumn()
  nextMonth?: Month;
}
