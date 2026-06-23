"use client";
import { useAuth } from "@/hook/useAuth";
import {
  User,
  CreditCard,
  ShoppingBag,
  Heart,
  Tag,
  Phone,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

// Add icon per item
export const AccountItemsData = [
  { href: "/account/personal-data", label: "Personal Data", icon: User },

  { href: "/account/orders", label: "Orders", icon: ShoppingBag },
  { href: "/account/wish-list", label: "Wish list", icon: Heart },
  { href: "/account/discount", label: "Discounts", icon: Tag },
  { href: "/contact-us", label: "Contact us", icon: Phone },
];

export default function AccountMenu() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-4 bg-[#111111] rounded-3xl border border-gray-800 p-2 shadow-[0_10px_40px_rgba(0,0,0,0.5)] h-fit sticky top-28">
      {/* avatar + name */}
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#1a1a1a] border border-gray-800 mx-2 mt-2">
        <div className="w-12 h-12 flex-shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-[0_0_15px_rgba(255,213,0,0.2)]">
          <User className="w-6 h-6" />
        </div>
        <div className="flex flex-col overflow-hidden">
          <div className="text-sm font-bold text-white truncate">
            {user?.role || user?.email?.split('@')[0] || "Guest"}
          </div>
          <div className="text-xs text-gray-400 truncate">
            {user?.email || "guest@tekno.dev"}
          </div>
        </div>
      </div>

      {/* tabs */}
      <div className="flex flex-col gap-1 px-2 pb-2">
        {AccountItemsData.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                active ? "bg-primary/10 text-primary font-bold" : "text-gray-400 hover:bg-[#1a1a1a] hover:text-white"
              }`}
            >
              <Icon
                className={`h-5 w-5 transition-colors ${active ? "text-primary shadow-[0_0_10px_rgba(255,213,0,0.5)] rounded-full" : "text-gray-500 group-hover:text-primary"}`}
              />
              {item.label}
            </Link>
          );
        })}

        <div className="w-full h-px bg-gray-800 my-2"></div>

        <button 
          className="group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 text-gray-400 hover:bg-red-500/10 hover:text-red-500 w-full text-left" 
          onClick={logout}
        >
          <LogOut className="h-5 w-5 text-gray-500 group-hover:text-red-500 transition-colors" />
          Log out
        </button>
      </div>
    </div>
  );
}
