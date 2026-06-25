"use client";
import React, { useState } from "react";
import { ProductDetail } from "@/type/product";
import { useCart } from "@/hook/useCart";
import { toast } from "sonner";

export default function AddToCartButton({
  product,
  selectedVariant, // prop variant đã chọn
}: {
  product: ProductDetail;
  selectedVariant?: ProductDetail["variants"][number] | null;
}) {
  const { addToCart } = useCart();

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
      const primaryImage =
        product.primaryImageUrl ??
        product.images?.find((image) => image.isPrimary)?.imageUrl ??
        product.images?.[0]?.imageUrl;

      await addToCart({
        variantId: selectedVariant.id,
        quantity: 1,
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        primaryImage,
        brandName: product.brand?.name,
        sku: selectedVariant.sku,
        availableStock: selectedVariant.stock,
        attributes: selectedVariant.attributes ?? [],
      });
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
