import { ArrowBigRight, ArrowRightCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import ProductCard from "../product/ProductCard";
import {
  getProductRecommendation,
  getProductsOnSale,
} from "@/services/products";
import { ProductCard as ProductCardType } from "@/type/product";
import { fromListItem } from "@/lib/productAdapter";
import { count } from "console";
import ViewAllButton from "../share/ViewAllButton";
import { useAuth } from "@/hook/useAuth";

export default function ProductsOnSale() {
  const [products, setProducts] = useState<ProductCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getProductRecommendation(Number(user?.id) || 2, 10);
        if (mounted) setProducts(res ? res.map(fromListItem) : []);
      } catch (e) {
        console.error("error in fetching new products", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);
  return (
    <div className="relative rounded-3xl overflow-hidden p-8 bg-gradient-to-r from-[#111111] via-[#1a1a1a] to-[#111111] border border-gray-800 shadow-2xl mt-8">
      {/* Glow overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none"></div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-[#0a0a0a]/50 backdrop-blur-md border border-primary/20 rounded-full px-8 py-3 mb-4 shadow-[0_0_15px_rgba(255,213,0,0.1)]">
            <span className="text-2xl drop-shadow-md">✨</span>
            <h2 className="text-xl font-extrabold text-primary tracking-widest uppercase drop-shadow-sm">
              RECOMMENDATION FOR YOU
            </h2>
          </div>
        </div>

        {/* Products Horizontal Scroll */}
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 scroll-smooth">
            {products?.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px]"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {/* Scroll indicators */}
          {products.length > 0 && (
            <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-800/80 hover:bg-primary hover:text-black rounded-full p-2 shadow-lg transition-all duration-300 z-20 text-gray-300">
              <ArrowRightCircle className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Bottom Action */}
        <div className="text-center mt-6">
          <ViewAllButton />
        </div>
      </div>
    </div>
  );
}
