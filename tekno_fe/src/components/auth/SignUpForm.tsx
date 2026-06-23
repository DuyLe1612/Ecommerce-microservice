"use client";

import React, { useState } from "react";
import { signupApi } from "@/services/auth";
import { toast } from "sonner";
import {
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Field } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { KeyIcon, MailIcon, UserRound } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { FieldLabel } from "../ui/field";

type SignupFormProps = {
  switchToLogin: () => void;
};

export default function SignUpForm({ switchToLogin }: SignupFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await signupApi({ username, email, password });
      toast.success("Account created successfully! Please log in.");
      switchToLogin();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 px-8 py-10 relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] pointer-events-none rounded-full"></div>

      <div className="space-y-2 text-center mb-8 relative z-10">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Create Account
        </h2>
        <p className="text-gray-400 text-sm">
          Join Tekno and start shopping today
        </p>
      </div>

      <FieldSet className="relative z-10 space-y-4">
        <FieldGroup className="space-y-4">
          <Field>
            <InputGroup className="border-gray-800 bg-[#1a1a1a] rounded-xl overflow-hidden focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all">
              <InputGroupAddon className="bg-transparent border-none pl-4">
                <UserRound className="w-5 h-5 text-gray-500" />
              </InputGroupAddon>
              <InputGroupInput
                id="username"
                type="text"
                name="username"
                autoComplete="off"
                placeholder="Your username"
                className="bg-transparent text-white border-none focus:ring-0 placeholder:text-gray-600 py-3"
              />
            </InputGroup>
          </Field>
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
          <Field>
            <InputGroup className="border-gray-800 bg-[#1a1a1a] rounded-xl overflow-hidden focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all">
              <InputGroupAddon className="bg-transparent border-none pl-4">
                <KeyIcon className="w-5 h-5 text-gray-500" />
              </InputGroupAddon>
              <InputGroupInput
                type="password"
                id="password"
                name="password"
                autoComplete="off"
                placeholder="Your Password"
                className="bg-transparent text-white border-none focus:ring-0 placeholder:text-gray-600 py-3"
              />
            </InputGroup>
          </Field>
          <Field orientation="horizontal" className="pt-2">
            <Checkbox id="checkout-7j9-same-as-shipping-wgm" defaultChecked className="border-gray-600 data-[state=checked]:bg-primary data-[state=checked]:text-black mt-0.5" />
            <FieldLabel
              htmlFor="checkout-7j9-same-as-shipping-wgm"
              className="font-normal text-sm text-gray-400 cursor-pointer"
            >
              I agree to all Terms & Conditions
            </FieldLabel>
          </Field>
        </FieldGroup>
        <FieldError className="text-red-400 text-sm">{error}</FieldError>
      </FieldSet>

      <button
        type="submit"
        disabled={loading}
        className="relative z-10 mt-6 w-full bg-primary hover:bg-yellow-400 text-black font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(255,213,0,0.2)] hover:shadow-[0_0_25px_rgba(255,213,0,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
      >
        {loading ? "Creating..." : "Create Account"}
      </button>
      
      <p className="text-sm text-center text-gray-400 mt-6 relative z-10">
        Already have an account?{" "}
        <span
          className="text-primary font-semibold cursor-pointer hover:underline underline-offset-4"
          onClick={switchToLogin}
        >
          Log in
        </span>
      </p>
    </form>
  );
}
