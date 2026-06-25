import React from "react";
import { LockKeyhole } from "lucide-react";
import SignIn from "../MainLayout/Header/SignIn";

export default function NoAccess({
  detail = "Log in to view your cart items and checkout. Don't miss out on your favorite products.",
}: {
  detail?: string;
}) {
  return (
    <div className="flex items-center justify-center py-16 md:py-32 p-4 w-full relative">
      <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full pointer-events-none w-3/4 h-3/4 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="bg-[#111111]/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] p-8 md:p-12 max-w-lg w-full flex flex-col items-center gap-6 relative z-10">
        
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 mb-2">
          <LockKeyhole size={36} className="text-primary" />
        </div>

        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Authentication Required
          </h2>
          <p className="text-white/60 leading-relaxed text-center">
            {detail}
          </p>
        </div>

        <div className="w-full mt-4">
          <SignIn />
        </div>
      </div>
    </div>
  );
}
