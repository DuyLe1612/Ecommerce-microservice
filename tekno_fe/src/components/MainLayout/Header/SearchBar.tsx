import SearchModal from "@/components/landing/SearchModal";
import { Search } from "lucide-react";
import React, { useState } from "react";

export default function SearchBar() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button 
        onClick={() => setOpen(true)}
        className="w-10 h-10 rounded-full flex items-center justify-center text-gray-300 hover:text-primary hover:bg-[#1a1a1a] transition-all duration-300 focus:outline-none"
      >
        <Search className="w-5 h-5" />
      </button>
      <SearchModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
