import { API_BASE_URL } from "@/lib/apiConfig";
import { CreateOrderRequest, CreateOrderResponse, Order, OrderHistoryResponse } from "@/type/order";
import { ApiResponse } from "@/type/share";

export async function fetchOrderHistory(
    status?: number,
  page = 1,
  pageSize = 20,
  accessToken?: string
): Promise<OrderHistoryResponse> {
  const searchParams = new URLSearchParams();

      if (status !== undefined) {
    searchParams.append("status", status.toString());
  }
  if (page) {
    searchParams.append("page", page.toString());
  }

  if (pageSize) {
    searchParams.append("pageSize", pageSize.toString());
  }

  const res = await fetch(
    `${API_BASE_URL}/orders/history?${searchParams.toString()}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch order history");
  }

  const json: ApiResponse<OrderHistoryResponse> = await res.json();

  return json.data;
}

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

  // API có thể trả về { data: Order } hoặc trực tiếp Order
  return (json?.data ?? json) as Order;
}

/**
 * GET /api/orders/by-id/{orderId}
 * Trả về chi tiết đơn hàng
 */
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
  if (!res.ok) throw new Error(json?.message || "Failed to fetch order by id");

  // API có thể trả về { data: Order } hoặc trực tiếp Order
  return (json?.data ?? json) as Order;
}

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
  if (!res.ok) {
    throw new Error(json?.message || "Create order failed");
  }

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
