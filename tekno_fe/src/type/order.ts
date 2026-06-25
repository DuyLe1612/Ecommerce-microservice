import { PaymentStatus } from "./payment";
import { Product, ProductVariant } from "./product";

export type OrderHistoryResponse = {
  content: Order[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  pageable: object;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
};

export type OrderItem = {
  id: number;
  productId: number;
  variantId?: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  productImageUrl?: string | null;
  productSlug?: string | null;
  sku?: string | null;
  // For display convenience — populated by FE from product service if needed
  product?: Product;
  variant?: ProductVariant;
};

export type Order = {
  id: number;
  orderNumber: string;
  userId: string;
  status: string;
  statusName: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  payment?: PaymentStatus;
  delivery?: Delivery;
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
};

export type CreateOrderRequest = {
  userId: string;
  items: {
    productId: number;
    variantId?: number;
    productName: string;
    productImageUrl?: string | null;
    productSlug?: string | null;
    sku?: string | null;
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
  couponCode?: string;
  couponId?: number;
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
