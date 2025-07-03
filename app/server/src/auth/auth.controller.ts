import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Cookies } from '@/common/decorators/cookies.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/user/user.entity';
import { GetUser } from '@/common/decorators/get-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  // passport redirects, nothing here
  google() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req, @Res() res) {
    const { access, refresh } = await this.auth.login(req.user);
    res
      .cookie('access_token', access, { httpOnly: true, sameSite: 'lax' })
      .cookie('refresh_token', refresh, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/auth/refresh',
      })
      .redirect(process.env.FRONTEND_SUCCESS_REDIRECT);
  }

  @Post('refresh')
  async refresh(@Cookies('refresh_token') token: string, @Res() res) {
    const { access, refresh } = await this.auth.refresh(token);
    res
      .cookie('access_token', access, { httpOnly: true, sameSite: 'lax' })
      .cookie('refresh_token', refresh, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/auth/refresh',
      })
      .json({ ok: true });
  }

  /** GET /api/auth/profile */
  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@GetUser() user: User) {
    // Strip fields you don’t want to expose
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      picture: user.picture,
    };
  }

  @Post('logout')
  logout(@Res() res) {
    res
      .clearCookie('access_token')
      .clearCookie('refresh_token', { path: '/auth/refresh' })
      .json({ ok: true });
  }
}
