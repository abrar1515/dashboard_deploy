import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

import { CartItem } from './entities/cart-item.entity';
import { Category } from './entities/category.entity';
import { DeliveryInfo } from './entities/delivery-info.entity';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { PriceTag } from './entities/price-tag.entity';
import { Product } from './entities/product.entity';
import { User } from './entities/user.entity';
import { AuthModule } from './modules/auth/auth.module';
import { CartsModule } from './modules/carts/carts.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { DeliveryInfoModule } from './modules/delivery-info/delivery-info.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ProductsModule } from './modules/products/products.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'public', 'admin'),
      serveRoot: '/admin',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        //port: Number(config.get<string>('DB_PORT', '5432')),
        username: config.get<string>('DB_USER', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'postgres'),
        database: config.get<string>('DB_NAME', 'click_shop'),
        entities: [
          User,
          Category,
          Product,
          PriceTag,
          CartItem,
          DeliveryInfo,
          Order,
          OrderItem,
        ],
        synchronize: config.get<string>('DB_SYNC', 'true') === 'true',
      }),
    }),
    AuthModule,
    CategoriesModule,
    ProductsModule,
    CartsModule,
    DeliveryInfoModule,
    OrdersModule,
    AdminModule,
  ],
})
export class AppModule {}
