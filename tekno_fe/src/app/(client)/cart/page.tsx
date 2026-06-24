"use client";
import EmptyCart from "@/components/cart-payment-checkout/EmptyCart";
import NoAccess from "@/components/cart-payment-checkout/NoAccess";
import ProductInCart from "@/components/cart-payment-checkout/ProductInCart";
import { Container } from "@/components/MainLayout/Container";
import FormattedPriced from "@/components/share/FormattedPriced";
import Stepper from "@/components/share/Stepper";
import { useAuth } from "@/hook/useAuth";
import { useCart } from "@/hook/useCart";
import { ShoppingBag } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createOrder } from "@/services/order";

const toOrderUserId = (id?: string) => {
  if (!id) return 1;
  const numeric = Number(id);
  if (Number.isSafeInteger(numeric) && numeric > 0) return numeric;

  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) % 2147483647;
  }
  return hash || 1;
};

export default function CartPage() {
  const { items, removeFromCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const ProductsInCart = useMemo(() => items ?? [], [items]);

  // selection state
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(
    new Set()
  );

  const toggleOne = (id: string | number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const allIds = useMemo(
    () => ProductsInCart.map((p) => p.variantId),
    [ProductsInCart]
  );
  const allSelected =
    selectedIds.size > 0 && selectedIds.size === allIds.length;

  const toggleAll = () => {
    setSelectedIds((prev) => {
      if (prev.size === allIds.length) return new Set();
      return new Set(allIds);
    });
  };

  const handleProceed = async () => {
    try {
      if (selectedIds.size === 0) return;

      const token = localStorage.getItem("token");
      if (!token) return;

      const selectedItems = ProductsInCart.filter((p) =>
        selectedIds.has(p.variantId)
      ).map((p) => ({
        productId: p.variantId,
        productName: p.productName ?? p.name ?? `Variant #${p.variantId}`,
        quantity: p.quantity,
        unitPrice: Number(p.price) || 0,
        subtotal: Number(p.totalPrice) || Number(p.price) * Number(p.quantity) || 0,
      }));

      if (selectedItems.length === 0) return;

      const res = await createOrder(
        {
          userId: toOrderUserId(user?.id),
          items: selectedItems,
          subtotal: selectedItems.reduce((sum, item) => sum + item.subtotal, 0),
          discountAmount: 0,
          shippingFee: 0,
          currency: ProductsInCart[0]?.currency ?? "VND",
          shippingAddress: {
            recipientName: user?.username ?? user?.email ?? "Customer",
            phone: "0900000000",
            streetAddress: "Default shipping address",
            city: "Ho Chi Minh",
            district: "District 1",
            ward: "Ben Nghe",
            postalCode: "700000",
          },
          notes: "Order from cart",
        },
        token
      );

      const orderId = res.data.orderId;
      router.push(`/payment?orderId=${orderId}`);
    } catch (error) {
      console.error("Create order error:", error);
    }
  };

  // Subtotal theo item được chọn
  const selectedSubtotal = useMemo(() => {
    if (!items?.length || selectedIds.size === 0) return 0;
    return items
      .filter((p) => selectedIds.has(p.variantId))
      .reduce((sum, it) => sum + (Number(it.totalPrice) || Number(it.price) * Number(it.quantity) || 0), 0);
  }, [items, selectedIds]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {isAuthenticated ? (
        <Container className="flex flex-col space-y-6 my-10 relative z-10">
          {ProductsInCart.length === 0 ? (
            <EmptyCart />
          ) : (
            <>
              <Stepper isActive={1} />

              {/* select all */}
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 backdrop-blur-md px-5 py-3 rounded-xl w-fit">
                <input
                  id="select-all"
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="h-5 w-5 rounded border-white/20 bg-black/40 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
                />
                <label htmlFor="select-all" className="text-sm font-medium text-white/80 cursor-pointer select-none">
                  Select All ({ProductsInCart.length} items)
                </label>
              </div>

              <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
                <div className="lg:col-span-2 flex flex-col gap-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-lg text-primary">
                      <ShoppingBag size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Your Shopping Cart</h1>
                  </div>

                  <div className="flex flex-col gap-4">
                    {ProductsInCart?.map((p) => {
                      const id = p.variantId;
                      const checked = selectedIds.has(id);
                      return (
                        <div
                          key={id}
                          className={`flex justify-between items-center gap-2 md:gap-3 border backdrop-blur-md rounded-2xl transition-all duration-300 ${
                            checked ? "border-primary/50 bg-primary/5" : "border-white/10 bg-white/5 hover:bg-white/10"
                          }`}
                        >
                          <div className="flex items-center pl-4 md:pl-6">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleOne(id)}
                              className="h-5 w-5 rounded border-white/20 bg-black/40 text-primary focus:ring-primary cursor-pointer transition-colors"
                            />
                          </div>
                          
                          <ProductInCart product={p} onRemove={() => removeFromCart(p.variantId)} />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col gap-6 relative">
                  <div className="sticky top-24 border border-white/10 bg-[#121212]/80 backdrop-blur-xl rounded-2xl p-6 lg:p-8 shadow-2xl">
                    <h2 className="text-white font-bold text-xl lg:text-2xl tracking-tight mb-6">
                      Order Summary
                    </h2>
                    
                    <div className="flex flex-col gap-4 mb-6 text-white/80">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Selected Items</span>
                        <span className="font-medium text-white">{selectedIds.size}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Subtotal</span>
                        <span className="font-medium text-white">
                          <FormattedPriced price={selectedSubtotal} />
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Shipping</span>
                        <span className="text-white/50">Calculated at next step</span>
                      </div>
                    </div>
                    
                    <div className="border-t border-white/10 pt-6 mb-6">
                      <div className="flex justify-between items-end">
                        <span className="text-base font-medium">Total</span>
                        <div className="text-2xl font-bold text-primary">
                          <FormattedPriced price={selectedSubtotal} />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleProceed}
                      disabled={selectedIds.size === 0}
                      className="w-full bg-primary text-black font-bold text-lg rounded-xl py-4 transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary disabled:active:scale-100 disabled:shadow-none"
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </Container>
      ) : (
        <NoAccess />
      )}
    </div>
  );
}
