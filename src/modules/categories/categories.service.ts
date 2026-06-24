import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { mapCategory } from '../../common/mappers';
import { Category } from '../../entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async getCategories() {
    const categories = await this.categoriesRepository.find({
      order: { name: 'ASC' },
    });

    return categories.map(mapCategory);
  }
}
