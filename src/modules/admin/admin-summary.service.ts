import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Category } from '../../entities/category.entity';
import { Order } from '../../entities/order.entity';
import { Product } from '../../entities/product.entity';
import { User } from '../../entities/user.entity';

@Injectable()
export class AdminSummaryService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async getSummary() {
    const [products, categories, orders, users] = await Promise.all([
      this.productsRepository.count(),
      this.categoriesRepository.count(),
      this.ordersRepository.count(),
      this.usersRepository.count(),
    ]);

    return { products, categories, orders, users };
  }
}
