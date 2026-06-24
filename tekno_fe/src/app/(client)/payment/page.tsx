"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { processPayment, triggerSimulatorCallback } from "@/services/payment";

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get("orderId");
  const gateway = searchParams.get("gateway");
  const amount = searchParams.get("amount");
  const currency = searchParams.get("currency") || "VND";

  const [isProcessing, setIsProcessing] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          if (!cancelled) { setErrorMsg("Not authenticated. Please login."); setIsProcessing(false); }
          return;
        }
        if (!orderId || !gateway || !amount) {
          if (!cancelled) { setErrorMsg("Missing orderId, gateway, or amount."); setIsProcessing(false); }
          return;
        }

        const result = await processPayment(token, {
          orderId: Number(orderId),
          amount: Number(amount),
          currency,
          gatewayType: gateway,
          returnUrl: `${window.location.origin}/payment/result`,
          description: `Order #${orderId} payment`,
        });

        sessionStorage.setItem("payment_orderId", String(orderId));
        sessionStorage.setItem("payment_transactionId", String(result.transactionId));
        sessionStorage.setItem("payment_gatewayType", result.gatewayType);
        sessionStorage.setItem("payment_idempotencyKey", result.idempotencyKey);

        const SIMULATOR_GATEWAYS = ["STRIPE", "MOMO", "ZALOPAY", "PAYPAL", "VNPAY"];
        if (result.redirectUrl && SIMULATOR_GATEWAYS.includes(result.gatewayType)) {
          try {
            await triggerSimulatorCallback(result.idempotencyKey, result.gatewayType, true);
            window.location.replace("/payment/result");
          } catch {
            window.location.replace("/checkout?orderId=" + orderId);
          }
          return;
        }

        if (result.redirectUrl) {
          window.location.href = result.redirectUrl;
          return;
        }

        window.location.replace("/payment/result");
      } catch (err: any) {
        const msg = err?.message || "Payment initiation failed";
        if (!cancelled) {
          setErrorMsg(msg);
          setIsProcessing(false);
        }
      }
    }

    run();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 md:p-8 shadow-2xl">
        {isProcessing ? (
          <div className="flex flex-col gap-4 items-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
            <h3 className="text-lg font-medium text-gray-700">Initiating payment…</h3>
            <p className="text-sm text-gray-500 text-center">
              Please wait while we set up your payment
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 items-center text-center">
            <div className="text-4xl">⚠️</div>
            <h3 className="text-lg font-medium text-red-600">Payment Failed</h3>
            <p className="text-sm text-gray-600">{errorMsg}</p>
            <button
              onClick={() => window.location.replace("/checkout?orderId=" + (orderId || ""))}
              className="mt-2 w-full bg-yellow-400 hover:bg-yellow-500 text-white font-medium py-3 rounded-md"
            >
              Back to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentPage() {
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
      <PaymentContent />
    </Suspense>
  );
}
