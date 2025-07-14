import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Response,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Cookies } from '@/common/decorators/cookies.decorator';
import { User } from '@/user/user.entity';
import { GetUser } from '@/auth/decorators/get-user.decorator';
import { SignupDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { UserService } from '@/user/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private auth: AuthService,
    private userService: UserService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
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

  @Post('check-email')
  async checkEmail(@Body('email') email: string) {
    if (!email) {
      throw new NotFoundException('No email provided');
    }
    const exists = await this.auth.emailExists(email);
    return exists;
  }

  @Post('signup')
  async signup(@Body() dto: SignupDto) {
    const user = await this.auth.signup(dto);
    return this.auth.login(user);
  }

  @Post('login')
  async login(@Body() dto: LoginDto,@Res({ passthrough: true }) res) {
    const user = await this.userService.findByEmail(dto.email);
    if (
      !user ||
      !user.passwordHash ||
      !(await bcrypt.compare(dto.password, user.passwordHash))
    ) {
      throw new UnauthorizedException();
    }
    const jwt = this.auth.login(user);
    res.cookie('access_token', (await jwt).access, {
      httpOnly: true,
      sameSite: 'lax',
    });
    return jwt;
  }
}
