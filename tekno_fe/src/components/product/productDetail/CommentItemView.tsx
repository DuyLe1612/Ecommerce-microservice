import { Product } from "@/type/product";
import { ProductReview } from "@/type/review";
import React, { useMemo, useState } from "react";
import { Star, ThumbsDown, ThumbsUp } from "lucide-react";
import { deleteReview, updateReview, voteReview } from "@/services/review";
import { toast } from "sonner";
import { useAuth } from "@/hook/useAuth";

export default function CommentItemView({ review }: { review: ProductReview }) {
  const { user } = useAuth();

  const isOwner = user?.id != null && Number(review.userId) === Number(user?.id);

  console.log("Review item render, isOwner:", user?.id);

  // edit state
  const [editing, setEditing] = useState(false);
  const [editRating, setEditRating] = useState<number>(review.rating ?? 5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [editText, setEditText] = useState<string>(review.comment ?? "");
  const [saving, setSaving] = useState(false);

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token") || "";
      if (!token) throw new Error("Missing token");
      await deleteReview(token, Number(review.productId), Number(review.id));
      toast.success("Comment deleted successfully");
      window.location.reload();
    } catch (e: any) {
      toast.error(e?.message || "Failed to delete comment");
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token") || "";
      if (!token) throw new Error("Missing token");
      if (!editText.trim()) {
        toast.error("Content cannot be empty");
        return;
      }
      setSaving(true);
      await updateReview(token, Number(review.productId), Number(review.id), {
        rating: editRating,
        comment: editText.trim(),
      });
      toast.success("Comment updated successfully");
      // reload or lift state up to re-fetch
      window.location.reload();
    } catch (e: any) {
      toast.error(e?.message || "Failed to update comment");
    } finally {
      setSaving(false);
    }
  };

  const handleVote = async (voteType: "helpful" | "not_helpful") => {
    try {
      const token = localStorage.getItem("token") || "";
      if (!token) {
        toast.error("Please log in to vote on this review");
        return;
      }
      await voteReview(token, Number(review.productId), Number(review.id), voteType);
      toast.success("Vote recorded");
      window.location.reload();
    } catch (e: any) {
      toast.error(e?.message || "Failed to vote");
    }
  };

  return (
    <div className="flex flex-col gap-4 border border-gray-800 bg-[#111111] p-5 rounded-2xl shadow-md hover:shadow-lg hover:border-primary/30 transition-all duration-300 group">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-11 h-11 rounded-full bg-primary/20 text-primary shadow-[0_0_10px_rgba(255,213,0,0.1)] font-bold text-lg">
            {(review.userName || review.userEmail)[0].toUpperCase()}
          </div>
          <div className="flex flex-col">
            <div className="text-lg font-bold text-white tracking-tight">{review.userName || review.userEmail.split('@')[0]}</div>
            <div className="text-gray-500 font-medium text-xs mt-0.5" suppressHydrationWarning>
              {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>

        {!editing ? (
          <div className="flex items-center justify-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary px-3 py-1 font-semibold text-sm shadow-[0_0_10px_rgba(255,213,0,0.1)]">
            <Star fill="currentColor" className="h-4 w-4 drop-shadow-sm" />
            <span>{review.rating}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((v) => {
              const active = (hoverRating || editRating) >= v;
              return (
                <button
                  key={v}
                  type="button"
                  className="p-0.5"
                  onMouseEnter={() => setHoverRating(v)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setEditRating(v)}
                >
                  <Star
                    className={`h-5 w-5 ${active ? "text-yellow-400" : "text-gray-300"
                      }`}
                    fill={active ? "currentColor" : "none"}
                  />
                </button>
              );
            })}
            <span className="ml-2 text-sm text-gray-600">{editRating}/5</span>
          </div>
        )}
      </div>

      {!editing ? (
        <div className="text-gray-300 font-normal leading-relaxed text-sm md:text-base mt-1">{review.comment}</div>
      ) : (
        <textarea
          className="w-full border border-gray-800 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all resize-none bg-[#1a1a1a] text-white shadow-inner"
          rows={3}
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
        />
      )}

      <div className="flex items-center justify-between gap-2 mt-2 pt-4 border-t border-gray-800/50">
        {!editing ? (
          <div className="flex items-center gap-1">
            <button
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-[#1a1a1a] text-gray-500 hover:text-primary transition-all active:scale-95"
              onClick={() => handleVote("helpful")}
            >
              <ThumbsUp className="w-4 h-4" />
              <span className="text-sm font-medium">{review.helpfulCount}</span>
            </button>
            <div className="w-px h-4 bg-gray-800 mx-1" />
            <button
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-[#1a1a1a] text-gray-500 hover:text-primary transition-all active:scale-95"
              onClick={() => handleVote("not_helpful")}
            >
              <ThumbsDown className="w-4 h-4" />
              <span className="text-sm font-medium">{review.notHelpfulCount}</span>
            </button>
          </div>
        ) : (
          <div />
        )}

        {isOwner && (
          <div className="flex items-center gap-2">
            {!editing ? (
              <>
                <button
                  type="button"
                  className="px-4 py-1.5 text-sm font-medium rounded-full border border-gray-700 text-gray-400 hover:bg-[#1a1a1a] hover:text-white transition-colors"
                  onClick={() => {
                    setEditing(true);
                    setEditRating(review.rating ?? 5);
                    setEditText(review.comment ?? "");
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="px-4 py-1.5 text-sm font-medium rounded-full border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="px-4 py-1.5 text-sm font-medium rounded-full border border-gray-700 text-gray-400 hover:bg-[#1a1a1a] hover:text-white transition-colors"
                  onClick={() => {
                    setEditing(false);
                    setHoverRating(0);
                    setEditText(review.comment ?? "");
                    setEditRating(review.rating ?? 5);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-1.5 text-sm font-medium rounded-full bg-primary text-black hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
