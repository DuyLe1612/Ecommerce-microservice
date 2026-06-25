"use client";

import React, { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import CommentItemView from "./CommentItemView";

import {
  ProductReview,
  ProductReviewsResponse,
  ReviewSummary,
  SubmitReviewPayload,
  CanReviewData,
} from "@/type/review";
import {
  getProductReviews,
  canReviewProduct,
  createReview,
} from "@/services/review";
import { toast } from "sonner";
import { Star, Loader2, ShieldAlert, CheckCircle2, LogIn } from "lucide-react";
import Link from "next/link";

export default function Comments({ productId }: { productId: number }) {
  const [response, setResponse] = useState<ProductReviewsResponse | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // permission + input
  const [canData, setCanData] = useState<CanReviewData | null>(null);
  const [permChecking, setPermChecking] = useState(true);
  const [commentText, setCommentText] = useState<string>("");
  const [commentError, setCommentError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchReviews = async () => {
    const res = await getProductReviews({ productId });
    setResponse(res.data);
    setReviews(res.data?.reviews ?? []);
    setSummary(res.data?.summary ?? null);
  };

  useEffect(() => {
    let mounted = true;

    // Fetch reviews
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

    // Check permission to comment
    (async () => {
      try {
        setPermChecking(true);
        const token = typeof window !== "undefined" ? localStorage.getItem("token") ?? "" : "";
        if (!token) {
          if (mounted) {
            setIsLoggedIn(false);
            setCanData(null);
          }
          return;
        }
        setIsLoggedIn(true);
        const perm = await canReviewProduct(token, productId);
        if (mounted) setCanData(perm?.data ?? null);
      } catch (e) {
        console.warn("canReviewProduct error:", e);
        if (mounted) setCanData(null);
      } finally {
        if (mounted) setPermChecking(false);
      }
    })();

    return () => { mounted = false; };
  }, [productId]);

  const canComment = Boolean(canData?.canReview);

  const handleSubmitComment = async () => {
    if (!canComment || submitting) return;
    setCommentError(null);

    if (!commentText.trim()) {
      setCommentError("Please enter your review content.");
      return;
    }
    if (commentText.trim().length < 10) {
      setCommentError("Review must be at least 10 characters.");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token") || "";
      if (!token) throw new Error("Missing auth token");

      const payload: SubmitReviewPayload = { rating, comment: commentText.trim() };
      const resCreate = await createReview(token, productId, payload);
      toast.success(resCreate.message || "Review submitted! It will appear after moderation.");

      // Reset form
      setCommentText("");
      setRating(5);
      // Reload reviews
      await fetchReviews();
    } catch (error: any) {
      if (error?.errors?.Comment?.length) {
        setCommentError(error.errors.Comment[0]);
      } else {
        toast.error(error?.message || "Failed to submit review.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // --- Render permission notice ---
  const renderPermissionNotice = () => {
    if (permChecking) {
      return (
        <div className="flex items-center gap-2 text-sm text-white/40">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Checking eligibility…</span>
        </div>
      );
    }

    if (!isLoggedIn) {
      return (
        <p className="text-sm text-white/50 flex items-center gap-1.5">
          <LogIn className="w-4 h-4 text-primary/70" />
          <Link href="/sign-in" className="text-primary hover:underline font-medium">Log in</Link>
          {" "}to write a review.
        </p>
      );
    }

    if (canData?.hasAlreadyReviewed) {
      return (
        <p className="text-sm text-green-400 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" />
          You have already submitted a review for this product.
        </p>
      );
    }

    if (!canComment) {
      return (
        <p className="text-sm text-white/50 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-yellow-400 shrink-0" />
          {canData?.message || "Purchase and receive this product to write a review."}
        </p>
      );
    }

    return (
      <p className="text-sm text-white/40">
        Your review will appear after moderation by our team.
      </p>
    );
  };

  return (
    <section id="reviews" className="flex flex-col md:flex-row gap-8 lg:gap-12 mt-8">
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
                      <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${percent}%` }} />
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
            <div className="mt-2">{renderPermissionNotice()}</div>
          </div>

          {/* Rating stars */}
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((v) => {
              const active = (hoverRating || rating) >= v;
              return (
                <button
                  key={v}
                  type="button"
                  aria-label={`Rate ${v} star`}
                  className={`p-1 transition-transform ${canComment ? "hover:scale-110 cursor-pointer" : "cursor-not-allowed opacity-40"}`}
                  disabled={!canComment}
                  onMouseEnter={() => setHoverRating(v)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(v)}
                >
                  <Star
                    className={`h-6 w-6 transition-colors ${active ? "text-yellow-400" : "text-gray-600"}`}
                    fill={active ? "currentColor" : "none"}
                  />
                </button>
              );
            })}
            <span className="ml-2 text-sm text-gray-600">{rating}/5</span>
          </div>

          <Textarea
            placeholder="Share your thoughts about this product…"
            value={commentText}
            onChange={(e) => {
              setCommentText(e.target.value);
              if (commentError) setCommentError(null);
            }}
            disabled={!canComment}
            className="min-h-[120px] resize-none rounded-xl focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-300 bg-[#1a1a1a] border-gray-800 text-white placeholder:text-gray-500 shadow-inner disabled:opacity-40 disabled:cursor-not-allowed"
          />

          {commentError && (
            <p className="-mt-2 text-sm text-red-400">{commentError}</p>
          )}

          <button
            className="w-full bg-primary text-black font-semibold rounded-xl py-3 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 disabled:bg-gray-700 disabled:text-gray-500 disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
            onClick={handleSubmitComment}
            disabled={!canComment || submitting}
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
            ) : (
              "Submit Review"
            )}
          </button>
        </div>
      </div>

      {/* Right side: Reviews List */}
      <div className="flex flex-col w-full md:w-2/3 gap-4">
        {loading ? (
          <div className="py-8 flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading reviews…
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-10 text-center border border-gray-800 rounded-2xl bg-[#111111]">
            <Star className="w-10 h-10 mx-auto mb-3 text-gray-700" />
            <p className="text-gray-400 font-medium">No reviews yet</p>
            <p className="text-sm text-gray-600 mt-1">Be the first to review this product!</p>
          </div>
        ) : (
          reviews.map((rv) => <CommentItemView key={rv.id} review={rv} />)
        )}
      </div>
    </section>
  );
}
