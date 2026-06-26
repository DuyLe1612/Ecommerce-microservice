"use client";
import { useCallback, useEffect, useState } from "react";
import { favorApi } from "@/services/favor";
import { ProductCard as ProductCardType } from "@/type/product";

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "="
  );
  return atob(padded);
}

function getTokenSubject(token: string | null) {
  if (!token) return null;
  if (token.startsWith("mock-user-")) {
    const parts = token.split("-");
    return parts.length >= 3 ? parts[2] : null;
  }

  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const claims = JSON.parse(decodeBase64Url(payload));
    return typeof claims.sub === "string" && claims.sub.trim()
      ? claims.sub
      : null;
  } catch {
    return null;
  }
}

function getStoredUserId() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const user = JSON.parse(raw);
    return typeof user?.id === "string" && user.id.trim() ? user.id : null;
  } catch {
    return null;
  }
}

export default function useFavor(enabled = true) {
  const [items, setItems] = useState<ProductCardType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const userId = getTokenSubject(token) ?? getStoredUserId();

  const fetchFavor = useCallback(async () => {
    setError(null);
    if (!enabled || !token || !userId) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await favorApi.getFavor(token, userId);

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
  }, [enabled, token, userId]);

  useEffect(() => {
    if (!enabled) return;
    fetchFavor();
  }, [enabled, fetchFavor]);

  const addToFavor = async (productId: number) => {
    if (!token || !userId) return alert("Bạn cần đăng nhập!");
    await favorApi.addToFavor(token, productId, userId);
    await fetchFavor();
  };

  const removeFavor = async (productId: number) => {
    if (!token || !userId) return;
    await favorApi.removeFavor(token, productId, userId);
    await fetchFavor();
  };

  const checkFavor = async (productId: number) => {
    if (!token || !userId) return false;

    const res = await favorApi.checkFavor(token, productId, userId);
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
