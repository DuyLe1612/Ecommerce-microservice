"use client";

import { headerData } from "@/data/HeaderData";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";
import { getCategoriesTree } from "@/services/categories";
import { Category } from "@/type/categories";
import { AlignLeft, ChevronRight, ChevronDown } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function MobileMenu() {
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [isProductsExpanded, setIsProductsExpanded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategoriesTree();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryToggle = (categoryId: number) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const handleProductsToggle = () => {
    setIsProductsExpanded(!isProductsExpanded);
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden p-1">
          <AlignLeft className="h-6 w-6 hover:text-primary hoverEffect" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-[300px] p-0 overflow-y-auto">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="text-left text-lg font-semibold">
            Menu
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col">
          {/* Main Navigation */}
          <div className="px-4 py-4">
            <nav className="space-y-1">
              {headerData?.map((item) => {
                const isRoot = item.match === "/";
                const isActive = isRoot
                  ? pathname === "/"
                  : pathname.startsWith(item.match);

                const isProduct = item.label === "Products";

                if (isProduct) {
                  return (
                    <div key={item.label}>
                      <button
                        onClick={handleProductsToggle}
                        className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                          pathname.startsWith(item.match)
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <span>
                          {item.label === "Products" ? "Products" : item.label}
                        </span>
                        {isProductsExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>

                      {/* Product Categories */}
                      {isProductsExpanded && (
                        <div className="ml-4 mt-2 space-y-1">
                          <Link
                            href={item.href}
                            onClick={handleLinkClick}
                            className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md"
                          >
                            Products
                          </Link>

                          {categories.map((category) => (
                            <div key={category.id}>
                              <button
                                onClick={() =>
                                  handleCategoryToggle(category.id)
                                }
                                className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md"
                              >
                                <div className="flex items-center gap-2">
                                  <Image
                                    src={category.iconPath}
                                    width={20}
                                    height={20}
                                    alt={category.name}
                                    className="w-5 h-5 object-contain"
                                  />
                                  <span>{category.name}</span>
                                </div>
                                {category.subCategories.length > 0 &&
                                  (expandedCategory === category.id ? (
                                    <ChevronDown className="h-3 w-3" />
                                  ) : (
                                    <ChevronRight className="h-3 w-3" />
                                  ))}
                              </button>

                              {/* Sub Categories */}
                              {expandedCategory === category.id &&
                                category.subCategories.length > 0 && (
                                  <div className="ml-4 mt-1 space-y-1">
                                    {category.subCategories.map(
                                      (subCategory) => (
                                        <Link
                                          key={subCategory.id}
                                          href={`/products?category=${subCategory.slug}`}
                                          onClick={handleLinkClick}
                                          className="block px-3 py-2 text-xs text-gray-500 hover:bg-gray-50 rounded-md"
                                        >
                                          {subCategory.name}
                                        </Link>
                                      )
                                    )}
                                  </div>
                                )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={handleLinkClick}
                    className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {item.label === "Home"
                      ? "Home"
                      : item.label === "Blogs"
                      ? "Blog"
                      : item.label === "FAQ"
                      ? "FAQ"
                      : item.label === "Contact us"
                      ? "Contact us"
                      : item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
