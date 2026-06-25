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
import { getProfileAddresses } from "@/services/profile";
import { ProfileAddress } from "@/type/address";

const fallbackShippingAddress = {
  recipientName: "Customer",
  phone: "0900000000",
  streetAddress: "Default shipping address",
  city: "Ho Chi Minh",
  district: "District 1",
  ward: "Ben Nghe",
  postalCode: "700000",
};

function toOrderShippingAddress(address: ProfileAddress | null | undefined) {
  if (!address) return fallbackShippingAddress;

  return {
    recipientName: address.recipientName,
    phone: address.phoneNumber,
    streetAddress: address.addressLine,
    city: address.provinceName,
    district: address.districtName,
    ward: address.wardName,
    postalCode: "700000",
  };
}

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
        variantId: p.variantId,
        productName: p.productName ?? p.name ?? `Variant #${p.variantId}`,
        productImageUrl: p.primaryImage ?? null,
        productSlug: p.productSlug ?? null,
        sku: p.sku ?? null,
        quantity: p.quantity,
        unitPrice: Number(p.price) || 0,
        subtotal: Number(p.totalPrice) || Number(p.price) * Number(p.quantity) || 0,
      }));

      if (selectedItems.length === 0) return;
      const addresses = await getProfileAddresses(token).catch(() => []);
      const shippingAddress = toOrderShippingAddress(
        addresses.find((address) => address.isDefault) ?? addresses[0]
      );

      const res = await createOrder(
        {
          userId: user?.id ?? "",
          items: selectedItems,
          subtotal: selectedItems.reduce((sum, item) => sum + item.subtotal, 0),
          discountAmount: 0,
          shippingFee: 0,
          currency: ProductsInCart[0]?.currency ?? "VND",
          shippingAddress: {
            ...shippingAddress,
            recipientName:
              shippingAddress.recipientName || user?.username || user?.email || "Customer",
          },
          notes: "Order from cart",
        },
        token
      );

      const orderId = res.data.orderId;
      sessionStorage.setItem(`checkout:order-items:${orderId}`, JSON.stringify(selectedItems));
      router.push(`/checkout?orderId=${orderId}`);
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
    <div>
      {isAuthenticated ? (
        <Container className="flex flex-col space-y-5 my-10">
          {ProductsInCart.length === 0 ? (
            <EmptyCart />
          ) : (
            <>
              <Stepper isActive={1} />

              {/* select all */}
              <div className="flex items-center gap-2">
                <input
                  id="select-all"
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                />
                <label htmlFor="select-all" className="text-sm">
                  Select all
                </label>
              </div>

              <div className="grid lg:grid-cols-3 md:gap-8">
                <div className="lg:col-span-2">
                  <div className="flex gap-2 items-center mb-5">
                    <ShoppingBag />
                    <h1>Your shopping cart</h1>
                  </div>

                  <div className="flex flex-col gap-2 ">
                    {ProductsInCart?.map((p) => {
                      const id = p.variantId;
                      const checked = selectedIds.has(id);
                      return (
                        <div
                          key={id}
                          className="flex justify-between items-centre gap-3 border border-gray-300 rounded-md"
                        >
                          <ProductInCart product={p} onRemove={() => removeFromCart(p.variantId)} />

                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleOne(id)}
                            className="h-5 w-5 mt-5 mr-7 rounded-md text-gray-100 items-center"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col py-5 px-3 border border-gray-300 rounded-md gap-4">
                  <p className="text-black font-bold text-2xl ">
                    Payment details
                  </p>
                  <div className="p-1 flex flex-col">
                    <div className="flex justify-between">
                      <p className="text-start">Subtotal</p>
                      {/* đổi sang subtotal theo item được chọn */}
                      <FormattedPriced price={selectedSubtotal} />
                    </div>
                  </div>

                  <button
                    onClick={handleProceed}
                    disabled={selectedIds.size === 0}
                    className="bg-primary/70 text-white font-normal text-xl rounded-md hover:bg-primary hoverEffect p-3 text-center disabled:bg-gray-300"
                  >
                    Procced to checkout
                  </button>
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
