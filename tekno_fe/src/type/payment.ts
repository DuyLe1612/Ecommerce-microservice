export type PaymentGateway = {
  type: string;
  displayName: string;
  description: string;
  isMock: boolean;
};

export type PaymentStatus = {
  transactionId: number;
  orderId: number;
  userId: string;
  amount: number;
  currency: string;
  gatewayType: string;
  status: string;
  gatewayTransactionId: string;
  redirectUrl: string | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
  expiredAt: string | null;
};

export type PaymentProcessResponse = {
  transactionId: number;
  idempotencyKey: string;
  status: string;
  redirectUrl: string;
  gatewayType: string;
  expiredAt: string;
};

// Matches BE ProcessPaymentCommand fields
export type PaymentPayload = {
  orderId: number;
  amount: number;
  currency: string;
  gatewayType: string;
  returnUrl: string;
  description?: string;
};

export type PaymentHistory = {
  paymentId: number;
  orderId: number;
  orderNumber: string;
  transactionId: string;
  gateway: number;
  gatewayName: string;
  method: number;
  methodName: string;
  status: number;
  statusName: string;
  amount: number;
  currency: string;
  createdAt: string;
  completedAt: string | null;
  errorMessage: string | null;
};

export type MyPaymentsResponse = {
  data: PaymentHistory[];
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
};
