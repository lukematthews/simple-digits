import { Account } from '@/account/account.entity';
import { OwnedEntity } from '@/common/owned.entity';
import { Month } from '@/month/month.entity';
import { Transaction } from '@/transaction/transaction.entity';
import { User } from '@/user/user.entity';
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
}
