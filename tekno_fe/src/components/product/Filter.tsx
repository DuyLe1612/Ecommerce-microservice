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
  selectedBrand,
  minPrice,
  maxPrice,
  onBrandChange,
  onMinPriceChange,
  onMaxPriceChange,
  categorySlug, // optional: id category để load attributes
  onAttributesChange, // optional callback nhận filters hiện tại
}: {
  selectedBrand?: string;
  minPrice?: number;
  maxPrice?: number;
  onBrandChange: (value: string) => void;
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
    // reset lại giá trị ban đầu cho priceRange
    setPriceRange([0, 0]);
    onBrandChange("");
    onMinPriceChange(0);
    onMaxPriceChange(0);
    onAttributesChange?.({});
  };

  return (
    <div>
      <aside className="lg:col-span-1">
        <div className="bg-white rounded-lg p-6 sticky top-24">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5" />
              Filters
            </h3>
            <button
              className="text-sm text-secondary hover:underline"
              onClick={clearAll}
            >
              Clear All
            </button>
          </div>

          <Accordion type="multiple" defaultValue={["brand", "price"]}>
            {/* brand */}
            <AccordionItem value="brand">
              <AccordionTrigger>Brand</AccordionTrigger>
              <AccordionContent>
                {brandList.map((brand) => (
                  <div
                    key={brand.id}
                    className="flex items-center space-x-2 space-y-2"
                  >
                    <Checkbox
                      id={brand.id.toString()}
                      checked={selectedBrand === brand.slug}
                      onCheckedChange={(checked) =>
                        onBrandChange(checked ? brand.slug : "")
                      }
                    />
                    <Label htmlFor={brand.id.toString()}>{brand.name}</Label>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>

            {/* price */}
            <AccordionItem value="price">
              <AccordionTrigger>Price</AccordionTrigger>
              <AccordionContent>
                {/* Chỉ dùng 2 ô input; mỗi giá trị nhập vào sẽ * 1000 VNĐ khi emit ra ngoài */}
                <div className="flex flex-col items-center justify-center gap-2 pb-4">
                  <div className="flex items-center gap-1">
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
                      className="w-24 border rounded-md px-2 py-1 text-lg text-center"
                      placeholder="min (x1000)"
                    />
                    <span className="text-xs text-gray-500">.000 </span>
                  </div>

                  <span className="text-gray-400">—</span>

                  <div className="flex items-center gap-1">
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
                      className="w-24 border rounded-md px-2 py-1 text-lg text-center"
                      placeholder="max (x1000)"
                    />
                    <span className="text-xs text-gray-500">.000</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* dynamic attributes */}
            {attributes.map((attr) => (
              <AccordionItem key={attr.name} value={attr.name}>
                <AccordionTrigger>{attr.name}</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-2">
                    {attr.values?.map((val) => (
                      <div key={val} className="flex items-center gap-2">
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
                        <Label htmlFor={`${attr.name}-${val}`}>{val}</Label>
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
