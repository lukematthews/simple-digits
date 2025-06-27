import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Budget } from './budget.entity';
import { BudgetController } from './budget.controller';
import { BudgetService } from './budget.service';
import { Month } from '@/month/month.entity';
import { EventsModule } from '@/events/events.module';

@Module({
  imports: [TypeOrmModule.forFeature([Budget, Month]), forwardRef(() => EventsModule)],
  controllers: [BudgetController],
  providers: [BudgetService],
  exports: [BudgetService],
})
export class BudgetModule {}
