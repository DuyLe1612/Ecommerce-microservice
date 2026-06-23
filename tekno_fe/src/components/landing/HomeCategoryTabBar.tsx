"use client";

import { getCategoriesList } from "@/services/categories";
import { Category } from "@/type/categories";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function HomeCategoryTabBar() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getCategoriesList();
        if (mounted) setCategories(res ?? []);
      } catch (e) {
        console.error("fetch categories error:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading)
    return <div className="py-4 text-sm text-gray-500">Loading…</div>;
  if (!categories.length)
    return <div className="py-4 text-sm text-gray-500">Empty</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between pb-2 border-b border-gray-800">
        <h2 className="text-2xl font-bold text-white tracking-wide">Categories</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => scroll("left")} className="p-2 rounded-full bg-gray-800/80 hover:bg-primary hover:text-black transition-all duration-300 text-gray-300">
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => scroll("right")} className="p-2 rounded-full bg-gray-800/80 hover:bg-primary hover:text-black transition-all duration-300 text-gray-300">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      <div ref={scrollRef} className="gap-5 flex overflow-x-auto scrollbar-hide pb-4 scroll-smooth snap-x snap-mandatory">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/products?category=${category.slug}`}
            className="group bg-[#111111] border border-gray-800 hover:border-primary/50 hover:bg-[#151515] hover:shadow-[0_0_20px_rgba(255,213,0,0.1)] transition-all duration-300 hover:-translate-y-1 rounded-3xl flex flex-col items-center gap-4 p-5 min-w-[140px] snap-start"
          >
            {category?.imageUrl && (
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center p-4 group-hover:bg-primary/10 transition-colors">
                <Image
                  src={category.imageUrl}
                  alt={category.name}
                  width={60}
                  height={60}
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-md"
                />
              </div>
            )}
            <div className="text-center font-medium text-gray-300 group-hover:text-primary transition-colors">
              {category.name}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
