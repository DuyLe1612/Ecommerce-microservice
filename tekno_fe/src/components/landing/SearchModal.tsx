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
        console.error("Product fetch error", error);
      } finally {
        setLoading(false);
      }
    };
    fecthProductList();
  }, [input]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-[900px] w-[95%] p-6">
        <DialogHeader>
          {/* <DialogTitle className="sr-only">Search</DialogTitle> */}
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
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                <Search className="w-5 h-5" />
              </span>

              <input
                id="site-search"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                autoFocus
                className="w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="What can we help you to find ?"
                aria-label="Search"
              />

              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-600 px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
                aria-label="Start search"
              >
                Search
              </button>
            </form>
          </div>

          <button
            onClick={onClose}
            className="ml-2 flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Body section */}
        {!input ? (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-4">The Most Searched Items</h3>
              <div className="flex flex-wrap gap-3">
                {mostSearched.map((item) => (
                  <Link
                    key={item}
                    href={`/products?q=${encodeURIComponent(item)}`}
                    className="text-sm px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Most used keywords</h3>
              <div className="flex flex-wrap gap-3">
                {mostUsedKeywords.map((item) => (
                  <Link
                    key={item}
                    href={`/products?q=${encodeURIComponent(item)}`}
                    className="text-sm px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="gap-50">
            {products?.slice(0, 4).map((p) => (
              <ProductCardInSearch product={p} />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
