import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { mapAdminOrder } from '../../common/mappers';
import { Order } from '../../entities/order.entity';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class AdminOrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
  ) {}

  async list() {
    const orders = await this.ordersRepository.find({
      relations: {
        user: true,
        deliveryInfo: true,
        orderItems: {
          product: { priceTags: true, categories: true },
          priceTag: { product: true },
        },
      },
      order: { createdAt: 'DESC' },
    });

    return { data: orders.map(mapAdminOrder) };
  }

  async updateStatus(id: string, payload: UpdateOrderStatusDto) {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: {
        user: true,
        deliveryInfo: true,
        orderItems: {
          product: { priceTags: true, categories: true },
          priceTag: { product: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.orderStatus = payload.orderStatus;
    const saved = await this.ordersRepository.save(order);

    return mapAdminOrder(saved);
  }
}
