import { get, post, put, del, API_BASE } from "@/lib/api";
import { API_BASE_URL } from "@/lib/apiConfig";
import { ProductDetail, ProductListItem, PageResponse } from "@/type/product";

// PUBLIC: List products via product-service new endpoint
export async function getProductsList(params?: {
  page?: number;       // 0-indexed
  size?: number;
  categorySlug?: string;
  sortBy?: string;
  sortDir?: string;
  keyword?: string;
  brandSlug?: string;
  minPrice?: number;
  maxPrice?: number;
}): Promise<PageResponse<ProductListItem>> {
  const query = new URLSearchParams();
  if (params?.keyword) query.append("keyword", params.keyword);
  if (params?.categorySlug) query.append("categorySlug", params.categorySlug);
  if (params?.brandSlug) query.append("brandSlug", params.brandSlug);
  if (params?.sortBy) query.append("sortBy", params.sortBy);
  if (params?.sortDir) query.append("sortDir", params.sortDir ?? "DESC");
  if (params?.minPrice != null) query.append("minPrice", String(params.minPrice));
  if (params?.maxPrice != null) query.append("maxPrice", String(params.maxPrice));
  query.append("page", String(params?.page ?? 0));
  query.append("size", String(params?.size ?? 20));

  const url = `${API_BASE_URL}/products?${query.toString()}`;
  const res = await fetch(url, { method: "GET", cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch product list: ${res.status}`);
  const result = await res.json();
  // product-service returns ApiResponse<Page<ProductListItemResponse>>
  // Spring Page has: content[], totalElements, totalPages, number, size
  return result.data as PageResponse<ProductListItem>;
}

// PUBLIC: Get product detail by slug
export async function getProductDetail(slug: string): Promise<ProductDetail | null> {
  const res = await fetch(`${API_BASE_URL}/products/${slug}`, {
    method: "GET", cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch product detail: ${res.status}`);
  const result = await res.json();
  const data = result.data;
  // Compute primaryImageUrl if not present
  if (!data.primaryImageUrl && Array.isArray(data.images)) {
    const primary = data.images.find((i: any) => i.isPrimary) ?? data.images[0];
    data.primaryImageUrl = primary?.imageUrl ?? null;
  }
  return data as ProductDetail;
}

// ADMIN: List products with pagination
export async function getAdminProducts(params?: { page?: number; size?: number; keyword?: string }) {
  const query = new URLSearchParams();
  if (params?.keyword) query.append("keyword", params.keyword);
  query.append("page", String(params?.page ?? 0));
  query.append("size", String(params?.size ?? 20));
  return get(`${API_BASE}/admin/products?${query.toString()}`, { cache: "no-store" });
}

// ADMIN: Get product by slug (fix URL)
export async function getAdminProduct(slug: string) {
  return get(`${API_BASE}/admin/products/slug/${slug}`, { cache: "no-store" });
}

// ADMIN: Create product — JSON body (not FormData)
export async function createAdminProduct(payload: {
  name: string; slug: string; categoryId: number; brandId: number;
  basePrice: number; discountPercent?: number; overview?: string; description?: string; status?: string;
}) {
  return post(`${API_BASE}/admin/products`, payload);
}

// ADMIN: Update product — JSON body
export async function updateAdminProduct(id: number | string, payload: any) {
  return put(`${API_BASE}/admin/products/${id}`, payload);
}

// ADMIN: Delete product
export async function deleteAdminProduct(id: number | string) {
  return del(`${API_BASE}/admin/products/${id}`);
}

// ADMIN: Upload image (stays as FormData — backend accepts multipart)
export async function uploadProductImage(productId: number, file: File, isPrimary = false) {
  const fd = new FormData();
  fd.append("productId", String(productId));
  fd.append("file", file);
  fd.append("isPrimary", String(isPrimary));
  return post(`${API_BASE}/admin/products/images`, fd);
}

// ADMIN: Create variant — JSON body with attributeValues format
export async function createProductVariant(payload: {
  productId: number; sku: string; price: number; stock: number; status?: string;
  attributeValues?: Array<{ attributeId: number; valueId: number }>;
}) {
  return post(`${API_BASE}/admin/products/variants`, payload);
}

// ADMIN: Update variant
export async function updateProductVariant(variantId: number | string, payload: any) {
  return put(`${API_BASE}/admin/products/variants/${variantId}`, payload);
}

// ADMIN: Delete variant
export async function deleteProductVariant(variantId: number | string) {
  return del(`${API_BASE}/admin/products/variants/${variantId}`);
}

// ADMIN: Adjust stock
export async function adjustStock(variantId: number, delta: number, reason?: string) {
  return post(`${API_BASE}/admin/products/variants/${variantId}/stock`, { delta, reason });
}

// WRAPPERS for specific UI components
export async function getProductRecommendation(userId: number, limit: number = 10) {
  // Recommendation not implemented in backend yet, just return recent products
  const res = await getProductsList({ size: limit, sortBy: "createdAt", sortDir: "DESC" });
  return res.content;
}

export async function getProductsOnSale(limit: number = 10) {
  const res = await getProductsList({ size: limit, sortBy: "discountPercent", sortDir: "DESC" });
  return res.content;
}