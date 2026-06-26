import Link from "next/link";
import React from "react";
import logo from "../../../asset/MainLogo.png";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function Logo({ className }: { className?: string }) {
  return (
    <Link href={"/"}>
      <Image
        src={logo}
        alt="Logo"
        priority
        className={cn("w-10 lg:w-12 hoverEffect", className)}
      />
    </Link>

    //   {/*  */}
  );
}
