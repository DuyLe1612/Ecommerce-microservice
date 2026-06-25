import { API_BASE_URL } from "@/lib/apiConfig";
import { CreateOrderRequest, CreateOrderResponse, Order, OrderHistoryResponse } from "@/type/order";
import { ApiResponse } from "@/type/share";

// The BE returns Spring Page<> which is a flat object (not wrapped in ApiResponse)
// Note: BE /history does NOT support status filtering — it returns all user orders
export async function fetchOrderHistory(
  page = 0,
  pageSize = 10,
  accessToken?: string
): Promise<OrderHistoryResponse> {
  const params = new URLSearchParams();
  params.append("page", String(page));
  params.append("pageSize", String(pageSize));

  const res = await fetch(`${API_BASE_URL}/orders/history?${params}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch order history");
  return (await res.json()) as OrderHistoryResponse;
}

// GET /api/orders/by-id/{orderId}
// BE returns ApiResponse<OrderResponse> — unwrap to Order
export async function getOrderByOrderId(token: string, orderId: number): Promise<Order> {
  const res = await fetch(`${API_BASE_URL}/orders/by-id/${orderId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || "Failed to fetch order by id");
  return (json?.data ?? json) as Order;
}

// GET /api/orders/{orderNumber}
export async function getOrderByOrderNumber(token: string, orderNumber: string): Promise<Order> {
  const res = await fetch(`${API_BASE_URL}/orders/${orderNumber}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || "Failed to fetch order");
  return (json?.data ?? json) as Order;
}

// POST /api/orders/create
export async function createOrder(
  payload: CreateOrderRequest,
  token: string
): Promise<ApiResponse<CreateOrderResponse>> {
  const res = await fetch(`${API_BASE_URL}/orders/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || "Create order failed");

  const order = json?.data ?? json;
  return {
    success: true,
    message: json?.message ?? "",
    data: {
      ...order,
      orderId: order.orderId ?? order.id,
      totalAmount: order.totalAmount ?? 0,
      itemsCount: order.itemsCount ?? order.items?.length ?? 0,
      note: order.note ?? order.notes ?? "",
    },
    errors: null,
    timestamp: json?.timestamp ?? new Date().toISOString(),
  };
}
