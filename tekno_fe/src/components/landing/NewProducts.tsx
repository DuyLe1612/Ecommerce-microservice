"use client";
import { getProductsList } from "@/services/products";
import { ProductCard as ProductCardType } from "@/type/product";
import { fromListItem } from "@/lib/productAdapter";
import { ChevronRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import ProductCard from "../product/ProductCard";
import ViewAllButton from "../share/ViewAllButton";

export default function NewProducts() {
  const [products, setProducts] = useState<ProductCardType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getProductsList({ sortBy: "createdAt", sortDir: "DESC" });
        if (mounted) setProducts(res.content ? res.content.map(fromListItem) : []);
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
    <div className="flex flex-col gap-5">
      <div className="border-b border-gray-500 flex items-center justify-between pb-2">
        <div className="font-semibold text-2xl">New Products</div>
        <ViewAllButton />
      </div>
      <div className="grid grid-col-3 md:grid-cols-5 gap-4">
        {products?.slice(0, 5).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
