import { Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CartsService } from './carts.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { SyncCartDto } from './dto/sync-cart.dto';

@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post()
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async addToCart(@Req() req: any, @Body() payload: AddToCartDto) {
    const cartItem = await this.cartsService.addToCart(req.user, payload);
    return { data: cartItem };
  }

  @Post('sync')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async syncCart(@Req() req: any, @Body() payload: SyncCartDto) {
    const cartItems = await this.cartsService.syncCart(req.user, payload);
    return { data: cartItems };
  }
}
