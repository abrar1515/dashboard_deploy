import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { PriceTag } from './price-tag.entity';
import { Product } from './product.entity';
import { User } from './user.entity';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.cartItems, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Product, { eager: false, onDelete: 'CASCADE' })
  product: Product;

  @ManyToOne(() => PriceTag, { eager: false, onDelete: 'CASCADE' })
  priceTag: PriceTag;

  @CreateDateColumn()
  createdAt: Date;
}
