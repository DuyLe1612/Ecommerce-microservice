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
      toast.error("Please select all options to add to cart");
      return;
    }

    if (isOutOfStock) return;

    setLoading(true);
    setError(null);

    try {
      await addToCart(selectedVariant.id, 1);
      toast.success(`${product.name} added to cart`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to add to cart");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex items-center">
      <button
        onClick={handleAddToCart}
        disabled={isOutOfStock || loading}
        className="w-full rounded-full py-3.5 px-8 text-base font-semibold bg-primary text-black hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
      >
        {loading ? "Adding..." : "Add to Cart"}
      </button>
      {error && <div className="text-red-500 mt-2 text-sm">{error}</div>}
    </div>
  );
}
