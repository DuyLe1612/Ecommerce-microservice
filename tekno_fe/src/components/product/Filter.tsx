import { SlidersHorizontal } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Brand } from "@/type/brand";
import { getBrandList } from "@/services/brand";
import { Slider } from "../ui/slider";
import {
  getCategoryAttributes,
  getCategoryAttributesForFilter,
} from "@/services/categories";
import { CategoryAttribute } from "@/type/categories";

export default function Filter({
  selectedBrands,
  minPrice,
  maxPrice,
  onBrandChange,
  onMinPriceChange,
  onMaxPriceChange,
  categorySlug, // optional: id category để load attributes
  onAttributesChange, // optional callback nhận filters hiện tại
}: {
  selectedBrands?: string[];
  minPrice?: number;
  maxPrice?: number;
  onBrandChange: (value: string[]) => void;
  onMinPriceChange: (value: number) => void;
  onMaxPriceChange: (value: number) => void;
  categorySlug?: string;
  onAttributesChange?: (filters: Record<string, string[]>) => void;
}) {
  const [brandList, setbrandList] = useState<Brand[]>([]);
  // priceRange hiển thị theo đơn vị "nghìn" (x1000 VNĐ)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);

  // DYNAMIC ATTRIBUTES
  const [attributes, setAttributes] = useState<CategoryAttribute[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string[]>
  >({});

  // Đồng bộ giá trị ban đầu từ props -> input theo đơn vị nghìn
  useEffect(() => {
    const minK = Math.max(0, Math.floor((minPrice ?? 0) / 1000));
    const maxK = Math.max(0, Math.floor((maxPrice ?? 0) / 1000));
    setPriceRange([minK, maxK]);
  }, [minPrice, maxPrice]);

  useEffect(() => {
    async function fetchBrandList() {
      const data = await getBrandList();
      setbrandList(data.data);
    }
    fetchBrandList();
  }, []);

  // fetch attributes khi categoryId thay đổi
  useEffect(() => {
    if (!categorySlug) {
      setAttributes([]);
      return;
    }
    let mounted = true;
    (async () => {
      try {
        const attrs = await getCategoryAttributesForFilter(categorySlug);
        if (mounted) setAttributes(attrs || []);
      } catch (err) {
        console.error("Failed to load category attributes", err);
        if (mounted) setAttributes([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [categorySlug]);

  // toggle giá trị attribute
  const toggleAttributeValue = (
    attrName: string,
    value: string,
    checked: boolean
  ) => {
    setSelectedAttributes((prev) => {
      const cur = new Set(prev[attrName] || []);
      if (checked) cur.add(value);
      else cur.delete(value);

      const next = { ...prev, [attrName]: Array.from(cur) };
      onAttributesChange?.(next); // notify parent
      return next;
    });
  };

  const clearAll = () => {
    setSelectedAttributes({});
    setPriceRange([0, 0]);
    onBrandChange([]);
    onMinPriceChange(0);
    onMaxPriceChange(0);
    onAttributesChange?.({});
  };

  return (
    <div>
      <aside className="lg:col-span-1">
        <div className="bg-[#111111] border border-gray-800 shadow-xl rounded-2xl p-6 sticky top-28">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-800">
            <h3 className="flex items-center gap-3 text-lg font-bold text-white tracking-wide">
              <SlidersHorizontal className="w-5 h-5 text-primary" />
              Filters
            </h3>
            <button
              className="text-sm text-primary hover:text-primary/80 transition-colors hover:underline"
              onClick={clearAll}
            >
              Clear All
            </button>
          </div>

          <Accordion type="multiple" defaultValue={["brand", "price"]}>
            {/* brand */}
            <AccordionItem value="brand" className="border-b border-gray-800">
              <AccordionTrigger className="text-white hover:text-primary font-bold text-base py-4 transition-colors">
                Brand
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-4 pt-2 pb-4">
                  {brandList.map((brand) => (
                    <div
                      key={brand.id}
                      className="flex items-center space-x-3 group cursor-pointer"
                    >
                    <Checkbox
                      id={brand.id.toString()}
                      checked={(selectedBrands || []).includes(brand.slug)}
                      onCheckedChange={(checked) => {
                        const current = selectedBrands || [];
                        if (checked) {
                          onBrandChange([...current, brand.slug]);
                        } else {
                          onBrandChange(current.filter((b) => b !== brand.slug));
                        }
                      }}
                    />
                      <Label 
                        htmlFor={brand.id.toString()}
                        className="text-gray-200 group-hover:text-white cursor-pointer transition-colors text-[15px] font-medium"
                      >
                        {brand.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* price */}
            <AccordionItem value="price" className="border-b border-gray-800">
              <AccordionTrigger className="text-white hover:text-primary font-bold text-base py-4 transition-colors">
                Price Range
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex items-center justify-between gap-3 pt-2 pb-4">
                  <div className="flex items-center gap-1 relative w-full">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={priceRange[0]}
                      onChange={(e) => {
                        const vK = Math.max(0, Number(e.target.value) || 0);
                        setPriceRange([vK, priceRange[1]]);
                        onMinPriceChange(vK * 1000); // emit theo VNĐ
                      }}
                      className="w-full bg-[#222222] border border-gray-700 text-white rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-inner"
                      placeholder="min"
                    />
                    <span className="absolute right-2 text-[10px] text-gray-500 font-medium">.000đ</span>
                  </div>

                  <span className="text-gray-500 font-bold">—</span>

                  <div className="flex items-center gap-1 relative w-full">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={priceRange[1]}
                      onChange={(e) => {
                        const vK = Math.max(0, Number(e.target.value) || 0);
                        setPriceRange([priceRange[0], vK]);
                        onMaxPriceChange(vK * 1000); // emit theo VNĐ
                      }}
                      className="w-full bg-[#222222] border border-gray-700 text-white rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-inner"
                      placeholder="max"
                    />
                    <span className="absolute right-2 text-[10px] text-gray-500 font-medium">.000đ</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* dynamic attributes */}
            {attributes.map((attr) => (
              <AccordionItem key={attr.name} value={attr.name} className="border-b border-gray-800">
                <AccordionTrigger className="text-white hover:text-primary font-bold text-base py-4 transition-colors uppercase tracking-wider text-xs">
                  {attr.name}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-4 pt-2 pb-4">
                    {attr.values?.map((val) => (
                      <div key={val} className="flex items-center gap-3 group cursor-pointer">
                        <Checkbox
                          id={`${attr.name}-${val}`}
                          checked={(
                            selectedAttributes[attr.name] || []
                          ).includes(val)}
                          onCheckedChange={(checked) =>
                            toggleAttributeValue(
                              attr.name,
                              val,
                              Boolean(checked)
                            )
                          }
                        />
                        <Label 
                          htmlFor={`${attr.name}-${val}`}
                          className="text-gray-200 group-hover:text-white cursor-pointer transition-colors text-[15px] font-medium"
                        >
                          {val}
                        </Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </aside>
    </div>
  );
}
