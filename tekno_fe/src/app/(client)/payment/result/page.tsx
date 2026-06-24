"use client";
import FormattedPrice from "@/components/share/FormattedPriced";
import { getOrderByOrderId } from "@/services/order";
import { triggerSimulatorCallback } from "@/services/payment";
import { Order, OrderItem } from "@/type/order";
import { CheckCircle, X, AlertCircle, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState, useRef } from "react";

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("OrderId");
  const transactionId = searchParams.get("transactionId");
  const gatewayType = searchParams.get("gatewayType");

  const [items, setItems] = useState<OrderItem[]>([]);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [orderTotal, setOrderTotal] = useState<number>(0);
  const [status, setStatus] = useState<string>("");
  const [orderDetails, setOrderDetails] = useState<Order>();
  const [callbackTriggered, setCallbackTriggered] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const pollOrderStatus = async (token: string) => {
    try {
      const res = await getOrderByOrderId(token, Number(orderId));
      if (res) {
        setOrderDetails(res);
        setStatus(res?.payment?.status || "");
      }
      return res;
    } catch (e) {
      console.error("Poll order error:", e);
      return null;
    }
  };

  const isOrderPaid = (order: Order | undefined) => {
    if (!order) return false;
    const status = order.payment?.status?.toLowerCase();
    return status === "completed" || status === "paid" || status === "success";
  };

  useEffect(() => {
    if (!orderId) return;

    let mounted = true;
    const token = localStorage.getItem("token") || "";

    const triggerCallback = async () => {
      if (!transactionId || !gatewayType || callbackTriggered) {
        // No transaction data, just poll
        const order = await pollOrderStatus(token);
        if (mounted) setLoadingOrder(false);
        return;
      }

      try {
        console.log(`Triggering simulator callback for transaction ${transactionId}, gateway ${gatewayType}`);
        await triggerSimulatorCallback(Number(transactionId), gatewayType, true);
        setCallbackTriggered(true);
        console.log("Simulator callback triggered successfully");
      } catch (e: any) {
        console.error("Simulator callback error:", e);
        if (mounted) {
          setPaymentError(e?.message || "Failed to process payment");
          setLoadingOrder(false);
        }
        return;
      }
    };

    const startPolling = () => {
      pollIntervalRef.current = setInterval(async () => {
        const order = await pollOrderStatus(token);
        if (mounted && order) {
          if (isOrderPaid(order)) {
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            setLoadingOrder(false);
          }
        }
      }, 2000);
    };

    (async () => {
      await triggerCallback();
      if (mounted) {
        // Initial poll
        await pollOrderStatus(token);
        setLoadingOrder(false);
        // Start polling
        startPolling();
      }
    })();

    return () => {
      mounted = false;
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [orderId, transactionId, gatewayType]);

  // Show error state
  if (paymentError) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 md:p-8 shadow-2xl">
          <div className="flex flex-col gap-4 items-center">
            <AlertCircle className="h-14 w-14 text-red-500" />
            <h3 className="text-xl font-semibold text-center text-red-700">
              Payment Failed
            </h3>
            <p className="text-sm text-gray-600 text-center">
              {paymentError}
            </p>
            <button
              onClick={() => window.location.href = "/payment"}
              className="mt-2 w-full rounded-lg bg-yellow-400 px-4 py-2 font-medium text-white hover:bg-yellow-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loadingOrder) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 md:p-8 shadow-2xl">
          <div className="flex flex-col gap-4 items-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
            <h3 className="text-lg font-medium text-gray-700">
              Processing payment...
            </h3>
            <p className="text-sm text-gray-500 text-center">
              Please wait while we verify your payment
            </p>
            <p className="text-xs text-gray-400">
              Order ID: {orderId}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isOrderPaid(orderDetails)) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 md:p-8 shadow-2xl">
          <button
            aria-label="Close"
            className="absolute right-3 top-3 rounded-full p-1 hover:bg-gray-100"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-center">
              <CheckCircle className="h-14 w-14 text-green-500" />
            </div>
            <h3 className="text-2xl font-semibold text-center text-green-700">
              Successful Payment
            </h3>

            <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-700">
              <span className="text-gray-500">Payment type</span>
              <span className="text-right">{gatewayType || "N/A"}</span>

              <span className="text-gray-500">Order number</span>
              <span className="text-right">{orderDetails?.orderNumber}</span>

              <span className="text-gray-500">Transaction id</span>
              <span className="text-right">{transactionId || "-"}</span>

              <span className="text-gray-500">Amount Paid</span>
              <span className="text-right font-semibold">
                {orderDetails?.totalAmount != null ? (
                  <FormattedPrice price={orderDetails?.totalAmount} />
                ) : (
                  "-"
                )}
              </span>
            </div>

            <button
              onClick={() => {
                window.location.href = `/account/orders/order-status/${orderDetails?.orderNumber}`;
              }}
              className="mt-3 w-full rounded-lg bg-yellow-400 px-4 py-2 font-medium text-white hover:bg-yellow-500"
            >
              Order Status
            </button>
          </div>
        </div>
      </div>
    );
  } else {
    // Show failure page
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 md:p-8 shadow-2xl">
          <button
            aria-label="Close"
            className="absolute right-3 top-3 rounded-full p-1 hover:bg-gray-100"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>

          <div className="flex flex-col gap-4 items-center">
            <X className="h-14 w-14 text-red-500" />
            <h3 className="text-2xl font-semibold text-center text-red-700">
              Payment Failed
            </h3>
            <p className="text-sm text-gray-600 text-center">
              There was an issue processing your payment. Please try again.
            </p>
            <p className="text-xs text-gray-400">
              Order ID: {orderId}
            </p>
            <button
              onClick={() => window.location.href = "/payment"}
              className="mt-2 w-full rounded-lg bg-yellow-400 px-4 py-2 font-medium text-white hover:bg-yellow-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PaymentResultContent />
    </Suspense>
  );
}
