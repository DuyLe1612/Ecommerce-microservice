"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getOrderByOrderNumber } from "@/services/order";
import { Order, OrderItem } from "@/type/order";
import FormattedPrice from "@/components/share/FormattedPriced";

export default function OrderStatusPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  /* ---------- MOUNT ---------- */
  useEffect(() => {
    setMounted(true);
  }, []);

  /* ---------- FETCH ORDER ---------- */
  useEffect(() => {
    if (!mounted) return;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token") || "";
        if (!token) throw new Error("Missing token");
        if (!orderNumber) throw new Error("Missing order number");

        const res = await getOrderByOrderNumber(token, orderNumber);

        // API thường trả về { data: Order }
        const data: Order = (res as any)?.data ?? res;

        setOrder(data);
      } catch (e: any) {
        setError(e?.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [mounted, orderNumber]);

  /* ---------- STATUS STEPS ---------- */
  const statusSteps = useMemo(() => {
    const status = (order?.statusName || "").toLowerCase();

    const steps = [
      { key: "placed", label: "Order Placed" },
      { key: "processing", label: "Processing" },
      { key: "on_the_way", label: "On the way" },
      { key: "delivered", label: "Delivered" },
    ];

    const indexMap: Record<string, number> = {
      placed: 0,
      pending: 0,
      processing: 1,
      shipped: 2,
      on_the_way: 2,
      completed: 3,
      delivered: 3,
      cancelled: 3,
    };

    const currentIdx = indexMap[status] ?? 0;
    const percent = Math.round(((currentIdx + 1) / steps.length) * 100);

    return { steps, currentIdx, percent };
  }, [order]);

  /* ---------- PRICE FORMAT ---------- */
  const currency = order?.payment?.currency || "USD";

  const priceFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
      }),
    [currency]
  );

  const formatPrice = (value: number) => priceFormatter.format(value || 0);

  /* ---------- STATES ---------- */
  if (!mounted) return null;
  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!order) return <div className="p-6">No data</div>;

  const items: OrderItem[] = order.items || [];
  const shippingAddress = order.delivery?.shippingAddress;

  const fullAddress = shippingAddress
    ? `${shippingAddress.addressLine}, ${shippingAddress.wardName}, ${shippingAddress.districtName}, ${shippingAddress.provinceName}`
    : "-";

  /* ---------- RENDER ---------- */
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold">Order Status</h1>
      <p className="text-sm text-gray-500">Track your order</p>

      {/* ---------- STATUS ---------- */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="text-center mb-6">
          <div className="text-lg font-semibold">
            {statusSteps.percent}% Completed
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 mb-6">
          {statusSteps.steps.map((step, idx) => {
            const active = idx <= statusSteps.currentIdx;
            return (
              <div key={step.key} className="flex-1 flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border ${
                    active
                      ? "bg-yellow-100 border-yellow-400"
                      : "bg-gray-100 border-gray-300"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full ${
                      active ? "bg-yellow-400" : "bg-gray-300"
                    }`}
                  />
                </div>
                <div
                  className={`mt-2 text-xs ${
                    active ? "text-yellow-600" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* ---------- INFO ---------- */}
        <div className="space-y-3">
          <InfoRow
            label="order code"
            value={`#${order.orderNumber || order.id}`}
          />

          <InfoRow label="Sent to" value={fullAddress} />

          <InfoRow label="Payment type" value={order.payment?.gatewayType || "-"} />

          <InfoRow
            label="Transaction id"
            value={order.payment?.transactionId || "-"}
          />

          <InfoRow
            label="Amount Paid"
            value={<FormattedPrice price={order.totalAmount} />}
          />
        </div>
      </div>

      {/* ---------- ITEMS ---------- */}
      <div className="space-y-4">
        {items.map((it) => {
          const title = it.product?.name ?? "Product";

          const image = it.product?.primaryImageUrl || "/placeholder.png";

          const variantText =
            it.variant?.attributes?.join(", ") || it.variant?.sku || "";

          return (
            <div
              key={it.id}
              className="flex items-center gap-4 border rounded-xl p-3"
            >
              <div className="relative w-20 h-20 shrink-0">
                <Image
                  src={image}
                  alt={title}
                  fill
                  className="object-cover rounded-md"
                />
              </div>

              <div className="flex-1">
                <div className="text-sm font-medium">{title}</div>

                {variantText && (
                  <div className="text-xs text-gray-500">{variantText}</div>
                )}

                <div className="text-xs text-gray-500">x{it.quantity}</div>
              </div>

              <div className="text-right">
                <div className="text-sm font-semibold">
                  <FormattedPrice price={it.subtotal ?? (it.unitPrice ?? 0) * it.quantity} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between text-xs text-gray-500">
        <Link href="/account/orders">Back to Orders</Link>
        <span>We will notify you for any changes in your order.</span>
      </div>
    </div>
  );
}

/* ---------- INFO ROW ---------- */
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center">
      <div className="w-40 capitalize text-xs text-gray-500">{label}</div>
      <div className="flex-1 text-sm bg-gray-50 rounded-md px-3 py-2">
        {value}
      </div>
    </div>
  );
}
