import React from "react";

export default function TitleAccount({
  title,
  des,
}: {
  title: string;
  des: string;
}) {
  return (
    <div className="flex flex-col mb-2">
      <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">{title}</h2>
      <p className="text-gray-400 mt-1.5 text-sm md:text-base">{des}</p>
    </div>
  );
}
