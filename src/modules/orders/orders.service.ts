import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';

import { OrderStatus } from '../../common/enums/order-status.enum';
import { mapOrder } from '../../common/mappers';
import { DeliveryInfo } from '../../entities/delivery-info.entity';
import { Order } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { PriceTag } from '../../entities/price-tag.entity';
import { Product } from '../../entities/product.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { User } from '../../entities/user.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(PriceTag)
    private readonly priceTagsRepository: Repository<PriceTag>,
    @InjectRepository(DeliveryInfo)
    private readonly deliveryInfoRepository: Repository<DeliveryInfo>,
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

  async getOrders(user: User) {
    const orders =
      user.role === UserRole.ADMIN
        ? await this.loadOrders()
        : await this.loadOrders({
            user: { id: user.id },
            orderStatus: Not(OrderStatus.DELETED),
          });

    return orders.map(mapOrder);
  }

  async getOrdersByStatus(status: string) {
    const normalizedStatus = status.trim().toLowerCase();
    const statusMap: Record<string, OrderStatus> = {
      pending: OrderStatus.PENDING,
      completed: OrderStatus.COMPLETED,
      cancelled: OrderStatus.CANCELLED,
    };

    const orderStatus = statusMap[normalizedStatus];

    if (orderStatus === undefined) {
      throw new BadRequestException('Invalid order status');
    }

    const orders = await this.loadOrders({ orderStatus });

    return orders.map(mapOrder);
  }

  async getDeletedOrders() {
    const orders = await this.loadOrders({ orderStatus: OrderStatus.DELETED });

    return orders.map(mapOrder);
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

    return mapOrder(saved);
  }

  async createOrder(user: User, payload: CreateOrderDto) {
    const deliveryInfo = await this.deliveryInfoRepository.findOne({
      where: { id: payload.deliveryInfo, user: { id: user.id } },
    });

    if (!deliveryInfo) {
      throw new BadRequestException('Delivery info not found');
    }

    const orderItems: OrderItem[] = [];

    for (const item of payload.orderItems) {
      const product = await this.productsRepository.findOne({
        where: { id: item.product },
        relations: { priceTags: true, categories: true },
      });
      const priceTag = await this.priceTagsRepository.findOne({
        where: { id: item.priceTag },
        relations: { product: true },
      });

      if (!product || !priceTag) {
        throw new BadRequestException('Invalid order item');
      }

      const price = Number(priceTag.price) * item.quantity;

      const orderItem = this.orderItemsRepository.create({
        product,
        priceTag,
        price,
        quantity: item.quantity,
      });

      orderItems.push(orderItem);
    }

    const order = this.ordersRepository.create({
      user,
      deliveryInfo,
      discount: payload.discount ?? 0,
      orderStatus: OrderStatus.PENDING,
      orderItems,
    });

    orderItems.forEach((item) => {
      item.order = order;
    });

    const saved = await this.ordersRepository.save(order);

    const hydrated = await this.ordersRepository.findOne({
      where: { id: saved.id },
      relations: {
        deliveryInfo: true,
        orderItems: {
          product: { priceTags: true, categories: true },
          priceTag: { product: true },
        },
      },
    });

    if (!hydrated) {
      return mapOrder({ ...saved, deliveryInfo, orderItems } as Order);
    }

    return mapOrder(hydrated);
  }
}
