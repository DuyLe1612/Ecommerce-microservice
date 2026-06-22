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
          className="w-full max-h-[550] min-h-[500] border border-secondary/10 rounded-md group overflow-hidden"
        >
          <Image
            src={active}
            alt="productImage"
            width={400}
            height={400}
            priority
            className={`w-full h-96 max-h-[550px] min-h-[500] object-contain group-hover:scale-110 hoverEffect rounded-md ${
              isStock === false ? "opacity-50" : ""
            }`}
          />
        </motion.div>
      </AnimatePresence>
      <div className="grid grid-cols-6 gap-4 h-20 md:h-24">
        {images.map((image) => (
          <button
            key={image.id}
            onClick={() => setActive(image.imageUrl)}
            className={`h-full items-center border rounded-md overflow-hidden ${
              active === image.imageUrl ? "border-gray-600 opacity-100" : "opacity-80"
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
