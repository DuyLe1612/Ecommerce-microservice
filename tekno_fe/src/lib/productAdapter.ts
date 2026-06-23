import { ProductListItem, ProductSearchResult, ProductCard } from "@/type/product";

function calcFinalPrice(base: number, discount: number | null): number {
  if (!discount || discount <= 0) return base;
  return Math.round(base - (base * discount) / 100);
}

export function fromListItem(p: ProductListItem): ProductCard {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    basePrice: p.basePrice,
    finalPrice: calcFinalPrice(p.basePrice, p.discountPercent),
    discountPercent: p.discountPercent,
    primaryImagePath: p.primaryImageUrl,
    averageRating: p.averageRating ?? 0,
  };
}

export function fromSearchResult(p: ProductSearchResult): ProductCard {
  return {
    id: Number(p.id),
    name: p.name,
    slug: p.slug,
    basePrice: p.basePrice,
    finalPrice: calcFinalPrice(p.basePrice ?? p.minVariantPrice, p.discountPercent),
    discountPercent: p.discountPercent,
    primaryImagePath: p.primaryImageUrl,
    averageRating: p.averageRating ?? 0,
  };
}
