import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import LoginForm from "../../auth/LoginForm";
import SignUpForm from "../../auth/SignUpForm";
import { Button } from "@/components/ui/button";

export default function SignIn() {
  const [mode, setMode] = useState<"login" | "register">("login");
  return (
    // <button className="text-lg font-semibold text-gray-500 hover:text-black hover:cursor-pointer hoverEffect">
    //   Sign In
    // </button>
    <>
      <Dialog>
        <div className="flex items-center justify-center gap-3">
          <DialogTrigger asChild>
            <button
              onClick={() => setMode("login")}
              className="px-2 py-1.5 text-sm font-semibold text-gray-300 hover:text-primary hover:scale-105 transition-all duration-200 ease-out focus:outline-none"
            >
              Login
            </button>
          </DialogTrigger>

          {/* Divider */}
          <span className="h-4 w-px bg-gray-700" />

          <DialogTrigger asChild>
            <button
              onClick={() => setMode("register")}
              className="px-2 py-1.5 text-sm font-semibold text-gray-300 hover:text-primary hover:scale-105 transition-all duration-200 ease-out focus:outline-none"
            >
              Signup
            </button>
          </DialogTrigger>
        </div>

        <DialogContent
          className="bg-[#111111] border border-gray-800 text-white rounded-3xl p-0 overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] sm:max-w-md"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogTitle className="sr-only">
            {mode === "login" ? "Login" : "Sign Up"}
          </DialogTitle>
          {/* <AuthModal mode={mode} /> */}
          {mode === "login" ? (
            <LoginForm switchToRegister={() => setMode("register")} />
          ) : (
            <SignUpForm switchToLogin={() => setMode("login")} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
