"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import banner from "@/asset/MainLogo.png";
import { getAdvertisementsByPosition } from "@/services/advertisementApi";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function HomeBanner() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getAdvertisementsByPosition("ProductSidebar");
        if (mounted) setBanners(res ?? []);
      } catch (e) {
        console.warn("fetch advertisements error:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // auto-rotate
  useEffect(() => {
    if (!banners.length) return;
    const t = setInterval(
      () => setCurrent((p) => (p + 1) % banners.length),
      4000
    );
    return () => clearInterval(t);
  }, [banners.length]);

  // reset index when data changes
  useEffect(() => {
    setCurrent(0);
  }, [banners.length]);

  const next = () => setCurrent((p) => (p + 1) % Math.max(1, banners.length));
  const prev = () =>
    setCurrent(
      (p) => (p - 1 + Math.max(1, banners.length)) % Math.max(1, banners.length)
    );

  const active = banners[current];

  return (
    <div className="py-16 md:py-16 rounded-3xl bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#0a0a0a] px-10 lg:px-24 flex items-center justify-between border border-gray-800 shadow-2xl relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      {/* title */}
      <div className="space-y-10 relative z-10">
        <div className="flex-1">
          <h2 className="text-5xl md:text-7xl font-extrabold text-primary capitalize tracking-tight mb-4 drop-shadow-md">
            Tekno
          </h2>
          <p className="text-xl md:text-3xl font-medium text-gray-300">
            "Join the <span className="text-white font-bold">digital revolution</span>"
          </p>
        </div>
        <Link
          href={"/products"}
          className="inline-block bg-primary rounded-full text-black px-10 py-4 text-lg font-bold hover:bg-primary/90 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,213,0,0.3)] transition-all duration-300"
        >
          Explore more
        </Link>
      </div>

      {/* rotating product banner */}
      <div className="relative w-full max-w-md flex flex-col items-center">
        {loading ? (
          <Image
            src={banner}
            alt="banner"
            className="hidden md:inline-flex w-82"
          />
        ) : banners.length ? (
          <>
            <div className="relative w-full flex items-center justify-center mt-10">
              <button
                type="button"
                onClick={prev}
                aria-label="Previous"
                className="absolute left-0 p-2 rounded-full bg-white/70 hover:bg-white shadow"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <Link
                href={`/products/${active.productSlug}`}
                className="text-center"
              >
                <Image
                  src={active?.imageUrl}
                  alt={active?.productName ?? "Advertisement"}
                  height={200}
                  width={300}
                  className="h-70 w-100 object-fill mx-auto "
                />
                {active?.productName && (
                  <p className="mt-2 text-sm">{active.productName}</p>
                )}
              </Link>

              <button
                type="button"
                onClick={next}
                aria-label="Next"
                className="absolute right-0 p-2 rounded-full bg-white/70 hover:bg-white shadow"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* indicators */}
            <div className="my-4 flex items-center justify-center gap-4">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  aria-label={`Slide ${i + 1}`}
                  className="focus:outline-none"
                >
                  <span
                    className={`block h-2 rounded-full transition-all duration-300 ${i === current ? "w-16 bg-primary shadow-[0_0_10px_rgba(255,213,0,0.5)]" : "w-10 bg-gray-600 hover:bg-gray-500"
                      }`}
                  />
                </button>
              ))}
            </div>
          </>
        ) : (
          <Image
            src={banner}
            alt="banner"
            className="hidden md:inline-flex w-82"
          />
        )}
      </div>
    </div>
  );
}
