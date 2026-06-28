import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { OrderStatus } from '@/common/enums/order-status.enum';
import { DeliveryInfo } from './delivery-info.entity';
import { OrderItem } from './order-item.entity';
import { User } from './user.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.orders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  user: User;

  @ManyToOne(() => DeliveryInfo, { eager: false })
  deliveryInfo: DeliveryInfo;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: true,
  })
  orderItems: OrderItem[];

  @Column({ type: 'double precision', default: 0 })
  discount: number;

  @Column({ type: 'int', default: OrderStatus.PENDING, name: 'status' })
  orderStatus: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
