import { Body, Controller, Delete, Get, Param, Put, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { AdminOrdersService } from './admin-orders.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller('admin/orders')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminOrdersController {
  constructor(private readonly adminOrdersService: AdminOrdersService) {}

  @Get()
  async list() {
    return this.adminOrdersService.list();
  }

  @Get('status/:status')
  async listByStatus(@Param('status') status: string) {
    return this.adminOrdersService.listByStatus(status);
  }

  @Get('deleted')
  async listDeleted() {
    return this.adminOrdersService.listDeleted();
  }

  @Delete(':id')
  async deleteOrder(@Param('id') id: string) {
    return this.adminOrdersService.deleteOrder(id);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() payload: UpdateOrderStatusDto,
  ) {
    return this.adminOrdersService.updateStatus(id, payload);
  }
}
