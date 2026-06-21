import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Review } from './review.entity';

@Entity('review_votes')
@Unique(['reviewId', 'userId'])
export class ReviewVote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  reviewId: number;

  @Column()
  userId: number;

  @Column()
  voteType: string; // 'helpful' | 'not_helpful'

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Review, (review) => review.votes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reviewId' })
  review: Review;
}
