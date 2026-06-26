"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { useAuthContext } from "@/context/AuthContext";
import { AddToCartPayload, cartApi } from "@/services/cart";

export interface CartItem {
  id: number;
  cartId?: number;
  productId?: number;
  variantId: number;
  quantity: number;
  price: number;
  currency?: string;
  name?: string;
  availableStock?: number;
  attributes?: {
    name: string;
    value: string;
  }[];
  brandName?: string;
  primaryImage?: string;
  productName?: string;
  productSlug?: string;
  sku?: string;
  totalPrice: number;
}

export interface CartResponse {
  success: boolean;
  message: string | null;
  data: {
    id?: number;
    createdAt?: string;
    updatedAt?: string;
    userId: string;
    subtotal: number;
    currency?: string;
    totalItems: number;
    items: CartItem[];
  };
}

const normalizeCartResponse = (response: CartResponse): CartResponse => {
  const items = response.data?.items ?? [];
  const normalizedItems = items.map((item) => {
    const price = Number(item.price ?? 0);
    const quantity = Number(item.quantity ?? 0);

    return {
      ...item,
      id: item.id ?? item.variantId,
      productName: item.productName ?? item.name ?? `Variant #${item.variantId}`,
      totalPrice: item.totalPrice ?? price * quantity,
      availableStock: item.availableStock ?? Number.MAX_SAFE_INTEGER,
      attributes: item.attributes ?? [],
    };
  });

  return {
    ...response,
    data: {
      ...response.data,
      userId: String(response.data?.userId ?? ""),
      items: normalizedItems,
      totalItems:
        response.data?.totalItems ??
        normalizedItems.reduce((sum, item) => sum + Number(item.quantity ?? 0), 0),
      subtotal:
        response.data?.subtotal ??
        normalizedItems.reduce((sum, item) => sum + Number(item.totalPrice ?? 0), 0),
    },
  };
};

interface CartContextType {
  cart: CartResponse | null;
  items: CartItem[];
  loading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addToCart: (payload: AddToCartPayload) => Promise<void>;
  removeFromCart: (variantId: number) => Promise<void>;
  cleanCart: () => Promise<boolean>;
  updateQuantity: (variantId: number, quantity: number) => Promise<boolean>;
  getTotalPrice: () => number;
  SubTotalPrice: number;
  getTotalItems: () => number;
  getItemCount: (variantId: number) => number;
  getGroupItems: () => CartItem[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const isUnauthorized = (err: unknown) =>
  (err as Error & { status?: number })?.status === 401;

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuthContext();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchedTokenRef = useRef<string | null>(null);

  const getToken = useCallback(() => {
    if (typeof window === "undefined") return null;
    return user?.token ?? localStorage.getItem("token");
  }, [user?.token]);

  const handleUnauthorized = useCallback(() => {
    setCart(null);
    setError(null);
    fetchedTokenRef.current = null;
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth-expired"));
    }
  }, []);

  const fetchCart = useCallback(async () => {
    if (authLoading || !user) {
      setCart(null);
      return;
    }

    const token = getToken();
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const data = normalizeCartResponse(await cartApi.getCart(token));
      setCart(data);
    } catch (err: unknown) {
      if (isUnauthorized(err)) {
        handleUnauthorized();
        return;
      }
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [authLoading, user, getToken, handleUnauthorized]);

  const addToCart = async (payload: AddToCartPayload) => {
    const token = getToken();
    if (!token || !user) {
      alert("Please sign in to add products to cart.");
      return;
    }

    try {
      const data = normalizeCartResponse(await cartApi.addToCart(token, payload));
      setCart(data);
    } catch (err: unknown) {
      if (isUnauthorized(err)) {
        handleUnauthorized();
        throw new Error("Please sign in again.");
      }
      throw err;
    }
  };

  const removeFromCart = async (variantId: number) => {
    const token = getToken();
    if (!token || !user) return;

    try {
      const data = normalizeCartResponse(await cartApi.removeFromCart(token, variantId));
      setCart(data);
    } catch (err: unknown) {
      if (isUnauthorized(err)) {
        handleUnauthorized();
        return;
      }
      throw err;
    }
  };

  const cleanCart = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token || !user) throw new Error("Token not found");

      const res = await cartApi.cleanCart(token);
      if (!res.success) throw new Error("Failed to clear cart");

      setCart(null);
      return true;
    } catch (err: unknown) {
      if (isUnauthorized(err)) handleUnauthorized();
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (variantId: number, quantity: number) => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token || !user) throw new Error("Token not found");

      const data = normalizeCartResponse(
        await cartApi.updateQuantity(variantId, quantity, token)
      );
      setCart(data);

      return true;
    } catch (err: unknown) {
      if (isUnauthorized(err)) handleUnauthorized();
      return false;
    } finally {
      setLoading(false);
    }
  };

  const items = cart?.data?.items ?? [];

  const getItemCount = (variantId: number) => {
    const item = cart?.data?.items?.find((i) => i.variantId === variantId);
    return item ? item.quantity : 0;
  };

  const SubTotalPrice = cart?.data?.subtotal ?? 0;

  const getTotalPrice = () => cart?.data?.subtotal ?? 0;

  const getTotalItems = () => cart?.data?.totalItems ?? 0;

  const getGroupItems = () => {
    const map = new Map<number, CartItem>();

    items.forEach((item) => {
      if (!map.has(item.variantId)) {
        map.set(item.variantId, { ...item });
      } else {
        const existing = map.get(item.variantId)!;
        existing.quantity += item.quantity;
      }
    });

    return Array.from(map.values());
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setCart(null);
      fetchedTokenRef.current = null;
      return;
    }

    const token = getToken();
    if (!token || fetchedTokenRef.current === token) return;

    fetchedTokenRef.current = token;
    fetchCart();
  }, [authLoading, user, getToken, fetchCart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        loading,
        error,
        fetchCart,
        addToCart,
        removeFromCart,
        cleanCart,
        updateQuantity,
        getTotalPrice,
        SubTotalPrice,
        getTotalItems,
        getItemCount,
        getGroupItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
