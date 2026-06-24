import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { AdminProductsService } from './admin-products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('admin/products')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminProductsController {
  constructor(private readonly adminProductsService: AdminProductsService) {}

  @Get()
  async list(@Query() query: Record<string, string>) {
    return this.adminProductsService.list(query);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.adminProductsService.findOne(id);
  }

  @Post()
  async create(@Body() payload: CreateProductDto) {
    return this.adminProductsService.create(payload);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() payload: UpdateProductDto) {
    return this.adminProductsService.update(id, payload);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.adminProductsService.remove(id);
  }
}
