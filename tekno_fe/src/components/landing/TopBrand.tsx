"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Brand } from "@/type/brand";
import { getBrandList } from "@/services/brand";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function TopBrand() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await getBrandList();
        setBrands(res.data ?? []);
      } catch (error) {
        console.log("error in fetching brand", error);
      }
    };
    fetchBrands();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between pb-2 border-b border-gray-800">
        <h2 className="text-2xl font-bold text-white tracking-wide">Top Brands</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => scroll("left")} className="p-2 rounded-full bg-gray-800/80 hover:bg-primary hover:text-black transition-all duration-300 text-gray-300">
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => scroll("right")} className="p-2 rounded-full bg-gray-800/80 hover:bg-primary hover:text-black transition-all duration-300 text-gray-300">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* scrollable brand list */}
      <div ref={scrollRef} className="flex items-center gap-5 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory py-4">
        {brands.map((brand) => (
          <div
            key={brand.id}
            className="snap-start shrink-0 flex items-center justify-center rounded-2xl bg-white/95 border border-transparent hover:border-primary hover:shadow-[0_0_20px_rgba(255,213,0,0.2)] hover:-translate-y-1 transition-all duration-300 px-6 py-4 cursor-pointer group"
            style={{ minWidth: 140 }}
          >
            <div className="relative w-28 h-12 md:w-36 md:h-16 group-hover:scale-105 transition-transform duration-300">
              <Image
                alt={brand.name ?? "brand image"}
                src={brand.logoPath}
                fill
                sizes="(max-width: 640px) 112px, 144px"
                className="object-contain drop-shadow-sm"
                priority={false}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
