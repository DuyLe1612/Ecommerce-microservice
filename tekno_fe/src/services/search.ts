import { API_BASE_URL } from "@/lib/apiConfig";
import { ProductSearchResult, PageResponse } from "@/type/product";

export interface SearchParams {
  q?: string;
  categoryId?: number;
  brandId?: number;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  page?: number;  // 0-indexed
  size?: number;
  sortBy?: string;
  sortDir?: string;
}

export async function searchProducts(params: SearchParams): Promise<PageResponse<ProductSearchResult>> {
  const query = new URLSearchParams();
  if (params.q) query.append("q", params.q);
  if (params.categoryId != null) query.append("categoryId", String(params.categoryId));
  if (params.brandId != null) query.append("brandId", String(params.brandId));
  if (params.minPrice != null) query.append("minPrice", String(params.minPrice));
  if (params.maxPrice != null) query.append("maxPrice", String(params.maxPrice));
  if (params.status) query.append("status", params.status);
  if (params.sortBy) query.append("sortBy", params.sortBy);
  if (params.sortDir) query.append("sortDir", params.sortDir);
  query.append("page", String(params.page ?? 0));
  query.append("size", String(params.size ?? 20));

  const url = `${API_BASE_URL}/search/products?${query.toString()}`;
  const res = await fetch(url, { method: "GET", cache: "no-store" });
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  const result = await res.json();
  // search-service returns ApiResponse<SearchResponse<ProductDocument>>
  // SearchResponse has: content, totalElements, totalPages, size, number
  return result.data as PageResponse<ProductSearchResult>;
}

export async function suggestProducts(q: string, size = 5): Promise<string[]> {
  const url = `${API_BASE_URL}/search/suggest?q=${encodeURIComponent(q)}&size=${size}`;
  const res = await fetch(url, { method: "GET", cache: "no-store" });
  if (!res.ok) return [];
  const result = await res.json();
  return result.data as string[];
}

export async function getSearchFacets(): Promise<any> {
  const url = `${API_BASE_URL}/search/facets`;
  const res = await fetch(url, { method: "GET", cache: "no-store" });
  if (!res.ok) return {};
  const result = await res.json();
  return result.data;
}
