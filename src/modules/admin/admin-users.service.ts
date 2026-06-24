import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { mapAdminUser } from '../../common/mappers';
import { User } from '../../entities/user.entity';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Injectable()
export class AdminUsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async list() {
    const users = await this.usersRepository.find({
      order: { createdAt: 'DESC' },
    });

    return { data: users.map(mapAdminUser) };
  }

  async updateRole(id: string, payload: UpdateUserRoleDto) {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = payload.role;
    const saved = await this.usersRepository.save(user);

    return mapAdminUser(saved);
  }
}
