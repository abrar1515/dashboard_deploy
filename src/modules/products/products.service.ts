import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { mapProduct } from '../../common/mappers';
import { Product } from '../../entities/product.entity';

interface ProductQuery {
  keyword?: string;
  page?: string;
  pageSize?: string;
  categories?: string;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async getProducts(query: ProductQuery) {
    const page = Number(query.page ?? 0) || 0;
    const pageSize = Number(query.pageSize ?? 10) || 10;
    const keyword = (query.keyword ?? '').trim();

    let categoryIds: string[] = [];
    if (query.categories) {
      try {
        const parsed = JSON.parse(query.categories);
        if (Array.isArray(parsed)) {
          categoryIds = parsed.filter(Boolean);
        }
      } catch (_) {
        categoryIds = [];
      }
    }

    const qb = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.priceTags', 'priceTags')
      .leftJoinAndSelect('product.categories', 'categories')
      .distinct(true);

    if (keyword) {
      qb.where('LOWER(product.name) LIKE :keyword', {
        keyword: `%${keyword.toLowerCase()}%`,
      });
    }

    if (categoryIds.length > 0) {
      qb.andWhere('categories.id IN (:...categoryIds)', { categoryIds });
    }

    qb.orderBy('product.createdAt', 'DESC').skip(page * pageSize).take(pageSize);

    const [products, total] = await qb.getManyAndCount();

    return {
      meta: {
        page,
        pageSize,
        total,
      },
      data: products.map(mapProduct),
    };
  }
}
