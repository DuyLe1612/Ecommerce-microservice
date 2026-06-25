"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Star, X, CheckCircle2, ShieldAlert, Loader2 } from "lucide-react";
import { canReviewProduct, createReview } from "@/services/review";
import { CanReviewData, SubmitReviewPayload } from "@/type/review";
import { toast } from "sonner";

interface WriteReviewModalProps {
  productId: number;
  productName: string;
  productImageUrl?: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

type ModalState = "checking" | "cannot" | "form" | "success";

export default function WriteReviewModal({
  productId,
  productName,
  productImageUrl,
  onClose,
  onSuccess,
}: WriteReviewModalProps) {
  const [state, setState] = useState<ModalState>("checking");
  const [canReviewData, setCanReviewData] = useState<CanReviewData | null>(null);

  // form state
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Check permission on mount
  useEffect(() => {
    const checkPermission = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") ?? "" : "";
      if (!token) {
        setCanReviewData({ canReview: false, message: "Please log in to write a review.", hasPurchased: false, hasAlreadyReviewed: false, eligibleOrders: [] });
        setState("cannot");
        return;
      }
      try {
        const res = await canReviewProduct(token, productId);
        const data = res?.data;
        setCanReviewData(data ?? null);
        setState(data?.canReview ? "form" : "cannot");
      } catch {
        setCanReviewData({ canReview: false, message: "Unable to check review eligibility. Please try again.", hasPurchased: false, hasAlreadyReviewed: false, eligibleOrders: [] });
        setState("cannot");
      }
    };
    checkPermission();
  }, [productId]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setCommentError(null);

    if (comment.trim().length < 10) {
      setCommentError("Review must be at least 10 characters.");
      return;
    }

    const token = localStorage.getItem("token") ?? "";
    if (!token) { toast.error("Please log in first."); return; }

    try {
      setSubmitting(true);
      const payload: SubmitReviewPayload = { rating, comment: comment.trim() };
      const res = await createReview(token, productId, payload);
      toast.success(res.message || "Review submitted! It will appear after moderation.");
      setState("success");
      onSuccess?.();
    } catch (err: any) {
      if (err?.errors?.Comment?.length) {
        setCommentError(err.errors.Comment[0]);
      } else {
        toast.error(err?.message || "Failed to submit review.");
      }
    } finally {
      setSubmitting(false);
    }
  }, [comment, productId, rating, submitting, onSuccess]);

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-lg bg-[#111111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-6 pt-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            {productImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={productImageUrl}
                alt={productName}
                className="w-12 h-12 rounded-lg object-cover border border-white/10 shrink-0"
              />
            )}
            <div className="min-w-0">
              <p className="text-xs text-white/45 uppercase tracking-wider font-medium">Write a Review</p>
              <h2 className="text-base font-bold text-white leading-tight line-clamp-2 mt-0.5">{productName}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {/* CHECKING */}
          {state === "checking" && (
            <div className="flex flex-col items-center gap-3 py-8 text-white/50">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-sm">Checking eligibility…</span>
            </div>
          )}

          {/* CANNOT REVIEW */}
          {state === "cannot" && (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              {canReviewData?.hasAlreadyReviewed ? (
                <>
                  <CheckCircle2 className="w-12 h-12 text-green-400" />
                  <div>
                    <p className="text-base font-semibold text-white">Already reviewed</p>
                    <p className="text-sm text-white/50 mt-1">You have already submitted a review for this product.</p>
                  </div>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-12 h-12 text-yellow-400" />
                  <div>
                    <p className="text-base font-semibold text-white">Review not available</p>
                    <p className="text-sm text-white/50 mt-1">
                      {canReviewData?.message || "You need to purchase and receive this product before reviewing."}
                    </p>
                  </div>
                </>
              )}
              <button
                onClick={onClose}
                className="mt-2 px-6 py-2 rounded-full border border-white/20 text-sm text-white/70 hover:bg-white/10 transition-colors"
              >
                Close
              </button>
            </div>
          )}

          {/* FORM */}
          {state === "form" && (
            <div className="flex flex-col gap-5">
              {/* Star rating */}
              <div>
                <label className="text-sm font-medium text-white/70 mb-2 block">Your Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((v) => {
                    const active = (hoverRating || rating) >= v;
                    return (
                      <button
                        key={v}
                        type="button"
                        aria-label={`Rate ${v} star`}
                        className="p-1 transition-transform hover:scale-110 active:scale-95"
                        onMouseEnter={() => setHoverRating(v)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(v)}
                      >
                        <Star
                          className={`h-7 w-7 transition-colors ${active ? "text-yellow-400" : "text-white/20"}`}
                          fill={active ? "currentColor" : "none"}
                        />
                      </button>
                    );
                  })}
                  <span className="ml-2 text-sm text-white/40 font-medium">{rating}/5</span>
                </div>
              </div>

              {/* Comment textarea */}
              <div>
                <label className="text-sm font-medium text-white/70 mb-2 block">Your Review</label>
                <textarea
                  className="w-full min-h-[120px] resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  placeholder="Share your experience with this product…"
                  value={comment}
                  onChange={(e) => {
                    setComment(e.target.value);
                    if (commentError) setCommentError(null);
                  }}
                  maxLength={2000}
                />
                <div className="flex items-center justify-between mt-1">
                  {commentError ? (
                    <p className="text-xs text-red-400">{commentError}</p>
                  ) : (
                    <span className="text-xs text-white/25">Min. 10 characters</span>
                  )}
                  <span className="text-xs text-white/25">{comment.length}/2000</span>
                </div>
              </div>

              {/* Note */}
              <p className="text-xs text-white/35 -mt-1">
                Your review will be visible after moderation by our team.
              </p>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-white/15 text-sm text-white/60 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-black font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                  ) : (
                    "Submit Review"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* SUCCESS */}
          {state === "success" && (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9 text-green-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">Review Submitted!</p>
                <p className="text-sm text-white/50 mt-1 max-w-xs">
                  Thank you for your feedback. Your review will appear after moderation.
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-2 px-6 py-2.5 rounded-full bg-primary text-black font-semibold text-sm hover:bg-primary/90 transition-all"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
