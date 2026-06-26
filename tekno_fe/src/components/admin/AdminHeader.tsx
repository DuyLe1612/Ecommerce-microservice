// src/components/admin/AdminHeader.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import logo from "@/asset/MainLogo.png";
import { Search, User, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/hook/useAuth";

const AdminHeader = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-black/20 backdrop-blur-md border-b border-white/10 px-6 h-16 flex items-center justify-between sticky top-0 z-50">
      {/* Logo và Text */}
      <div className="flex items-center gap-3">
        <Image src={logo} alt="Tekno Logo" className="w-10 h-10" />
        <span className="text-2xl font-bold text-primary">Tekno</span>
      </div>

      {/* Right side - Search và User info */}
      <div className="flex items-center gap-6">
        {/* Search Icon */}
        <button className="text-gray-400 hover:text-primary transition">
          <Search size={20} />
        </button>

        {/* User Info */}
        <div className="relative" ref={dropdownRef}>
          <div
            className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="bg-white/10 p-1.5 rounded-full border border-white/10">
              <User size={18} className="text-primary" />
            </div>
            <span className="text-gray-300 select-none">
              Hello, <span className="text-primary font-semibold">{user?.username || user?.email || "admin"}</span>
            </span>
            <ChevronDown size={16} className={`text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
          </div>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[#121212] backdrop-blur-md border border-white/10 rounded-xl shadow-2xl py-2 z-50">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
