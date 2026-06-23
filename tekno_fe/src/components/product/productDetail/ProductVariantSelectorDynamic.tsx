"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProductDetail } from "@/type/product";
import AddToCartButton from "../AddToCartButton";
import AddToFavorButton from "../AddToFavorButton";

export default function ProductVariantSelectorDynamic({
  product,
}: {
  product: ProductDetail;
}) {
  const variants = product?.variants ?? [];

  // 1️⃣ Map thuộc tính động
  const attributesMap = useMemo(() => {
    const map: Record<string, string[]> = {};

    variants.forEach((variant) => {
      variant.attributes?.forEach((attr: any) => {
        if (!map[attr.name]) map[attr.name] = [];
        if (!map[attr.name].includes(attr.value)) {
          map[attr.name].push(attr.value);
        }
      });
    });

    return map;
  }, [variants]);

  // 2️⃣ State chọn thuộc tính
  const [selectedAttrs, setSelectedAttrs] = useState<
    Record<string, string | null>
  >({});

  const handleSelectAttr = (attrName: string, value: string) => {
    setSelectedAttrs((prev) => ({
      ...prev,
      [attrName]: prev[attrName] === value ? null : value,
    }));
  };

  // 3️⃣ Tìm variant phù hợp
  const matchedVariant = useMemo(() => {
    return variants.find((variant) =>
      variant.attributes?.every((attr: any) => {
        const sel = selectedAttrs[attr.name];
        if (!sel) return false;
        return attr.value === sel;
      })
    );
  }, [variants, selectedAttrs]);

  return (
    <div className="space-y-6">
      <h3 className="font-bold text-xl tracking-wide text-white uppercase">Select Variant</h3>

      {/* DYNAMIC ATTRIBUTE BUTTONS */}
      {Object.keys(attributesMap).map((attrName) => (
        <div key={attrName} className="space-y-3">
          <div className="font-semibold text-gray-300">{attrName}</div>
          <div className="flex flex-wrap gap-2">
            {attributesMap[attrName]?.map((value) => (
              <Button
                key={value}
                variant="outline"
                onClick={() => handleSelectAttr(attrName, value)}
                className={cn(
                  "px-4 py-2 rounded-xl transition-all duration-300",
                  selectedAttrs[attrName] === value
                    ? "border-primary text-primary bg-primary/10 shadow-[0_0_10px_rgba(255,213,0,0.15)]"
                    : "border-gray-800 text-gray-400 bg-[#111111] hover:border-primary/50 hover:bg-[#1a1a1a]"
                )}
              >
                {value}
              </Button>
            ))}
          </div>
        </div>
      ))}

      {/* Variant info */}
      <div className="p-6 border border-gray-800 rounded-2xl bg-[#111111] shadow-lg relative overflow-hidden group">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[40px] pointer-events-none group-hover:bg-primary/10 transition-colors"></div>

        {matchedVariant ? (
          <>
            <div className="text-gray-300 relative z-10">
              <span className="font-medium text-gray-500 mr-2">SKU:</span>
              {matchedVariant.sku}
            </div>
            <div className="mt-3 relative z-10">
              <span className="font-medium text-gray-500 mr-2">Price:</span>
              <span className="font-extrabold text-3xl text-primary drop-shadow-sm">
                {matchedVariant.price.toLocaleString('vi-VN')}₫
              </span>
            </div>
            <div className="mt-4 relative z-10">
              <span className="font-medium text-gray-500 mr-2">Stock:</span>
              {matchedVariant.stock > 0 ? (
                <span className="text-green-400 bg-green-500/10 px-3 py-1 rounded-full text-sm font-semibold border border-green-500/20 shadow-sm">
                  In stock ({matchedVariant.stock})
                </span>
              ) : (
                <span className="text-red-400 bg-red-500/10 px-3 py-1 rounded-full text-sm font-semibold border border-red-500/20 shadow-sm">
                  Out of stock
                </span>
              )}
            </div>
          </>
        ) : (
          <div className="text-gray-500 flex items-center justify-center py-6 text-sm font-medium relative z-10">
            Please select all options to view variant details.
          </div>
        )}
      </div>

      {/* Add to cart */}
      <div className="flex items-center justify-center gap-5">
        <AddToCartButton product={product} selectedVariant={matchedVariant} />
        <AddToFavorButton productId={product.id} className="relative" />
      </div>
    </div>
  );
}
