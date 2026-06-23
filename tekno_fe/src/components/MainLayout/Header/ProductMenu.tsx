"use client";

import { useEffect, useState } from "react";
import { getCategoriesTree } from "@/services/categories";
import { Category } from "@/type/categories";
import Image from "next/image";
import Link from "next/link";

export default function ProductMenu() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCategoriesTree();
        if (Array.isArray(data)) {
          setCategories(data);
          setActiveCategory(data[0] ?? null);
        }
      } catch (err) {
        console.error("Failed to fetch category tree in ProductMenu", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-[#0a0a0a] border border-gray-800 shadow-[0_10px_40px_rgba(0,0,0,0.8)] rounded-2xl w-[900px] p-6 z-[999] relative overflow-hidden">
      {/* Subtle glow effect in the background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] pointer-events-none rounded-full"></div>

      <div className="grid grid-cols-3 gap-6 relative z-10">
        {/* LEFT: Category list */}
        <div className="col-span-1 border-r border-gray-800 pr-4 max-h-[340px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
          {(categories || []).map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              onMouseEnter={() => setActiveCategory(cat)}
              className={`
                flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 mb-1
                ${activeCategory?.id === cat.id
                  ? "bg-primary/10 text-primary font-bold shadow-[0_0_15px_rgba(255,213,0,0.05)] border border-primary/20"
                  : "text-gray-400 hover:bg-[#1a1a1a] hover:text-white border border-transparent"
                }
              `}
            >
              {cat.iconPath ? (
                <div className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${activeCategory?.id === cat.id ? 'bg-primary/20' : 'bg-[#1a1a1a]'}`}>
                  <Image
                    src={cat.iconPath}
                    width={40}
                    height={40}
                    alt={cat.name}
                    className="w-6 h-6 object-contain filter invert opacity-90"
                  />
                </div>
              ) : (
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-extrabold transition-colors ${activeCategory?.id === cat.id ? 'bg-primary/20 text-primary' : 'bg-[#1a1a1a] text-gray-500'}`}>
                  {cat.name ? cat.name.charAt(0).toUpperCase() : ""}
                </div>
              )}
              <span className="text-sm tracking-wide">{cat.name}</span>
            </Link>
          ))}
        </div>

        {/* RIGHT: Sub category / preview */}
        <div className="col-span-2 pl-2">
          {!activeCategory || !activeCategory.subCategories || activeCategory.subCategories.length === 0 ? (
            <div className="flex h-full items-center justify-center text-gray-500 text-sm italic">
              No product categories
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {(activeCategory.subCategories || []).map((subCat) => (
                <Link
                  key={subCat.id}
                  href={`/products?category=${subCat.slug}`}
                  className="
                    bg-[#111111] border border-gray-800 rounded-2xl p-4 text-center group
                    hover:border-primary/50 hover:bg-[#1a1a1a] hover:-translate-y-1 hover:shadow-[0_5px_20px_rgba(255,213,0,0.1)] transition-all duration-300
                  "
                >
                  <div className="w-full h-20 flex items-center justify-center mb-3">
                    {(subCat.imageUrl || subCat.iconPath) ? (
                      <Image
                        src={subCat.imageUrl || subCat.iconPath}
                        width={60}
                        height={60}
                        alt={subCat.name}
                        className="object-contain filter invert opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 drop-shadow-md"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-[#222222] rounded-full flex items-center justify-center text-xs text-gray-500 font-bold group-hover:text-primary transition-colors">
                        {subCat.name ? subCat.name.charAt(0).toUpperCase() : ""}
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-gray-400 group-hover:text-white transition-colors">{subCat.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
