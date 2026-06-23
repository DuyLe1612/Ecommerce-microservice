import { getProductsList } from "@/services/products";
import React from "react";
import ProductsListWithCarousel from "./ProductsListWithCarousel";
import { fromListItem } from "@/lib/productAdapter";

export default async function SimilarProducts() {
  const data = await getProductsList({ categorySlug: "laptop" });

  const products = data.content.map(fromListItem);
  console.log(products);
  return (
    <div className="flex flex-col gap-4">
      {/* title */}
      <div className="font-bold text-xl">Similar Products</div>
      <ProductsListWithCarousel products={products} />
    </div>
  );
}
