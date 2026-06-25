"use client";

import { Container } from "@/components/MainLayout/Container";
import Stepper from "@/components/share/Stepper";
import FormattedPrice from "@/components/share/FormattedPriced";
import AddressItem from "@/components/share/AddressItem";
import { getOrderByOrderId } from "@/services/order";
import { getPaymentGateways } from "@/services/payment";
import { getProductsList } from "@/services/products";
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

type PendingOrderItemSnapshot = {
  productId: number;
  variantId?: number;
  productName?: string;
  productImageUrl?: string | null;
  productSlug?: string | null;
  sku?: string | null;
};

function readPendingOrderItems(orderId: string): PendingOrderItemSnapshot[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = sessionStorage.getItem(`checkout:order-items:${orderId}`);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function findProductSnapshot(productName?: string) {
  if (!productName) return null;

  try {
    const page = await getProductsList({ keyword: productName, page: 0, size: 1 });
    const product = page.content?.[0];
    if (!product) return null;

    return {
      productImageUrl: product.primaryImageUrl ?? null,
      productSlug: product.slug ?? null,
    };
  } catch (error) {
    console.warn("Unable to hydrate order item image", error);
    return null;
  }
}

async function enrichOrderItems(order: Order, orderId: string): Promise<Order> {
  if (!order.items?.length) return order;

  const snapshots = readPendingOrderItems(orderId);
  const snapshotByProductId = new Map(
    snapshots.map((item) => [item.productId, item])
  );

  const items = await Promise.all(
    order.items.map(async (item) => {
      const snapshot = snapshotByProductId.get(item.productId);
      const productImageUrl =
        item.productImageUrl ?? snapshot?.productImageUrl ?? null;
      const productSlug = item.productSlug ?? snapshot?.productSlug ?? null;
      const sku = item.sku ?? snapshot?.sku ?? null;

      if (productImageUrl) {
        return { ...item, productImageUrl, productSlug, sku };
      }

      const product = await findProductSnapshot(item.productName);
      return {
        ...item,
        productImageUrl: product?.productImageUrl ?? productImageUrl,
        productSlug: product?.productSlug ?? productSlug,
        sku,
      };
    })
  );

  return { ...order, items };
}

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
        const enrichedOrder = await enrichOrderItems(data, orderId);
        if (mounted) setOrder(enrichedOrder);
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

  const shippingSnapshot = order?.shippingAddress;
  const shippingDisplay = selectedAddress
    ? {
        recipientName: selectedAddress.recipientName,
        phone: selectedAddress.phoneNumber,
        address: `${selectedAddress.addressLine}, ${selectedAddress.wardName}, ${selectedAddress.districtName}, ${selectedAddress.provinceName}`,
      }
    : shippingSnapshot
      ? {
          recipientName: shippingSnapshot.recipientName,
          phone: shippingSnapshot.phone,
          address: [
            shippingSnapshot.streetAddress,
            shippingSnapshot.ward,
            shippingSnapshot.district,
            shippingSnapshot.city,
            shippingSnapshot.postalCode,
          ].filter(Boolean).join(", "),
        }
      : null;

  const subtotal = useMemo(() => {
    if (!order?.items?.length) return 0;
    return order.items.reduce((sum, it) => sum + (it.subtotal ?? (it.unitPrice ?? 0) * it.quantity), 0);
  }, [order]);

  const proceedToPayment = async () => {
    if (!selectedAddressId && !shippingSnapshot) {
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
            <div className="rounded-md p-4 space-y-4 border border-white/10 bg-white/[0.03]">
              <div className="flex items-start gap-3">
                <span className="text-red-500 mt-1">&#x1F4CD;</span>
                <div className="flex-1">
                  <div className="text-lg font-semibold text-red-600">Shipping Address</div>
                  {shippingDisplay ? (
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <span className="font-semibold text-white">{shippingDisplay.recipientName}</span>
                      <span className="text-white/60">
                        (+84 {String(shippingDisplay.phone).replace(/^0/, "")})
                      </span>
                      <span className="text-white/70">
                        {shippingDisplay.address}
                      </span>
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-white/45">No address selected</div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setOpenAddressModal(true)}
                  className="text-primary hover:underline whitespace-nowrap"
                >
                  Change
                </button>
              </div>
            </div>

            {/* Address selection modal */}
            {openAddressModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/30" onClick={() => setOpenAddressModal(false)} />
                <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-[#121212] border border-white/10 p-4 md:p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white">Select Address</h3>
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
                              selected ? "border-yellow-400 bg-yellow-400/10" : "border-white/10"
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
            <div className="rounded-md p-4 space-y-4 border border-white/10 bg-white/[0.03]">
              <h2 className="font-semibold text-white">Payment Method</h2>
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
            <div className="rounded-md bg-white/[0.03] p-4 border border-white/10">
              <h3 className="font-semibold text-white mb-4">Order Summary</h3>
              <div className="space-y-3 max-h-72 overflow-auto">
                {order.items?.map((it: OrderItem) => {
                  const imageSrc = it.productImageUrl ?? it.product?.primaryImageUrl ?? null;

                  return (
                    <div key={it.id ?? it.productId} className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-md bg-white/5 overflow-hidden flex-shrink-0 border border-white/10">
                        {imageSrc ? (
                          <Image
                            src={imageSrc}
                            alt={it.productName ?? "product"}
                            width={64}
                            height={64}
                            className="w-16 h-16 object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 flex items-center justify-center text-[10px] text-white/35">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium line-clamp-2 text-white">
                          {it.productName ?? "Product"}
                        </div>
                        <div className="text-xs text-white/45">x{it.quantity}</div>
                      </div>
                      <div className="text-sm text-white/70 flex-shrink-0">
                        <FormattedPrice price={it.unitPrice ?? it.subtotal ?? 0} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 space-y-2 text-sm border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-white/50">Subtotal</span>
                  <span className="text-white">
                    <FormattedPrice price={subtotal} />
                  </span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t border-white/10 text-white">
                  <span>Total</span>
                  <span>
                    <FormattedPrice price={Number(order.totalAmount ?? subtotal)} />
                  </span>
                </div>
              </div>

              <button
                onClick={proceedToPayment}
                disabled={(!selectedAddressId && !shippingSnapshot) || !paymentMethod}
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
