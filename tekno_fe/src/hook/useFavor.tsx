"use client";
import { useCallback, useEffect, useState } from "react";
import { favorApi } from "@/services/favor";
import { ProductCard as ProductCardType } from "@/type/product";

export default function useFavor(enabled = true) {
  const [items, setItems] = useState<ProductCardType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchFavor = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      if (!token) throw new Error("No auth token");
      const res = await favorApi.getFavor(token);

      if (Array.isArray(res)) setItems(res);
      else if (res && Array.isArray((res as any).data))
        setItems((res as any).data);
      else setItems([]);
    } catch (err: any) {
      setError(err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!enabled) return;
    fetchFavor();
  }, [enabled, fetchFavor]);

  const addToFavor = async (productId: number) => {
    if (!token) return alert("Bạn cần đăng nhập!");
    await favorApi.addToFavor(token, productId);
    await fetchFavor();
  };

  const removeFavor = async (productId: number) => {
    if (!token) return;
    await favorApi.removeFavor(token, productId);
    await fetchFavor();
  };

  const checkFavor = async (productId: number) => {
    if (!token) return false; // ✔️ không return undefined

    const res = await favorApi.checkFavor(token, productId);
    return res.data ?? false;
  };

  return {
    items,
    setItems,
    loading,
    error,
    refetch: fetchFavor,
    addToFavor,
    removeFavor,
    checkFavor,
  };
}
