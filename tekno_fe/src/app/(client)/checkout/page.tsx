"use client";

import { Container } from "@/components/MainLayout/Container";
import Stepper from "@/components/share/Stepper";
import FormattedPrice from "@/components/share/FormattedPriced";
import AddressItem from "@/components/share/AddressItem";
import { getOrderByOrderId } from "@/services/order";
import { getPaymentGateways } from "@/services/payment";
import { getProfileAddresses } from "@/services/profile";
import { Order, OrderItem } from "@/type/order";
import { PaymentGateway } from "@/type/payment";
import { ProfileAddress } from "@/type/address";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeftFromLine, X, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import React, { Suspense, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<Order | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);

  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>("");

  const [openAddressModal, setOpenAddressModal] = useState(false);
  const [addresses, setAddresses] = useState<ProfileAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  useEffect(() => {
    let mounted = true;
    if (!orderId) { setLoadingOrder(false); return; }
    (async () => {
      try {
        const token = localStorage.getItem("token") || "";
        const data = await getOrderByOrderId(token, Number(orderId));
        if (mounted) setOrder(data);
      } catch (e) {
        console.error("Fetch order error:", e);
        toast.error("Failed to load order");
      } finally {
        if (mounted) setLoadingOrder(false);
      }
    })();
    return () => { mounted = false; };
  }, [orderId]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getPaymentGateways();
        if (mounted) {
          setGateways(data);
          if (data.length && !paymentMethod) setPaymentMethod(data[0].type);
        }
      } catch (e) { console.error("Fetch gateways error", e); }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    const token = localStorage.getItem("token");
    if (!token) { setLoadingAddresses(false); return; }
    (async () => {
      try {
        const list = await getProfileAddresses(token);
        const arr = Array.isArray(list) ? list : (list as any)?.data ?? [];
        if (mounted) {
          setAddresses(arr);
          const def = arr.find((a: any) => a.isDefault) ?? (arr.length ? arr[0] : null);
          setSelectedAddressId(def?.id ?? null);
        }
      } catch (e) {
        console.error("Fetch addresses error:", e);
      } finally {
        if (mounted) setLoadingAddresses(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const selectedAddress = useMemo(
    () => addresses.find((a) => a.id === selectedAddressId) ?? addresses[0],
    [addresses, selectedAddressId]
  );

  const subtotal = useMemo(() => {
    if (!order?.items?.length) return 0;
    return order.items.reduce((sum, it) => sum + (it.subtotal ?? (it.unitPrice ?? 0) * it.quantity), 0);
  }, [order]);

  const proceedToPayment = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a shipping address");
      return;
    }
    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }
    router.push(
      `/payment?orderId=${orderId}&gateway=${paymentMethod}&amount=${order?.totalAmount ?? subtotal}&currency=${order?.currency ?? "VND"}`
    );
  };

  return (
    <Container className="flex flex-col space-y-6 my-10">
      <Stepper isActive={2} />

      {loadingOrder ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : !order ? (
        <div className="text-center py-20 text-gray-500">Order not found.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left — address + payment */}
          <div className="lg:col-span-7 space-y-5">
            {/* Shipping address */}
            <div className="rounded-md p-4 space-y-4 border border-gray-200">
              <div className="flex items-start gap-3">
                <span className="text-red-500 mt-1">&#x1F4CD;</span>
                <div className="flex-1">
                  <div className="text-lg font-semibold text-red-600">Shipping Address</div>
                  {selectedAddress ? (
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <span className="font-semibold">{selectedAddress.recipientName}</span>
                      <span className="text-gray-700">
                        (+84 {String(selectedAddress.phoneNumber).replace(/^0/, "")})
                      </span>
                      <span className="text-gray-800">
                        {selectedAddress.addressLine}, {selectedAddress.wardName},{" "}
                        {selectedAddress.districtName}, {selectedAddress.provinceName}
                      </span>
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-gray-500">No address selected</div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setOpenAddressModal(true)}
                  className="text-blue-600 hover:underline whitespace-nowrap"
                >
                  Change
                </button>
              </div>
            </div>

            {/* Address selection modal */}
            {openAddressModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/30" onClick={() => setOpenAddressModal(false)} />
                <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-white p-4 md:p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold">Select Address</h3>
                    <button
                      className="text-sm text-gray-500 hover:text-gray-700"
                      onClick={() => setOpenAddressModal(false)}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  {loadingAddresses ? (
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
                              setOpenAddressModal(false);
                            }}
                            className={`cursor-pointer rounded-lg border transition ${
                              selected ? "border-yellow-400 bg-yellow-50" : "border-gray-200"
                            }`}
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

            {/* Payment method */}
            <div className="rounded-md p-4 space-y-4 border border-gray-100">
              <h2 className="font-semibold text-gray-800">Payment Method</h2>
              <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value)}>
                {gateways.map((g) => (
                  <div key={g.type} className="flex items-center gap-2">
                    <RadioGroupItem value={g.type} />
                    <Label className="cursor-pointer">
                      {g.displayName}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Link href="/cart" className="text-sm hover:underline flex items-center gap-2">
              <ArrowLeftFromLine />
              Back to cart
            </Link>
          </div>

          {/* Right — order summary */}
          <div className="lg:col-span-5">
            <div className="rounded-md bg-white p-4 border">
              <h3 className="font-semibold text-gray-800 mb-4">Order Summary</h3>
              <div className="space-y-3 max-h-72 overflow-auto">
                {order.items?.map((it: OrderItem) => (
                  <div key={it.id ?? it.productId} className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-md bg-gray-100 overflow-hidden flex-shrink-0">
                      <Image
                        src={it.productImageUrl ?? "/images/sample/product.jpg"}
                        alt={it.productName ?? "product"}
                        width={64}
                        height={64}
                        className="w-16 h-16 object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium line-clamp-2">
                        {it.productName ?? "Product"}
                      </div>
                      <div className="text-xs text-gray-500">x{it.quantity}</div>
                    </div>
                    <div className="text-sm text-gray-700 flex-shrink-0">
                      <FormattedPrice price={it.unitPrice ?? it.subtotal ?? 0} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2 text-sm border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-800">
                    <FormattedPrice price={subtotal} />
                  </span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t">
                  <span>Total</span>
                  <span>
                    <FormattedPrice price={Number(order.totalAmount ?? subtotal)} />
                  </span>
                </div>
              </div>

              <button
                onClick={proceedToPayment}
                disabled={!selectedAddressId || !paymentMethod}
                className="mt-4 w-full bg-yellow-400 hover:bg-yellow-500 text-white font-medium py-3 rounded-md disabled:bg-yellow-300"
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutContent />
    </Suspense>
  );
}
