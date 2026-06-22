"use client";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { ProductDetail } from "@/type/product";
import { useCart } from "@/hook/useCart";
import { toast } from "sonner";

export default function AddToCartButton({
  product,
  selectedVariant, // prop variant đã chọn
  className,
}: {
  product: ProductDetail;
  selectedVariant?: ProductDetail["variants"][number] | null;
  className?: string;
}) {
  const { addToCart, getItemCount } = useCart();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOutOfStock = !selectedVariant || selectedVariant.stock <= 0;

  const handleAddToCart = async () => {
    console.log("Selected Variant:", selectedVariant);

    if (!selectedVariant) {
      alert("Vui lòng chọn đủ thuộc tính để mua");
      return;
    }

    if (isOutOfStock) return;

    setLoading(true);
    setError(null);

    try {
      await addToCart(selectedVariant.id, 1); // thêm 1 sp
      toast.success(`${product.name} đã thêm vào giỏ hàng`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Thêm vào giỏ hàng thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-12 flex items-center">
      <Button
        variant="outline"
        onClick={handleAddToCart}
        disabled={isOutOfStock || loading}
        className="w-full"
      >
        {loading ? "Đang thêm..." : "Add to cart"}
      </Button>
      {error && <div className="text-red-500 mt-1">{error}</div>}
    </div>
  );
}
