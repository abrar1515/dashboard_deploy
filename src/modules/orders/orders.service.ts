import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { OrderStatus } from '../../common/enums/order-status.enum';
import { mapOrder } from '../../common/mappers';
import { CartItem } from '../../entities/cart-item.entity';
import { DeliveryInfo } from '../../entities/delivery-info.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { Order } from '../../entities/order.entity';
import { PriceTag } from '../../entities/price-tag.entity';
import { Product } from '../../entities/product.entity';
import { User } from '../../entities/user.entity';
import { CheckoutOrderDto } from './dto/checkout-order.dto';
import { CreateDirectOrderDto } from './dto/create-direct-order.dto';

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
    @InjectRepository(CartItem)
    private readonly cartItemsRepository: Repository<CartItem>,
    @InjectRepository(DeliveryInfo)
    private readonly deliveryInfoRepository: Repository<DeliveryInfo>,
  ) {}

  async list(user: User) {
    const orders = await this.ordersRepository.find({
      where: { user: { id: user.id } },
      relations: {
        deliveryInfo: true,
        orderItems: {
          product: { priceTags: true, categories: true },
          priceTag: { product: true },
        },
      },
      order: { createdAt: 'DESC' },
    });

    return { data: orders.map(mapOrder) };
  }

  async findOne(id: string, user: User) {
    const order = await this.ordersRepository.findOne({
      where: { id, user: { id: user.id } },
      relations: {
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

    return mapOrder(order);
  }

  async createDirect(user: User, payload: CreateDirectOrderDto) {
    const deliveryInfo = await this.deliveryInfoRepository.findOne({
      where: { id: payload.deliveryInfoId, user: { id: user.id } },
    });

    if (!deliveryInfo) {
      throw new NotFoundException('Delivery info not found');
    }

    const product = await this.productsRepository.findOne({
      where: { id: payload.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const priceTag = await this.priceTagsRepository.findOne({
      where: { id: payload.priceTagId, product: { id: product.id } },
    });

    if (!priceTag) {
      throw new NotFoundException('Price tag not found for this product');
    }

    const orderItem = this.orderItemsRepository.create({
      product,
      priceTag,
      priceAtTime: priceTag.price,
      quantity: payload.quantity,
    });

    const order = this.ordersRepository.create({
      user,
      deliveryInfo,
      orderItems: [orderItem],
      status: OrderStatus.PENDING,
      orderStatus: 0, // Legacy status
      paymentMethod: payload.paymentMethod,
      paymentId: payload.paymentId,
      discount: 0, // Ensure discount is initialized
    });

    const saved = await this.ordersRepository.save(order);

    return this.findOne(saved.id, user);
  }

  async createFromCart(user: User, payload: CheckoutOrderDto) {
    const deliveryInfo = await this.deliveryInfoRepository.findOne({
      where: { id: payload.deliveryInfoId, user: { id: user.id } },
    });

    if (!deliveryInfo) {
      throw new NotFoundException('Delivery info not found');
    }

    const cartItems = await this.cartItemsRepository.find({
      where: { user: { id: user.id } },
      relations: ['product', 'priceTag'],
    });

    if (cartItems.length === 0) {
      throw new BadRequestException('Your cart is empty on the server. Please add items to cart again.');
    }

    const orderItems = cartItems.map((cartItem) =>
      this.orderItemsRepository.create({
        product: cartItem.product,
        priceTag: cartItem.priceTag,
        priceAtTime: cartItem.priceTag.price,
        quantity: cartItem.quantity,
      }),
    );

    const order = this.ordersRepository.create({
      user,
      deliveryInfo,
      orderItems,
      status: OrderStatus.PENDING,
      orderStatus: 0, // Legacy status
      paymentMethod: payload.paymentMethod,
      paymentId: payload.paymentId,
    });

    const saved = await this.ordersRepository.save(order);

    // Clear user's cart
    const cartItemIds = cartItems.map((item) => item.id);
    await this.cartItemsRepository.delete({ id: In(cartItemIds) });

    return this.findOne(saved.id, user);
  }
}