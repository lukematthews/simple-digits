import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './types/jwt-payload';
import { UserService } from '@/user/user.service';
import { User } from '@/user/user.entity';
import { ConfigService } from '@nestjs/config';
import { SignupDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private users: UserService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async login(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };
    return {
      access: this.jwt.sign(payload, { expiresIn: '30d' }),
      refresh: this.jwt.sign(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '30d',
      }),
    };
  }

  async refresh(token: string) {
    const payload = this.jwt.verify<JwtPayload>(token, {
      secret: process.env.JWT_REFRESH_SECRET,
    });
    return this.login(await this.users.findById(payload.sub));
  }

  async validateOAuthLogin(profile: {
    email: string;
    name: string;
    picture?: string;
  }) {
    return this.users.upsertGoogle(profile);
  }

  verifyToken(token: string): JwtPayload {
    try {
      const payload = this.jwt.verify(token, {
        secret: this.config.get('JWT_ACCESS_SECRET'),
      }) as JwtPayload;
      return payload;
    } catch (error) {
      throw error;
    }
  }

  async signup({ email, name, password }: SignupDto) {
    const existing = await this.users.findByEmail(email);
    if (existing) throw new BadRequestException('User already exists');

    const passwordHash = await bcrypt.hash(password, 12);

    const user = this.users.create({
      email,
      name,
      passwordHash,
      provider: 'email',
    });

    return user;
  }

  async emailExists(email: string) {
    const user = await this.users.findByEmail(email);
    if (!user) {
      return { exists: false };
    }

    return {
      exists: true,
      provider: user.provider || 'email',
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user || !user.passwordHash) return null;

    const valid = await bcrypt.compare(password, user.passwordHash);
    return valid ? user : null;
  }
}
