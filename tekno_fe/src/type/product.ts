// For product-service public detail endpoint
export interface ProductDetail {
  id: number;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  discountPercent: number | null;
  status: string;
  images: ProductImage[];
  variants: ProductVariant[];
  category: { id: number; name: string; slug: string };
  brand: { id: number; name: string; slug: string; logoUrl?: string };
  overview: string;
  specs: any;
  averageRating: number;
  totalReviews: number;
  totalSold: number;
  primaryImageUrl?: string;
}

export interface ProductImage {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
  sortOrder: number;
}

// For product-service public list endpoint
export interface ProductListItem {
  id: number;
  name: string;
  slug: string;
  basePrice: number;
  discountPercent: number | null;
  primaryImageUrl: string;
  brandName: string;
  categoryName: string;
  averageRating: number;
  status: string;
}

// For search-service
export interface ProductSearchResult {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  categoryName: string;
  brandId: string;
  brandName: string;
  basePrice: number;
  minVariantPrice: number;
  discountPercent: number | null;
  primaryImageUrl: string;
  averageRating: number;
  totalReviews: number;
  status: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// Unified card type (adapter output)
export interface ProductCard {
  id: number;
  name: string;
  slug: string;
  basePrice: number;
  finalPrice: number;
  discountPercent: number | null;
  primaryImagePath: string;
  averageRating: number;
}

export type ProductVariant = {
  id: number;
  sku: string;
  price: number;
  stock: number;
  attributes: VariantAttribute[];
};

export type VariantAttribute = {
  id: number;
  name: string;
  value: string[];
};

// Keep backward compat alias
export type Product = ProductListItem;
