"use client";
import { Blog } from "@/type/blog";
import { Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";

export default function BlogCard({
  blog,
  type,
}: {
  blog: Blog;
  type?: "horizontal" | "vertical";
}) {
  return (
    <Link href={`/blogs/${blog.slug}`} className="flex space-x-4 w-fit group">
      <div
        className={`flex ${
          type === "horizontal" ? "flex-row" : "flex-col"
        } gap-4`}
      >
        {/* Motion wrapper for image: subtle hover scale + fade-in */}
        <motion.div
          className={`w-full ${
            type === "vertical" ? "h-55" : "max-w-60 min-w-30"
          }`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.03 }}
          transition={{
            type: "spring",
            stiffness: 240,
            damping: 20,
            mass: 0.6,
          }}
        >
          <Image
            src={blog.featuredImageUrl}
            alt={blog.title}
            width={200}
            height={80}
            className={`object-cover rounded-xl w-full ${
              type === "vertical" ? "h-55" : "h-auto"
            }`}
            priority={false}
          />
        </motion.div>

        <div
          className={`flex flex-col ${type === "horizontal" ? "my-auto" : ""}`}
        >
          <div className="text-xs text-primary font-medium tracking-wide uppercase mb-1" suppressHydrationWarning>
            <Calendar className="inline-block mr-1.5 mb-0.5" size={14} />
            {new Date(blog.createdAt).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric" })}
          </div>
          <div className="font-bold text-xl line-clamp-2 text-gray-100 group-hover:text-primary transition-colors leading-snug">
            {blog.title}
          </div>
          <div className="text-sm text-gray-400 line-clamp-3 mt-2 leading-relaxed">
            {blog.summary}
          </div>
          <div className="text-primary font-semibold text-sm mt-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            Read more <span className="text-lg leading-none">&rarr;</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
