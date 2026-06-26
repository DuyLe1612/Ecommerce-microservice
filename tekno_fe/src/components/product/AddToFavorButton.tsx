"use client";

import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import React, { useState } from "react";
import useFavor from "@/hook/useFavor";

export default function AddToFavorButton({
  productId,
  className,
}: {
  productId: number;
  className?: string;
}) {
  const { items, addToFavor, removeFavor } = useFavor();

  const exists = items.some((item) => item.id === productId);
  const [isLoading, setIsLoading] = useState(false);

  const handleFavor = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!productId) return;
    if (isLoading) return;

    setIsLoading(true);
    try {
      if (exists) {
        await removeFavor(productId);
      } else {
        await addToFavor(productId);
      }
    } catch (error) {
      if ((error as Error).message !== "User identity required") {
        console.error("Error updating favorite:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("", className)}>
      <button
        className={`flex items-center justify-center p-3.5 rounded-full border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-red-500/50 hover:bg-red-50 hover:scale-105 active:scale-95 transition-all duration-300 ${
          isLoading ? "opacity-50 cursor-wait" : ""
        }`}
        onClick={handleFavor}
        disabled={isLoading}
        aria-label={exists ? "Remove from favorites" : "Add to favorites"}
      >
        {exists ? (
          <Heart fill="#EF4444" size={22} className="text-red-500" />
        ) : (
          <Heart size={22} className="text-gray-400 hover:text-red-500" />
        )}
      </button>
    </div>
  );
}
