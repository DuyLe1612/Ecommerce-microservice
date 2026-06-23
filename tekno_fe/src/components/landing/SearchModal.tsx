"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { searchProducts } from "@/services/search";
import { fromSearchResult } from "@/lib/productAdapter";
import { ProductCard as ProductCardType } from "@/type/product";
import { Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import ProductCard, { ProductCardInSearch } from "../product/ProductCard";

export default function SearchModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const mostSearched = [
    "MacBook Pro",
    "AirPods Pro",
    "Samsung S9",
    "Tablet",
    "Xiaomi",
    "JBL speaker",
    "Canon",
    "AirPods Max",
    "Asus",
    "MagSafe",
  ];

  const mostUsedKeywords = [
    "Tablets",
    "Laptops",
    "Headphones",
    "USB Drive",
    "Smartphones",
    "Phone Cases",
    "Smartwatch",
  ];

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ProductCardType[]>();

  useEffect(() => {
    const fecthProductList = async () => {
      setLoading(true);
      try {
        const res = await searchProducts({
          q: input,
          size: 8,
        });

        setProducts(res.content.map(fromSearchResult));
        //setTotalRecords(res.totalRecords);
      } catch (error) {
        console.warn("Product fetch error", error);
      } finally {
        setLoading(false);
      }
    };
    fecthProductList();
  }, [input]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-[900px] w-[95%] p-8 bg-[#111111] border border-gray-800 text-white rounded-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="sr-only">Search</DialogTitle>
        </DialogHeader>

        {/* Header search bar */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label htmlFor="site-search" className="sr-only">
              Search
            </label>

            <form
              className="relative"
              onSubmit={(e) => {
                e.preventDefault();
                if (input.trim()) {
                  window.location.href = `/products?q=${encodeURIComponent(input.trim())}`;
                  onClose();
                }
              }}
            >
              <span className="absolute inset-y-0 left-4 flex items-center text-gray-500">
                <Search className="w-5 h-5" />
              </span>

              <input
                id="site-search"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                autoFocus
                className="w-full pl-12 pr-24 py-4 border border-gray-800 rounded-xl bg-[#1a1a1a] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-white placeholder:text-gray-500 shadow-inner transition-all"
                placeholder="What can we help you find?"
                aria-label="Search"
              />

              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-black font-bold px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 hover:shadow-lg hover:-translate-y-[55%] transition-all"
                aria-label="Start search"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {/* Body section */}
        {!input ? (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold mb-4 text-white text-lg tracking-tight">The Most Searched Items</h3>
              <div className="flex flex-wrap gap-2">
                {mostSearched.map((item) => (
                  <Link
                    key={item}
                    href={`/products?q=${encodeURIComponent(item)}`}
                    className="text-sm px-4 py-2 rounded-lg bg-[#1a1a1a] hover:bg-primary/10 hover:text-primary text-gray-400 border border-gray-800 transition-colors font-medium"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-4 text-white text-lg tracking-tight">Most Used Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {mostUsedKeywords.map((item) => (
                  <Link
                    key={item}
                    href={`/products?q=${encodeURIComponent(item)}`}
                    className="text-sm px-4 py-2 rounded-lg bg-[#1a1a1a] hover:bg-primary/10 hover:text-primary text-gray-400 border border-gray-800 transition-colors font-medium"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="gap-50 mt-6">
            {products?.slice(0, 4).map((p) => (
              <ProductCardInSearch key={p.id} product={p} />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
