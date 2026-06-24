'use client';

import { useState, useEffect } from 'react';
import { cartApi } from '@/services/cart';

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

export function useCart() {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  };

  // FETCH CART
  const fetchCart = async () => {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const data = normalizeCartResponse(await cartApi.getCart(token));
      setCart(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ADD TO CART
  const addToCart = async (variantId: number, quantity: number) => {
    const token = getToken();
    if (!token) return alert("Bạn cần đăng nhập!");

    const data = normalizeCartResponse(await cartApi.addToCart(token, { variantId, quantity }));
    setCart(data);
  };

  // REMOVE ITEM
  const removeFromCart = async (variantId: number) => {
    const token = getToken();
    if (!token) return;

    const data = normalizeCartResponse(await cartApi.removeFromCart(token, variantId));
    setCart(data);
  };

  // CLEAN ENTIRE CART
  const cleanCart = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) throw new Error("Không tìm thấy token");

      const res = await cartApi.cleanCart(token);
      if (!res.success) throw new Error("Xoá giỏ hàng thất bại");

      setCart(null);
      return true;

    } catch (err) {
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // UPDATE QUANTITY
  const updateQuantity = async (variantId: number, quantity: number) => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) throw new Error("Token not found");

      const data = normalizeCartResponse(await cartApi.updateQuantity(variantId, quantity, token));
      setCart(data);

      // refetch lại cart để đồng bộ FE
      return true;

    } catch (err) {
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // 🔥 HELPER FUNCTIONS
  // =========================

  // Items array
  const items = cart?.data?.items ?? [];

  // Lấy số lượng của 1 item theo variantId
const getItemCount = (variantId: number) => {
  const item = cart?.data?.items?.find(i => i.variantId === variantId);
  return item ? item.quantity : 0;
};


  // Tổng tiền (subtotal từ BE)
  const SubTotalPrice = cart?.data?.subtotal ?? 0;

  // Tổng tiền có thể bao gồm thuế/ship nếu có
  const getTotalPrice = () => cart?.data?.subtotal ?? 0;

  // Tổng số item
  const getTotalItems = () => cart?.data?.totalItems ?? 0;

  // Gom nhóm theo variantId (nếu muốn xử lý UI)
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
    fetchCart();
  }, []);

  return {
    cart,
    items,
    loading,
    error,

    // APIs
    fetchCart,
    addToCart,
    removeFromCart,
    cleanCart,
    updateQuantity,

    // Helpers
    getTotalPrice,
    SubTotalPrice,
    getTotalItems,
    getItemCount,
    getGroupItems,
  };
}
