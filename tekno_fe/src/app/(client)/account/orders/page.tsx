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
  | "Pending"
  | "Processing"
  | "Completed"
  | "Shipping"
  | "Delivered"
  | "Cancelled"
  | "RefundRequested"
  | "Refunded";

export default function OrderHistoryPage() {
  const [tab, setTab] = useState<TabKey>("all");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // map tab -> status code (adjust to your API)
  const statusMap: Record<TabKey, number | undefined> = {
    all: undefined,
    Pending: 1, // Order created, awaiting payment
    Processing: 2, // Payment received, preparing order
    Completed: 3, // Legacy - use Shipping/Delivered instead
    Shipping: 4, // Order shipped, on the way
    Delivered: 5, // Order delivered to customer
    Cancelled: 6, // Order cancelled
    RefundRequested: 7, // Customer requested refund
    Refunded: 8,
  };

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") ?? "" : "";
    setLoading(true);
    console.log("Fetching orders with status:", statusMap[tab]);

    fetchOrderHistory(statusMap[tab], page, pageSize, token)
      .then((res) => setOrders(res.data))
      .catch((err) => console.error("Order history error:", err))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, page]);

  const counts = useMemo(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") ?? "" : "";
    // Optionally prefetch counts per status; for simplicity show current array length
    return {
      all: tab === "all" ? orders.length : 0,
      processing: tab === "Processing" ? orders.length : 0,
      delivered: tab === "Delivered" ? orders.length : 0,
      canceled: tab === "Cancelled" ? orders.length : 0,
      returned: tab === "Refunded" ? orders.length : 0,
    };
  }, [orders, tab]);

  return (
    <div className="flex flex-col gap-4">
      <TitleAccount
        title="Order History"
        des="Track, return or purchase items"
      />

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as TabKey)}
        className="w-full"
      >
        <TabsList className="flex items-start gap-2">
          <TabsTrigger value="all">
            All orders{" "}
            {/* <Badge variant="outline" className="ml-2">
              {counts.all}
            </Badge> */}
          </TabsTrigger>
          <TabsTrigger value="Processing">
            Processing{" "}
            {/* <Badge variant="outline" className="ml-2">
              {counts.processing}
            </Badge> */}
          </TabsTrigger>
          <TabsTrigger value="Delivered">
            Delivered{" "}
            {/* <Badge variant="outline" className="ml-2">
              {counts.delivered}
            </Badge> */}
          </TabsTrigger>
          <TabsTrigger value="Canceled">
            Canceled{" "}
            {/* <Badge variant="outline" className="ml-2">
              {counts.canceled}
            </Badge> */}
          </TabsTrigger>
          <TabsTrigger value="Returned">
            Returned{" "}
            {/* <Badge variant="outline" className="ml-2">
              {counts.returned}
            </Badge> */}
          </TabsTrigger>
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
                  key={order.orderNumber}
                  className="border rounded-xl overflow-hidden"
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
                        {order.delivery?.status ? order.delivery?.status : "-"}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-gray-500">Status</div>
                        <div className="font-medium">
                          {order.statusName ?? order.payment ?? "—"}
                        </div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>

                  {/* items thumbnails row */}
                  <div className="flex gap-2 p-3 bg-pink-50 flex-wrap">
                    {(order.items ?? []).slice(0, 6).map((it) => (
                      <div
                        key={it.id}
                        className="w-14 h-14 bg-white rounded-md overflow-hidden border"
                      >
                        <Image
                          src={
                            it.product.primaryImageUrl ??
                            "/images/sample/product.jpg"
                          }
                          alt={it.product.name ?? "item"}
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
