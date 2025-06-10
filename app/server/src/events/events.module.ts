import { Module, forwardRef } from '@nestjs/common';
import { EventGateway } from './event.gateway';
import { AccountModule } from '../account/account.module';
import { MonthModule } from '../month/month.module';
import { TransactionModule } from '@/transaction/transaction.module';

@Module({
  imports: [
    forwardRef(() => AccountModule),
    forwardRef(() => MonthModule),
    forwardRef(() => TransactionModule),
  ],
  providers: [EventGateway],
  exports: [EventGateway],
})
export class EventsModule {}
