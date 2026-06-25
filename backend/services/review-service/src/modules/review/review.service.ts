import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Review } from './entities/review.entity';
import { ReviewVote } from './entities/review-vote.entity';
import { CreateReviewDto, UpdateReviewDto, VoteReviewDto } from './dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Injectable()
export class ReviewService {
  private readonly logger = new Logger(ReviewService.name);

  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(ReviewVote)
    private voteRepository: Repository<ReviewVote>,
    private configService: ConfigService,
    private dataSource: DataSource,
  ) {}

  // ─────────────────────────────────────────────
  // GET /products/:productId/reviews
  // ─────────────────────────────────────────────
  async getProductReviews(
    productId: number,
    page: number = 1,
    pageSize: number = 20,
    verifiedOnly?: boolean,
  ) {
    const query = this.reviewRepository
      .createQueryBuilder('review')
      .where('review.productId = :productId', { productId })
      .andWhere('review.status = :status', { status: 'Approved' });

    if (verifiedOnly === true) {
      query.andWhere('review.isVerifiedPurchase = true');
    }

    query
      .orderBy('review.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [reviews, totalCount] = await query.getManyAndCount();

    const summary = await this.buildSummary(productId);

    return {
      reviews,
      summary,
      totalCount,
      page,
      pageSize,
    };
  }

  // ─────────────────────────────────────────────
  // GET /products/:productId/reviews/summary
  // ─────────────────────────────────────────────
  async getReviewSummary(productId: number) {
    return this.buildSummary(productId);
  }

  // ─────────────────────────────────────────────
  // GET /products/:productId/reviews/can-review
  // ─────────────────────────────────────────────
  async canReview(productId: number, user: CurrentUser) {
    const userId = parseInt(user.id, 10);

    // Check if user has already reviewed this product
    const existingReview = await this.reviewRepository.findOne({
      where: { productId, userId },
    });

    if (existingReview) {
      return {
        canReview: false,
        message: 'You have already reviewed this product',
        hasPurchased: true,
        hasAlreadyReviewed: true,
        eligibleOrders: [],
      };
    }

    const requireVerify = this.configService.get<string>('VERIFY_PURCHASE_REQUIRED') === 'true';

    if (!requireVerify) {
      // Loose mode: any logged-in user can review
      return {
        canReview: true,
        message: 'You can review this product',
        hasPurchased: false,
        hasAlreadyReviewed: false,
        eligibleOrders: [],
      };
    }

    // Strict mode: check order-service for delivered orders containing this product
    try {
      const orderServiceUrl = this.configService.get<string>('ORDER_SERVICE_URL');
      const token = `internal`; // Will use forwarded token in controller
      const response = await axios.get(`${orderServiceUrl}/api/orders/history`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 3000,
      });

      const orders = response.data?.data || [];
      const eligibleOrders = orders
        .filter(
          (order: any) =>
            ['Delivered', 'Completed'].includes(order.status) &&
            order.items?.some((item: any) => item.productId === productId),
        )
        .map((order: any) => order.id);

      const hasPurchased = eligibleOrders.length > 0;

      return {
        canReview: hasPurchased,
        message: hasPurchased
          ? 'You can review this product'
          : 'You must purchase this product before leaving a review',
        hasPurchased,
        hasAlreadyReviewed: false,
        eligibleOrders,
      };
    } catch (err) {
      this.logger.warn(`Failed to reach order-service for purchase check: ${(err as Error).message}`);
      // Fallback: allow review if order-service is unavailable
      return {
        canReview: true,
        message: 'You can review this product',
        hasPurchased: false,
        hasAlreadyReviewed: false,
        eligibleOrders: [],
      };
    }
  }

  // ─────────────────────────────────────────────
  // POST /products/:productId/reviews
  // ─────────────────────────────────────────────
  async createReview(
    productId: number,
    dto: CreateReviewDto,
    user: CurrentUser,
    token: string,
  ) {
    const userId = parseInt(user.id, 10);

    // Check duplicate review
    const existing = await this.reviewRepository.findOne({
      where: { productId, userId },
    });
    if (existing) {
      throw new ConflictException('You have already reviewed this product');
    }

    // Verify purchase if required
    let isVerifiedPurchase = false;
    let orderId: number | null = null;
    let productName: string | null = null;

    const requireVerify = this.configService.get<string>('VERIFY_PURCHASE_REQUIRED') === 'true';

    if (requireVerify) {
      try {
        const orderServiceUrl = this.configService.get<string>('ORDER_SERVICE_URL');
        const response = await axios.get(`${orderServiceUrl}/api/orders/history`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 3000,
        });

        const orders = response.data?.data || [];
        const eligible = orders.find(
          (order: any) =>
            ['Delivered', 'Completed'].includes(order.status) &&
            order.items?.some((item: any) => item.productId === productId),
        );

        if (eligible) {
          isVerifiedPurchase = true;
          orderId = eligible.id;
          // Try to get productName from order item
          const item = eligible.items?.find((i: any) => i.productId === productId);
          productName = item?.productName || null;
        }
      } catch (err) {
        this.logger.warn(`Purchase verification failed: ${(err as Error).message}`);
      }
    }

    // Try to get product name from product-service if not available
    if (!productName) {
      try {
        const productServiceUrl = this.configService.get<string>('PRODUCT_SERVICE_URL');
        const resp = await axios.get(`${productServiceUrl}/api/products/${productId}`, {
          timeout: 3000,
        });
        productName = resp.data?.data?.name || resp.data?.name || null;
      } catch {
        this.logger.warn(`Could not fetch product name for productId=${productId}`);
      }
    }

    const reviewData: Partial<Review> = {
      productId: productId,
      userId: userId,
      userEmail: user.email,
      userName: user.email.split('@')[0],
      productName: productName ?? undefined,
      rating: dto.rating,
      comment: dto.comment,
      status: 'Pending',
      isVerifiedPurchase: isVerifiedPurchase,
      orderId: orderId ?? undefined,
    };

    const review = this.reviewRepository.create(reviewData as any);
    const saved = await this.reviewRepository.save(review);
    return saved;
  }

  // ─────────────────────────────────────────────
  // PUT /products/:productId/reviews/:reviewId
  // ─────────────────────────────────────────────
  async updateReview(
    productId: number,
    reviewId: number,
    dto: UpdateReviewDto,
    user: CurrentUser,
  ) {
    const userId = parseInt(user.id, 10);

    const review = await this.reviewRepository.findOne({
      where: { id: reviewId, productId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('You can only update your own review');
    }

    if (dto.rating !== undefined) review.rating = dto.rating;
    if (dto.comment !== undefined) review.comment = dto.comment;

    // Reset to Pending when content changes so admin can re-moderate
    review.status = 'Pending';

    return this.reviewRepository.save(review);
  }

  // ─────────────────────────────────────────────
  // DELETE /products/:productId/reviews/:reviewId
  // ─────────────────────────────────────────────
  async deleteReview(productId: number, reviewId: number, user: CurrentUser) {
    const userId = parseInt(user.id, 10);

    const review = await this.reviewRepository.findOne({
      where: { id: reviewId, productId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== userId && user.role !== 'admin') {
      throw new ForbiddenException('You can only delete your own review');
    }

    await this.reviewRepository.remove(review);
    return true;
  }

  // ─────────────────────────────────────────────
  // POST /products/:productId/reviews/:reviewId/vote
  // ─────────────────────────────────────────────
  async voteReview(
    productId: number,
    reviewId: number,
    dto: VoteReviewDto,
    user: CurrentUser,
  ) {
    const userId = parseInt(user.id, 10);

    const review = await this.reviewRepository.findOne({
      where: { id: reviewId, productId, status: 'Approved' },
    });

    if (!review) {
      throw new NotFoundException('Review not found or not yet approved');
    }

    if (review.userId === userId) {
      throw new ForbiddenException('You cannot vote on your own review');
    }

    // Upsert vote using transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingVote = await queryRunner.manager.findOne(ReviewVote, {
        where: { reviewId, userId },
      });

      if (existingVote) {
        const oldType = existingVote.voteType;
        const newType = dto.voteType;

        if (oldType !== newType) {
          // Switch vote
          existingVote.voteType = newType;
          await queryRunner.manager.save(existingVote);

          if (oldType === 'helpful') {
            review.helpfulCount = Math.max(0, review.helpfulCount - 1);
            review.notHelpfulCount += 1;
          } else {
            review.notHelpfulCount = Math.max(0, review.notHelpfulCount - 1);
            review.helpfulCount += 1;
          }
        }
        // Same vote type: do nothing (idempotent)
      } else {
        const vote = queryRunner.manager.create(ReviewVote, {
          reviewId,
          userId,
          voteType: dto.voteType,
        });
        await queryRunner.manager.save(vote);

        if (dto.voteType === 'helpful') {
          review.helpfulCount += 1;
        } else {
          review.notHelpfulCount += 1;
        }
      }

      await queryRunner.manager.save(review);
      await queryRunner.commitTransaction();

      return {
        helpfulCount: review.helpfulCount,
        notHelpfulCount: review.notHelpfulCount,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // ─────────────────────────────────────────────
  // Admin: get review by id (internal)
  // ─────────────────────────────────────────────
  async findById(reviewId: number): Promise<Review> {
    const review = await this.reviewRepository.findOne({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async save(review: Review): Promise<Review> {
    return this.reviewRepository.save(review);
  }

  // ─────────────────────────────────────────────
  // Admin: get all reviews for a product (any status)
  // ─────────────────────────────────────────────
  async getAdminProductReviews(productId: number, page: number = 1, pageSize: number = 20) {
    const [reviews, totalCount] = await this.reviewRepository.findAndCount({
      where: { productId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const summary = await this.buildSummary(productId);

    return {
      reviews,
      summary,
      totalCount,
      page,
      pageSize,
    };
  }

  // ─────────────────────────────────────────────
  // Admin: get all reviews across all products
  // ─────────────────────────────────────────────
  async getAllAdminReviews(page: number = 1, pageSize: number = 20, status?: string) {
    const query = this.reviewRepository.createQueryBuilder('review');

    if (status) {
      query.andWhere('review.status = :status', { status });
    }

    query
      .orderBy('review.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [reviews, totalCount] = await query.getManyAndCount();

    return {
      reviews,
      totalCount,
      page,
      pageSize,
    };
  }

  // ─────────────────────────────────────────────
  // Private helper: build rating summary
  // ─────────────────────────────────────────────
  private async buildSummary(productId: number) {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'averageRating')
      .addSelect('COUNT(*)', 'totalReviews')
      .addSelect(
        `COUNT(CASE WHEN review.rating = 1 THEN 1 END)`,
        'rating1',
      )
      .addSelect(
        `COUNT(CASE WHEN review.rating = 2 THEN 1 END)`,
        'rating2',
      )
      .addSelect(
        `COUNT(CASE WHEN review.rating = 3 THEN 1 END)`,
        'rating3',
      )
      .addSelect(
        `COUNT(CASE WHEN review.rating = 4 THEN 1 END)`,
        'rating4',
      )
      .addSelect(
        `COUNT(CASE WHEN review.rating = 5 THEN 1 END)`,
        'rating5',
      )
      .addSelect(
        `COUNT(CASE WHEN review.isVerifiedPurchase = true THEN 1 END)`,
        'verifiedPurchaseCount',
      )
      .where('review.productId = :productId', { productId })
      .andWhere('review.status = :status', { status: 'Approved' })
      .getRawOne();

    return {
      productId,
      totalReviews: parseInt(result.totalReviews) || 0,
      averageRating: parseFloat(result.averageRating) || 0,
      ratingDistribution: {
        '1': parseInt(result.rating1) || 0,
        '2': parseInt(result.rating2) || 0,
        '3': parseInt(result.rating3) || 0,
        '4': parseInt(result.rating4) || 0,
        '5': parseInt(result.rating5) || 0,
      },
      verifiedPurchaseCount: parseInt(result.verifiedPurchaseCount) || 0,
    };
  }
}
