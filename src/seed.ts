import 'reflect-metadata';

import * as bcrypt from 'bcryptjs';
import { DataSource } from 'typeorm';

import { CartItem } from './entities/cart-item.entity';
import { Category } from './entities/category.entity';
import { DeliveryInfo } from './entities/delivery-info.entity';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { PriceTag } from './entities/price-tag.entity';
import { Product } from './entities/product.entity';
import { User } from './entities/user.entity';
import { UserRole } from './common/enums/user-role.enum';
import 'dotenv/config';

const fallbackDatabaseUrl =
  'postgresql://postgres:HGwBOJLcHmyqlQWefiPdxjiPfLETXBDI@reseau.proxy.rlwy.net:18988/railway';

const categoryImageUrl =
  'https://res.cloudinary.com/dhyttttax/image/upload/v1693148015/category/headphone_pdqwo2.jpg';

const mouseImages = [
  'https://res.cloudinary.com/dhyttttax/image/upload/v1693151785/product/vxyyemcdwcuoooyejehj.jpg',
  'https://res.cloudinary.com/dhyttttax/image/upload/v1693151785/product/vqiw6cswpnzhgryd3s1l.jpg',
  'https://res.cloudinary.com/dhyttttax/image/upload/v1693151785/product/tkanjwktt2t0qvybk5xf.jpg',
  'https://res.cloudinary.com/dhyttttax/image/upload/v1693151785/product/yjxkgevogpaim02wonks.jpg',
  'https://res.cloudinary.com/dhyttttax/image/upload/v1693151785/product/m2bb9pzzobynrpyo9ike.jpg',
  'https://res.cloudinary.com/dhyttttax/image/upload/v1693151785/product/xhojjofgfyfpbjwo2vox.jpg',
];

const headsetImages = [
  'https://res.cloudinary.com/dhyttttax/image/upload/v1693151785/product/vxyyemcdwcuoooyejehj.jpg',
];

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL ?? fallbackDatabaseUrl,
  //ssl:{rejectUnauthorized: false},
  port: Number(process.env.DB_PORT ?? '5432'),
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? '12345678',
  database: process.env.DB_NAME ?? 'click_shop',
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
  synchronize: true,
  //logging: false, 
});

async function seed() {
  await dataSource.initialize();

  const userRepository = dataSource.getRepository(User);
  const categoryRepository = dataSource.getRepository(Category);
  const productRepository = dataSource.getRepository(Product);

  const existingUser = await userRepository.findOne({
    where: { email: 'demo@click-shop.com' },
  });

  if (!existingUser) {
    const passwordHash = await bcrypt.hash('password123', 10);
    const user = userRepository.create({
      firstName: 'Demo',
      lastName: 'User',
      email: 'demo@click-shop.com',
      passwordHash,
      role: UserRole.CUSTOMER,
    });
    await userRepository.save(user);
  }

  const adminEmail = (process.env.ADMIN_EMAIL ?? 'admin@click-shop.com').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin123';
  const existingAdmin = await userRepository.findOne({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    const admin = userRepository.create({
      firstName: 'Admin',
      lastName: 'User',
      email: adminEmail,
      passwordHash,
      role: UserRole.ADMIN,
    });
    await userRepository.save(admin);
  }

  const categoryCount = await categoryRepository.count();
  if (categoryCount === 0) {
    const categories = categoryRepository.create([
      {
        name: 'Headphone',
        image: categoryImageUrl,
      },
      {
        name: 'Gaming',
        image: categoryImageUrl,
      },
    ]);
    await categoryRepository.save(categories);
  }

  const productCount = await productRepository.count();
  if (productCount === 0) {
    const categories = await categoryRepository.find();
    const headphoneCategory = categories[0];

    const mouseProduct = productRepository.create({
      name: 'Asus Gaming Mouse',
      description: 'Text description',
      images: mouseImages,
      categories: headphoneCategory ? [headphoneCategory] : [],
      priceTags: [],
    });

    const whitePriceTag = new PriceTag();
    whitePriceTag.name = 'White';
    whitePriceTag.price = 50.99;
    whitePriceTag.product = mouseProduct;

    mouseProduct.priceTags = [whitePriceTag];

    const headsetProduct = productRepository.create({
      name: 'Wireless Headset',
      description: 'High quality wireless headset with noise cancellation.',
      images: headsetImages,
      categories: headphoneCategory ? [headphoneCategory] : [],
      priceTags: [],
    });

    const blackPriceTag = new PriceTag();
    blackPriceTag.name = 'Black';
    blackPriceTag.price = 89.99;
    blackPriceTag.product = headsetProduct;

    headsetProduct.priceTags = [blackPriceTag];

    await productRepository.save([mouseProduct, headsetProduct]);
  }

  await dataSource.destroy();
}

seed().catch(async (error) => {
  console.error('Seed failed', error);
  await dataSource.destroy();
  process.exit(1);
});
