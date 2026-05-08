import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  recipientName: string;

  @Column()
  phoneNumber: string;

  @Column()
  addressLine: string;

  @Column({ type: 'int' })
  provinceCode: number;

  @Column()
  provinceName: string;

  @Column({ type: 'int' })
  districtCode: number;

  @Column()
  districtName: string;

  @Column({ type: 'int' })
  wardCode: number;

  @Column()
  wardName: string;

  @Column({ default: false })
  isDefault: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;
}