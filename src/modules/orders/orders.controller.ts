import { Body, Controller, Delete, Get, HttpCode, Param, Post, Req, UseGuards } from '@nestjs/common';

import { AdminGuard } from '../../common/guards/admin.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async getOrders(@Req() req: any) {
    return this.ordersService.getOrders(req.user);
  }

  @Get('status/:status')
  @UseGuards(AdminGuard)
  async getOrdersByStatus(@Param('status') status: string) {
    return this.ordersService.getOrdersByStatus(status);
  }

  @Get('deleted')
  @UseGuards(AdminGuard)
  async getDeletedOrders() {
    return this.ordersService.getDeletedOrders();
  }

  @Post()
  @HttpCode(200)
  async createOrder(@Req() req: any, @Body() payload: CreateOrderDto) {
    return this.ordersService.createOrder(req.user, payload);
  }

  @Delete(':id')
  @HttpCode(200)
  @UseGuards(AdminGuard)
  async deleteOrder(@Param('id') id: string) {
    return this.ordersService.deleteOrder(id);
  }
}
