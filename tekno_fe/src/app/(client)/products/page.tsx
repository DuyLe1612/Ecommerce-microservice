"use client";
import React, { Suspense, useEffect, useState } from "react";
import { Grid3x3, List, ChevronDown, Loader2, Search } from "lucide-react";
import Filter from "@/components/product/Filter";
import ProductCard from "@/components/product/ProductCard";
import { ProductCard as ProductCardType } from "@/type/product";
import { Breadcrumb } from "@/components/share/breadcumbCustom";
import { Container } from "@/components/MainLayout/Container";
import { getProductsList } from "@/services/products";
import { fromListItem } from "@/lib/productAdapter";

import { AnimatePresence, motion } from "motion/react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Category } from "@/type/categories";
import NoProductAvailable from "@/components/product/NoProductAvailable";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { CategoryTabs } from "@/components/product/CategoryTabs";
import FilterChips from "@/components/product/FilterChips";

function ProductContent() {
  const [loading, setLoading] = useState(false);
  const [productsList, setproductsList] = useState<ProductCardType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("created_desc");
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>();
  const [filters, setFilters] = useState<Record<string, string[]>>({});

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalRecords, setTotalRecords] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const router = useRouter();
  const searchParams = useSearchParams();
  const queryCategory = searchParams.get("category") || "";
  const queryKeyword = searchParams.get("q") || "";
  console.log(queryCategory);

  const [keyword, setKeyword] = useState<string>(queryKeyword);

  const handleAttributesChange = (attrs: Record<string, string[]>) => {
    setFilters(attrs);
    setPage(1); // reset page khi filter thay đổi
  };

  useEffect(() => {
    if (queryCategory) {
      setSelectedCategory(queryCategory);
    }
  }, [queryCategory]);

  useEffect(() => {
    if (queryKeyword) {
      setKeyword(queryKeyword);
    }
  }, [queryKeyword]);
  useEffect(() => {
    const fecthProductList = async () => {
      setLoading(true);
      try {
        let backendSortBy = "createdAt";
        let backendSortDir = "DESC";
        if (sortBy === "price_asc") {
          backendSortBy = "basePrice";
          backendSortDir = "ASC";
        } else if (sortBy === "price_desc") {
          backendSortBy = "basePrice";
          backendSortDir = "DESC";
        } else if (sortBy === "rating_desc") {
          backendSortBy = "averageRating";
          backendSortDir = "DESC";
        }
        
        const res = await getProductsList({
          categorySlug: selectedCategory,
          page: page,
          size: pageSize,
          sortBy: backendSortBy,
          sortDir: backendSortDir,
          brandSlug: selectedBrands.length > 0 ? selectedBrands.join(",") : undefined,
          maxPrice: maxPrice,
          minPrice: minPrice,
          // filters: filters, // filters logic isn't easily supported without dynamic properties but we send it if supported. Let's omit for now since backend doesn't take attrs
          keyword,
        });
        const products = res.content ? res.content.map(fromListItem) : [];
        setproductsList(products);
        setTotalRecords(res.totalElements || 0);
        setTotalPages(res.totalPages || 1);
      } catch (error) {
        console.error("Product fetch error", error);
      } finally {
        setLoading(false);
      }
    };
    fecthProductList();
  }, [
    selectedCategory,
    page,
    pageSize,
    sortBy,
    selectedBrands,
    minPrice,
    maxPrice,
    filters,
    keyword, // <-- theo dõi keyword
  ]);

  const getVisiblePages = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, -1, totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1, -1, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, -1, page - 1, page, page + 1, -1, totalPages);
      }
    }
    return pages;
  };

  // chuyển object -> mảng chips để hiển thị
  const chips = Object.entries(filters).flatMap(([name, vals]) =>
    vals.map((v) => ({
      key: `${name}|${v}`,
      label: `${name}: ${v}`,
      attrName: name,
      value: v,
    }))
  );

  // remove chip handler
  const HandleRemoveFilter = (chipKey: string) => {
    const [name, val] = chipKey.split("|");
    setFilters((prev) => {
      const next = { ...prev };
      next[name] = (next[name] || []).filter((x) => x !== val);
      if (!next[name].length) delete next[name];
      return next;
    });
  };

  const handleCategoryChange = (category: Category) => {
    setSelectedCategory(category.slug);
    router.push(`/products?category=${category.slug}`, { scroll: false });
  };

  return (
    <>
      {/* Container chính */}
      <Container className="flex flex-col space-y-5 my-10">
        <Breadcrumb />
        <CategoryTabs queryCategory={queryCategory} />

        <div className="col-span-12">
          <FilterChips
            filters={filters}
            HandleRemoveFilter={HandleRemoveFilter}
          />
        </div>
        {/* Sidebar */}
        {/* tutu tinh */}
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="hidden lg:block w-full lg:w-1/4">
            <Filter
              categorySlug={queryCategory}
              selectedBrands={selectedBrands}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onBrandChange={setSelectedBrands}
              onMinPriceChange={(value) => {
                setMinPrice(value);
              }}
              onMaxPriceChange={(value) => {
                setMaxPrice(value);
              }}
              onAttributesChange={handleAttributesChange}
            />
          </div>

          {/* Content chính */}
          <div className="w-full lg:w-3/4 space-y-8">
            {/* Bộ lọc */}

            {/* Thanh công cụ */}
            <div className="bg-[#111111] border border-gray-800 rounded-2xl p-5 flex flex-wrap justify-between items-center gap-4 shadow-md">
              {/* input keyword search here */}
              <div className="relative flex items-center flex-1 max-w-md">
                <Search className="w-5 h-5 text-gray-400 absolute left-4" />

                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Search products…"
                  className="w-full bg-[#222222] border border-gray-700 text-white rounded-xl pl-12 pr-4 py-3
               focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-inner placeholder:text-gray-400"
                />
              </div>

              <div className="flex items-center gap-4">
                <Select
                  aria-label="Sort by"
                  value={sortBy}
                  onValueChange={setSortBy}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_desc">Newest First</SelectItem>
                    <SelectItem value="price_asc">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price_desc">
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="rating_desc">Best Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Danh sách sản phẩm */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 min-h-80 gap-4 bg-[#111111] border border-gray-800 rounded-2xl w-full mt-6 text-gray-400">
                <div className="space-x-2 flex items-center">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Product is loading...</span>
                </div>
              </div>
            ) : productsList?.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 ">
                {productsList.map((product) => (
                  <AnimatePresence key={product?.id}>
                    <motion.div>
                      <ProductCard key={product.id} product={product} />
                    </motion.div>
                  </AnimatePresence>
                ))}
              </div>
            ) : (
              <NoProductAvailable selectedCategory={selectedCategory} />
            )}
            <div></div>

            {/* Phân trang */}
            {totalPages > 1 && (
              <Pagination className="mt-8 flex flex-wrap justify-center overflow-hidden">
                <PaginationContent className="flex-wrap gap-1 sm:gap-2">
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      className="text-gray-300 hover:text-white hover:bg-gray-800 cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage((prev) => Math.max(prev - 1, 1));
                      }}
                    />
                  </PaginationItem>

                  {getVisiblePages().map((p, i) => (
                    <PaginationItem key={i}>
                      {p === -1 ? (
                        <PaginationEllipsis className="text-gray-500" />
                      ) : (
                        <PaginationLink
                          href="#"
                          isActive={page === p}
                          className={`cursor-pointer transition-colors ${
                            page === p
                              ? "bg-primary text-black hover:bg-primary/90"
                              : "text-gray-300 hover:text-white hover:bg-gray-800"
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            setPage(p);
                          }}
                        >
                          {p}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      className="text-gray-300 hover:text-white hover:bg-gray-800 cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage((prev) => Math.min(prev + 1, totalPages));
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>
      </Container>
    </>
  );
}

export default function ProductPage() {
  return (
    <Suspense fallback={null}>
      <ProductContent />
    </Suspense>
  );
}
