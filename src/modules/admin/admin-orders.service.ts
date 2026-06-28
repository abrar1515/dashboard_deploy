import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OrderStatus } from '../../common/enums/order-status.enum';
import { mapAdminOrder } from '../../common/mappers';
import { Order } from '../../entities/order.entity';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class AdminOrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
  ) {}

  private async loadOrders(where?: Record<string, unknown>) {
    return this.ordersRepository.find({
      where,
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
  }

  async list() {
    const orders = await this.loadOrders();

    return { data: orders.map(mapAdminOrder) };
  }

  async listByStatus(status: string) {
    const normalizedStatus = status.trim().toLowerCase();
    const statusMap: Record<string, OrderStatus> = {
      pending: OrderStatus.PENDING,
      completed: OrderStatus.COMPLETED,
      cancelled: OrderStatus.CANCELLED,
    };

    const orderStatus = statusMap[normalizedStatus];

    if (orderStatus === undefined) {
      throw new NotFoundException('Invalid order status');
    }

    const orders = await this.loadOrders({ orderStatus });

    return { data: orders.map(mapAdminOrder) };
  }

  async listDeleted() {
    const orders = await this.loadOrders({ orderStatus: OrderStatus.DELETED });

    return { data: orders.map(mapAdminOrder) };
  }

  async deleteOrder(id: string) {
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

    order.orderStatus = OrderStatus.DELETED;
    const saved = await this.ordersRepository.save(order);

    return mapAdminOrder(saved);
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
