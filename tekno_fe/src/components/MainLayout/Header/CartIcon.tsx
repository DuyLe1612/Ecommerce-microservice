"use client";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useCart } from "@/hook/useCart";

export default function CartIcon() {
  const { getTotalItems } = useCart();
  const n = getTotalItems();

  return (
    <div>
      <Link href={"/cart"} className="group relative w-10 h-10 rounded-full flex items-center justify-center text-gray-300 hover:text-primary hover:bg-[#1a1a1a] transition-all duration-300">
        <ShoppingBag className="w-5 h-5" />
        {n > 0 && (
          <span className="absolute top-1.5 right-1.5 bg-primary text-black rounded-full w-4 h-4 text-[10px] font-bold flex items-center justify-center shadow-[0_0_10px_rgba(255,213,0,0.5)] transform translate-x-1/2 -translate-y-1/2">
            {n}
          </span>
        )}
      </Link>
    </div>
  );
}
