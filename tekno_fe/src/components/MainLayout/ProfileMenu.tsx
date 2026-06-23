"use client";

import { useAuth } from "@/hook/useAuth";
import { Heart, LogOut, ShoppingBag, UserRound } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function ProfileMenu() {
  const { logout, user } = useAuth();

  return (
    <div className="bg-[#111111] border border-gray-800 shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-2xl p-2 w-56 space-y-1 z-[999] relative">
      <Link
        href="/account/personal-data"
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#1a1a1a] text-gray-300 hover:text-white transition-colors text-sm font-medium group"
      >
        <UserRound size={18} className="text-gray-500 group-hover:text-primary transition-colors" />
        <span className="truncate">{user?.email || "Account"}</span>
      </Link>
      <Link
        href="/cart"
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#1a1a1a] text-gray-300 hover:text-white transition-colors text-sm font-medium group"
      >
        <ShoppingBag size={18} className="text-gray-500 group-hover:text-primary transition-colors" /> 
        Orders
      </Link>

      <Link
        href="/account/wishlist"
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#1a1a1a] text-gray-300 hover:text-white transition-colors text-sm font-medium group"
      >
        <Heart size={18} className="text-gray-500 group-hover:text-primary transition-colors" /> 
        Wish list
      </Link>
      
      <div className="h-px w-full bg-gray-800 my-2"></div>

      <button
        onClick={logout}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-gray-300 hover:text-red-500 transition-colors text-sm font-medium group"
      >
        <LogOut size={18} className="text-gray-500 group-hover:text-red-500 transition-colors" />
        Logout
      </button>
    </div>
  );
}
