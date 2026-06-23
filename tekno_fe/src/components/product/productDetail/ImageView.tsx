"use client";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import React, { useState } from "react";
import logo from "@/asset/MainLogo.png";

import { ProductImage } from "@/type/product";

interface Props {
  images?: ProductImage[];
  isStock?: boolean;
}
export default function ImageView({ images = [], isStock }: Props) {
  const [active, setActive] = useState(images.length ? images[0].imageUrl : logo.src);
  return (
    <div className="w-full md:w-1/2 space-y-2 md:space-y-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full flex items-center justify-center min-h-[400px] md:min-h-[500px] border border-gray-800 rounded-3xl group overflow-hidden bg-white/5 backdrop-blur-sm shadow-[0_0_30px_rgba(0,0,0,0.5)] relative"
        >
          <Image
            src={active}
            alt="productImage"
            width={400}
            height={400}
            priority
            className={`w-full h-auto max-h-[500px] object-contain group-hover:scale-105 transition-transform duration-500 ease-out ${
              isStock === false ? "opacity-50 grayscale" : ""
            }`}
          />
        </motion.div>
      </AnimatePresence>
      <div className="grid grid-cols-6 gap-4 h-20 md:h-24">
        {images.map((image) => (
          <button
            key={image.id}
            onClick={() => setActive(image.imageUrl)}
            className={`relative h-full flex items-center justify-center border-2 rounded-2xl overflow-hidden transition-all duration-300 bg-white/5 backdrop-blur-sm ${
              active === image.imageUrl ? "border-primary shadow-[0_0_15px_rgba(255,213,0,0.2)] opacity-100 scale-105" : "border-gray-800 opacity-60 hover:opacity-100 hover:border-gray-600"
            }`}
          >
            <Image
              src={image.imageUrl}
              alt="image"
              width={100}
              height={100}
              className="w-fix h-auto object-contain"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
