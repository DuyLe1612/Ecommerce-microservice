"use client";

import AccountMenu from "@/components/account/AccountMenu";
import SignUpForm from "@/components/auth/SignUpForm";
import { Container } from "@/components/MainLayout/Container";
import SignIn from "@/components/MainLayout/Header/SignIn";
import { Breadcrumb } from "@/components/share/breadcumbCustom";
import { useAuth } from "@/hook/useAuth";
import { Lock, LogIn, ShieldX } from "lucide-react";
import Link from "next/link";
import React, { use } from "react";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  if (!user) {
    // no access view
    return (
      <Container className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
        <div className="text-center space-y-6 bg-[#111111] p-10 rounded-3xl border border-gray-800 shadow-[0_10px_40px_rgba(0,0,0,0.5)] relative overflow-hidden group max-w-md w-full">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-[80px] pointer-events-none rounded-full"></div>
          
          <div className="mx-auto w-24 h-24 bg-[#1a1a1a] border border-gray-800 rounded-full flex items-center justify-center relative shadow-[0_0_30px_rgba(239,68,68,0.05)]">
            <ShieldX className="w-12 h-12 text-red-500 opacity-80" />
          </div>
          
          <div className="space-y-3 relative z-10">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Access Denied</h1>
            <p className="text-gray-400 leading-relaxed px-4">
              You need to be logged in to access your account dashboard. Please
              sign in to continue.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10 pt-4">
            <SignIn />
          </div>

          <div className="text-sm text-gray-500 relative z-10 pt-2">
            <Link href="/" className="text-gray-400 hover:text-primary transition-colors hover:underline underline-offset-4">
              Back to home
            </Link>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="flex flex-col space-y-5 my-10">
      <Breadcrumb />
      <div className="flex gap-2">
        <div className="w-1/4 hidden md:inline-flex">
          <AccountMenu />
        </div>
        <main className="w-full md:w-3/4">{children}</main>
      </div>
    </Container>
  );
}
