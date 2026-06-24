import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { mapProduct } from '../../common/mappers';
import { Category } from '../../entities/category.entity';
import { PriceTag } from '../../entities/price-tag.entity';
import { Product } from '../../entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

interface ProductQuery {
  keyword?: string;
  page?: string;
  pageSize?: string;
  categories?: string;
}

@Injectable()
export class AdminProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(PriceTag)
    private readonly priceTagsRepository: Repository<PriceTag>,
  ) {}

  async list(query: ProductQuery) {
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

  async findOne(id: string) {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: { priceTags: true, categories: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return mapProduct(product);
  }

  async create(payload: CreateProductDto) {
    const categories = payload.categories?.length
      ? await this.categoriesRepository.find({
          where: { id: In(payload.categories) },
        })
      : [];

    const product = this.productsRepository.create({
      name: payload.name,
      description: payload.description,
      images: payload.images ?? [],
      categories,
    });

    const priceTags = (payload.priceTags ?? []).map((tag) =>
      this.priceTagsRepository.create({
        name: tag.name,
        price: tag.price,
        product,
      }),
    );

    product.priceTags = priceTags;

    const saved = await this.productsRepository.save(product);
    return this.findOne(saved.id);
  }

  async update(id: string, payload: UpdateProductDto) {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: { priceTags: true, categories: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (payload.name !== undefined) {
      product.name = payload.name;
    }

    if (payload.description !== undefined) {
      product.description = payload.description;
    }

    if (payload.images !== undefined) {
      product.images = payload.images;
    }

    if (payload.categories !== undefined) {
      product.categories = payload.categories.length
        ? await this.categoriesRepository.find({
            where: { id: In(payload.categories) },
          })
        : [];
    }

    if (payload.priceTags !== undefined) {
      await this.priceTagsRepository.delete({ product: { id: product.id } });
      product.priceTags = payload.priceTags.map((tag) =>
        this.priceTagsRepository.create({
          name: tag.name,
          price: tag.price,
          product,
        }),
      );
    }

    const saved = await this.productsRepository.save(product);
    return this.findOne(saved.id);
  }

  async remove(id: string) {
    const product = await this.productsRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.productsRepository.remove(product);
    return { success: true };
  }
}
