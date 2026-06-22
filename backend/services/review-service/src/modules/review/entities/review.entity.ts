import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
  Unique,
} from 'typeorm';
import { ReviewVote } from './review-vote.entity';

@Entity('reviews')
@Unique(['productId', 'userId'])
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  productId: number;

  @Index()
  @Column()
  userId: number;

  @Column()
  userEmail: string;

  @Column({ nullable: true })
  userName: string;

  /**
   * Denormalized product name to avoid calling product-service on every admin list query.
   * Populated at review creation time.
   */
  @Column({ nullable: true })
  productName: string;

  @Column({ type: 'int' })
  rating: number; // 1-5

  @Column({ type: 'text' })
  comment: string; // min 10, max 2000 chars

  @Column({ default: 'Pending' })
  status: string; // 'Pending' | 'Approved' | 'Rejected'

  @Column({ default: false })
  isVerifiedPurchase: boolean;

  @Column({ nullable: true })
  orderId: number;

  @Column({ nullable: true })
  variantSku: string;

  @Column({ type: 'jsonb', nullable: true })
  variantAttributes: Record<string, string> | null;

  @Column({ default: 0 })
  helpfulCount: number;

  @Column({ default: 0 })
  notHelpfulCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ReviewVote, (vote) => vote.review, { cascade: true })
  votes: ReviewVote[];
}
