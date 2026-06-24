import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { mapCategory } from '../../common/mappers';
import { Category } from '../../entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class AdminCategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async list() {
    const categories = await this.categoriesRepository.find({
      order: { name: 'ASC' },
    });

    return { data: categories.map(mapCategory) };
  }

  async create(payload: CreateCategoryDto) {
    const category = this.categoriesRepository.create({
      name: payload.name,
      image: payload.image,
    });

    const saved = await this.categoriesRepository.save(category);
    return mapCategory(saved);
  }

  async update(id: string, payload: UpdateCategoryDto) {
    const category = await this.categoriesRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (payload.name !== undefined) {
      category.name = payload.name;
    }

    if (payload.image !== undefined) {
      category.image = payload.image;
    }

    const saved = await this.categoriesRepository.save(category);
    return mapCategory(saved);
  }

  async remove(id: string) {
    const category = await this.categoriesRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    await this.categoriesRepository.remove(category);
    return { success: true };
  }
}
