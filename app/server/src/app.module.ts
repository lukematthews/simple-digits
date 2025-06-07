import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModule } from './account/account.module';
import { EventsModule } from './events/events.module';
import { AccountController } from '@/account/account.controller';
import { MonthController } from './month/month.controller';
import { MonthModule } from './month/month.module';
import { TransactionController } from './transaction/transaction.controller';
import { TransactionModule } from './transaction/transaction.module';
import { BudgetController } from './budget/budget.controller';
import { BudgetService } from './budget/budget.service';
import { BudgetModule } from './budget/budget.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'budget_db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    AccountModule,
    EventsModule,
    MonthModule,
    TransactionModule,
    BudgetModule,
  ],
  controllers: [AccountController, MonthController, TransactionController, BudgetController],
})
export class AppModule {}