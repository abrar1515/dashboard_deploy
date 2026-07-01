import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Order } from './order.entity';
import { PriceTag } from './price-tag.entity';
import { Product } from './product.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.orderItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Product, { eager: false })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => PriceTag, { eager: false })
  @JoinColumn({ name: 'price_tag_id' })
  priceTag: PriceTag;

  @Column({ type: 'double precision' })
  priceAtTime: number;

  @Column({ type: 'int', default: 1 })
  quantity: number;
}
