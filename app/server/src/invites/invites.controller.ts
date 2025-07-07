// invites.controller.ts
import { Controller, Post, Body, Param, Get, UseGuards, Request } from '@nestjs/common';
import { InvitesService } from './invites.service';
import { SendInviteDto } from './dto/send-invite.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Controller('invites')
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER')
  @Post('/budget/:budgetId')
  async sendInvite(
    @Param('budgetId') budgetId: number,
    @Body() dto: SendInviteDto,
    @Request() req,
  ) {
    return this.invitesService.sendInvite(budgetId, dto, req.user);
  }

  @Get('/:token')
  async getInvite(@Param('token') token: string) {
    return this.invitesService.getInviteByToken(token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/:token/accept')
  async acceptInvite(@Param('token') token: string, @Request() req) {
    return this.invitesService.acceptInvite(token, req.user);
  }
}
