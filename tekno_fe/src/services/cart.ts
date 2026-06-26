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

const readCartError = async (res: Response, fallback: string) => {
  const text = await res.text().catch(() => "");
  const error = new Error(text || fallback);
  (error as Error & { status?: number }).status = res.status;
  return error;
};

export const cartApi = {
  getCart: async (token: string): Promise<CartResponse> => {
    const res = await fetch(`${BASE_URL}/cart`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw await readCartError(res, "Failed to fetch cart");
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
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw await readCartError(res, "Failed to add to cart");
    return res.json();
  },

  removeFromCart: async (token: string, variantId: number): Promise<CartResponse> => {
    const res = await fetch(`${BASE_URL}/cart/items/${variantId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw await readCartError(res, "Failed to remove from cart");
    return res.json();
  },

  cleanCart: async (token: string): Promise<CartResponse> => {
    const res = await fetch(`${BASE_URL}/cart`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw await readCartError(res, "Failed to delete cart");
    return res.json();
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
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ quantity }),
    });

    if (!res.ok) throw await readCartError(res, "Failed to update quantity");
    return res.json();
  },
};
