"use client";

import { useEffect, useState } from "react";

type ProductSpecificationsProps = {
  productId?: number;
  categoryId?: number;
  initialSpecs?: ProductSpec[];
  onChange: (specs: ProductSpec[]) => void;
};

type ProductSpec = {
  attributeId: number;
  attributeName: string;
  values: string[];
};

export default function ProductSpecifications({
  productId,
  categoryId,
  initialSpecs = [],
  onChange,
}: ProductSpecificationsProps) {
  const [specifications, setSpecifications] = useState<ProductSpec[]>(initialSpecs);

  // Sync initial specs
  useEffect(() => {
    setSpecifications(initialSpecs);
  }, [initialSpecs]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg text-gray-100">Product Specifications</h3>
      </div>

      {/* Specifications List - Read Only */}
      {specifications.length === 0 ? (
        <div className="p-8 border border-white/10 rounded bg-black/20 text-center text-gray-400 shadow-sm">
          No specifications.
        </div>
      ) : (
        <div className="space-y-4">
          {specifications.map((spec, idx) => (
            <div key={`spec-${idx}`} className="border border-white/10 rounded-lg p-4 bg-black/20 shadow-sm">
              <h4 className="font-semibold text-base mb-3 text-gray-100">{spec.attributeName}</h4>
              
              <div>
                <label className="text-xs text-gray-400 block mb-2">Values:</label>
                {spec.values.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-2">No values</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {spec.values.map((value, idx) => (
                      <div key={idx} className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-full text-sm shadow-sm">
                        {value}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}