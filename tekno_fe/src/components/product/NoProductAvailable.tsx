import { cn } from "@/lib/utils";
import React from "react";
import { motion } from "motion/react";
import { Loader2, SearchX } from "lucide-react";

export default function NoProductAvailable({
  selectedCategory,
  className,
}: {
  selectedCategory?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 min-h-80 space-y-5 text-center bg-[#111111] border border-gray-800 rounded-2xl w-full mt-10 shadow-lg",
        className
      )}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(255,213,0,0.05)]"
      >
        <SearchX className="w-10 h-10 text-gray-400" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          No Product Available
        </h2>
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-gray-400 max-w-lg"
      >
        We are sorry, but there are no products matching your{" "}
        {selectedCategory ? (
          <span className="text-base font-semibold text-primary drop-shadow-sm px-1">
            "{selectedCategory}"
          </span>
        ) : (
          "selected"
        )}{" "}
        criteria at the moment.
      </motion.p>
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="flex items-center space-x-3 text-primary bg-primary/10 px-4 py-2 rounded-full border border-primary/20"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="font-medium text-sm tracking-wide">We are restocking shortly</span>
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-sm text-gray-500 mt-4"
      >
        Please check back later or explore our other product categories.
      </motion.p>
    </div>
  );
}
