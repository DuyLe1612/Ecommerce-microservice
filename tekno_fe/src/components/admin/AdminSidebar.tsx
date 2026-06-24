"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  ShoppingBag,
  Pen,
  TicketSlash,
  Megaphone,
  Star,
  MessageCircle,
} from "lucide-react";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={22} /> },
  { href: "/dashboard/products", label: "Products", icon: <Package size={22} /> },
  { href: "/dashboard/catalog", label: "Vouchers", icon: <TicketSlash size={22} /> },
  { href: "/dashboard/orders", label: "Orders", icon: <ShoppingBag size={22} /> },
  { href: "/dashboard/blog", label: "Blog", icon: <Pen size={22} /> },
  { href: "/dashboard/brand", label: "Brand", icon: <Star size={22} /> },
  { href: "/dashboard/category", label: "Category", icon: <ClipboardList size={22} /> },
  { href: "/dashboard/advertisement", label: "Advertisement", icon: <Megaphone size={22} /> },
  { href: "/dashboard/reviews", label: "Reviews", icon: <MessageCircle size={22} /> },
];

const AdminSidebar = () => {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <aside
      className={`bg-black/20 backdrop-blur-md border-r border-white/10 flex flex-col transition-all duration-300 ${
        isExpanded ? "w-64" : "w-20"
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Menu items */}
      <nav className="mt-8 flex flex-col gap-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 py-3.5 transition-all ${
                isExpanded ? "px-6" : "px-6 justify-center"
              } ${
                isActive
                  ? "text-primary border-l-4 border-primary bg-primary/20 shadow-[inset_4px_0_15px_rgba(255,213,0,0.15)] font-semibold"
                  : "text-gray-400 hover:text-primary hover:bg-white/5"
              }`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span
                className={`text-base whitespace-nowrap transition-all duration-300 ${
                  isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;