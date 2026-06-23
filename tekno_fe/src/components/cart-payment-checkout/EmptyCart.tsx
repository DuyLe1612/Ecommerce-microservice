"use client";

import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function EmptyCart() {
  return (
    <div className="py-16 md:py-24 bg-transparent flex items-center justify-center p-4 w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-[#111111] border border-gray-800 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] p-10 max-w-md w-full space-y-10 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] pointer-events-none rounded-full"></div>

        {/* ICON ANIMATION */}
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 4,
            ease: "easeInOut",
          }}
          className="relative w-32 h-32 mx-auto flex items-center justify-center bg-[#1a1a1a] border border-gray-800 rounded-full shadow-[0_0_30px_rgba(255,213,0,0.05)]"
        >
          <ShoppingCart
            size={48}
            className="text-primary opacity-80"
            strokeWidth={1.5}
          />
        </motion.div>

        {/* TEXT */}
        <div className="text-center space-y-4 relative z-10">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Your cart is empty
          </h2>
          <p className="text-gray-400 leading-relaxed">
            It looks like you haven't added anything to your cart yet. Let's
            change that and find some amazing products for you!
          </p>
        </div>

        {/* BUTTON */}
        <div className="relative z-10">
          <Link
            href="/products"
            className="block bg-primary text-black text-center py-3.5 rounded-xl text-base font-bold tracking-wide hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-[0_5px_15px_rgba(255,213,0,0.2)] active:scale-[0.98] transition-all duration-300"
          >
            Discover Products
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
