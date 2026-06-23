import { Product } from "@/type/product";
import { ProductReview } from "@/type/review";
import React, { useMemo, useState } from "react";
import { Star, ThumbsDown, ThumbsUp } from "lucide-react";
import { deleteReview, updateReview } from "@/services/review";
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
      toast.success("Đã xóa bình luận");
      window.location.reload();
    } catch (e: any) {
      toast.error(e?.message || "Xóa bình luận thất bại");
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token") || "";
      if (!token) throw new Error("Missing token");
      if (!editText.trim()) {
        toast.error("Nội dung không được để trống");
        return;
      }
      setSaving(true);
      await updateReview(token, Number(review.productId), Number(review.id), {
        rating: editRating,
        comment: editText.trim(),
      });
      toast.success("Đã cập nhật bình luận");
      // reload or lift state up to re-fetch
      window.location.reload();
    } catch (e: any) {
      toast.error(e?.message || "Cập nhật bình luận thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 border border-gray-300 bg-gray-50 p-3 rounded-2xl">
      <div className="flex justify-between">
        {/* thong tin ng cmt */}
        <div className="flex items-center gap-4">
          <div className="rounded-full">avt</div>
          <div className="flex flex-col">
            <div className="text-xl font-bold">{review.userEmail}</div>
            <div className="text-gray-500 font-normal text-sm" suppressHydrationWarning>
              {new Date(review.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {!editing ? (
          <div className="flex items-center justify-center gap-1 rounded-xl bg-primary text-white px-3 py-1">
            <Star fill="white" className="h-5 w-5" />
            <p className="text-md font-normal">{review.rating}</p>
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
                    className={`h-5 w-5 ${
                      active ? "text-yellow-400" : "text-gray-300"
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
        <div className="text-black font-normal">{review.comment}</div>
      ) : (
        <textarea
          className="w-full border rounded-md px-3 py-2 text-sm"
          rows={3}
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
        />
      )}

      <div className="flex items-center justify-between gap-2">
        {!editing ? (
          <div className="flex items-center gap-2">
            <button className="flex items-center justify-center gap-1 hover:text-primary">
              <ThumbsUp />
              <span>{review.helpfulCount}</span>
            </button>
            <div className="bg-gray-500 rounded-2xl w-0.5 h-5" />
            <button className="flex items-center justify-center gap-1 hover:text-primary">
              <ThumbsDown />
              <span>{review.notHelpfulCount}</span>
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
                  className="px-3 py-1 text-sm rounded-md border hover:bg-gray-100"
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
                  className="px-3 py-1 text-sm rounded-md border border-red-300 text-red-600 hover:bg-red-50"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="px-3 py-1 text-sm rounded-md border hover:bg-gray-100"
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
                  className="px-3 py-1 text-sm rounded-md border bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
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
