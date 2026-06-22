"use client";
import { getProductsList } from "@/services/products";
import { ProductCard as ProductCardType } from "@/type/product";
import { fromListItem } from "@/lib/productAdapter";
import { ChevronRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import ProductCard from "../product/ProductCard";
import { useRouter } from "next/navigation";
import ViewAllButton from "../share/ViewAllButton";

export default function BestSell() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductCardType[]>([]);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await getProductsList({ sortBy: "totalSold", sortDir: "DESC" });
        setProducts(res.content.slice(0, 5).map(fromListItem) || []);
      } catch (error) {
        console.log("error in fetching new products", error);
      }
    };
    fetchProducts();
  }, []);
  return (
    <div className="flex flex-col gap-5">
      <div className="border-b border-gray-500 flex items-center justify-between pb-2">
        <div className="font-semibold text-2xl">Best Sellers</div>
        <ViewAllButton />
      </div>
      <div className="grid grid-col-2 md:grid-cols-5 gap-4">
        {products &&
          products
            ?.slice(0, 5)
            .map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>
    </div>
  );
}
