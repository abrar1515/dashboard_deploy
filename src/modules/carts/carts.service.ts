import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { mapCartItem } from '../../common/mappers';
import { CartItem } from '../../entities/cart-item.entity';
import { PriceTag } from '../../entities/price-tag.entity';
import { Product } from '../../entities/product.entity';
import { User } from '../../entities/user.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { SyncCartDto } from './dto/sync-cart.dto';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(PriceTag)
    private readonly priceTagsRepository: Repository<PriceTag>,
  ) {}

  async addToCart(user: User, payload: AddToCartDto) {
    const product = await this.productsRepository.findOne({
      where: { id: payload.product },
      relations: { priceTags: true, categories: true },
    });

    if (!product) {
      throw new BadRequestException('Product not found');
    }

    const priceTag = await this.priceTagsRepository.findOne({
      where: { id: payload.priceTag },
      relations: { product: true },
    });

    if (!priceTag) {
      throw new BadRequestException('Price tag not found');
    }

    const cartItem = this.cartRepository.create({
      user,
      product,
      priceTag,
    });

    const saved = await this.cartRepository.save(cartItem);

    const hydrated = await this.cartRepository.findOne({
      where: { id: saved.id },
      relations: {
        product: { priceTags: true, categories: true },
        priceTag: { product: true },
      },
    });

    if (!hydrated) {
      return mapCartItem({ ...saved, product, priceTag } as CartItem);
    }

    return mapCartItem(hydrated);
  }

  async syncCart(user: User, payload: SyncCartDto) {
    await this.cartRepository.delete({ user: { id: user.id } });

    for (const item of payload.data) {
      const product = await this.productsRepository.findOne({
        where: { id: item.product },
      });
      const priceTag = await this.priceTagsRepository.findOne({
        where: { id: item.priceTag },
      });

      if (!product || !priceTag) {
        continue;
      }

      const cartItem = this.cartRepository.create({
        user,
        product,
        priceTag,
      });

      await this.cartRepository.save(cartItem);
    }

    const refreshed = await this.cartRepository.find({
      where: { user: { id: user.id } },
      relations: {
        product: { priceTags: true, categories: true },
        priceTag: { product: true },
      },
    });

    return refreshed.map(mapCartItem);
  }
}
