import { ProductListItem, ProductCard as ProductCardType } from "@/type/product";
import { fromListItem } from "@/lib/productAdapter";
import { API_BASE } from "@/lib/api";

export const favorApi = {
  getFavor: async (token: string): Promise<ProductCardType[]> => {
    try {
      const res = await fetch(`${API_BASE}/wishlist`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch favorites");
      }
      
      const data = await res.json();
      
      // Handle different response formats
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
    } catch (error) {
      console.error("Error fetching favorites:", error);
      throw error;
    }
  },

  addToFavor: async (token: string, productId: number) => {
    try {
      const res = await fetch(`${API_BASE}/wishlist/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to add to favorites");
      }
      
      return await res.json();
    } catch (error) {
      console.error("Error adding to favorites:", error);
      throw error;
    }
  },

  removeFavor: async (token: string, productId: number) => {
    try {
      const res = await fetch(`${API_BASE}/wishlist/items/${productId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to remove from favorites");
      }
      
      return await res.json();
    } catch (error) {
      console.error("Error removing from favorites:", error);
      throw error;
    }
  },

  checkFavor: async (token: string, productId: number) => {
    try {
      const res = await fetch(`${API_BASE}/wishlist/check/${productId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to check favorites");
      }
      
      const data = await res.json();
      return { data: data.data ?? data.exists ?? data.isFavorite ?? false };
    } catch (error) {
      console.error("Error checking favorites:", error);
      return { data: false };
    }
  },
};
