import { CreditCard, ShoppingCart, Truck } from "lucide-react";
import React from "react";

export default function Stepper({ isActive }: { isActive: number }) {
  return (
    <div className="mx-auto flex items-center justify-center py-4">
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
          isActive >= 1
            ? "bg-primary text-black shadow-[0_0_15px_rgba(var(--primary),0.5)] scale-110"
            : "bg-white/10 text-white/40 border border-white/10"
        }`}
      >
        <ShoppingCart className="w-5 h-5" />
      </div>
      
      <span
        className={`w-16 md:w-24 h-1 rounded-full mx-2 transition-all duration-300 ${
          isActive >= 1 ? "bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" : "bg-white/10"
        }`}
      />
      
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
          isActive >= 2
            ? "bg-primary text-black shadow-[0_0_15px_rgba(var(--primary),0.5)] scale-110"
            : "bg-white/10 text-white/40 border border-white/10"
        }`}
      >
        <Truck className="w-5 h-5" />
      </div>

      <span
        className={`w-16 md:w-24 h-1 rounded-full mx-2 transition-all duration-300 ${
          isActive >= 2 ? "bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" : "bg-white/10"
        }`}
      />
      
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
          isActive >= 3
            ? "bg-primary text-black shadow-[0_0_15px_rgba(var(--primary),0.5)] scale-110"
            : "bg-white/10 text-white/40 border border-white/10"
        }`}
      >
        <CreditCard className="w-5 h-5" />
      </div>
    </div>
  );
}
