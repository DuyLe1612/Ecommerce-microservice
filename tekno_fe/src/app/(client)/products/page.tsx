"use client";
import React, { useEffect, useState } from "react";
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

export default function ProductPage() {
  const [loading, setLoading] = useState(false);
  const [productsList, setproductsList] = useState<ProductCardType[]>([]);
  // filter
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedBrands, setSelectedBrands] = useState<string>();
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
          brandSlug: selectedBrands,
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
        <div className="flex">
          <div className="hidden lg:block w-3/12">
            <Filter
              categorySlug={queryCategory}
              selectedBrand={selectedBrands}
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
          <div className="w-full md:w-9/12 space-y-8">
            {/* Bộ lọc */}

            {/* Thanh công cụ */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap justify-between items-center gap-4 shadow-sm">
              {/* input keyword search here */}
              <div className="relative flex items-center flex-1 max-w-md">
                <Search className="w-5 h-5 text-gray-400 absolute left-3" />

                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Search products…"
                  className="w-full border rounded-md pl-10 pr-3 py-2
               focus:outline-none focus:ring-2 focus:ring-primary"
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
              <div className="flex flex-col items-center justify-center py-10 min-h-80 gap-4 bg-gray-100 w-full mt-10">
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
            <Pagination>
              <PaginationContent>
                {/* Nút Previous */}
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  />
                </PaginationItem>

                {/* Các trang */}
                {Array.from({ length: totalPages }, (_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      isActive={page === i + 1}
                      onClick={() => setPage(i + 1)}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                {/* Nút Next */}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={() =>
                      setPage((prev) => Math.min(prev + 1, totalPages))
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </Container>
    </>
  );
}
