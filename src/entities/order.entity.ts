import {
  Column,
  CreateDateColumn,
  Index,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { OrderStatus } from '../common/enums/order-status.enum';
import { DeliveryInfo } from './delivery-info.entity';
import { OrderItem } from './order-item.entity';
import { User } from './user.entity';

import { PaymentMethod } from '../common/enums/payment-method.enum';
import { PaymentStatus } from '../common/enums/payment-status.enum';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.orders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  @Index('idx_orders_customer_id')
  user: User;

  @ManyToOne(() => DeliveryInfo, { eager: false })
  deliveryInfo: DeliveryInfo;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: true,
  })
  orderItems: OrderItem[];

  @Column({ type: 'double precision', default: 0 })
  discount: number;

  @Column({ type: 'enum', enum: PaymentMethod, nullable: true })
  paymentMethod: PaymentMethod;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  @Index('idx_orders_payment_status')
  paymentStatus: PaymentStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  paymentId: string;

  @Column({ type: 'int', default: 0, name: 'order_status' }) // Legacy status (0=pending, 1=completed, 2=cancelled, 3=deleted)
  orderStatus: number; // This will now be managed separately from the new `status` field

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  @Index('idx_orders_status')
  status: OrderStatus;

  @CreateDateColumn({ name: 'created_at' })
  @Index('idx_orders_created_at')
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  confirmedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  shippedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt: Date;
}
