"use client";
import { useEffect, useState } from "react";
import { getCategoriesList } from "@/services/categories";
import { Category } from "@/type/categories";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

export function CategoryTabs({ queryCategory }: { queryCategory: string }) {
  const [categories, setCategories] = useState<Category[]>([]);
  //const searchParams = useSearchParams();
  //const queryCategory = searchParams.get("category") || "";

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategoriesList();
        setCategories(data);
      } catch (error) {
        console.error("❌ Lỗi khi lấy categories:", error);
      }
    }
    loadCategories();
  }, []);

  return (
    <div className="flex flex-wrap justify-center gap-6 md:gap-10 max-w-5xl mx-auto py-6 mb-8 border-b border-gray-800/50">
      {categories.map((category) => (
        <Link
          href={`/products?category=${category.slug}`}
          key={category.id}
          className="flex flex-col items-center justify-start gap-3 w-[90px] relative group"
        >
          {category.iconPath && (
            <div className="w-14 h-14 bg-[#111111] border border-gray-800 rounded-2xl flex items-center justify-center group-hover:bg-[#1a1a1a] group-hover:border-primary/50 transition-all shadow-sm group-hover:-translate-y-1">
              <Image
                src={category.iconPath}
                alt={category.slug}
                width={28}
                height={28}
                className="w-7 h-7 drop-shadow-sm invert opacity-70 group-hover:opacity-100 transition-opacity"
              />
            </div>
          )}

          <div className="text-xs text-center font-medium leading-snug text-gray-400 group-hover:text-primary transition-colors line-clamp-2">
            {category.name}
          </div>
          <span
            className={`absolute -bottom-3 left-0 w-0 h-0.5 bg-primary group-hover:w-full hoverEffect ${
              category.slug == queryCategory && "w-full"
            }`}
          />
        </Link>
      ))}
    </div>
  );
}
