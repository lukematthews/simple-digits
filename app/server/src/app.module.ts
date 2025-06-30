import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AccountModule } from './account/account.module';
import { EventsModule } from './events/events.module';
import { MonthModule } from './month/month.module';
import { TransactionModule } from './transaction/transaction.module';
import { BudgetModule } from './budget/budget.module';
import { AuditLogModule } from './audit/audit-log.module';

import { AccountController } from '@/account/account.controller';
import { MonthController } from './month/month.controller';
import { TransactionController } from './transaction/transaction.controller';
import { BudgetController } from './budget/budget.controller';

import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    // Load .env and environment variables
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Configure TypeORM dynamically
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbUrl = config.get<string>('DATABASE_URL');

        if (dbUrl) {
          return {
            type: 'postgres',
            url: dbUrl,
            autoLoadEntities: true,
            synchronize: true,
          };
        }

        return {
          type: 'postgres',
          host: config.get('DB_HOST', ''),
          port: parseInt(config.get('DB_PORT', '')),
          username: config.get('DB_USER', ''),
          password: config.get('DB_PASSWORD', ''),
          database: config.get('DB_NAME', ''),
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),
    EventsModule,
    AccountModule,
    MonthModule,
    TransactionModule,
    BudgetModule,
    AuditLogModule,
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
    }),
  ],
  controllers: [
    AccountController,
    MonthController,
    TransactionController,
    BudgetController,
  ],
})
export class AppModule {}
