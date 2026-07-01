import { Body, Controller, Get, HttpCode, Param, Post, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CheckoutOrderDto } from './dto/checkout-order.dto';
import { CreateDirectOrderDto } from './dto/create-direct-order.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async list(@Req() req: any) {
    return this.ordersService.list(req.user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.ordersService.findOne(id, req.user);
  }

  @Post('direct')
  @HttpCode(200)
  async createDirect(
    @Req() req: any,
    @Body() payload: CreateDirectOrderDto,
  ) {
    return this.ordersService.createDirect(req.user, payload);
  }

  @Post('checkout')
  @HttpCode(200)
  async createFromCart(
    @Req() req: any,
    @Body() payload: CheckoutOrderDto,
  ) {
    return this.ordersService.createFromCart(req.user, payload);
  }
}
