import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Product } from './product.entity';

@Entity('price_tags')
export class PriceTag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'double precision' })
  price: number;

  @ManyToOne(() => Product, (product) => product.priceTags, { onDelete: 'CASCADE' })
  product: Product;
}
