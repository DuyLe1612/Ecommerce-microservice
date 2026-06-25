import { Injectable, NotFoundException } from '@nestjs/common';
import { ReviewService } from '../review/review.service';
import { MessagingService } from '../messaging/messaging.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly reviewService: ReviewService,
    private readonly messagingService: MessagingService,
  ) {}

  // ─────────────────────────────────────────────
  // PATCH /api/admin/reviews/:reviewId/approve
  // ─────────────────────────────────────────────
  async approveReview(reviewId: number) {
    const review = await this.reviewService.findById(reviewId);

    review.status = 'Approved';
    const saved = await this.reviewService.save(review);

    // Publish event for notification-service / search-service
    await this.messagingService.publishReviewApproved({
      reviewId: saved.id,
      productId: saved.productId,
      userId: saved.userId,
      rating: saved.rating,
    });

    return true;
  }

  // ─────────────────────────────────────────────
  // PATCH /api/admin/reviews/:reviewId/reject
  // ─────────────────────────────────────────────
  async rejectReview(reviewId: number) {
    const review = await this.reviewService.findById(reviewId);

    review.status = 'Rejected';
    await this.reviewService.save(review);

    // Publish event
    await this.messagingService.publishReviewRejected({
      reviewId: review.id,
      productId: review.productId,
      userId: review.userId,
    });

    return true;
  }

  // ─────────────────────────────────────────────
  // GET /api/admin/reviews/product/:productId
  // ─────────────────────────────────────────────
  async getProductReviews(productId: number, page: number = 1, pageSize: number = 20) {
    return this.reviewService.getAdminProductReviews(productId, page, pageSize);
  }

  // ─────────────────────────────────────────────
  // GET /api/admin/reviews
  // ─────────────────────────────────────────────
  async getAllReviews(page: number = 1, pageSize: number = 20, status?: string) {
    return this.reviewService.getAllAdminReviews(page, pageSize, status);
  }
}
