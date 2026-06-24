import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';

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

  @Post()
  @HttpCode(200)
  async createOrder(@Req() req: any, @Body() payload: CreateOrderDto) {
    return this.ordersService.createOrder(req.user, payload);
  }
}
