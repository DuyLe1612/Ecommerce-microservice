import { API_BASE_URL } from "@/lib/apiConfig";
import {
  PaymentGateway,
  PaymentHistory,
  PaymentPayload,
  PaymentProcessResponse,
  PaymentStatus,
} from "@/type/payment";
import { ApiResponse } from "@/type/share";

export async function getPaymentGateways(token?: string): Promise<PaymentGateway[]> {
  const res = await fetch(`${API_BASE_URL}/payment/gateways`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) throw new Error("Failed to fetch payment gateways");
  const json: ApiResponse<PaymentGateway[]> = await res.json();
  if (!json.success) throw new Error(json.message || "Get payment gateways failed");
  return json.data;
}

export async function getMyPayments(token: string): Promise<PaymentHistory[]> {
  const res = await fetch(`${API_BASE_URL}/payment/my-payments`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch payment history");
  const json: ApiResponse<{ data: PaymentHistory[] }> = await res.json();
  if (!json.success) throw new Error(json.message || "Get my payments failed");
  return json.data.data;
}

export async function getPaymentStatus(transactionId: number, token: string): Promise<PaymentStatus> {
  const res = await fetch(`${API_BASE_URL}/payment/status/${transactionId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to get payment status");
  const json: ApiResponse<PaymentStatus> = await res.json();
  if (!json.success) throw new Error(json.message || "Get payment status failed");
  return json.data;
}

// POST /api/payment/process — initiates payment
// BE ProcessPaymentCommand: orderId, amount, currency, gatewayType (enum name string), returnUrl, description
export async function processPayment(
  token: string,
  payload: PaymentPayload
): Promise<PaymentProcessResponse> {
  // Use self.crypto for Edge compatibility, fallback to runtime polyfill
  const idempotencyKey = (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  console.log("[processPayment] POST to", `${API_BASE_URL}/payment/process`, "with idempotencyKey:", idempotencyKey);
  const res = await fetch(`${API_BASE_URL}/payment/process`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({
      orderId: payload.orderId,
      amount: payload.amount,
      currency: payload.currency,
      gatewayType: payload.gatewayType,
      returnUrl: payload.returnUrl,
      description: payload.description,
    }),
  });
  console.log("[processPayment] Response status:", res.status);

  const json = await res.json().catch(() => ({}));
  console.log("[processPayment] Response body:", JSON.stringify(json));
  if (!res.ok) throw new Error(json?.message || `Payment initiation failed (${res.status})`);
  if (!json.success) throw new Error(json?.message || "Payment initiation failed");

  return json.data as PaymentProcessResponse;
}

// POST /internal/callback/{success|failure} — triggers simulator success/failure (internal trusted endpoint)
export async function triggerSimulatorCallback(
  idempotencyKey: string,
  gatewayType: string,
  success: boolean = true
): Promise<void> {
  const endpoint = success ? "success" : "failure";
  const params = new URLSearchParams({
    idempotencyKey,
    gatewayType,
  });
  if (!success) params.set("reason", "Payment failed by simulator");

  const res = await fetch(`${API_BASE_URL}/internal/callback/${endpoint}?${params}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json?.message || "Simulator callback failed");
  }
}
