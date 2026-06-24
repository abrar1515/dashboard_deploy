import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';

import { mapUser } from '../../common/mappers';
import { User } from '../../entities/user.entity';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(payload: SignUpDto) {
    const existingUser = await this.usersRepository.findOne({
      where: { email: payload.email.toLowerCase() },
    });

    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);

    const user = this.usersRepository.create({
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email.toLowerCase(),
      passwordHash,
    });

    const savedUser = await this.usersRepository.save(user);
    const token = this.jwtService.sign({ sub: savedUser.id });

    return {
      token,
      user: mapUser(savedUser),
    };
  }

  async signIn(payload: SignInDto) {
    const user = await this.usersRepository.findOne({
      where: { email: payload.identifier.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(payload.password, user.passwordHash);

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({ sub: user.id });

    return {
      token,
      user: mapUser(user),
    };
  }
}
