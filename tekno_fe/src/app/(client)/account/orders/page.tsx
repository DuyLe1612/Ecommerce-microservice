"use client";

import React, { useEffect, useMemo, useState } from "react";
import TitleAccount from "@/components/account/TitleAccount";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { fetchOrderHistory } from "@/services/order";
import { Order } from "@/type/order";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import FormattedPrice from "@/components/share/FormattedPriced";

type TabKey =
  | "all"
  | "PENDING_PAYMENT"
  | "PAID"
  | "PROCESSING"
  | "SHIPPING"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUND_REQUESTED"
  | "REFUNDED";

const STATUS_LABELS: Record<TabKey, string> = {
  all: "All",
  PENDING_PAYMENT: "Pending",
  PAID: "Paid",
  PROCESSING: "Processing",
  SHIPPING: "Shipping",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUND_REQUESTED: "Refund Requested",
  REFUNDED: "Refunded",
};

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, page]);

  const tabs: TabKey[] = [
    "all",
    "PENDING_PAYMENT",
    "PROCESSING",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
  ];

  return (
    <div className="flex flex-col gap-4">
      <TitleAccount
        title="Order History"
        des="Track, return or purchase items"
      />

      <Tabs
        value={tab}
        onValueChange={(v) => { setTab(v as TabKey); setPage(0); }}
        className="w-full"
      >
        <TabsList className="flex items-start gap-2 flex-wrap">
          {tabs.map((key) => (
            <TabsTrigger key={key} value={key}>
              {STATUS_LABELS[key]}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={tab}>
          {loading ? (
            <div className="p-6 text-center text-sm text-gray-500">
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="p-10 text-center text-sm text-gray-500">
              No orders found.
            </div>
          ) : (
            <div className="space-y-6 mt-4">
              {orders.map((order) => (
                <Link
                  href={`/account/orders/order-status/${encodeURIComponent(
                    order.orderNumber
                  )}`}
                  key={order.orderNumber ?? order.id}
                  className="border rounded-xl overflow-hidden block"
                >
                  {/* header row */}
                  <div className="grid grid-cols-5 items-start gap-4 bg-gray-50 px-4 py-3 text-sm">
                    <div>
                      <div className="text-gray-500">Order code</div>
                      <div className="font-medium">
                        #{order.orderNumber ?? order.id}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Placed on</div>
                      <div className="font-medium">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString()
                          : "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Total</div>
                      <div className="font-medium">
                        {typeof order.totalAmount === "number" ? (
                          <FormattedPrice price={order.totalAmount} />
                        ) : (
                          "-"
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Delivered</div>
                      <div className="font-medium">
                        {order.delivery?.status ?? "-"}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-gray-500">Status</div>
                        <div className="font-medium">
                          {order.statusName ?? order.status ?? "—"}
                        </div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>

                  {/* items thumbnails row */}
                  <div className="flex gap-2 p-3 bg-pink-50 flex-wrap">
                    {(order.items ?? []).slice(0, 6).map((it, idx) => (
                      <div
                        key={it.id ?? idx}
                        className="w-14 h-14 bg-white rounded-md overflow-hidden border"
                      >
                        <Image
                          src={
                            it.productImageUrl ??
                            "/images/sample/product.jpg"
                          }
                          alt={it.productName ?? "item"}
                          width={56}
                          height={56}
                          className="w-14 h-14 object-cover"
                        />
                      </div>
                    ))}
                    {order.items && order.items.length > 6 && (
                      <div className="w-14 h-14 bg-white rounded-md border flex items-center justify-center text-sm text-gray-600">
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
