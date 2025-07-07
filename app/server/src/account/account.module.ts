import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './account.entity';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { EventsModule } from '../events/events.module';
import { BudgetModule } from '@/budget/budget.module';

@Module({
  imports: [TypeOrmModule.forFeature([Account]), forwardRef(() => EventsModule), BudgetModule],
  providers: [AccountService],
  controllers: [AccountController],
  exports: [AccountService],
})
export class AccountModule {}
