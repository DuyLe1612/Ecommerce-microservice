"use client";

import React, { useState } from "react";

import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext"; // ✅ thêm dòng này
import { Field, FieldError, FieldGroup, FieldSet } from "../ui/field";
import { Input } from "../ui/input";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../ui/input-group";
import { EyeClosed, Eye, Key, MailIcon } from "lucide-react";
import { toast } from "sonner";

type LoginFormProps = {
  switchToRegister: () => void;
};

export default function LoginForm({ switchToRegister }: LoginFormProps) {
  const router = useRouter();
  const { login, isAdmin, user } = useAuthContext(); // ✅ gọi login từ context

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const user = await login(email, password); // ✅ user trả về ngay dữ liệu đúng
      toast.success("Login successful!");

      if (user && user.role.toLowerCase() === "admin")
        router.push("/dashboard");
      else router.push("/");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 px-8 py-10 relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] pointer-events-none rounded-full"></div>
      
      <div className="space-y-2 text-center mb-8 relative z-10">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Welcome back
        </h2>
        <p className="text-gray-400 text-sm">
          Log in to your Tekno account to continue
        </p>
      </div>

      <FieldSet className="relative z-10 space-y-4">
        <FieldGroup className="space-y-4">
          {/* email */}
          <Field>
            <InputGroup className="border-gray-800 bg-[#1a1a1a] rounded-xl overflow-hidden focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all">
              <InputGroupAddon className="bg-transparent border-none pl-4">
                <MailIcon className="w-5 h-5 text-gray-500" />
              </InputGroupAddon>
              <InputGroupInput
                type="email"
                id="email"
                name="email"
                autoComplete="off"
                placeholder="Enter your email"
                className="bg-transparent text-white border-none focus:ring-0 placeholder:text-gray-600 py-3"
              />
            </InputGroup>
          </Field>
          {/* password */}
          <Field>
            <InputGroup className="border-gray-800 bg-[#1a1a1a] rounded-xl overflow-hidden focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all">
              <InputGroupAddon className="bg-transparent border-none pl-4">
                <Key className="w-5 h-5 text-gray-500" />
              </InputGroupAddon>
              <InputGroupInput
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                autoComplete="off"
                placeholder="Your Password"
                className="bg-transparent text-white border-none focus:ring-0 placeholder:text-gray-600 py-3"
              />
              <InputGroupAddon align="inline-end" className="bg-transparent border-none pr-2">
                <InputGroupButton
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide" : "Show"}
                  size="icon-xs"
                  onClick={() => setShowPassword((v) => !v)}
                  type="button"
                  className="text-gray-400 hover:text-white bg-transparent hover:bg-gray-800 rounded-lg"
                >
                  {showPassword ? <Eye className="w-4 h-4" /> : <EyeClosed className="w-4 h-4" />}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </Field>
        </FieldGroup>
        <FieldError className="text-red-400 text-sm">{error}</FieldError>
      </FieldSet>

      <div className="flex justify-end relative z-10">
        <span className="text-sm text-gray-400 hover:text-primary cursor-pointer transition-colors hover:underline underline-offset-4">
          Forgot password?
        </span>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="relative z-10 mt-6 w-full bg-primary hover:bg-yellow-400 text-black font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(255,213,0,0.2)] hover:shadow-[0_0_25px_rgba(255,213,0,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
      
      <p className="text-sm text-center text-gray-400 mt-6 relative z-10">
        Don't have an account?{" "}
        <span
          className="text-primary font-semibold cursor-pointer hover:underline underline-offset-4"
          onClick={switchToRegister}
        >
          Sign up now
        </span>
      </p>
    </form>
  );
}
