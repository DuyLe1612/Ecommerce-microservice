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

  return (
    <div className="flex p-2.5 items-center justify-between gap-5 w-full">
      <div className="flex flex-1 items-start gap-2 h-26 md:h-44 max-w-60">
        {product?.primaryImage && product?.productSlug && (
          <Link
            href={`/products/${product?.productSlug}`}
            className="border p-0.5 md:p-1 mr-2 rounded-md overflow-hidden group"
          >
            <Image
              src={product.primaryImage}
              alt="product image"
              width={500}
              height={500}
              loading="lazy"
              className="w-32 md:w-40 h-32 md:h-40 object-cover"
            />
          </Link>
        )}
      </div>
      <div className="h-full flex flex-1 flex-col justify-between py-1">
        <div className="flex flex-col gap-0.5 md:gap-1.5">
          <h2 className="text-base font-semibold line-clamp-2">
            {productName}
          </h2>
          {/* product variant */}
          {product.attributes?.map((attr) => (
            <p key={attr.name} className="text-sm capitalize">
              {attr.name}: <span className="font-normal">{attr.value}</span>
            </p>
          ))}
        </div>
        {/* <p>{product?.productName}</p>
        <p>variant</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p>{product?.price} </p>
            <p>{product?.totalPrice}</p>
          </div>
          <div>
            <Trash2 />
            <QuantityButton item={product} />
          </div>
        </div> */}

        <div className=" flex items-end justify-between">
          <div className="flex flex-col items-baseline gap-1">
            {product.price ? (
              <div className="text-sm text-gray-400 line-through">
                <FormattedPriced price={product.price} />
                {/* {product.price.toLocaleString()} đ */}
              </div>
            ) : null}
            <div className="text-xl font-bold text-primary">
              <FormattedPriced price={lineTotal} />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              aria-label="remove"
              onClick={onRemove}
              className="text-red-500 p-1 rounded hover:bg-red-50"
            >
              <Trash2 />
            </button>
            <QuantityButton item={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
