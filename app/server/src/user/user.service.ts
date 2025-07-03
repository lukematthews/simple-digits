import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private users: Repository<User>,
  ) {}

  async findByEmail(email: string) {
    return this.users.findOne({ where: { email } });
  }

  async findById(id: string) {
    return this.users.findOne({ where: { id } });
  }

  async upsertGoogle(profile: GoogleProfile) {
    let user = await this.findByEmail(profile.email);
    if (!user) {
      user = this.users.create({
        email: profile.email,
        name: profile.name,
        picture: profile.picture,
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
