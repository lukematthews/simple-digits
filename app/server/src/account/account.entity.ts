import { OwnedEntity } from '@/common/owned.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Month } from '../month/month.entity';

@Entity()
export class Account implements OwnedEntity {
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
