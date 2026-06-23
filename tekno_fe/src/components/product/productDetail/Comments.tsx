"use client";

import React, { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import CommentItemView from "./CommentItemView";

import {
  ProductReview,
  ProductReviewsResponse,
  ReviewSummary,
  SubmitReviewPayload,
} from "@/type/review";
import {
  getProductReviews,
  canReviewProduct,
  createReview,
} from "@/services/review";
import { toast } from "sonner";
import { Star } from "lucide-react";

export default function Comments({ productId }: { productId: number }) {
  const [response, setResponse] = useState<ProductReviewsResponse | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // permission + input
  const [canComment, setCanComment] = useState<boolean>(false);
  const [commentText, setCommentText] = useState<string>("");
  const [commentError, setCommentError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(5); // rating UI state
  const [hoverRating, setHoverRating] = useState<number>(0); // for hover preview

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await getProductReviews({ productId });
        if (mounted) {
          setResponse(res.data);
          setReviews(res.data?.reviews ?? []);
          setSummary(res.data?.summary ?? null);
        }
      } catch (e) {
        console.warn("fetch product reviews error:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    // check permission to comment
    (async () => {
      try {
        const token = localStorage.getItem("token") || "";
        if (!token) {
          setCanComment(false);
          return;
        }
        const perm = await canReviewProduct(token, productId);
        setCanComment(Boolean(perm?.data?.canReview));
      } catch (e) {
        console.warn("canReviewProduct error:", e);
        setCanComment(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [productId]);

  const handleSubmitComment = async () => {
    if (!canComment || submitting) return;

    // reset lỗi cũ
    setCommentError(null);

    if (!commentText.trim()) {
      setCommentError("Please enter your comment content");
      return;
    }

    try {
      setSubmitting(true);

      const token = localStorage.getItem("token") || "";
      if (!token) throw new Error("Missing auth token");

      const payload: SubmitReviewPayload = {
        rating,
        comment: commentText.trim(),
      };

      const resCreate = await createReview(token, productId, payload);

      toast.success(resCreate.message || "Comment submitted successfully");

      // reset form
      setCommentText("");
      setRating(5);

      // reload reviews
      const res = await getProductReviews({ productId });
      setResponse(res.data);
      setReviews(res.data?.reviews ?? []);
      setSummary(res.data?.summary ?? null);
    } catch (error: any) {
      /**
       * error.errors dạng:
       * {
       *   Comment: ["Comment must be between 10 and 2000 characters"]
       * }
       */
      if (error?.errors?.Comment?.length) {
        setCommentError(error.errors.Comment[0]);
      } else {
        toast.error(error?.message || "Failed to submit comment");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 lg:gap-12 mt-8">
      {/* Left side: Summary & Form */}
      <div className="flex flex-col w-full md:w-1/3 gap-5 h-fit sticky top-24">
        {summary && summary.totalReviews > 0 && (
          <div className="bg-[#111111] p-6 rounded-2xl shadow-lg border border-gray-800 flex flex-col gap-4">
            <h3 className="font-bold text-xl text-white tracking-tight">Rating Summary</h3>
            <div className="flex items-center gap-4">
              <div className="text-5xl font-black text-primary drop-shadow-sm">{summary.averageRating.toFixed(1)}</div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center text-yellow-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} fill={s <= Math.round(summary.averageRating) ? "currentColor" : "none"} className="w-5 h-5" />
                  ))}
                </div>
                <div className="text-sm text-gray-400 font-medium">{summary.totalReviews} reviews</div>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = summary.ratingDistribution[star as keyof typeof summary.ratingDistribution] || 0;
                const percent = summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="w-2 font-bold">{star}</span>
                    <Star className="w-3 h-3 text-gray-500" fill="currentColor" />
                    <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${percent}%` }}></div>
                    </div>
                    <span className="w-8 text-right text-gray-400 text-xs font-semibold">{percent.toFixed(0)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-5 bg-[#111111] p-6 rounded-2xl shadow-lg border border-gray-800">
          <div>
            <h3 className="font-bold text-2xl text-white tracking-tight">Write a Review</h3>
            <p className="text-gray-400 text-sm mt-1">
              You are not allowed to write a review for this product. Please purchase this product first.
            </p>
          </div>

          {/* Rating stars */}
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((v) => {
              const active = (hoverRating || rating) >= v;
              return (
                <button
                  key={v}
                  type="button"
                  aria-label={`Chọn ${v} sao`}
                  className="p-1"
                  disabled={!canComment}
                  onMouseEnter={() => setHoverRating(v)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(v)}
                >
                  <Star
                    className={`h-5 w-5 ${active ? "text-yellow-400" : "text-gray-300"
                      }`}
                    fill={active ? "currentColor" : "none"}
                  />
                  {/* <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className={`w-6 h-6 ${
                    active ? "text-yellow-400" : "text-gray-300"
                  }`}
                  fill="currentColor"
                >
                  <path d="M11.48 3.5a1 1 0 0 1 1.04 0l3.2 1.9 3.67.6a1 1 0 0 1 .56 1.72l-2.6 2.6.62 3.73a1 1 0 0 1-1.46 1.05L12 14.9l-3.71 2.2a1 1 0 0 1-1.46-1.05l.62-3.73-2.6-2.6a1 1 0 0 1 .56-1.72l3.67-.6 3.2-1.9Z" />
                </svg> */}
                </button>
              );
            })}
            <span className="ml-2 text-sm text-gray-600">{rating}/5</span>
          </div>

          <Textarea
            placeholder="Share your thoughts about this product..."
            value={commentText}
            onChange={(e) => {
              setCommentText(e.target.value);
              if (commentError) setCommentError(null);
            }}
            disabled={!canComment}
            className="min-h-[120px] resize-none rounded-xl focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-300 bg-[#1a1a1a] border-gray-800 text-white placeholder:text-gray-500 shadow-inner"
          />

          {commentError && (
            <p className="mt-1 text-sm text-red-500">{commentError}</p>
          )}

          <button
            className="w-full bg-primary text-black font-semibold rounded-xl py-3 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 disabled:bg-gray-200 disabled:text-gray-400 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            onClick={handleSubmitComment}
            disabled={!canComment || submitting}
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>

      {/* Right side: Comments List */}
      <div className="flex flex-col w-full md:w-2/3 gap-4">
        {loading ? (
          <div className="py-4 text-sm text-gray-500">Loading…</div>
        ) : reviews.length === 0 ? (
          <div className="py-4 text-sm text-gray-500">No comments yet</div>
        ) : (
          reviews.map((rv) => <CommentItemView key={rv.id} review={rv} />)
        )}
      </div>
    </div>
  );
}
