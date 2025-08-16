import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { Month } from '../month/month.entity';
import { OwnedEntity } from '@/common/owned.entity';

@Entity()
export class Transaction implements OwnedEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  description!: string;

  @Column({ type: 'date' })
  date!: string;

  @Column({ type: 'float' })
  amount!: number;

  @Column({ default: false })
  paid!: boolean;

  @ManyToOne(() => Month, (month) => month.transactions, {
    onDelete: 'CASCADE',
  })
  month!: Month;
}
