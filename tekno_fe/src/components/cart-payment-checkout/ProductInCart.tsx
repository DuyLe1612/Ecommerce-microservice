import { Trash2 } from "lucide-react";
import React from "react";
import QuantityButton from "../product/productDetail/QuantityButton";
import { CartItem } from "@/hook/useCart";
import Link from "next/link";
import Image from "next/image";
import FormattedPriced from "../share/FormattedPriced";

export default function ProductInCart({
  product,
  onRemove,
}: {
  product: CartItem;
  onRemove?: () => void;
}) {
  const productName = product.productName ?? product.name ?? `Variant #${product.variantId}`;
  const lineTotal = product.totalPrice ?? Number(product.price) * Number(product.quantity);
  const productHref = product.productSlug ? `/products/${product.productSlug}` : "/products";

  return (
    <div className="flex p-4 items-center justify-between gap-6 w-full">
      <div className="flex items-center gap-4 h-24 md:h-36 shrink-0">
        {product?.primaryImage && product?.productSlug ? (
          <Link
            href={`/products/${product.productSlug}`}
            className="block border border-white/10 bg-black/40 p-2 rounded-xl overflow-hidden group hover:border-primary/50 transition-colors"
          >
            <Image
              src={product.primaryImage}
              alt="product image"
              width={140}
              height={140}
              loading="lazy"
              className="w-20 md:w-32 h-20 md:h-32 object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
            />
          </Link>
        ) : (
          <div className="w-32 md:w-40 h-32 md:h-40 border border-white/10 bg-white/5 rounded-md" aria-hidden="true" />
        )}
      </div>
      <div className="h-full flex flex-1 flex-col justify-between py-1">
        <div className="flex flex-col gap-1.5 md:gap-2">
          <Link href={productHref} className="hover:text-primary transition-colors">
            <h2 className="text-base md:text-lg font-semibold line-clamp-2 text-white/90">
              {productName}
            </h2>
          </Link>
          
          <div className="flex flex-wrap gap-2">
            {product.attributes?.map((attr) => (
              <span key={attr.name} className="text-xs md:text-sm capitalize px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-white/70">
                {attr.name}: <span className="font-medium text-white/90">{attr.value}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-end justify-between mt-4">
          <div className="flex flex-col items-baseline gap-1">
            {product.price ? (
              <div className="text-sm md:text-base text-white/40 line-through">
                <FormattedPriced price={product.price} />
              </div>
            ) : null}
            <div className="text-lg md:text-2xl font-bold text-primary tracking-tight">
              <FormattedPriced price={lineTotal} />
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            <QuantityButton item={product} />
            <button
              aria-label="remove"
              onClick={onRemove}
              className="text-red-400 p-2 md:p-2.5 rounded-lg hover:bg-red-500/10 hover:text-red-300 transition-all active:scale-95 border border-transparent hover:border-red-500/20"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
