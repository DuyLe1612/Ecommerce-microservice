"use client";

import React, { useEffect, useMemo, useState } from "react";
import TitleAccount from "@/components/account/TitleAccount";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { fetchOrderHistory } from "@/services/order";
import { Order } from "@/type/order";
import { ChevronDown, PackageSearch } from "lucide-react";
import Link from "next/link";
import FormattedPrice from "@/components/share/FormattedPriced";

type TabKey = "all" | "PENDING_PAYMENT" | "PROCESSING" | "SHIPPING" | "DELIVERED" | "CANCELLED";

const STATUS_LABELS: Record<TabKey, string> = {
  all: "All",
  PENDING_PAYMENT: "Pending payment",
  PROCESSING: "Processing",
  SHIPPING: "Shipping",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const tabs: TabKey[] = ["all", "PENDING_PAYMENT", "PROCESSING", "SHIPPING", "DELIVERED", "CANCELLED"];

function statusLabel(status?: string, fallback?: string) {
  const key = status as TabKey;
  return STATUS_LABELS[key] ?? fallback ?? status ?? "Unknown";
}

function orderDate(value?: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
}

export default function OrderHistoryPage() {
  const [tab, setTab] = useState<TabKey>("all");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") ?? "" : "";
    setLoading(true);

    fetchOrderHistory(page, pageSize, token)
      .then((res) => setOrders(res.content ?? []))
      .catch((err) => console.error("Order history error:", err))
      .finally(() => setLoading(false));
  }, [page]);

  const filteredOrders = useMemo(
    () => (tab === "all" ? orders : orders.filter((order) => order.status === tab)),
    [orders, tab]
  );

  return (
    <div className="flex flex-col gap-5">
      <TitleAccount title="Order History" des="Track orders, shipping progress, and payment status." />

      <Tabs
        value={tab}
        onValueChange={(value) => {
          setTab(value as TabKey);
          setPage(0);
        }}
        className="w-full"
      >
        <TabsList className="flex h-auto items-start gap-2 flex-wrap bg-white/5 border border-white/10 p-1.5 rounded-lg">
          {tabs.map((key) => (
            <TabsTrigger
              key={key}
              value={key}
              className="text-white/60 data-[state=active]:bg-primary data-[state=active]:text-black rounded-md"
            >
              {STATUS_LABELS[key]}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={tab}>
          {loading ? (
            <div className="p-8 text-center text-sm text-white/50 border border-white/10 rounded-lg bg-white/5">
              Loading orders...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-10 text-center text-sm text-white/50 border border-white/10 rounded-lg bg-white/5">
              <PackageSearch className="w-8 h-8 mx-auto mb-3 text-white/30" />
              No orders found.
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              {filteredOrders.map((order) => (
                <Link
                  href={`/account/orders/order-status/${encodeURIComponent(order.orderNumber)}`}
                  key={order.orderNumber ?? order.id}
                  className="border border-white/10 rounded-lg overflow-hidden block bg-white/[0.03] hover:border-primary/50 transition-colors"
                >
                  <div className="grid grid-cols-1 md:grid-cols-5 items-start gap-4 bg-white/5 px-4 py-3 text-sm">
                    <div>
                      <div className="text-white/45">Order code</div>
                      <div className="font-medium text-white">#{order.orderNumber ?? order.id}</div>
                    </div>
                    <div>
                      <div className="text-white/45">Placed on</div>
                      <div className="font-medium text-white">{orderDate(order.createdAt)}</div>
                    </div>
                    <div>
                      <div className="text-white/45">Total</div>
                      <div className="font-medium text-primary">
                        <FormattedPrice price={Number(order.totalAmount ?? 0)} />
                      </div>
                    </div>
                    <div>
                      <div className="text-white/45">Shipping to</div>
                      <div className="font-medium text-white line-clamp-1">
                        {order.shippingAddress?.city ?? order.shippingAddress?.streetAddress ?? "-"}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white/45">Status</div>
                        <div className="font-medium text-white">{statusLabel(order.status, order.statusName)}</div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-white/40" />
                    </div>
                  </div>

                  <div className="flex gap-2 p-3 bg-black/20 flex-wrap">
                    {(order.items ?? []).slice(0, 6).map((item, index) => {
                      const imageSrc = item.productImageUrl ?? item.product?.primaryImageUrl ?? null;
                      return (
                        <div
                          key={item.id ?? item.productId ?? index}
                          className="w-14 h-14 bg-white/5 rounded-md overflow-hidden border border-white/10"
                        >
                          {imageSrc ? (
                            <Image
                              src={imageSrc}
                              alt={item.productName ?? "Order item"}
                              width={56}
                              height={56}
                              className="w-14 h-14 object-cover"
                            />
                          ) : (
                            <div className="w-14 h-14 flex items-center justify-center text-[10px] text-white/30">
                              No image
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {order.items && order.items.length > 6 && (
                      <div className="w-14 h-14 bg-white/5 rounded-md border border-white/10 flex items-center justify-center text-sm text-white/60">
                        +{order.items.length - 6}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
