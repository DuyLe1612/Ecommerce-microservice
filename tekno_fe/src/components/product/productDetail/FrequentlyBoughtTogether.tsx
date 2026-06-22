import React from "react";
import ProductsListWithCarousel from "./ProductsListWithCarousel";
import { addYAxis } from "recharts/types/state/cartesianAxisSlice";
import { getProductsList } from "@/services/products";
import { fromListItem } from "@/lib/productAdapter";

export default async function FrequentlyBoughtTogether() {
  const data = await getProductsList({ categorySlug: "tablet" });
  const products = data.content ? data.content.map(fromListItem) : [];
  console.log(products);
  return (
    <div className="flex flex-col gap-4">
      {/* title */}
      <div className="font-bold text-xl">Frequently Bought Together</div>
      <ProductsListWithCarousel products={products} />
    </div>
  );
}
