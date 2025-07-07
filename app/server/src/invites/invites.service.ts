// invites.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BudgetInvite } from './entities/budget-invite.entity';
import { SendInviteDto } from './dto/send-invite.dto';
import { v4 as uuid } from 'uuid';
import { addDays } from 'date-fns';
import { BudgetMember } from '@/budget/budget-member.entity';
import { Budget } from '@/budget/budget.entity';
import { EmailService } from './email.service';
import { User } from '@/user/user.entity';

@Injectable()
export class InvitesService {
  constructor(
    @InjectRepository(BudgetInvite)
    private invitesRepo: Repository<BudgetInvite>,

    @InjectRepository(BudgetMember)
    private membersRepo: Repository<BudgetMember>,

    @InjectRepository(Budget)
    private budgetRepo: Repository<Budget>,

    private emailService: EmailService,
  ) {}

  async sendInvite(budgetId: number, dto: SendInviteDto, inviter: User) {
    const budget = await this.budgetRepo.findOneByOrFail({ id: budgetId });

    const token = uuid();
    const invite = this.invitesRepo.create({
      email: dto.email,
      role: dto.role,
      token,
      budgetId,
      expiresAt: addDays(new Date(), 7),
    });

    await this.invitesRepo.save(invite);

    await this.emailService.sendInviteEmail(dto.email, {
      inviter: inviter.name,
      budgetName: budget.name,
      token,
    });

    return { success: true };
  }

  async getInviteByToken(token: string) {
    const invite = await this.invitesRepo.findOneBy({ token });
    if (!invite || invite.status !== 'PENDING' || new Date() > invite.expiresAt) {
      throw new NotFoundException('Invite not found or expired');
    }
    return invite;
  }

  async acceptInvite(token: string, user: User) {
    const invite = await this.getInviteByToken(token);

    const alreadyMember = await this.membersRepo.findOneBy({
      userId: user.id,
      budgetId: invite.budgetId,
    });

    if (!alreadyMember) {
      await this.membersRepo.save({
        userId: user.id,
        budgetId: invite.budgetId,
        role: invite.role,
      });
    }

    invite.status = 'ACCEPTED';
    await this.invitesRepo.save(invite);
    return { success: true };
  }
}
