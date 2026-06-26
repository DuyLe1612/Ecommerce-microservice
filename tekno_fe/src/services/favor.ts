import { ProductCard as ProductCardType } from "@/type/product";
import { fromListItem } from "@/lib/productAdapter";
import { API_BASE } from "@/lib/api";

const isMissingIdentity = (status: number, message?: string) =>
  status === 401 || message === "User identity required";

const authHeaders = (token: string, userId?: string) => ({
  Authorization: `Bearer ${token}`,
  ...(userId ? { "X-User-Id": userId } : {}),
});

export const favorApi = {
  getFavor: async (token: string, userId?: string): Promise<ProductCardType[]> => {
    const res = await fetch(`${API_BASE}/wishlist`, {
      headers: {
        ...authHeaders(token, userId),
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      if (isMissingIdentity(res.status, errorData.message)) return [];
      throw new Error(errorData.message || "Failed to fetch favorites");
    }

    const data = await res.json();

    if (Array.isArray(data)) {
      return data.map(fromListItem);
    }
    if (data.data && Array.isArray(data.data)) {
      return data.data.map(fromListItem);
    }
    if (data.success && Array.isArray(data.data)) {
      return data.data.map(fromListItem);
    }

    return [];
  },

  addToFavor: async (token: string, productId: number, userId?: string) => {
    const res = await fetch(`${API_BASE}/wishlist/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(token, userId),
      },
      body: JSON.stringify({ productId }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to add to favorites");
    }

    return await res.json();
  },

  removeFavor: async (token: string, productId: number, userId?: string) => {
    const res = await fetch(`${API_BASE}/wishlist/items/${productId}`, {
      method: "DELETE",
      headers: authHeaders(token, userId),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to remove from favorites");
    }

    return await res.json();
  },

  checkFavor: async (token: string, productId: number, userId?: string) => {
    try {
      const res = await fetch(`${API_BASE}/wishlist/check/${productId}`, {
        method: "GET",
        headers: authHeaders(token, userId),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (isMissingIdentity(res.status, errorData.message)) {
          return { data: false };
        }
        throw new Error(errorData.message || "Failed to check favorites");
      }

      const data = await res.json();
      return { data: data.data ?? data.exists ?? data.isFavorite ?? false };
    } catch (error) {
      if ((error as Error).message !== "User identity required") {
        console.error("Error checking favorites:", error);
      }
      return { data: false };
    }
  },
};
