"use client";
import React, { useState } from "react";
import { Search, ShoppingBasket, UserRound } from "lucide-react";
import { usePathname } from "next/navigation";

import { useAuth } from "@/hook/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Container } from "../Container";
import Logo from "./Logo";
import HeaderMenu from "./HeaderMenu";
import SearchBar from "./SearchBar";
import CartIcon from "./CartIcon";
import SignIn from "./SignIn";
import MobileMenu from "./MobileMenu";
import ProfileMenu from "../ProfileMenu";
import Link from "next/link";

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  return (
    <header className="bg-[#050505]/80 border-b border-gray-800 py-4 sticky top-0 z-50 backdrop-blur-md shadow-sm transition-all duration-300">
      <Container className="flex items-center justify-between">
        {/* logo */}
        <div className="flex-1 flex items-center justify-start gap-3">
          <MobileMenu />
          <Logo className="hidden md:inline-flex" />
        </div>

        {/* NavButton */}
        <div className="flex-none hidden lg:flex justify-center">
          <HeaderMenu />
        </div>
        {/* NavAdmin */}
        <div className="flex-1 flex items-center justify-end gap-5">
          <SearchBar />
          <CartIcon />

          {/* {!user ? <SignIn /> : <UserRound />} */}
          {/* USER MENU DROPDOWN */}
          <div className="relative group">
            {!user ? (
              <SignIn />
            ) : (
              <>
                <Link href="/account/personal-data" className="w-10 h-10 rounded-full flex items-center justify-center text-gray-300 hover:text-primary hover:bg-[#1a1a1a] transition-all duration-300 focus:outline-none">
                  <UserRound className="w-5 h-5" />
                </Link>

                {/* Dropdown */}
                <div
                  className="
          absolute right-0 top-full pt-4
          hidden group-hover:block
        "
                >
                  <ProfileMenu />
                </div>
              </>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
};

export default Header;
