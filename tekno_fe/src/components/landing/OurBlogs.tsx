"use client";
import { ChevronRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Blog } from "@/type/blog";
import BlogCard from "../blog/BlogCard";
import { getBlogsList } from "@/services/blogs";

export default function OurBlogs() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getBlogsList(1, 4)
      .then((res) => {
        if (!mounted) return;
        const list: Blog[] = res?.data ?? [];
        setBlogs(list.slice(0, 4));
      })
      .catch((err) => {
        console.error("OurBlogs fetch error:", err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  if (loading)
    return <div className="py-4 text-sm text-gray-500">Loading blogs…</div>;

  return (
    <div className="flex flex-col gap-5">
      <div className="border-b border-gray-500 flex items-center justify-between pb-2">
        <div className="font-semibold text-2xl">Our Blogs</div>
        <button
          className="flex items-center gap-2 hoverEffect mx-10 hover:cursor-pointer"
          onClick={() => router.push("/blogs")}
        >
          View all <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      {blogs.length === 0 ? (
        <div className="py-4 text-sm text-gray-400">Không có bài viết nào.</div>
      ) : (
        <div className="grid grid-col-2 md:grid-cols-4 gap-5">
          {blogs.map((blog) => (
            <BlogCard type="vertical" blog={blog} key={blog.id} />
          ))}
        </div>
      )}
    </div>
  );
}
