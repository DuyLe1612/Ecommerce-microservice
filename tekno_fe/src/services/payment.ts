// src/services/payment/getPaymentGateways.ts

import { API_BASE_URL } from "@/lib/apiConfig";
import {
  MyPaymentsResponse,
  PaymentGateway,
  PaymentHistory,
  PaymentPayload,
  PaymentStatus,
} from "@/type/payment";
import { ApiResponse } from "@/type/share";

export async function getPaymentGateways(
  token?: string
): Promise<PaymentGateway[]> {
  const res = await fetch(`${API_BASE_URL}/payment/gateways`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch payment gateways");
  }

  const json: ApiResponse<PaymentGateway[]> = await res.json();

  if (!json.success) {
    throw new Error(json.message || "Get payment gateways failed");
  }

  return json.data;
}

export async function getMyPayments(
  token: string
): Promise<MyPaymentsResponse> {
  const res = await fetch(`${API_BASE_URL}/payment/my-payments`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch payment history");
  }

  const json: ApiResponse<MyPaymentsResponse> = await res.json();

  if (!json.success) {
    throw new Error(json.message || "Get my payments failed");
  }

  return json.data;
}

export async function getPaymentStatus(
  transactionId: string,
  token: string
): Promise<PaymentStatus> {
  const res = await fetch(
    `${API_BASE_URL}/payment/status/${transactionId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to get payment status");
  }

  const json: ApiResponse<PaymentStatus> = await res.json();

  // ✅ check success
  if (!json.success) {
    throw new Error(json.message || "Get payment status failed");
  }

  return json.data;
}

export async function processPayment(
  token: string,
  payload: PaymentPayload
): Promise<{
  paymentUrl: string;
  transactionId: number;
  gatewayType: string;
}> {
  const res = await fetch(`${API_BASE_URL}/payment/process`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json?.message || "Payment failed");
  }

  return json.data;
}

export async function triggerSimulatorCallback(
  transactionId: number,
  gatewayType: string,
  success: boolean = true
): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/simulator/trigger-callback`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      transactionId,
      gatewayType,
      success,
    }),
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json?.message || "Simulator callback failed");
  }
}
