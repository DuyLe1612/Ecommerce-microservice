import RecentReports from "@/components/blog/RecentReports";
import { Container } from "@/components/MainLayout/Container";
import ProductCard from "@/components/product/ProductCard";
import { Breadcrumb } from "@/components/share/breadcumbCustom";
import Title from "@/components/share/Title";
import { getBlogDetail, getBlogsRecent } from "@/services/blogs";
import { fromListItem } from "@/lib/productAdapter";
import Image from "next/image";
import React from "react";

export default async function BlogDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = await getBlogDetail(slug);
  // const blog = {
  //   id: 5,
  //   title: "Tablet giá r? ?áng mua 2025: Xiaomi Pad 6 vs iPad Air M2",
  //   slug: "tablet-gia-re-dang-mua-2025",
  //   summary:
  //     "So sánh hai chi?c tablet t?m trung hot nh?t: Xiaomi Pad 6 giá ch? 8,990,000 VND và iPad Air M2 giá 16,990,000 VND. ?âu là l?a ch?n phù h?p v?i b?n?",
  //   featuredImageUrl: "https://www.gstatic.com/webp/gallery/5.jpg",
  //   authorName: "",
  //   status: "Published",
  //   viewCount: 520,
  //   publishedAt: "2025-01-15T09:00:00Z",
  //   createdAt: "2025-01-14T18:30:00Z",
  //   tags: ["ipad", "xiaomi", "budget", "tablet", "comparison"],
  // };

  return (
    <Container className="flex flex-col space-y-5 my-10">
      <Breadcrumb />
      <div className="flex gap-10">
        <div className="w-3/4 flex flex-col space-y-5">
          <Title title={blog.title} />

          <div>
            {" "}
            by {blog.authorName} on{" "}
            {new Date(blog.createdAt).toLocaleString("vi-VN")}{" "}
          </div>

          <Image
            src={blog.featuredImageUrl}
            alt={blog.title}
            width={400}
            height={200}
            className="w-full h-auto rounded-md"
          />
          <div dangerouslySetInnerHTML={{ __html: blog.content }} />
        </div>
        <div className="w-1/4 gap-5 flex flex-col">
          <RecentReports />
          <div className="flex flex-col space-y-2 ">
            <p className="text-xl font-bold">Tags</p>
            <div className="flex flex-wrap gap-2">
              {blog.tags?.map((tag) => (
                <div
                  key={tag}
                  className="py-2 px-5 border border-primary-900 rounded-lg"
                >
                  {tag}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div>Related Product</div>

      <div className="grid grid-cols-3 gap-5">
        {blog.relatedProducts?.map((p) => (
          <ProductCard key={p.id} product={fromListItem(p as any)} />
        ))}
      </div>
    </Container>
  );
}
