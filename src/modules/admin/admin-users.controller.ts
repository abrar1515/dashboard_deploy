import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { AdminUsersService } from './admin-users.service';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  async list() {
    return this.adminUsersService.list();
  }

  @Put(':id/role')
  async updateRole(@Param('id') id: string, @Body() payload: UpdateUserRoleDto) {
    return this.adminUsersService.updateRole(id, payload);
  }
}
