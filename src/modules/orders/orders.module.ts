import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CartItem } from '../../entities/cart-item.entity';
import { DeliveryInfo } from '../../entities/delivery-info.entity';
import { Order } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { PriceTag } from '../../entities/price-tag.entity';
import { Product } from '../../entities/product.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      Product,
      PriceTag,
      DeliveryInfo,
      CartItem,
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
