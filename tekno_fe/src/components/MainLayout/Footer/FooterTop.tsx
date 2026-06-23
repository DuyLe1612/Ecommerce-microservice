import { Phone } from "lucide-react";
import React from "react";

interface ServiceData {
  text: string;
  icon: React.ReactNode;
}

const data: ServiceData[] = [
  {
    text: "Latest and Greatest Tech",
    icon: (
      <Phone className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
    ),
  },
  {
    text: "Guarantee",
    icon: (
      <Phone className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
    ),
  },
  {
    text: "Free Shipping over 1000$",
    icon: (
      <Phone className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
    ),
  },
  {
    text: "24/7 Support",
    icon: (
      <Phone className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
    ),
  },
];
export default function FooterTop() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-[#111111] border border-gray-800 p-8 rounded-3xl mt-16 shadow-lg relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[80px] pointer-events-none" />

      {data?.map((item, index) => (
        <div
          key={index}
          className="flex flex-col items-center justify-center text-center gap-4 group hover:bg-[#1a1a1a] rounded-2xl py-6 px-4 transition-all relative z-10"
        >
          <div className="bg-primary/10 p-4 rounded-full group-hover:bg-primary/20 transition-all">
            {item.icon}
          </div>
          <span className="font-semibold text-gray-300 group-hover:text-primary transition-colors">
            {item?.text}
          </span>
        </div>
      ))}
    </div>
  );
}
