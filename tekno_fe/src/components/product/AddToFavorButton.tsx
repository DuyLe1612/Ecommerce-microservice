"use client";

import { cn } from "@/lib/utils";
import { Product } from "@/type/product";
import { Heart } from "lucide-react";
import React, { useEffect, useState } from "react";
import useFavor from "@/hook/useFavor";

export default function AddToFavorButton({
  productId,
  className,
}: {
  productId: number;
  className?: string;
}) {
  console.log(productId);

  const { items, addToFavor, removeFavor, checkFavor } = useFavor();

  // Kiểm tra sản phẩm có trong danh sách yêu thích hay chưa
  const exists = items.some((item) => item.id === productId);
  // const [exists, setExists] = useState(false);
  // useEffect(() => {
  //   const check = async () => {
  //     if (!productId) return;

  //     const exists = await checkFavor(productId);
  //     setExists(exists);
  //   };

  //   check();
  // }, [productId]);

  const handleFavor = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!productId) return;
    console.log(productId);

    if (exists) {
      await removeFavor(productId); // Đã tồn tại -> remove
    } else {
      await addToFavor(productId); // Chưa tồn tại -> add
    }
  };

  return (
    <div className={cn("", className)}>
      <button
        className="flex items-center justify-center p-3.5 rounded-full border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-primary/50 hover:bg-primary/5 hover:scale-105 active:scale-95 transition-all duration-300 text-gray-500"
        onClick={handleFavor}
      >
        {exists ? (
          <Heart fill="#EF4444" size={22} className="text-red-500" />
        ) : (
          <Heart size={22} className="text-gray-400 group-hover:text-primary" />
        )}
      </button>
    </div>
  );
}
