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
          product: true,
          priceTag: true,
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
      confirmed: OrderStatus.CONFIRMED,
      shipped: OrderStatus.SHIPPED,
      delivered: OrderStatus.DELIVERED,
      cancelled: OrderStatus.CANCELLED,
      deleted: OrderStatus.DELETED,
    };

    const newStatus = statusMap[normalizedStatus];

    if (newStatus === undefined) {
      throw new NotFoundException('Invalid order status');
    }

    // Querying the new 'status' field instead of the legacy 'orderStatus'
    const orders = await this.loadOrders({ status: newStatus });

    return { data: orders.map(mapAdminOrder) };
  }

  async listDeleted() {
    const orders = await this.loadOrders({ status: OrderStatus.DELETED });

    return { data: orders.map(mapAdminOrder) };
  }

  async deleteOrder(id: string) {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: {
        user: true,
        deliveryInfo: true,
        orderItems: {
          product: true,
          priceTag: true,
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.status = OrderStatus.DELETED;
    order.orderStatus = 3; // Set legacy status for backward compatibility
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
          product: true,
          priceTag: true,
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // This logic updates the legacy numeric status.
    // We'll also update the new string-based status for consistency.
    order.orderStatus = payload.orderStatus;

    const statusMap: Record<number, OrderStatus> = {
      0: OrderStatus.PENDING,
      1: OrderStatus.CONFIRMED,
      2: OrderStatus.SHIPPED,
      3: OrderStatus.CANCELLED,
      4: OrderStatus.DELETED,
    };

    const newStatus = statusMap[payload.orderStatus];
    if (newStatus) {
      order.status = newStatus;
    }

    const saved = await this.ordersRepository.save(order);

    return mapAdminOrder(saved);
  }
}
