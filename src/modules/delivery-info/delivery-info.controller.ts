import { Body, Controller, Get, HttpCode, Post, Put, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DeliveryInfoService } from './delivery-info.service';
import { DeliveryInfoDto } from './dto/delivery-info.dto';

@Controller()
export class DeliveryInfoController {
  constructor(private readonly deliveryInfoService: DeliveryInfoService) {}

  @Get('delivery-info')
  @UseGuards(JwtAuthGuard)
  async getDeliveryInfo(@Req() req: any) {
    return this.deliveryInfoService.getDeliveryInfo(req.user);
  }

  @Post('users/delivery-info')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async addDeliveryInfo(@Req() req: any, @Body() payload: DeliveryInfoDto) {
    return this.deliveryInfoService.addDeliveryInfo(req.user, payload);
  }

  @Put('users/delivery-info')
  @UseGuards(JwtAuthGuard)
  async editDeliveryInfo(@Req() req: any, @Body() payload: DeliveryInfoDto) {
    return this.deliveryInfoService.editDeliveryInfo(req.user, payload);
  }
}
