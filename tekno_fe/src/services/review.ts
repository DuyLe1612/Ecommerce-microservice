import { API_BASE_URL } from "@/lib/apiConfig";
import { CanReviewData, ProductReviewsResponse, SubmitReviewPayload, SubmitReviewResponse } from "@/type/review";
import { ApiResponse } from "@/type/share";


interface GetProductReviewsParams {
  productId: number;
  page?: number;
  pageSize?: number;
  verifiedOnly?: boolean;
}

export async function getProductReviews({
  productId,
  page = 1,
  pageSize = 20,
  verifiedOnly,
}: GetProductReviewsParams): Promise<ApiResponse<ProductReviewsResponse>> {
  const params = new URLSearchParams();

  params.append("page", page.toString());
  params.append("pageSize", pageSize.toString());

  if (verifiedOnly !== undefined) {
    params.append("verifiedOnly", String(verifiedOnly));
  }

  const res = await fetch(
    `${API_BASE_URL}/products/${productId}/reviews?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // nếu muốn luôn fresh
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch product reviews");
  }

  return res.json();
}

// POST /api/products/{productId}/reviews
export async function createReview(
  token: string,
  productId: number,
  payload: SubmitReviewPayload
): Promise<ApiResponse<SubmitReviewResponse>> {
  const res = await fetch(
    `${API_BASE_URL}/products/${productId}/reviews`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw json;
  }

  return json as ApiResponse<SubmitReviewResponse>;
}

// PUT /api/products/{productId}/reviews/{reviewId}
export async function updateReview(
  token: string,
  productId: number,
  reviewId: number,
  payload: SubmitReviewPayload
): Promise<ApiResponse<SubmitReviewResponse>> {
  const res = await fetch(
    `${API_BASE_URL}/products/${productId}/reviews/${reviewId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw json;
  }

  return json as ApiResponse<SubmitReviewResponse>;
}
// DELETE /api/products/{productId}/reviews/{reviewId}
export async function deleteReview(
  token: string,
  productId: number,
  reviewId: number
): Promise<ApiResponse<boolean>> {
  const res = await fetch(
    `${API_BASE_URL}/products/${productId}/reviews/${reviewId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw json;
  }

  return json as ApiResponse<boolean>;
}

// POST /api/products/{productId}/reviews/{reviewId}/vote
export async function voteReview(
  token: string,
  productId: number,
  reviewId: number,
  voteType: 'helpful' | 'not_helpful'
): Promise<ApiResponse<{ helpfulCount: number; notHelpfulCount: number }>> {
  const res = await fetch(
    `${API_BASE_URL}/products/${productId}/reviews/${reviewId}/vote`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ voteType }),
    }
  );

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw json;
  }

  return json;
}

// GET /api/products/{productId}/reviews/can-review
export async function canReviewProduct(
  token: string,
  productId: number
): Promise<ApiResponse<CanReviewData>> {
  const res = await fetch(
    `${API_BASE_URL}/products/${productId}/reviews/can-review`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw json;
  }

  return json as ApiResponse<CanReviewData>;
}

// ============ ADMIN REVIEWS ============

export interface AdminReview {
  id: number;
  productId: number;
  productName: string;
  userId: number;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  status: "Pending" | "Approved" | "Rejected";
  isVerifiedPurchase: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ReviewSummary {
  productId: number;
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    "1": number;
    "2": number;
    "3": number;
    "4": number;
    "5": number;
  };
  verifiedPurchaseCount: number;
}

export interface AdminReviewsResponse {
  reviews: AdminReview[];
  summary: ReviewSummary;
  totalCount: number;
  page: number;
  pageSize: number;
}

// PATCH /api/admin/reviews/{reviewId}/approve
export async function approveReview(
  token: string,
  reviewId: number
): Promise<ApiResponse<boolean>> {
  const res = await fetch(
    `${API_BASE_URL}/admin/reviews/${reviewId}/approve`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw json;
  }

  return json as ApiResponse<boolean>;
}

// PATCH /api/admin/reviews/{reviewId}/reject
export async function rejectReview(
  token: string,
  reviewId: number
): Promise<ApiResponse<boolean>> {
  const res = await fetch(
    `${API_BASE_URL}/admin/reviews/${reviewId}/reject`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw json;
  }

  return json as ApiResponse<boolean>;
}

// GET /api/admin/reviews/product/{productId}
export async function getAdminProductReviews(
  token: string,
  productId: number,
  page: number = 1,
  pageSize: number = 20
): Promise<ApiResponse<AdminReviewsResponse>> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("pageSize", pageSize.toString());

  const res = await fetch(
    `${API_BASE_URL}/admin/reviews/product/${productId}?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw json;
  }

  return json as ApiResponse<AdminReviewsResponse>;
}