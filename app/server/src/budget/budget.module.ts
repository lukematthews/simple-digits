import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Budget } from './budget.entity';
import { BudgetController } from './budget.controller';
import { BudgetService } from './budget.service';
import { Month } from '@/month/month.entity';
import { EventsModule } from '@/events/events.module';
import { BudgetMembershipService } from './budget-membership.service';
import { BudgetMember } from './budget-member.entity';
import { BudgetAccessService } from './budget-access.service';
import { Account } from '@/account/account.entity';
import { Transaction } from '@/transaction/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Budget, BudgetMember, Month, Account, Transaction]), forwardRef(() => EventsModule)],
  controllers: [BudgetController],
  providers: [BudgetService, BudgetMembershipService, BudgetAccessService],
  exports: [BudgetService, BudgetMembershipService, BudgetAccessService],
})
export class BudgetModule {}
