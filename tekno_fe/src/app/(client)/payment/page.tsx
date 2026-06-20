// import { Container } from "@/components/MainLayout/Container";
// import Stepper from "@/components/share/Stepper";
// import React from "react";

// export default function PaymentPage() {
//   return (
//     <Container className="flex flex-col space-y-5 my-10">
//       <Stepper isActive={3} />
//     </Container>
//   );
// }

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Container } from "@/components/MainLayout/Container";
import Stepper from "@/components/share/Stepper";
import {
  CreditCard,
  Plus,
  Edit2,
  User,
  ArrowBigLeft,
  ArrowLeftFromLine,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PaymentGateway, PaymentPayload } from "@/type/payment";
import { getPaymentGateways, processPayment } from "@/services/payment";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "recharts";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ProfileAddress } from "@/type/address";
import { getProfileAddresses } from "@/services/profile";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { getOrderByOrderId } from "@/services/order";
import { OrderItem } from "@/type/order";
import { log } from "console";
import FormattedPrice from "@/components/share/FormattedPriced";
import MyAddress from "@/components/share/MyAddress";
import AddressItem from "@/components/share/AddressItem";

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  // remove mock
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [orderTotal, setOrderTotal] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!orderId) return;
      try {
        setLoadingOrder(true);
        const token = localStorage.getItem("token") || "";
        const res = await getOrderByOrderId(token, Number(orderId));
        // normalize response

        console.log(res);

        const order = res;
        const list = order.items as OrderItem[];
        if (mounted) {
          setItems(list);
          setOrderTotal(Number(order.totalAmount ?? 0));
        }
      } catch (e) {
        console.error("Fetch order by id error:", e);
      } finally {
        if (mounted) setLoadingOrder(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [orderId]);

  // discount code
  const [code, setCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);

  // payment method
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>("");

  // address (mock default)
  const [open, setOpen] = useState(false);
  const [addresses, setAddresses] = useState<ProfileAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null
  );
  const defaultAddress = useMemo(
    () => addresses.find((a) => a.id === selectedAddressId) ?? addresses[0],
    [addresses, selectedAddressId]
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const list = await getProfileAddresses(token);
        const arr = Array.isArray(list) ? list : (list as any)?.data ?? [];
        setAddresses(arr);
        // set default selected address (prefer default flag, else first)
        const def =
          arr.find((a: any) => a.isDefault) ?? (arr.length ? arr[0] : null);
        setSelectedAddressId(def?.id ?? null);
      } catch (e) {
        console.error("Fetch addresses error:", e);
        setAddresses([]);
        setSelectedAddressId(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const data = await getPaymentGateways();
        setGateways(data);
        if (data.length && !paymentMethod) setPaymentMethod(String(data[0].id));
      } catch (e) {
        console.error("Fetch gateways error", e);
      }
    })();
  }, []);

  // billing address same as shipping
  const [sameAsShipping] = useState(true);

  // shipment cost (mock)
  const shipmentCost = 22.5;

  // recompute subtotal from fetched items
  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + it.price * it.quantity, 0),
    [items]
  );

  // prefer backend total if present; otherwise compute
  const grandTotal = useMemo(() => {
    const computed = Math.max(0, subtotal - appliedDiscount + shipmentCost);
    return orderTotal > 0 ? orderTotal : computed;
  }, [orderTotal, subtotal, appliedDiscount, shipmentCost]);

  const applyCode = () => {
    // Simple mock: apply -$11.87 if any non-empty code
    if (code.trim()) {
      setAppliedDiscount(11.87);
    } else {
      setAppliedDiscount(0);
    }
  };

  const continueToPay = async () => {
    try {
      const token = localStorage.getItem("token") || "";
      if (!token) throw new Error("Missing token");
      if (!orderId) throw new Error("Missing orderId");

      const shippingAddressId = defaultAddress?.id;
      if (!shippingAddressId) throw new Error("Select a shipping address");

      const gatewayId = Number(paymentMethod || gateways[0]?.id);
      const gw = gateways.find((g) => Number(g.id) === gatewayId);
      const method =
        Number((gw as any)?.methods?.[0]?.id) ||
        Number((gw as any)?.defaultMethod) ||
        Number((gw as any)?.method) ||
        1;

      const payload: PaymentPayload = {
        shippingAddressId,
        gateway: gatewayId,
        method,
        returnUrl: `${window.location.origin}/payment/result`,
        orderId: Number(orderId),
      };

      const { paymentUrl, transactionId, gatewayType } = await processPayment(token, payload);
      if (!paymentUrl) throw new Error("No payment URL returned");

      // For demo: store transaction data and redirect to result page
      // The result page will call the simulator to trigger the callback
      const resultUrl = new URL(`${window.location.origin}/payment/result`);
      resultUrl.searchParams.set("OrderId", String(orderId));
      resultUrl.searchParams.set("transactionId", String(transactionId));
      resultUrl.searchParams.set("gatewayType", gatewayType);
      window.location.href = resultUrl.toString();
    } catch (e: any) {
      toast.error(e?.message || "Payment error");
    }
  };

  return (
    <Container className="flex flex-col space-y-6 my-10">
      <Stepper isActive={2} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 ">
        {/* địa chỉ nhân hàng */}
        <div className="lg:col-span-7 space-y-5">
          <div className="rounded-md p-4 space-y-4 border border-gray-200">
            <div className=" flex items-start gap-3">
              <span className="text-red-500 mt-1">📍</span>
              <div className="flex-1">
                <div className="text-lg font-semibold text-red-600">
                  Địa Chỉ Nhận Hàng
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <span className="font-semibold">
                    {defaultAddress?.recipientName || "No name"}
                  </span>
                  <span className="text-gray-700">
                    (
                    {defaultAddress?.phoneNumber
                      ? `+84 ${defaultAddress.phoneNumber}`
                      : "No phone number"}
                    )
                  </span>
                  <span className="text-gray-800">
                    {defaultAddress
                      ? `${defaultAddress.addressLine} , ${defaultAddress.wardName}, ${defaultAddress.districtName}, ${defaultAddress.provinceName}`
                      : "No address selected"}
                  </span>
                </div>
              </div>
              {/* modal change address */}
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="text-blue-600 hover:underline whitespace-nowrap"
              >
                Thay Đổi
              </button>
            </div>
          </div>

          {/* Change Address Modal */}
          {open && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-black/30"
                onClick={() => setOpen(false)}
              />
              <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-white p-4 md:p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">Chọn địa chỉ</h3>
                  <button
                    className="text-sm text-gray-500 hover:text-gray-700"
                    onClick={() => setOpen(false)}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* List addresses to choose */}
                {loading ? (
                  <p className="text-sm text-gray-500">Loading addresses…</p>
                ) : addresses.length === 0 ? (
                  <p className="text-sm text-gray-500">No addresses found.</p>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((addr) => {
                      const selected = addr.id === selectedAddressId;

                      return (
                        <div
                          key={addr.id}
                          onClick={() => {
                            setSelectedAddressId(addr.id);
                          }}
                          className={`cursor-pointer rounded-lg border transition
          ${selected ? "border-yellow-400 bg-yellow-50" : "border-gray-200"}
        `}
                        >
                          <AddressItem addr={addr} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Left: Payment + Billing */}
          <div className="rounded-md p-4 space-y-4 border border-gray-100">
            <h2 className="font-semibold text-gray-800">Payment</h2>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value)}
            >
              {gateways.map((g) => (
                <div key={g.id} className="flex items-center gap-2">
                  <RadioGroupItem
                    value={String(g.id)}
                    disabled={!g.available}
                  />
                  <span>{g.name}</span>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Link
            href="/checkout"
            className="text-sm hover:underline flex items-center gap-2"
          >
            <ArrowLeftFromLine />
            Return to checkout
          </Link>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-5">
          <div className="rounded-md bg-white p-4 border">
            <h3 className="font-semibold text-gray-800 mb-4">Your Order</h3>

            <div className="space-y-3 max-h-72 overflow-auto">
              {loadingOrder ? (
                <div className="py-3 text-sm text-gray-500">Loading order…</div>
              ) : (
                items.map((it) => (
                  <div key={it.id} className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-md bg-gray-100 overflow-hidden">
                      <Image
                        src={it.product.primaryImagePath}
                        alt={it.product.slug}
                        width={64}
                        height={64}
                        className="w-16 h-16 object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium line-clamp-2">
                        {it.product.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        x{it.quantity}
                        {/* {it.variant. ? `· ${it.color}` : ""} */}
                      </div>
                    </div>
                    <div className="text-sm text-gray-700">
                      <FormattedPrice price={it.price} />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Discount code */}
            <div className="mt-4 flex gap-2">
              <input
                className="flex-1 border rounded-md px-3 py-2 text-sm"
                placeholder="discount code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <button
                onClick={applyCode}
                className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm"
              >
                Apply
              </button>
            </div>

            {/* Totals */}
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-800">
                  <FormattedPrice price={subtotal} />
                </span>
              </div>
              {/* // Delete */}
              <div className="flex justify-between">
                <span className="text-gray-600">Discount</span>
                <span className="text-gray-800">
                  <FormattedPrice price={appliedDiscount} />
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipment cost</span>
                <span className="text-gray-800">
                  <FormattedPrice price={shipmentCost} />
                </span>
              </div>
              <div className="flex justify-between font-semibold pt-2 border-t">
                <span>Grand Total</span>
                <span>
                  {" "}
                  <FormattedPrice price={grandTotal} />{" "}
                </span>
              </div>
            </div>

            {/* Continue button */}
            <button
              onClick={continueToPay}
              className="mt-4 w-full bg-yellow-400 hover:bg-yellow-500 text-white font-medium py-3 rounded-md"
            >
              Continue to pay
            </button>
          </div>
        </div>
      </div>
    </Container>
  );
}
