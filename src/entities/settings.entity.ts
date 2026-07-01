import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('settings')
export class Settings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20, default: '03062555956' })
  jazzCashNumber: string;

  @Column({ type: 'varchar', length: 20, default: '03062555956' })
  easyPaisaNumber: string;

  @Column({ type: 'varchar', length: 120, default: 'admin@clickshop.com' })
  adminEmail: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
