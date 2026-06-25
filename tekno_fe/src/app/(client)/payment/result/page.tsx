"use client";

import { useSearchParams } from "next/navigation";
import { getOrderByOrderId } from "@/services/order";
import { Order } from "@/type/order";
import { CheckCircle, X, AlertCircle, Loader2 } from "lucide-react";
import React, { Suspense, useEffect, useState, useRef } from "react";

function PaymentResultContent() {
  const searchParams = useSearchParams();

  // sessionStorage is primary; fall back to URL params
  const getOrderId = () =>
    (typeof window !== "undefined" ? sessionStorage.getItem("payment_orderId") : null) ??
    searchParams.get("orderId");

  const transactionId =
    (typeof window !== "undefined" ? sessionStorage.getItem("payment_transactionId") : null) ??
    searchParams.get("transactionId");

  const idempotencyKey =
    (typeof window !== "undefined" ? sessionStorage.getItem("payment_idempotencyKey") : null) ??
    searchParams.get("idempotencyKey");

  const gatewayType =
    (typeof window !== "undefined" ? sessionStorage.getItem("payment_gatewayType") : null) ??
    searchParams.get("gatewayType");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up sessionStorage on unmount (keep idempotencyKey for reference)
  useEffect(() => {
    return () => {
      sessionStorage.removeItem("payment_orderId");
      sessionStorage.removeItem("payment_transactionId");
      sessionStorage.removeItem("payment_gatewayType");
      // payment_idempotencyKey intentionally kept for debugging
    };
  }, []);

  const pollOrder = async (token: string): Promise<Order | null> => {
    const currentOrderId = getOrderId();
    if (!currentOrderId) return null;
    try {
      const data = await getOrderByOrderId(token, Number(currentOrderId));
      setOrder(data);
      return data;
    } catch (e) {
      console.error("Poll order error:", e);
      return null;
    }
  };

  const isPaid = (o: Order | null) => {
    if (!o) return false;
    const s = (o.status ?? "").toUpperCase();
    return s === "PAID" || s === "PROCESSING";
  };

  const isFailed = (o: Order | null) => {
    if (!o) return false;
    const s = (o.status ?? "").toUpperCase();
    return s === "FAILED" || s === "CANCELLED" || s === "REFUNDED";
  };

  const isPending = (o: Order | null) => {
    if (!o) return false;
    const s = (o.status ?? "").toUpperCase();
    return s === "PENDING_PAYMENT";
  };

  useEffect(() => {
    const currentOrderId = getOrderId();
    if (!currentOrderId) {
      setLoading(false);
      return;
    }

    let mounted = true;
    const token = localStorage.getItem("token") || "";

    const run = async () => {
      // 1. Fetch initial order status
      await pollOrder(token);

      // 2. Poll every 2 seconds until non-pending
      if (mounted) {
        pollRef.current = setInterval(async () => {
          const o = await pollOrder(token);
          if (mounted && o) {
            if (isPaid(o) || isFailed(o)) {
              clearInterval(pollRef.current!);
              pollRef.current = null;
              setLoading(false);
            }
          }
        }, 2000);
      }
    };

    run();

    return () => {
      mounted = false;
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    if (order) {
      window.location.href = `/account/orders/order-status/${encodeURIComponent(order.orderNumber)}`;
    } else {
      window.location.href = "/account/orders";
    }
  };

  const handleRetry = () => {
    const currentOrderId = getOrderId();
    if (currentOrderId) {
      window.location.href = `/checkout?orderId=${currentOrderId}`;
    } else {
      window.location.href = "/cart";
    }
  };

  // Error state
  if (paymentError) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 md:p-8 shadow-2xl">
          <div className="flex flex-col gap-4 items-center">
            <AlertCircle className="h-14 w-14 text-red-500" />
            <h3 className="text-xl font-semibold text-center text-red-700">Payment Failed</h3>
            <p className="text-sm text-gray-600 text-center">{paymentError}</p>
            <button
              onClick={handleRetry}
              className="mt-2 w-full rounded-lg bg-yellow-400 px-4 py-2 font-medium text-white hover:bg-yellow-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading / Pending
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 md:p-8 shadow-2xl">
          <div className="flex flex-col gap-4 items-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
            <h3 className="text-lg font-medium text-gray-700">
              {isPending(order) ? "Awaiting payment…" : "Verifying payment…"}
            </h3>
            <p className="text-sm text-gray-500 text-center">
              Please wait while we {isPending(order) ? "process your payment" : "verify your payment"}
            </p>
            {getOrderId() && (
              <p className="text-xs text-gray-400">Order ID: {getOrderId()}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Success
  if (isPaid(order)) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 md:p-8 shadow-2xl">
          <button
            aria-label="Close"
            onClick={handleClose}
            className="absolute right-3 top-3 rounded-full p-1 hover:bg-gray-100"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-center">
              <CheckCircle className="h-14 w-14 text-green-500" />
            </div>
            <h3 className="text-2xl font-semibold text-center text-green-700">
              Payment Successful
            </h3>
            <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-700">
              <span className="text-gray-500">Payment method</span>
              <span className="text-right">{gatewayType ?? "N/A"}</span>
              <span className="text-gray-500">Order number</span>
              <span className="text-right">{order?.orderNumber ?? "-"}</span>
              <span className="text-gray-500">Transaction ID</span>
              <span className="text-right">{transactionId ?? "-"}</span>
              <span className="text-gray-500">Amount Paid</span>
              <span className="text-right font-semibold">
                {order?.totalAmount != null
                  ? new Number(order.totalAmount).toLocaleString("vi-VN") + "đ"
                  : "-"}
              </span>
            </div>
            <button
              onClick={handleClose}
              className="mt-3 w-full rounded-lg bg-yellow-400 px-4 py-2 font-medium text-white hover:bg-yellow-500"
            >
              View Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Failed
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 md:p-8 shadow-2xl">
        <button
          aria-label="Close"
          onClick={handleClose}
          className="absolute right-3 top-3 rounded-full p-1 hover:bg-gray-100"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
        <div className="flex flex-col gap-4 items-center">
          <X className="h-14 w-14 text-red-500" />
          <h3 className="text-2xl font-semibold text-center text-red-700">Payment Failed</h3>
          <p className="text-sm text-gray-600 text-center">
            There was an issue processing your payment. Please try again.
          </p>
          {getOrderId() && (
            <p className="text-xs text-gray-400">Order ID: {getOrderId()}</p>
          )}
          <button
            onClick={handleRetry}
            className="mt-2 w-full rounded-lg bg-yellow-400 px-4 py-2 font-medium text-white hover:bg-yellow-500"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 md:p-8 shadow-2xl">
            <div className="flex flex-col gap-4 items-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
              <h3 className="text-lg font-medium text-gray-700">Loading…</h3>
            </div>
          </div>
        </div>
      }
    >
      <PaymentResultContent />
    </Suspense>
  );
}
