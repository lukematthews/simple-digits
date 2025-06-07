import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Month } from '../month/month.entity';

@Entity()
export class Transaction {
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

  @ManyToOne(() => Month, month => month.transactions, { onDelete: 'CASCADE' })
  month!: Month;
}
