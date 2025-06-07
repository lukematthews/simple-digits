import { Month } from '../month/month.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('decimal', { precision: 12, scale: 2 })
  balance: number;

  @ManyToOne(() => Month, (month) => month.accounts, {
    onDelete: 'CASCADE',
  })
  month!: Month;
}
