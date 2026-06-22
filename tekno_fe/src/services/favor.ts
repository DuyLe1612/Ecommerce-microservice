import { ProductListItem, ProductCard as ProductCardType } from "@/type/product";
import { fromListItem } from "@/lib/productAdapter";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// FAVORITE API
export const favorApi = {
  getFavor: async (token: string): Promise<ProductCardType[]> => {
    const res = await fetch(`${BASE_URL}/wishlist`, { credentials: "include", headers: {
          "Authorization": `Bearer ${token}`,
        },
       });
    if (!res.ok) throw new Error("Failed to fetch favorites");
    const data: ProductListItem[] = await res.json();
    return data.map(fromListItem);
  },

  addToFavor: async (
    token: string,
    productId:  number
  ) => {
    const res = await fetch(`${BASE_URL}/wishlist/items`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify( {productId} ),
    });

    if (!res.ok) throw new Error("Failed to add to favor");
    return res.json();
  },

  removeFavor: async (token: string, productId: number) => {
    const res = await fetch(`${BASE_URL}/wishlist/items/${productId}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({productId} ),
    });

    if (!res.ok) throw new Error("Failed to remove from favor");
    return res.json();
  },

  checkFavor: async (token: string, productId: number) => {
    const res = await fetch(`${BASE_URL}/wishlist/check/${productId}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({productId} ),
    });

    if (!res.ok) throw new Error("Failed to remove from favor");
    return res.json();
  },
};
