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
    <div className="bg-white shadow-xl rounded-xl w-[900px] p-6 z-[999]">
      <div className="grid grid-cols-3 gap-6">
        {/* LEFT: Category list */}
        <div className="col-span-1 border-r pr-4 max-h-72 overflow-y-auto">
          {(categories || []).map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              onMouseEnter={() => setActiveCategory(cat)}
              className={`
                flex items-center gap-4 px-3 py-2 rounded cursor-pointer
                ${
                  activeCategory?.id === cat.id
                    ? "bg-gray-100 text-primary font-medium"
                    : "hover:bg-gray-50"
                }
              `}
            >
              {cat.iconPath ? (
                <Image
                  src={cat.iconPath}
                  width={40}
                  height={40}
                  alt={cat.name}
                  className="w-10 h-10 object-contain"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xs text-gray-500 font-bold">
                  {cat.name ? cat.name.charAt(0).toUpperCase() : ""}
                </div>
              )}
              <span className="text-sm">{cat.name}</span>
            </Link>
          ))}
        </div>

        {/* RIGHT: Sub category / preview */}
        <div className="col-span-2 pl-2">
          {!activeCategory || !activeCategory.subCategories || activeCategory.subCategories.length === 0 ? (
            <p className="text-gray-500 text-sm">Danh mục trống</p>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {(activeCategory.subCategories || []).map((subCat) => (
                <Link
                  key={subCat.id}
                  href={`/products?category=${subCat.slug}`}
                  className="
                    bg-blue-50 rounded-lg p-4 text-center
                    hover:shadow-md transition
                  "
                >
                  <div className="w-full h-20 flex items-center justify-center mb-2">
                    {(subCat.imageUrl || subCat.iconPath) ? (
                      <Image
                        src={subCat.imageUrl || subCat.iconPath}
                        width={60}
                        height={60}
                        alt={subCat.name}
                        className="object-contain"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-500 font-bold">
                        {subCat.name ? subCat.name.charAt(0).toUpperCase() : ""}
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-medium">{subCat.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
