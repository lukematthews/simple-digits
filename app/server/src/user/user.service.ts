import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private users: Repository<User>) {}

  async findByEmail(email: string) {
    return this.users.findOne({ where: { email } });
  }

  async findById(id: string) {
    return this.users.findOne({ where: { id } });
  }

  async create({ email, name, passwordHash }: Partial<User>) {
    const user = this.users.create({ email, name, passwordHash });
    return await this.users.save(user);
  }

  async upsertGoogle(profile: GoogleProfile) {
    let user = await this.findByEmail(profile.email);
    if (!user) {
      user = this.users.create({
        email: profile.email,
        name: profile.name,
        picture: profile.picture,
        provider: 'google',
      });
      await this.users.save(user);
    }
    return user;
  }
}

export interface GoogleProfile {
  email: string;
  name: string;
  picture?: string;
}
