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
      <div className="relative text-sm bg-[#111111] border border-gray-800 rounded-2xl group hover:shadow-[0_0_20px_rgba(255,213,0,0.15)] hover:border-primary/50 transition-all duration-300 overflow-hidden flex flex-col h-full">
        {/* --- Ảnh sản phẩm --- */}
        <motion.div
          className="w-full h-56 flex items-center justify-center overflow-hidden bg-white/5 border-b border-gray-800 relative"
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
              className="object-contain w-full h-full p-6 drop-shadow-lg"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600 bg-white/5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </motion.div>

        <AddToFavorButton
          className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
          productId={product.id}
        />
        {product?.discountPercent !== null && product.discountPercent > 0 && (
          <p className="absolute z-10 top-4 left-0 bg-primary text-black text-xs font-extrabold px-3 py-1 rounded-r-full shadow-lg">
            -{product.discountPercent}%
          </p>
        )}

        {/* <p className="absolute z-10 top-2 left-0 bg-blue-100 text-blue-600 text-sm font-semibold px-2 py-1 rounded-r-lg ">
          15
        </p> */}

        {/* --- Tên sản phẩm --- */}
        <div className="p-4 flex flex-col justify-between flex-1 gap-3">
          <p className="text-gray-100 text-base font-semibold line-clamp-2 group-hover:text-primary transition-colors leading-snug">
            {product.name}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <FormattedPriced
                price={product.basePrice}
                className="line-through text-gray-500 text-xs"
              />
              <FormattedPriced
                price={product.finalPrice}
                className="text-xl text-primary font-bold drop-shadow-sm"
              />
            </div>
            {/* sao */}
            <div className="flex gap-1.5 items-center text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-full">
              <Star size={14} className="text-primary" fill="currentColor" />
              <span className="font-semibold text-xs text-primary">
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
      <div className="flex items-center relative text-sm bg-[#111111] border border-gray-800 rounded-2xl group hover:border-primary/50 hover:shadow-[0_0_15px_rgba(255,213,0,0.15)] transition-all duration-300 overflow-hidden pr-4">
        {/* --- Ảnh sản phẩm --- */}
        <motion.div
          className="w-32 h-32 flex-shrink-0 flex items-center justify-center overflow-hidden bg-white/5 border-r border-gray-800 relative"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {product?.primaryImagePath && (
            <Image
              src={product.primaryImagePath}
              alt={product.name}
              loading="lazy"
              width={120}
              height={120}
              className="object-contain p-2 drop-shadow-md"
            />
          )}
        </motion.div>

        {product?.discountPercent !== null && product.discountPercent > 0 && (
          <p className="absolute z-10 top-2 left-0 bg-primary text-black text-xs font-extrabold px-2 py-0.5 rounded-r-full">
            -{product?.discountPercent}%
          </p>
        )}
        {/* <p className="absolute z-10 top-2 left-0 bg-blue-100 text-blue-600 text-sm font-semibold px-2 py-1 rounded-r-lg ">
          15
        </p> */}

        {/* --- Tên sản phẩm --- */}
        <div className="p-4 flex flex-col justify-center flex-1 gap-2 ml-2">
          <p className="text-gray-100 text-base font-semibold line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex flex-col mt-1">
              <FormattedPriced
                price={product.basePrice}
                className="line-through text-gray-500 text-xs"
              />
              <FormattedPriced
                price={product.finalPrice}
                className="text-lg text-primary font-bold drop-shadow-sm"
              />
            </div>
            {/* sao */}
          </div>
        </div>
      </div>
    </Link>
  );
}
