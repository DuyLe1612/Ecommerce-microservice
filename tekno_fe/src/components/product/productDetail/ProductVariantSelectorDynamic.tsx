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
      variant.attributes.forEach((attr: any) => {
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
      variant.attributes.every((attr: any) => {
        const sel = selectedAttrs[attr.name];
        if (!sel) return false;
        return attr.value.includes(sel); // vì value là mảng
      })
    );
  }, [variants, selectedAttrs]);

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-lg">Chọn phiên bản</h3>

      {/* DYNAMIC ATTRIBUTE BUTTONS */}
      {Object.keys(attributesMap).map((attrName) => (
        <div key={attrName} className="space-y-2">
          <div className="font-medium">{attrName}</div>
          <div className="flex flex-wrap gap-2">
            {attributesMap[attrName]?.map((value) => (
              <Button
                key={value}
                variant="outline"
                onClick={() => handleSelectAttr(attrName, value)}
                className={cn(
                  "px-4 py-2 rounded-md",
                  selectedAttrs[attrName] === value
                    ? "border-primary text-primary"
                    : "border-gray-300 text-gray-700"
                )}
              >
                {value}
              </Button>
            ))}
          </div>
        </div>
      ))}

      {/* Variant info */}
      <div className="p-4 border rounded-lg bg-gray-50">
        {matchedVariant ? (
          <>
            <div>
              <span className="font-medium">SKU:</span> {matchedVariant.sku}
            </div>
            <div>
              <span className="font-medium">Giá:</span>{" "}
              <span className="font-bold text-primary">
                {matchedVariant.price.toLocaleString()} đ
              </span>
            </div>
            <div>
              <span className="font-medium">Kho:</span>{" "}
              {matchedVariant.stock > 0 ? (
                <span className="text-green-600">
                  Còn {matchedVariant.stock} sp
                </span>
              ) : (
                <span className="text-red-500">Hết hàng</span>
              )}
            </div>
          </>
        ) : (
          <div className="text-gray-500">
            Vui lòng chọn đủ thuộc tính để xác định phiên bản.
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
