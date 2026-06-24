import { PaymentStatus } from "./payment";
import { Product, ProductVariant } from "./product";

export type OrderHistoryResponse = {
  data: Order[];
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
};
export type Delivery = {
  status: string;
  trackingNumber: string | null;
  carrier: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  estimatedDeliveryDate: string | null;
  shippingAddress: {
    recipientName: string;
    phoneNumber: string;
    addressLine: string;
    provinceCode: number;
    provinceName: string;
    districtCode: number;
    districtName: string;
    wardCode: number;
    wardName: string;
  }
}
export type Order = {
  id: number;
  orderNumber: string;
  status: number;
  statusName: string;
  totalAmount: number;
  createdAt: string;
  completedAt: string | null;
  payment: PaymentStatus | null;
  items: OrderItem[];
  delivery: Delivery | null; // need fix
};
export type OrderItem = {
  id: number;
  quantity: number;
  price: number;
  totalPrice: number;
  product: Product;
  variant: ProductVariant;
};

export type CreateOrderRequest = {
  userId: number;
  items: {
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  currency: string;
  shippingAddress: {
    recipientName: string;
    phone: string;
    streetAddress: string;
    city: string;
    district?: string;
    ward?: string;
    postalCode?: string;
  };
  notes?: string;
};

export type CreateOrderResponse = {
    id?: number;
    orderId: number;
    orderNumber: string;
    totalAmount: number;
    itemsCount: number;
    status: string;
    note: string;
};
