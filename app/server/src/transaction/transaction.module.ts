import { forwardRef, Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './transaction.entity';
import { EventsModule } from '@/events/events.module';
import { TransactionController } from './transaction.controller';
import { Month } from '../month/month.entity';
import { BudgetModule } from '@/budget/budget.module';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Month]), forwardRef(() => EventsModule), BudgetModule],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [TransactionService]
})
export class TransactionModule {}
