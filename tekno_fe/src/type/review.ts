export type RatingDistribution = {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
};

export type ReviewSummary = {
  productId: number;
  totalReviews: number;
  averageRating: number;
  ratingDistribution: RatingDistribution;
  verifiedPurchaseCount: number;
};

export type ProductReview = {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  isVerifiedPurchase: boolean;
  productId: number;
  userId: number;
  userEmail: string;
  userName?: string;
  status?: string;
  updatedAt: string;
  helpfulCount: number;
  notHelpfulCount: number;
  variantSku?: null;
  variantAttributes?: null;
};

export type ProductReviewsResponse = {
    reviews: ProductReview[];
    summary: ReviewSummary;
    totalCount: number;
    page: number;
    pageSize: number;
};

export type SubmitReviewPayload = {
  rating: number,
  comment: string
}

export type SubmitReviewResponse = {
  id: number,
  productId: number,
  userId: number,
  rating: number,
  userEmail: string,
  status: string,
  comment:string,
  createdAt: string,
  updatedAt: string | null,
  isVerifiedPurchase: boolean,
  helpfulCount: number,
  notHelpfulCount: number,
  variantSku: string | null,
  variantAttributes: Record<string, string> | null
}

export type CanReviewData = {
  canReview: boolean;
  message: string;
  hasPurchased: boolean;
  hasAlreadyReviewed: boolean;
  eligibleOrders: number[]; // hiện tại là []
};
