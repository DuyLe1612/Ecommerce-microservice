"use client";
import Link from "next/link";
import Image from "next/image";
import { ProductCard as ProductCardType } from "@/type/product";
import { HeartIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import AddToFavorButton from "./AddToFavorButton";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import FormattedPriced from "../share/FormattedPriced";

interface ProductCardProps {
  product: ProductCardType;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product?.slug}`}>
      <div className="relative text-sm bg-white border-[1px] border-secondary/20 rounded-md group shadow">
        {/* --- Ảnh sản phẩm --- */}
        <motion.div
          className="w-fix max-h-80 flex items-center overflow-hidden bg-gray-50 m-2 pb-1 border-b border-secondary/50"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {product?.primaryImagePath ? (
            <Image
              src={product.primaryImagePath}
              alt={product.name}
              loading="lazy"
              width={500}
              height={500}
              className="object-contain h-70"
            />
          ) : (
            <div className="w-full h-52 flex items-center justify-center text-gray-300 bg-gray-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </motion.div>

        <AddToFavorButton
          className="absolute top-2 right-2 z-10"
          productId={product.id}
        />
        {product?.discountPercent !== null && product.discountPercent > 0 && (
          <p className="absolute z-10 top-2 left-0 bg-blue-100 text-blue-600 text-sm font-semibold px-2 py-1 rounded-r-lg border border-blue-500/50 group-hover:border-blue-700 hoverEffect">
            {product.discountPercent}%
          </p>
        )}

        {/* <p className="absolute z-10 top-2 left-0 bg-blue-100 text-blue-600 text-sm font-semibold px-2 py-1 rounded-r-lg ">
          15
        </p> */}

        {/* --- Tên sản phẩm --- */}
        <div className="p-3 flex flex-col gap-2">
          <p className="text-gray-900 text-sm font-medium line-clamp-1">
            {product.name}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <FormattedPriced
                price={product.basePrice}
                className="line-through "
              />
              <FormattedPriced
                price={product.finalPrice}
                className="text-lg text-red-700 font-bold"
              />
            </div>
            {/* sao */}
            <div className="flex gap-1 items-center text-primary">
              <Star size={18} className="text-primary" fill="currentColor" />
              <span className="ml-1 font-normal text-base">
                {product.averageRating}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ProductCardInSearch({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product?.slug}`}>
      <div className=" flex items-center relative text-sm bg-white border-[1px] border-secondary/20 rounded-md group shadow">
        {/* --- Ảnh sản phẩm --- */}
        <motion.div
          className="w-auto h-40 flex items-center group overflow-hidden bg-gray-50 m-2 pb-1 border-b border-secondary/50 hover:border-secondary hoverEffect"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {product?.primaryImagePath && (
            <Image
              src={product.primaryImagePath}
              alt={product.name}
              loading="lazy"
              width={150}
              height={150}
              className="object-center"
            />
          )}
        </motion.div>

        {product?.discountPercent !== null && product.discountPercent > 0 && (
          <p className="absolute z-10 top-2 left-0 bg-blue-100 text-blue-600 text-sm font-semibold px-2 py-1 rounded-r-lg">
            {product?.discountPercent}
          </p>
        )}
        {/* <p className="absolute z-10 top-2 left-0 bg-blue-100 text-blue-600 text-sm font-semibold px-2 py-1 rounded-r-lg ">
          15
        </p> */}

        {/* --- Tên sản phẩm --- */}
        <div className="p-3 flex flex-col gap-2">
          <p className="text-gray-900 text-sm font-medium line-clamp-1">
            {product.name}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <FormattedPriced
                price={product.basePrice}
                className="line-through "
              />
              <FormattedPriced
                price={product.finalPrice}
                className="text-lg text-red-700 font-bold"
              />
            </div>
            {/* sao */}
          </div>
        </div>
      </div>
    </Link>
  );
}
