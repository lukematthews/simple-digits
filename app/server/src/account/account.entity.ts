import { User } from '@/user/user.entity';
import { Month } from '../month/month.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { OwnedEntity } from '@/common/owned.entity';

@Entity()
export class Account implements OwnedEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  userId!: string;

  @Column()
  name: string;

  @Column('decimal', { precision: 12, scale: 2 })
  balance: number;

  @ManyToOne(() => Month, (month) => month.accounts, {
    onDelete: 'CASCADE',
  })
  month!: Month;
}
