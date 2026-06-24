import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { DeliveryInfo } from './delivery-info.entity';
import { OrderItem } from './order-item.entity';
import { User } from './user.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.orders, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => DeliveryInfo, { eager: false })
  deliveryInfo: DeliveryInfo;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: true,
  })
  orderItems: OrderItem[];

  @Column({ type: 'double precision', default: 0 })
  discount: number;

  @Column({ type: 'int', default: 0 })
  orderStatus: number;

  @CreateDateColumn()
  createdAt: Date;
}
