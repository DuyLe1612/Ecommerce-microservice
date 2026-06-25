import { CartResponse } from "@/hook/useCart";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export type AddToCartPayload = {
  variantId: number;
  quantity: number;
  productId?: number;
  productName?: string;
  productSlug?: string;
  primaryImage?: string;
  brandName?: string;
  sku?: string;
  availableStock?: number;
  attributes?: {
    name: string;
    value: string;
  }[];
};

export const cartApi = {
  getCart: async (token: string): Promise<CartResponse> => {
    const res = await fetch(`${BASE_URL}/cart`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Failed to fetch cart");
    return res.json();
  },

  addToCart: async (
    token: string,
    payload: AddToCartPayload
  ): Promise<CartResponse> => {
    const res = await fetch(`${BASE_URL}/cart/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Failed to add to cart");
    return res.json();
  },

  removeFromCart: async (token: string, variantId: number): Promise<CartResponse> => {
    const res = await fetch(`${BASE_URL}/cart/items/${variantId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Failed to remove from cart");
    return res.json();
  },

cleanCart: async (token: string): Promise<CartResponse> => {
  const res = await fetch(`${BASE_URL}/cart`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const errorText = await res.text(); // log chi tiết lỗi backend
    throw new Error(`Failed to delete cart: ${errorText}`);
  }

  // Một số API DELETE không trả JSON → check trước khi parse

    return await res.json();
  
  },
updateQuantity: async (
    variantId: number,
    quantity: number,
    token: string
  ): Promise<CartResponse> => {
    const res = await fetch(`${BASE_URL}/cart/items/${variantId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ quantity }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error("Failed to update quantity: " + error);
    }

    return res.json();
  },

};
