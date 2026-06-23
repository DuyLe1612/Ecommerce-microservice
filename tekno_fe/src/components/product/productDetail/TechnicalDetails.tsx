"use client";
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
export default function TechnicalDetails({
  specs,
}: {
  specs: { name: string; value: string[] }[];
}) {
  const [showAll, setShowAll] = useState(false);
  const visibleSpecs = showAll ? specs : specs.slice(0, 5);

  return (
    <div className="flex flex-col gap-4 mt-8">
      <div className="font-extrabold text-2xl text-white tracking-tight">Technical Details</div>
      <div className="border border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <Table>
        {/* Chỉ hiện nút Show more nếu có hơn 5 dòng */}
        {specs.length > 5 && (
          <TableCaption>
            {!showAll ? (
              <button
                onClick={() => setShowAll(true)}
                className="text-blue-600 hover:underline"
              >
                Show more
              </button>
            ) : (
              <button
                onClick={() => setShowAll(false)}
                className="text-primary hover:text-primary/80 transition-colors font-medium hover:underline"
              >
                Show less
              </button>
            )}
          </TableCaption>
        )}

        <TableBody className="[&_tr:nth-child(odd)]:bg-[#111111] [&_tr:nth-child(even)]:bg-[#1a1a1a] [&_tr]:border-gray-800">
          {visibleSpecs.map((spec, index) => (
            <TableRow key={index} className="hover:bg-[#222222] transition-colors border-gray-800">
              {/* Cột 1: tên spec + màu xám + dấu chấm đầu dòng */}
              <TableCell className="w-2/6 p-4 font-semibold text-gray-300 border-r border-gray-800/50">{spec.name}</TableCell>

              {/* Cột 2: value (array) → join thành chuỗi */}
              <TableCell className="w-4/6 p-4 text-gray-400">
                {Array.isArray(spec.value) ? spec.value.join(", ") : spec.value}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}
