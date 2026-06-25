import { get, post, put, del, API_BASE } from "@/lib/api";

// String-based status enum matching backend
export enum OrderStatus {
  PENDING_PAYMENT = "PENDING_PAYMENT",
  PROCESSING = "PROCESSING",
  SHIPPING = "SHIPPING",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  REFUND_REQUESTED = "REFUND_REQUESTED",
  REFUNDED = "REFUNDED",
}

export const OrderStatusLabels: Record<OrderStatus, string> = {
  [OrderStatus.PENDING_PAYMENT]: "Chờ thanh toán",
  [OrderStatus.PROCESSING]: "Đang xử lý",
  [OrderStatus.SHIPPING]: "Đang giao",
  [OrderStatus.DELIVERED]: "Đã giao",
  [OrderStatus.CANCELLED]: "Đã hủy",
  [OrderStatus.REFUND_REQUESTED]: "Yêu cầu hoàn tiền",
  [OrderStatus.REFUNDED]: "Đã hoàn tiền",
};

export const OrderStatusColors: Record<OrderStatus, string> = {
  [OrderStatus.PENDING_PAYMENT]: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  [OrderStatus.PROCESSING]: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  [OrderStatus.SHIPPING]: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  [OrderStatus.DELIVERED]: "bg-green-500/20 text-green-400 border-green-500/30",
  [OrderStatus.CANCELLED]: "bg-red-500/20 text-red-400 border-red-500/30",
  [OrderStatus.REFUND_REQUESTED]: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  [OrderStatus.REFUNDED]: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

export type OrderItem = {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  productImageUrl?: string | null;
};

export type ShippingAddress = {
  recipientName?: string;
  phone?: string;
  streetAddress?: string;
  city?: string;
  district?: string;
  ward?: string;
  postalCode?: string;
};

export type Order = {
  id: number;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  statusName?: string;
  totalAmount: number;
  currency?: string;
  shippingAddress: ShippingAddress;
  createdAt: string;
  updatedAt?: string;
  items: OrderItem[];
  [key: string]: any;
};

export type OrdersListParams = {
  page?: number;
  pageSize?: number;
  status?: OrderStatus | null;
  keyword?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

// Get all orders (admin view) with pagination
export async function getAdminOrders(params?: OrdersListParams) {
  try {
    const query = new URLSearchParams();

    if (params?.page !== undefined) {
      query.append("page", String(params.page));
    }
    if (params?.pageSize) {
      query.append("size", String(params.pageSize));
    }
    
    if (params?.status !== undefined && params?.status !== null) {
      query.append("status", params.status);
    }
    
    if (params?.keyword) {
      query.append("search", params.keyword);
    }
    
    if (params?.startDate) {
      query.append("startDate", params.startDate);
    }
    if (params?.endDate) {
      query.append("endDate", params.endDate);
    }
    
    if (params?.sortBy) {
      query.append("sort", `${params.sortBy},${params.sortOrder || "desc"}`);
    }

    const url = `${API_BASE}/admin/orders${query.toString() ? `?${query.toString()}` : ""}`;
    
    const response = await get(url, { cache: "no-store" });
    return response;
  } catch (error) {
    console.error("Failed to load admin orders:", error);
    throw error;
  }
}

// Get order details by ID (admin view)
export async function getAdminOrder(orderId: number | string) {
  try {
    return await get(`${API_BASE}/admin/orders/${orderId}`, { cache: "no-store" });
  } catch (error) {
    console.error("Failed to load admin order:", error);
    throw error;
  }
}

// Cancel an order
export async function cancelOrder(orderId: number | string, reason?: string) {
  try {
    return await post(`${API_BASE}/admin/orders/${orderId}/cancel`, {
      reason: reason || "Cancelled by admin"
    });
  } catch (error) {
    console.error("Failed to cancel order:", error);
    throw error;
  }
}

// Mark order as delivered
export async function deliverOrder(orderId: number | string) {
  try {
    return await post(`${API_BASE}/admin/orders/${orderId}/deliver`, {
      recipientSignature: ""
    });
  } catch (error) {
    console.error("Failed to deliver order:", error);
    throw error;
  }
}

// Ship an order
export async function shipOrder(
  orderId: number | string, 
  trackingNumber?: string,
  carrier?: string
) {
  try {
    return await post(`${API_BASE}/admin/orders/${orderId}/ship`, {
      trackingNumber: trackingNumber || "",
      carrier: carrier || ""
    });
  } catch (error) {
    console.error("Failed to ship order:", error);
    throw error;
  }
}

// Update order status (generic)
export async function updateOrderStatus(
  orderId: number | string,
  status: OrderStatus,
  notes?: string
) {
  try {
    return await put(`${API_BASE}/admin/orders/${orderId}/status`, {
      status,
      notes
    });
  } catch (error) {
    console.error("Failed to update order status:", error);
    throw error;
  }
}
