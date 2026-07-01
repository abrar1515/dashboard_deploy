import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { Category } from '../../entities/category.entity';
import { Order } from '../../entities/order.entity';
import { PriceTag } from '../../entities/price-tag.entity';
import { Product } from '../../entities/product.entity';
import { User } from '../../entities/user.entity';
import { Settings } from '../../entities/settings.entity';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { AdminCategoriesController } from './admin-categories.controller';
import { AdminCategoriesService } from './admin-categories.service';
import { AdminOrdersController } from './admin-orders.controller';
import { AdminOrdersService } from './admin-orders.service';
import { AdminProductsController } from './admin-products.controller';
import { AdminProductsService } from './admin-products.service';
import { AdminSummaryController } from './admin-summary.controller';
import { AdminSummaryService } from './admin-summary.service';
import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from './admin-users.service';
import { AdminSettingsService } from './admin-settings.service';
import { AdminSettingsController } from './admin-settings.controller';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([User, Product, Category, PriceTag, Order, Settings]),
  ],
  controllers: [
    AdminAuthController,
    AdminCategoriesController,
    AdminProductsController,
    AdminOrdersController,
    AdminUsersController,
    AdminSummaryController,
    AdminSettingsController,
  ],
  providers: [
    AdminAuthService,
    AdminCategoriesService,
    AdminProductsService,
    AdminOrdersService,
    AdminUsersService,
    AdminSummaryService,
    AdminSettingsService,
  ],
})
export class AdminModule {}
