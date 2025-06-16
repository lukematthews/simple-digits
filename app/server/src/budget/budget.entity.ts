import { Account } from '@/account/account.entity';
import { Month } from '@/month/month.entity';
import { Transaction } from '@/transaction/transaction.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Budget {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  shortCode: string;

  @OneToMany(() => Month, (month) => month.budget, {
    cascade: true,
    eager: true,
  })
  months: Month[];
}
