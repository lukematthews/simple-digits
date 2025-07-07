import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsModule } from '@/events/events.module';
import { MonthService } from './month.service';
import { MonthController } from './month.controller';
import { Month } from './month.entity';
import { TransactionModule } from '@/transaction/transaction.module';
import { AccountModule } from '@/account/account.module';
import { BudgetModule } from '@/budget/budget.module';

@Module({
  imports: [TypeOrmModule.forFeature([Month]), TransactionModule, forwardRef(() => AccountModule), forwardRef(() => EventsModule), BudgetModule],
  providers: [MonthService],
  controllers: [MonthController],
  exports: [MonthService],
})
export class MonthModule {}
