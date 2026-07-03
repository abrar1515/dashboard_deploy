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
import { Settings } from './entities/settings.entity';
import { OrderStatus } from './common/enums/order-status.enum';
import { PaymentMethod } from './common/enums/payment-method.enum';
import { PaymentStatus } from './common/enums/payment-status.enum';
import { UserRole } from './common/enums/user-role.enum';
import 'reflect-metadata';
import 'dotenv/config';

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
  //host: process.env.DB_HOST ?? 'localhost',
  url: 'postgresql://postgres:KZPCzOdeceNFsMIhLiFFTMwtaYOawSLg@postgres.railway.internal:5432/railway',
  //ssl:{rejectUnauthorized: false},
  port: Number(process.env.DB_PORT ?? '5432'),
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? '12345678',
  database: process.env.DB_NAME ?? 'click_shop',
  ssl:
    process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  entities: [
    User,
    Category,
    Product,
    PriceTag,
    CartItem,
    DeliveryInfo,
    Order,
    OrderItem,
    Settings,
  ],
  synchronize: true,
  //logging: false, 
});

async function seed() {
  await dataSource.initialize();

  const userRepository = dataSource.getRepository(User);
  const categoryRepository = dataSource.getRepository(Category);
  const productRepository = dataSource.getRepository(Product);
  const deliveryInfoRepository = dataSource.getRepository(DeliveryInfo);
  const orderRepository = dataSource.getRepository(Order);
  const settingsRepository = dataSource.getRepository(Settings);

  const existingUser = await userRepository.findOne({
    where: { email: 'demo@click-shop.com' },
  });

  let user: User;
  if (!existingUser) {
    const passwordHash = await bcrypt.hash('password123', 10);
    const newUser = userRepository.create({
      firstName: 'Demo',
      lastName: 'User',
      email: 'demo@click-shop.com',
      passwordHash,
      role: UserRole.CUSTOMER,
    });
    user = await userRepository.save(newUser);
  } else {
    user = existingUser;
  }

  const adminEmail = (
    process.env.ADMIN_EMAIL ?? 'admin@click-shop.com'
  ).toLowerCase();
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

  const orderCount = await orderRepository.count({
    where: { user: { id: user.id } },
  });

  if (orderCount === 0) {
    console.log('Seeding an order for the demo user...');

    let deliveryInfo = await deliveryInfoRepository.findOne({
      where: { user: { id: user.id } },
    });

    if (!deliveryInfo) {
      const newDeliveryInfo = deliveryInfoRepository.create({
        user,
        firstName: 'Demo',
        lastName: 'User',
        addressLineOne: '123 Main St',
        city: 'Karachi',
        contactNumber: '03001234567',
      });
      deliveryInfo = await deliveryInfoRepository.save(newDeliveryInfo);
    }

    const productToOrder = await productRepository.findOne({
      where: {},
      relations: ['priceTags'],
    });

    if (productToOrder && productToOrder.priceTags.length > 0) {
      const orderItem = new OrderItem();
      orderItem.product = productToOrder;
      orderItem.priceTag = productToOrder.priceTags[0];
      orderItem.quantity = 1;
      orderItem.priceAtTime = productToOrder.priceTags[0].price;

      const order = orderRepository.create({
        user,
        deliveryInfo,
        orderItems: [orderItem],
        paymentMethod: PaymentMethod.COD,
        paymentStatus: PaymentStatus.PENDING,
        status: OrderStatus.PENDING,
        orderStatus: 0, // Legacy status
      });

      await orderRepository.save(order);
    }
  }

  // Seed Settings
  const settingsCount = await settingsRepository.count();
  if (settingsCount === 0) {
    const settings = settingsRepository.create({
      jazzCashNumber: '03062555956',
      easyPaisaNumber: '03062555956',
      adminEmail: 'admin@clickshop.com',
    });
    await settingsRepository.save(settings);
  }

  await dataSource.destroy();
}

seed().catch(async (error) => {
  console.error('Seed failed', error);
  await dataSource.destroy();
  process.exit(1);
});
