import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { AdminCategoriesService } from './admin-categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('admin/categories')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminCategoriesController {
  constructor(private readonly adminCategoriesService: AdminCategoriesService) {}

  @Get()
  async list() {
    return this.adminCategoriesService.list();
  }

  @Post()
  async create(@Body() payload: CreateCategoryDto) {
    return this.adminCategoriesService.create(payload);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() payload: UpdateCategoryDto) {
    return this.adminCategoriesService.update(id, payload);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.adminCategoriesService.remove(id);
  }
}
