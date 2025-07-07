// invites/invites.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvitesController } from './invites.controller';
import { InvitesService } from './invites.service';
import { BudgetInvite } from './entities/budget-invite.entity';
import { Budget } from '@/budget/budget.entity';
import { EmailService } from './email.service';
import { BudgetMember } from '@/budget/budget-member.entity';
import { BudgetModule } from '@/budget/budget.module';

@Module({
  imports: [TypeOrmModule.forFeature([BudgetInvite, Budget, BudgetMember]), BudgetModule],
  controllers: [InvitesController],
  providers: [InvitesService, EmailService],
})
export class InvitesModule {}
