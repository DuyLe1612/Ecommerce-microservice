"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getOrderByOrderNumber } from "@/services/order";
import { Order, OrderItem } from "@/type/order";
import FormattedPrice from "@/components/share/FormattedPriced";
import { ArrowLeft, Check, Clock, Package, Truck } from "lucide-react";

const TRACKING_STEPS = [
  { key: "PENDING_PAYMENT", label: "Order placed", icon: Clock },
  { key: "PROCESSING", label: "Processing", icon: Package },
  { key: "SHIPPING", label: "On the way", icon: Truck },
  { key: "DELIVERED", label: "Delivered", icon: Check },
];

const STATUS_INDEX: Record<string, number> = {
  PENDING_PAYMENT: 0,
  PAID: 1,
  PROCESSING: 1,
  SHIPPING: 2,
  DELIVERED: 3,
  CANCELLED: 0,
};

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "Pending payment",
  PAID: "Paid",
  PROCESSING: "Processing",
  SHIPPING: "Shipping",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

function fullAddress(order: Order) {
  const address = order.shippingAddress;
  if (!address) return "-";
  return [
    address.streetAddress,
    address.ward,
    address.district,
    address.city,
    address.postalCode,
  ].filter(Boolean).join(", ");
}

export default function OrderStatusPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token") || "";
        if (!token) throw new Error("Missing token");
        if (!orderNumber) throw new Error("Missing order number");

        setOrder(await getOrderByOrderNumber(token, orderNumber));
      } catch (e: any) {
        setError(e?.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [mounted, orderNumber]);

  const tracking = useMemo(() => {
    const status = order?.status ?? "PENDING_PAYMENT";
    const currentIdx = STATUS_INDEX[status] ?? 0;
    const percent = status === "CANCELLED"
      ? 0
      : Math.round((currentIdx / (TRACKING_STEPS.length - 1)) * 100);
    return { currentIdx, percent };
  }, [order]);

  if (!mounted) return null;
  if (loading) return <div className="p-6 text-white/60">Loading order...</div>;
  if (error) return <div className="p-6 text-red-400">{error}</div>;
  if (!order) return <div className="p-6 text-white/60">No order data found.</div>;

  const items: OrderItem[] = order.items || [];
  const isCancelled = order.status === "CANCELLED";

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6 text-white">
      <div>
        <Link href="/account/orders" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-primary">
          <ArrowLeft className="w-4 h-4" />
          Back to orders
        </Link>
        <h1 className="text-2xl font-bold mt-4">Order Tracking</h1>
        <p className="text-sm text-white/50">Order #{order.orderNumber || order.id}</p>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-8">
          <div>
            <div className="text-sm text-white/45">Current status</div>
            <div className={isCancelled ? "text-lg font-semibold text-red-400" : "text-lg font-semibold text-primary"}>
              {STATUS_LABELS[order.status] ?? order.statusName ?? order.status}
            </div>
          </div>
          <div className="text-sm text-white/50">
            {isCancelled ? "This order has been cancelled." : `${tracking.percent}% completed`}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {TRACKING_STEPS.map((step, index) => {
            const Icon = step.icon;
            const active = !isCancelled && index <= tracking.currentIdx;
            return (
              <div key={step.key} className="flex flex-col items-center text-center gap-2">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center border ${
                  active ? "bg-primary text-black border-primary" : "bg-white/5 text-white/35 border-white/10"
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className={active ? "text-xs text-white" : "text-xs text-white/40"}>{step.label}</div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-4">
          <InfoBlock label="Ship to" value={fullAddress(order)} />
          <InfoBlock label="Recipient" value={order.shippingAddress?.recipientName ?? "-"} />
          <InfoBlock label="Phone" value={order.shippingAddress?.phone ?? "-"} />
          <InfoBlock label="Total" value={<FormattedPrice price={Number(order.totalAmount ?? 0)} />} />
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Order items</h2>
        {items.map((item) => {
          const title = item.productName ?? item.product?.name ?? "Product";
          const image = item.productImageUrl ?? item.product?.primaryImageUrl ?? null;
          const variantText = item.sku ?? item.variant?.sku ?? "";

          return (
            <div
              key={item.id ?? item.productId}
              className="flex items-center gap-4 border border-white/10 rounded-lg p-3 bg-white/[0.03]"
            >
              <div className="relative w-20 h-20 shrink-0 rounded-md overflow-hidden bg-white/5 border border-white/10">
                {image ? (
                  <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[11px] text-white/35">
                    No image
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium line-clamp-2">{title}</div>
                {variantText ? <div className="text-xs text-white/45 mt-1">{variantText}</div> : null}
                <div className="text-xs text-white/45 mt-1">Quantity: {item.quantity}</div>
              </div>

              <div className="text-right text-sm font-semibold text-primary">
                <FormattedPrice price={Number(item.subtotal ?? (item.unitPrice ?? 0) * item.quantity)} />
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-white/45">
        We will notify you when the order status changes.
      </p>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md bg-black/20 border border-white/10 px-3 py-2">
      <div className="text-xs text-white/45">{label}</div>
      <div className="text-sm text-white mt-1">{value}</div>
    </div>
  );
}
