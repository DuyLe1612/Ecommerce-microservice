"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { getBrandList } from "@/services/brand";
import { getCategoriesList } from "@/services/categories";
import Actions from "@/components/admin/Actions";
import Image from "next/image";
import { uploadImage, updateImageMeta, deleteImage } from "@/lib/productsImageApi";
import { getAdminProducts, getAdminProduct, createAdminProduct, updateAdminProduct, deleteAdminProduct, updateProductVariant, createProductVariant } from "@/services/products";
import ProductSpecifications from "@/components/admin/ProductSpecifications";
import ProductVariants from "@/components/admin/ProductVariants";

type Product = {
  id: number;
  brandName?: string;
  categoryName?: string;
  name: string;
  slug: string;
  basePrice?: number;
  discountPercent?: number;
  finalPrice?: number;
  overview?: string | null;
  totalSold?: number;
  averageRating?: number;
  totalReviews?: number;
  primaryImagePath?: string | null;
  status?: string;
  [k: string]: any;
};

type CategoryNode = {
  id: number;
  name: string;
  subCategories?: CategoryNode[];
  parentId?: number | null;
  [k: string]: any;
};

type Brand = {
  id: number;
  name: string;
};

type ProductSpec = {
  attributeId: number;
  attributeName: string;
  values: string[];
};

type ProductVariant = {
  id?: number;
  sku: string;
  price: number;
  stock: number;
  status?: string;
  attributes: {
    attributeId: number;
    attributeName?: string;
    value: string;
  }[];
};

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPrice, setFilterPrice] = useState("");

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const [treeCategories, setTreeCategories] = useState<CategoryNode[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [openDetail, setOpenDetail] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const [editImages, setEditImages] = useState<any[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);

  const [createData, setCreateData] = useState({
    name: "",
    slug: "",
    categoryId: "" as string | number,
    brandId: "" as string | number,
    basePrice: 0,
    discountPercent: 0,
    overview: "",
    images: [] as File[],
  });

  const [editData, setEditData] = useState<any>(null);

  // Specifications & Variants states
  const [specifications, setSpecifications] = useState<ProductSpec[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  const [openAddVariant, setOpenAddVariant] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // filteredProducts moved down to avoid ReferenceError

  // load products, categories, brands
  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadBrands(), loadCategories(), loadProducts()]);
    setLoading(false);
  };

  const loadBrands = async () => {
    try {
      const res = await getBrandList();
      const list = res?.data?.data || res?.data || (Array.isArray(res) ? res : []) || [];
      setBrands(list);
    } catch (err) {
      console.error("Brand load failed", err);
      setBrands([]);
    }
  };

  const buildTreeFromFlat = (items: any[]) => {
    const map = new Map();
    items.forEach((it) => map.set(it.id, { ...it, subCategories: [] }));
    const roots: any[] = [];
    map.forEach((node) => {
      const parentId = node.parentId ?? node.parent?.id ?? null;
      if (parentId) {
        const parent = map.get(parentId);
        if (parent) parent.subCategories.push(node);
        else roots.push(node);
      } else {
        roots.push(node);
      }
    });
    return roots;
  };

  const loadCategories = async () => {
    try {
      const res = await getCategoriesList();
      let list = Array.isArray(res) ? res : (res ?? []);

      if (list.length > 0 && !("subCategories" in list[0])) {
        list = buildTreeFromFlat(list);
      }

      const tree = assignParentIds(list);
      setTreeCategories(tree);
    } catch (err) {
      console.error("Category load failed", err);
      setTreeCategories([]);
    }
  };

  // Thay thế hàm loadProducts hiện tại bằng code này:

  const loadProducts = async () => {
    try {
      // Request với PageSize lớn để lấy toàn bộ sản phẩm
      const res = await getAdminProducts({ size: 10000 });

      console.log("📦 Raw response:", res);

      let list = [];

      if (Array.isArray(res)) {
        list = res;
      } else if (res?.data) {
        if (Array.isArray(res.data)) {
          list = res.data;
        } else if (Array.isArray(res.data.data)) {
          list = res.data.data;
        } else if (res.data.content && Array.isArray(res.data.content)) {
          list = res.data.content;
        } else if (res.data.items && Array.isArray(res.data.items)) {
          list = res.data.items;
        }
      }

      console.log("✅ Extracted products:", list);
      setProducts(list);
      setCurrentPage(1); // Reset pagination
    } catch (err) {
      console.error("Product load failed", err);
      setProducts([]);
      setCurrentPage(1);
    }
  };

  const loadProductDetail = async (prod: any) => {
    try {
      const detail = await fetchProductDetail(prod);
      if (detail) {
        console.log("📦 Product Detail:", detail);
        console.log("🖼️ Images:", detail.images);
        console.log("📋 Specifications:", detail.specifications);
        setSelectedProduct(detail);
        setOpenDetail(true);
      }
    } catch (err) {
      console.error("Failed to load product detail", err);
    }
  };

  const assignParentIds = (nodes: any[], parentId: number | string | null = null) => {
    return nodes.map((node) => {
      node.parentId = parentId;
      if (node.subCategories && node.subCategories.length) {
        node.subCategories = assignParentIds(node.subCategories, node.id);
      }
      return node;
    });
  };

  const flatCategories = useMemo(() => {
    const out: { id: number; name: string }[] = [];
    const walk = (nodes: any[], depth = 0) => {
      for (const n of nodes) {
        out.push({ id: n.id, name: `${"—".repeat(depth)} ${n.name}` });
        if (n.subCategories && n.subCategories.length) walk(n.subCategories, depth + 1);
      }
    };
    walk(treeCategories);
    return out;
  }, [treeCategories]);

  // ✅ Thêm useMemo để filter products theo search query
  const filteredProducts = useMemo(() => {
    let result = products;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const matchId = String(p.id).includes(query);
        const matchName = p.name.toLowerCase().includes(query);
        const matchBrand = p.brandName?.toLowerCase().includes(query) || false;
        const matchCategory = p.categoryName?.toLowerCase().includes(query) || false;
        return matchId || matchName || matchBrand || matchCategory;
      });
    }

    if (filterBrand) {
      result = result.filter(p => p.brandId?.toString() === filterBrand || p.brandName === brands.find(b => b.id.toString() === filterBrand)?.name);
    }

    if (filterCategory) {
      const category = flatCategories.find(c => c.id.toString() === filterCategory);
      if (category) {
        result = result.filter(p => p.categoryName === category.name);
      }
    }

    if (filterStatus) {
      result = result.filter(p => (p.status || 'Active') === filterStatus);
    }

    if (filterPrice) {
      result = result.filter(p => {
        const price = p.finalPrice ?? Math.round((p.basePrice || 0) * (1 - (p.discountPercent || 0) / 100));
        if (filterPrice === "under1m") return price < 1000000;
        if (filterPrice === "1m-5m") return price >= 1000000 && price <= 5000000;
        if (filterPrice === "5m-10m") return price > 5000000 && price <= 10000000;
        if (filterPrice === "over10m") return price > 10000000;
        return true;
      });
    }

    if (sortOrder) {
      result = [...result];
      result.sort((a, b) => {
        if (sortOrder === "price_asc") {
          const pa = a.finalPrice ?? Math.round((a.basePrice || 0) * (1 - (a.discountPercent || 0) / 100));
          const pb = b.finalPrice ?? Math.round((b.basePrice || 0) * (1 - (b.discountPercent || 0) / 100));
          return pa - pb;
        }
        if (sortOrder === "price_desc") {
          const pa = a.finalPrice ?? Math.round((a.basePrice || 0) * (1 - (a.discountPercent || 0) / 100));
          const pb = b.finalPrice ?? Math.round((b.basePrice || 0) * (1 - (b.discountPercent || 0) / 100));
          return pb - pa;
        }
        if (sortOrder === "name_asc") return a.name.localeCompare(b.name);
        if (sortOrder === "name_desc") return b.name.localeCompare(a.name);
        if (sortOrder === "newest") return b.id - a.id;
        return 0;
      });
    }

    return result;
  }, [products, searchQuery, filterBrand, filterCategory, filterStatus, filterPrice, sortOrder, brands, flatCategories]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const calcFinalPrice = (base: number = 0, disc: number = 0) => {
    const b = Number(base) || 0;
    const d = Number(disc) || 0;
    return Math.round(b - (b * d) / 100);
  };

  // Create Modal
  const handleCreate = async () => {
    try {
      if (!createData.name || !createData.slug || !createData.categoryId || !createData.brandId) {
        toast.error("Please fill required fields: Name, Slug, Category, Brand");
        return;
      }

      const payload: any = {
        name: createData.name,
        slug: createData.slug,
        categoryId: Number(createData.categoryId),
        brandId: Number(createData.brandId),
        basePrice: Number(createData.basePrice),
        discountPercent: Number(createData.discountPercent),
        overview: createData.overview,
      };

      if (specifications && specifications.length > 0) {
        payload.specs = specifications;
      }

      const res: any = await createAdminProduct(payload);
      const newProductId = res?.data?.id || res?.id;

      if (newProductId) {
        // Upload images
        for (let i = 0; i < createData.images.length; i++) {
          try {
            await uploadImage(createData.images[i], newProductId, i === 0);
          } catch (e) {
            console.error("Failed to upload image", e);
          }
        }

        // Create variants
        if (variants && variants.length > 0) {
          for (const variant of variants) {
            try {
              const variantPayload = {
                productId: newProductId,
                sku: variant.sku,
                price: variant.price,
                stock: variant.stock,
                status: variant.status || "available",
                attributeValues: variant.attributes.map((attr: any) => ({
                  attributeId: attr.attributeId,
                  valueId: attr.valueId || 0
                }))
              };
              await createProductVariant(variantPayload);
            } catch (e) {
              console.error(`Failed to create variant ${variant.sku}:`, e);
            }
          }
        }
      }

      await loadAll();
      setCurrentPage(1);
      setOpenCreate(false);

      // Reset form
      setCreateData({
        name: "",
        slug: "",
        categoryId: "",
        brandId: "",
        basePrice: 0,
        discountPercent: 0,
        overview: "",
        images: [],
      });
      setSpecifications([]);
      setVariants([]);

      toast.success("Product created successfully!");
    } catch (err) {
      console.error("Create failed:", err);
      toast.error(`Create failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  async function fetchProductDetail(prod: any) {
    try {
      if (!prod?.slug) return null;
      const res = await getAdminProduct(prod.slug);
      return res?.data ?? res;
    } catch (err) {
      console.error("fetchProductDetail error", err);
      return null;
    }
  }

  const openEditModal = async (p: any) => {
    const detail = await fetchProductDetail(p);

    if (!detail) {
      toast.error("Không load được dữ liệu sản phẩm!");
      return;
    }

    console.log("🔍 Product detail:", detail);
    console.log("🖼️ Images from API:", detail.images);
    console.log("📋 Specifications from API:", detail.specifications);

    const matchedBrand = brands.find(
      (b: any) => b.name.toLowerCase() === detail.brandName?.toLowerCase()
    );

    const matchedCategory = flatCategories.find(
      (c: any) => c.name.replace(/—/g, "").trim().toLowerCase() === detail.categoryName?.toLowerCase()
    );

    setEditData({
      id: detail.id,
      name: detail.name,
      slug: detail.slug,
      basePrice: detail.basePrice,
      discountPercent: detail.discountPercent ?? 0,
      description: detail.description ?? "",
      longDescription: detail.longDescription ?? "",
      warrantyInfo: detail.warrantyInfo ?? "",
      overview: detail.overview ?? "",
      brandId: matchedBrand?.id ?? detail.brandId ?? null,
      categoryId: matchedCategory?.id ?? detail.categoryId ?? null,
      status: detail.status ?? "",
    });

    // ✅ FIX: Map images properly with detailed logging
    const images = detail.images || [];

    if (Array.isArray(images) && images.length > 0) {
      console.log("🔍 Processing images:", images);

      const mappedImages = images
        .map((img: any, index: number) => {
          console.log(`Processing image ${index}:`, img);

          // Nếu là string (chỉ URL)
          if (typeof img === 'string') {
            console.log(`⚠️ Image ${index} is a string:`, img);
            return {
              id: `temp-${index}`, // Temporary ID for display only
              imageUrl: img,
              isPrimary: index === 0,
              sortOrder: index,
              isTemporary: true // Flag to identify string images
            };
          }

          // Nếu là object
          const imageId = img.id || img.imageId;
          const imageUrl = img.imageUrl || img.url || img.path || img.imagePath;

          if (!imageUrl) {
            console.warn(`⚠️ No URL found for image ${index}:`, img);
            return null;
          }

          return {
            id: imageId || `temp-${index}`,
            imageUrl: imageUrl,
            isPrimary: img.isPrimary ?? (index === 0),
            sortOrder: img.sortOrder ?? index,
            isTemporary: !imageId // Flag if no real ID
          };
        })
        .filter(Boolean);

      console.log("✅ Mapped images:", mappedImages);
      setEditImages(mappedImages);
    } else {
      console.log("ℹ️ No images found");
      setEditImages([]);
    }

    // ✅ FIX: Load specifications properly
    const specs = detail.specifications || detail.specs || [];
    console.log("📋 Loading specifications:", specs);

    // ✅ IMPROVED: Keep original attributeId from backend
    const formattedSpecs = specs.map((spec: any, idx: number) => {
      // Try to get attributeId from multiple possible fields
      let attributeId = spec.attributeId ?? spec.id ?? spec.attribute_id;

      // ✅ FIX: Only assign negative ID if attributeId is truly missing (null/undefined)
      // Don't treat 0 as invalid - backend might use 0 for some attributes
      if (attributeId === null || attributeId === undefined) {
        // This is a custom attribute without ID
        attributeId = -(Date.now() + idx);
        console.warn(`⚠️ Spec without ID, assigning temporary: ${attributeId}`, spec);
      }

      return {
        attributeId,
        attributeName: spec.attributeName || spec.name || `Attribute ${Math.abs(attributeId)}`,
        values: Array.isArray(spec.values) ? spec.values :
          Array.isArray(spec.value) ? spec.value :
            spec.values ? [spec.values] :
              spec.value ? [spec.value] : []
      };
    });

    console.log("✅ Formatted specifications:", formattedSpecs);
    setSpecifications(formattedSpecs);

    // ✅ FIX: Load variants with attributeName
    const detailVariants = detail.variants || [];
    console.log("📦 Loading variants:", detailVariants);

    const variantsWithNames = detailVariants.map((variant: any) => ({
      ...variant,
      attributes: (variant.attributes || []).map((attr: any) => {
        // Backend returns { id, name, value: [] }
        // Convert to { attributeId, attributeName, value: string }
        let valueStr = attr.value;

        // ✅ Convert array to string
        if (Array.isArray(attr.value)) {
          valueStr = attr.value[0] || '';
        }

        return {
          attributeId: attr.id || attr.attributeId || 0,
          attributeName: attr.name || attr.attributeName || `Attribute ${attr.id}`,
          value: String(valueStr) // ✅ Always string
        };
      })
    }));

    console.log("✅ Formatted variants:", variantsWithNames);
    setVariants(variantsWithNames);

    setNewImages([]);
    setOpenEdit(true);
  };

  const makePrimary = (index: number) => {
    const updated = editImages.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    setEditImages(updated);
  };

  const handleEditSave = async () => {
    try {
      if (!editData.name || !editData.slug || !editData.brandId || !editData.categoryId) {
        toast.error("Please fill required fields: Name, Slug, Brand, Category");
        return;
      }

      console.log("💾 Starting save process...");
      console.log("Specifications to save:", specifications);
      console.log("Variants to save:", variants);

      // ✅ STEP 1: Update Product Basic Info
      const payload: any = {
        id: editData.id,
        name: editData.name,
        slug: editData.slug,
        categoryId: Number(editData.categoryId),
        brandId: Number(editData.brandId),
        status: editData.status || "available",
        basePrice: Number(editData.basePrice || 0),
        description: editData.description || "",
        longDescription: editData.longDescription || "",
        warrantyInfo: editData.warrantyInfo || "",
        overview: editData.overview || "",
        discountPercent: Number(editData.discountPercent || 0),
      };

      // ✅ Add Specifications
      if (specifications && specifications.length > 0) {
        payload.specs = specifications;
      }

      console.log("📤 Sending product info update...");
      const updateResponse = await updateAdminProduct(editData.id, payload);
      console.log("✅ Product info updated:", updateResponse);

      // ✅ STEP 2: Update/Create Variants individually
      if (variants && variants.length > 0) {
        console.log(`📦 Processing ${variants.length} variants...`);

        for (const variant of variants) {
          try {
            // ✅ Convert attributes to correct format
            const variantPayload = {
              productId: editData.id,
              sku: variant.sku,
              price: variant.price,
              stock: variant.stock,
              status: variant.status || "available",
              attributeValues: variant.attributes.map(attr => {
                return {
                  attributeId: attr.attributeId,
                  valueId: attr.valueId || 0
                };
              })
            };

            console.log("📦 Variant payload:", JSON.stringify(variantPayload, null, 2));

            if (variant.id) {
              // Update existing variant
              console.log(`Updating variant ${variant.id} (${variant.sku})...`);
              await updateProductVariant(variant.id, variantPayload);
              console.log(`✅ Variant ${variant.id} updated`);
            } else {
              // Create new variant
              console.log(`Creating new variant ${variant.sku}...`);
              const created = await createProductVariant(variantPayload);
              console.log(`✅ Variant ${variant.sku} created:`, created);
            }
          } catch (err: any) {
            console.error(`❌ Failed to update/create variant ${variant.sku}:`, err);

            // Parse error message
            let errorMsg = err.message || 'Unknown error';
            try {
              // Try to extract backend error message
              const match = errorMsg.match(/\{.*\}/);
              if (match) {
                const errJson = JSON.parse(match[0]);
                errorMsg = errJson.message || errorMsg;
                if (errJson.errors) {
                  errorMsg += '\nDetails: ' + JSON.stringify(errJson.errors);
                }
              }
            } catch (e) {
              // Use original error
            }

            toast.error(`Failed to save variant ${variant.sku}:\n${errorMsg}`);
            throw err; // Stop processing other variants
          }
        }
      }

      // ✅ STEP 3: Handle Images
      const validImages = editImages.filter(img => {
        const isValid = img.id &&
          typeof img.id === 'number' &&
          img.id > 0 &&
          !img.isTemporary;
        if (!isValid) {
          console.log("⚠️ Skipping invalid/temporary image:", img);
        }
        return isValid;
      });

      console.log("📸 Valid images to update:", validImages);

      // Update images metadata
      for (const img of validImages) {
        try {
          const updatePayload = {
            isPrimary: !!img.isPrimary,
            sortOrder: img.sortOrder ?? 0,
          };
          console.log(`Updating image ${img.id}:`, updatePayload);
          await updateImageMeta(img.id, updatePayload);
          console.log(`✅ Image ${img.id} updated`);
        } catch (e) {
          console.error(`❌ Failed to update image ${img.id}:`, e);
        }
      }

      // Upload new images
      const uploadedImageIds: number[] = [];
      if (newImages.length > 0) {
        console.log(`📤 Uploading ${newImages.length} new images...`);

        for (let i = 0; i < newImages.length; i++) {
          const file = newImages[i];
          const isPrimaryForThis = validImages.length === 0 && i === 0;

          try {
            const result = await uploadImage(file, editData.id, isPrimaryForThis);
            const newId = result?.id ?? result?.data?.id;
            if (newId && typeof newId === 'number' && newId > 0) {
              uploadedImageIds.push(newId);
              console.log(`✅ Uploaded image ${i + 1}, ID: ${newId}`);
            }
          } catch (e) {
            console.error(`❌ Failed to upload image ${i + 1}:`, e);
          }
        }
      }

      // ✅ STEP 4: Reload fresh data
      console.log("🔄 Reloading product list...");
      await loadProducts();
      setCurrentPage(1);

      // Wait for backend to finish processing
      await new Promise(resolve => setTimeout(resolve, 800));

      console.log("🔄 Reloading product details...");
      const freshDetail = await fetchProductDetail({ slug: editData.slug });

      if (freshDetail) {
        console.log("📦 Fresh detail from server:", freshDetail);

        // Update editData with fresh data
        const matchedBrand = brands.find(
          (b: any) => b.name.toLowerCase() === freshDetail.brandName?.toLowerCase()
        );

        const matchedCategory = flatCategories.find(
          (c: any) => c.name.replace(/—/g, "").trim().toLowerCase() === freshDetail.categoryName?.toLowerCase()
        );

        setEditData({
          id: freshDetail.id,
          name: freshDetail.name,
          slug: freshDetail.slug,
          basePrice: freshDetail.basePrice,
          discountPercent: freshDetail.discountPercent ?? 0,
          description: freshDetail.description ?? "",
          longDescription: freshDetail.longDescription ?? "",
          warrantyInfo: freshDetail.warrantyInfo ?? "",
          overview: freshDetail.overview ?? "",
          brandId: matchedBrand?.id ?? freshDetail.brandId ?? null,
          categoryId: matchedCategory?.id ?? freshDetail.categoryId ?? null,
          status: freshDetail.status ?? "",
        });

        // Update images
        const images = freshDetail.images || [];
        if (Array.isArray(images) && images.length > 0) {
          const mappedImages = images
            .map((img: any, index: number) => {
              if (typeof img === 'string') {
                return {
                  id: `temp-${index}`,
                  imageUrl: img,
                  isPrimary: index === 0,
                  sortOrder: index,
                  isTemporary: true
                };
              }

              const imageId = img.id || img.imageId;
              const imageUrl = img.imageUrl || img.url || img.path || img.imagePath;

              if (!imageUrl) return null;

              return {
                id: imageId || `temp-${index}`,
                imageUrl: imageUrl,
                isPrimary: img.isPrimary ?? (index === 0),
                sortOrder: img.sortOrder ?? index,
                isTemporary: !imageId
              };
            })
            .filter(Boolean);

          setEditImages(mappedImages);
        }

        // Update specifications
        const specs = freshDetail.specifications || freshDetail.specs || [];
        console.log("📋 Fresh specifications:", specs);

        // ✅ IMPROVED: Keep original attributeId from backend
        const formattedSpecs = specs.map((spec: any, idx: number) => {
          let attributeId = spec.attributeId ?? spec.id ?? spec.attribute_id;

          // ✅ FIX: Only assign negative ID if truly missing
          if (attributeId === null || attributeId === undefined) {
            attributeId = -(Date.now() + idx);
            console.warn(`⚠️ Fresh spec without ID, assigning temporary: ${attributeId}`, spec);
          }

          return {
            attributeId,
            attributeName: spec.attributeName || spec.name || `Attribute ${Math.abs(attributeId)}`,
            values: Array.isArray(spec.values) ? spec.values :
              Array.isArray(spec.value) ? spec.value :
                spec.values ? [spec.values] :
                  spec.value ? [spec.value] : []
          };
        });
        setSpecifications(formattedSpecs);

        // Update variants
        const detailVariants = freshDetail.variants || [];
        console.log("📦 Fresh variants:", detailVariants);
        const variantsWithNames = detailVariants.map((variant: any) => ({
          ...variant,
          attributes: (variant.attributes || []).map((attr: any) => {
            // Backend returns { id, name, value: [] }
            // Convert to { attributeId, attributeName, value: string }
            let valueStr = attr.value;

            // ✅ Convert array to string
            if (Array.isArray(attr.value)) {
              valueStr = attr.value[0] || '';
            }

            return {
              attributeId: attr.id || attr.attributeId || 0,
              attributeName: attr.name || attr.attributeName || `Attribute ${attr.id}`,
              value: String(valueStr) // ✅ Always string
            };
          })
        }));
        setVariants(variantsWithNames);

        console.log("✅ Modal data refreshed with latest from server");
      }

      // Clear new images
      setNewImages([]);

      toast.success(`✅ Product updated successfully!\n\n📋 Specifications: ${specifications.length}\n📦 Variants: ${variants.length}`);

    } catch (err) {
      console.error("❌ Update failed:", err);
      toast.error(`Update failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  const deleteProduct = async (id: number) => {
    if (!confirm("Delete product?")) return;
    try {
      await deleteAdminProduct(id);
      await loadAll();
      setCurrentPage(1);
      toast.success("Deleted");
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  const getVisiblePages = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, -1, totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, -1, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, -1, currentPage - 1, currentPage, currentPage + 1, -1, totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Products</h2>
        <Button onClick={() => setOpenCreate(true)}>+ Create Product</Button>
      </div>
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="🔍 Search by ID, Name, Brand, or Category..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-128 bg-black/20 border border-white/10 text-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-white/30 flex-1"
          />
          {searchQuery && (
            <p className="text-xs text-gray-400">
              Found {filteredProducts.length} product(s)
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            className="bg-black/20 border border-white/10 text-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-white/30 [&>option]:bg-[#121212]"
            value={filterBrand}
            onChange={(e) => { setFilterBrand(e.target.value); setCurrentPage(1); }}
          >
            <option value="">All Brands</option>
            {brands.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>

          <select
            className="bg-black/20 border border-white/10 text-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-white/30 [&>option]:bg-[#121212]"
            value={filterCategory}
            onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
          >
            <option value="">All Categories</option>
            {flatCategories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <select
            className="bg-black/20 border border-white/10 text-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-white/30 [&>option]:bg-[#121212]"
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Draft">Draft</option>
          </select>

          <select
            className="bg-black/20 border border-white/10 text-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-white/30 [&>option]:bg-[#121212]"
            value={filterPrice}
            onChange={(e) => { setFilterPrice(e.target.value); setCurrentPage(1); }}
          >
            <option value="">All Prices</option>
            <option value="under1m">Under 1,000,000đ</option>
            <option value="1m-5m">1,000,000đ - 5,000,000đ</option>
            <option value="5m-10m">5,000,000đ - 10,000,000đ</option>
            <option value="over10m">Over 10,000,000đ</option>
          </select>

          <select
            className="bg-black/20 border border-white/10 text-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-white/30 [&>option]:bg-[#121212] ml-auto"
            value={sortOrder}
            onChange={(e) => { setSortOrder(e.target.value); setCurrentPage(1); }}
          >
            <option value="">Sort By...</option>
            <option value="newest">Newest Added</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
            <option value="name_desc">Name: Z to A</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-transparent overflow-hidden">
          <div className="overflow-x-auto pb-4">
          <table className="w-full text-sm bg-white/5 backdrop-blur-md shadow-none rounded-xl border border-white/10 overflow-hidden">
            <thead>
              <tr className="bg-white/10 text-left text-gray-200 border-b border-white/10">
                <th className="p-2">ID</th>
                <th>Brand</th>
                <th>Category</th>
                <th>Name</th>
                <th>BasePrice</th>
                <th>Discount%</th>
                <th>FinalPrice</th>
                <th>Status</th>
                <th>Image</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {paginatedProducts.map((p) => (
                <tr
                  key={p.id}
                  className="cursor-pointer hover:bg-white/5 border-b border-white/5 text-gray-300 transition-colors"
                  onClick={() => loadProductDetail(p)}
                >
                  <td className="p-2">{p.id}</td>
                  <td className="p-2">{p.brandName ?? "-"}</td>
                  <td className="p-2">{p.categoryName ?? "-"}</td>
                  <td className="p-2 font-medium">{p.name}</td>
                  <td className="p-2 font-mono">{p.basePrice?.toLocaleString() || "-"}đ</td>
                  <td className="p-2">{p.discountPercent || 0}%</td>
                  <td className="p-2 font-mono text-green-400">
                    {(p.finalPrice ?? calcFinalPrice(p.basePrice, p.discountPercent))?.toLocaleString()}đ
                  </td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${p.status === 'Active' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      p.status === 'Inactive' ? 'bg-white/5 text-gray-300 border-white/10' :
                        p.status === 'Draft' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                          'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      }`}>
                      {p.status || 'available'}
                    </span>
                  </td>
                  <td className="p-2">
                    {p.primaryImageUrl ? (
                      <div className="relative w-20 h-12">
                        <Image
                          src={p.primaryImageUrl}
                          alt={p.name}
                          fill
                          className="object-cover rounded"
                          sizes="80px"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">
                        No image
                      </div>
                    )}
                  </td>

                  <td className="p-2">
                    <div className="flex gap-2">
                      <Actions
                        onEdit={() => openEditModal(p)}
                        onDelete={() => deleteProduct(p.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          {/* === PAGINATION CONTROLS === */}
          {totalPages > 1 && (
            <Pagination className="mt-8 flex flex-wrap justify-center overflow-hidden mb-4">
              <PaginationContent className="flex-wrap gap-1 sm:gap-2">
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    className="text-gray-300 hover:text-white hover:bg-gray-800 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage((prev) => Math.max(prev - 1, 1));
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
                        isActive={currentPage === p}
                        className={`cursor-pointer transition-colors ${currentPage === p
                          ? "bg-primary text-black hover:bg-primary/90"
                          : "text-gray-300 hover:text-white hover:bg-gray-800"
                          }`}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(p);
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
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}

      {/* === EDIT PRODUCT MODAL === */}
      {openEdit && editData && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#121212] border border-white/10 text-gray-200 w-full max-w-6xl rounded-xl shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
              <h2 className="text-xl font-semibold text-gray-100">Edit Product</h2>
              <button
                onClick={() => {
                  setOpenEdit(false);
                  setSpecifications([]);
                  setVariants([]);
                  setEditImages([]);
                  setNewImages([]);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X size={28} />
              </button>
            </div>

            {/* Basic Fields */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block font-medium mb-1 text-gray-300">Name *</label>
                <input
                  className="bg-black/20 border border-white/10 rounded p-2 w-full focus:outline-none focus:border-white/30 text-gray-200"
                  value={editData.name || ""}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-medium mb-1 text-gray-300">Slug *</label>
                <input
                  className="bg-black/20 border border-white/10 rounded p-2 w-full focus:outline-none focus:border-white/30 text-gray-200"
                  value={editData.slug || ""}
                  onChange={(e) => setEditData({ ...editData, slug: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-medium mb-1 text-gray-300">Category *</label>
                <select
                  className="bg-black/20 border border-white/10 rounded p-2 w-full focus:outline-none focus:border-white/30 text-gray-200 [&>option]:bg-[#121212] [&>option]:text-gray-300"
                  value={editData.categoryId || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, categoryId: Number(e.target.value) })
                  }
                >
                  <option value="">-- Select --</option>
                  {flatCategories.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1 text-gray-300">Brand *</label>
                <select
                  className="bg-black/20 border border-white/10 rounded p-2 w-full focus:outline-none focus:border-white/30 text-gray-200 [&>option]:bg-[#121212] [&>option]:text-gray-300"
                  value={editData.brandId || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, brandId: Number(e.target.value) })
                  }
                >
                  <option value="">-- Select --</option>
                  {brands.map((b: any) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1 text-gray-300">Base Price</label>
                <input
                  type="number"
                  className="bg-black/20 border border-white/10 rounded p-2 w-full focus:outline-none focus:border-white/30 text-gray-200"
                  value={editData.basePrice || 0}
                  onChange={(e) =>
                    setEditData({ ...editData, basePrice: Number(e.target.value) })
                  }
                />
              </div>

              <div>
                <label className="block font-medium mb-1 text-gray-300">Discount (%)</label>
                <input
                  type="number"
                  className="bg-black/20 border border-white/10 rounded p-2 w-full focus:outline-none focus:border-white/30 text-gray-200"
                  value={editData.discountPercent || 0}
                  onChange={(e) =>
                    setEditData({ ...editData, discountPercent: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            {/* Text fields */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block font-medium mb-1 text-gray-300">Description</label>
                <textarea
                  className="bg-black/20 border border-white/10 rounded p-2 w-full focus:outline-none focus:border-white/30 text-gray-200"
                  rows={3}
                  value={editData.description || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, description: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block font-medium mb-1 text-gray-300">Long Description</label>
                <textarea
                  className="bg-black/20 border border-white/10 rounded p-2 w-full focus:outline-none focus:border-white/30 text-gray-200"
                  rows={4}
                  value={editData.longDescription || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, longDescription: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block font-medium mb-1 text-gray-300">Overview</label>
                <textarea
                  className="bg-black/20 border border-white/10 rounded p-2 w-full focus:outline-none focus:border-white/30 text-gray-200"
                  rows={3}
                  value={editData.overview || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, overview: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block font-medium mb-1 text-gray-300">Warranty Info</label>
                <input
                  className="bg-black/20 border border-white/10 rounded p-2 w-full focus:outline-none focus:border-white/30 text-gray-200"
                  value={editData.warrantyInfo || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, warrantyInfo: e.target.value })
                  }
                />
              </div>
            </div>

            {/* === IMAGES SECTION === */}
            <div className="mb-6 border-t border-white/10 pt-6">
              <h3 className="font-semibold mb-3 text-gray-100">Images</h3>

              {/* Existing Images */}
              {editImages.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-2">Current Images ({editImages.length})</p>
                  <div className="flex gap-3 flex-wrap">
                    {editImages.map((img, index) => {
                      const imageUrl = img.imageUrl || img.url || img.path;

                      if (!imageUrl) {
                        console.warn("⚠️ No image URL found for:", img);
                        return null;
                      }

                      return (
                        <div key={img.id ?? `img-${index}`} className="relative w-28 h-28 rounded overflow-hidden border border-white/10 shadow-sm bg-black/20">
                          <img
                            src={imageUrl}
                            alt={`Product ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error("❌ Image load error:", imageUrl);
                              e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="112" height="112"><rect width="112" height="112" fill="%23ddd"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-size="12">Error</text></svg>';
                            }}
                          />

                          {/* Primary Badge */}
                          {img.isPrimary && (
                            <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded">
                              Primary
                            </span>
                          )}

                          {/* Temporary Badge */}
                          {img.isTemporary && (
                            <span className="absolute bottom-2 left-2 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded">
                              Read-only
                            </span>
                          )}

                          {/* Action Buttons - only for non-temporary images */}
                          {!img.isTemporary && (
                            <div className="absolute top-2 right-2 flex gap-1">
                              {!img.isPrimary && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    makePrimary(index);
                                  }}
                                  className="bg-green-600 text-white text-xs px-2 py-1 rounded hover:bg-green-700"
                                  title="Set as primary"
                                >
                                  ⭐
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (!confirm('Delete this image?')) return;
                                  try {
                                    await deleteImage(img.id);
                                    setEditImages((prev) => prev.filter((it) => it.id !== img.id));
                                    toast.success('Image deleted');
                                  } catch (err) {
                                    console.error('Delete image failed:', err);
                                    toast.error('Delete failed');
                                  }
                                }}
                                className="bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700"
                                title="Delete image"
                              >
                                🗑️
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Upload New Images */}
              <div className="mb-4">
                <label className="block font-medium mb-2 text-gray-300">Upload New Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setNewImages([...newImages, ...files]);
                  }}
                  className="bg-black/20 border border-white/10 text-gray-200 rounded p-2 w-full focus:outline-none focus:border-white/30"
                />

                {/* Preview New Images */}
                {newImages.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-400 mb-2">New Images to Upload ({newImages.length})</p>
                    <div className="flex gap-3 flex-wrap">
                      {newImages.map((file, idx) => (
                        <div key={`new-img-${idx}-${file.name}`} className="relative border border-white/10 bg-black/20 rounded p-1 shadow-sm">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`New ${idx + 1}`}
                            className="w-28 h-28 object-cover rounded"
                          />

                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={() => {
                              setNewImages(newImages.filter((_, i) => i !== idx));
                            }}
                            className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700"
                          >
                            ✕
                          </button>

                          {/* File name */}
                          <p className="text-xs text-gray-400 mt-1 truncate w-28" title={file.name}>
                            {file.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* === VARIANTS SECTION === */}
            <div className="mb-6 border-t border-white/10 pt-6">
              <ProductVariants
                productId={editData.id}
                basePrice={editData.basePrice}
                initialVariants={variants}
                onChange={setVariants}
                categoryId={editData.categoryId}
              />
            </div>

            {/* === SPECIFICATIONS SECTION === */}
            {editData.categoryId && (
              <div className="mb-6 border-t border-white/10 pt-6">
                <ProductSpecifications
                  productId={editData.id}
                  categoryId={Number(editData.categoryId)}
                  initialSpecs={specifications}
                  onChange={setSpecifications}
                />
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-4 border-t border-white/10 pt-4">
              <button
                className="px-4 py-2 bg-transparent border border-white/20 text-gray-300 hover:bg-white/10 hover:text-white rounded transition-colors"
                onClick={() => {
                  setOpenEdit(false);
                  setSpecifications([]);
                  setVariants([]);
                  setEditImages([]);
                  setNewImages([]);
                }}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-800 text-black rounded transition-colors shadow-sm"
                onClick={handleEditSave}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === CREATE PRODUCT MODAL === */}
      {openCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#121212] border border-white/10 text-gray-200 w-full max-w-4xl rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
              <h2 className="text-xl font-semibold text-gray-100">Create Product</h2>
              <button
                onClick={() => {
                  setOpenCreate(false);
                  setCreateData({
                    name: "",
                    slug: "",
                    categoryId: "",
                    brandId: "",
                    basePrice: 0,
                    discountPercent: 0,
                    overview: "",
                    images: [],
                  });
                  setSpecifications([]);
                  setVariants([]);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X size={28} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block font-medium mb-1 text-gray-300">Name *</label>
                <input
                  className="bg-black/20 border border-white/10 rounded p-2 w-full focus:outline-none focus:border-white/30 text-gray-200"
                  value={createData.name}
                  onChange={(e) =>
                    setCreateData({ ...createData, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block font-medium mb-1 text-gray-300">Slug *</label>
                <input
                  className="bg-black/20 border border-white/10 rounded p-2 w-full focus:outline-none focus:border-white/30 text-gray-200"
                  value={createData.slug}
                  onChange={(e) =>
                    setCreateData({ ...createData, slug: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block font-medium mb-1 text-gray-300">Category *</label>
                <select
                  className="bg-black/20 border border-white/10 rounded p-2 w-full focus:outline-none focus:border-white/30 text-gray-200 [&>option]:bg-[#121212] [&>option]:text-gray-300"
                  value={String(createData.categoryId)}
                  onChange={(e) =>
                    setCreateData({ ...createData, categoryId: Number(e.target.value) })
                  }
                >
                  <option value="">-- Select --</option>
                  {flatCategories.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1 text-gray-300">Brand *</label>
                <select
                  className="bg-black/20 border border-white/10 rounded p-2 w-full focus:outline-none focus:border-white/30 text-gray-200 [&>option]:bg-[#121212] [&>option]:text-gray-300"
                  value={String(createData.brandId)}
                  onChange={(e) =>
                    setCreateData({ ...createData, brandId: e.target.value })
                  }
                >
                  <option value="">-- Select --</option>
                  {brands.map((b: any) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1 text-gray-300">Base Price</label>
                <input
                  type="number"
                  className="bg-black/20 border border-white/10 rounded p-2 w-full focus:outline-none focus:border-white/30 text-gray-200"
                  value={createData.basePrice}
                  onChange={(e) =>
                    setCreateData({ ...createData, basePrice: Number(e.target.value) })
                  }
                />
              </div>

              <div>
                <label className="block font-medium mb-1 text-gray-300">Discount (%)</label>
                <input
                  type="number"
                  className="bg-black/20 border border-white/10 rounded p-2 w-full focus:outline-none focus:border-white/30 text-gray-200"
                  value={createData.discountPercent}
                  onChange={(e) =>
                    setCreateData({
                      ...createData,
                      discountPercent: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="mt-4 mb-6">
              <label className="block font-medium mb-1 text-gray-300">Overview</label>
              <textarea
                rows={3}
                className="bg-black/20 border border-white/10 rounded p-2 w-full focus:outline-none focus:border-white/30 text-gray-200"
                value={createData.overview}
                onChange={(e) =>
                  setCreateData({ ...createData, overview: e.target.value })
                }
              />
            </div>

            {/* === IMAGES SECTION === */}
            <div className="mb-6 border-t border-white/10 pt-6">
              <h3 className="font-semibold mb-3 text-gray-100">Images</h3>

              <div className="mb-4">
                <label className="block font-medium mb-2 text-gray-300">Upload Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setCreateData({ ...createData, images: [...createData.images, ...files] });
                  }}
                  className="bg-black/20 border border-white/10 text-gray-200 rounded p-2 w-full focus:outline-none focus:border-white/30"
                />

                {createData.images.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-400 mb-2">Selected Images ({createData.images.length})</p>
                    <div className="flex gap-3 flex-wrap">
                      {createData.images.map((file, idx) => (
                        <div key={`create-img-${idx}-${file.name}`} className="relative border border-white/10 rounded p-1 bg-black/20">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Image ${idx + 1}`}
                            className="w-28 h-28 object-cover rounded shadow-sm"
                          />

                          {/* Primary Badge */}
                          {idx === 0 && (
                            <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded shadow-sm">
                              Primary
                            </span>
                          )}

                          {/* Set Primary Button */}
                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newImages = [...createData.images];
                                const [movedImage] = newImages.splice(idx, 1);
                                newImages.unshift(movedImage);
                                setCreateData({ ...createData, images: newImages });
                              }}
                              className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded hover:bg-green-500 shadow-sm"
                              title="Set as primary"
                            >
                              ⭐
                            </button>
                          )}

                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={() => {
                              setCreateData({
                                ...createData,
                                images: createData.images.filter((_, i) => i !== idx)
                              });
                            }}
                            className="absolute top-2 right-2 bg-red-600/90 text-white text-xs px-2 py-1 rounded hover:bg-red-500 shadow-sm"
                          >
                            ✕
                          </button>

                          {/* File name */}
                          <p className="text-xs text-gray-400 mt-1 truncate w-28" title={file.name}>
                            {file.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 border-t border-white/10 pt-4">
              <button
                className="px-4 py-2 bg-transparent border border-white/20 text-gray-300 hover:bg-white/10 hover:text-white rounded transition-colors"
                onClick={() => {
                  setOpenCreate(false);
                  setCreateData({
                    name: "",
                    slug: "",
                    categoryId: "",
                    brandId: "",
                    basePrice: 0,
                    discountPercent: 0,
                    overview: "",
                    images: [],
                  });
                  setSpecifications([]);
                  setVariants([]);
                }}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-800 text-black rounded transition-colors shadow-sm"
                onClick={handleCreate}
              >
                Create Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === PRODUCT DETAIL MODAL === */}
      {openDetail && selectedProduct && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-[#121212] border border-white/10 text-gray-200 p-6 rounded-xl w-[900px] max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold text-gray-100">
                Product Detail — {selectedProduct.name}
              </h2>
              <button
                onClick={() => setOpenDetail(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={28} />
              </button>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p>
                  <strong>ID:</strong> {selectedProduct.id}
                </p>
                <p>
                  <strong>Name:</strong> {selectedProduct.name}
                </p>
                <p>
                  <strong>Slug:</strong> {selectedProduct.slug}
                </p>
                <p>
                  <strong>Brand:</strong> {selectedProduct.brandName}
                </p>
                <p>
                  <strong>Category:</strong> {selectedProduct.categoryName}
                </p>
                <p>
                  <strong>Base Price:</strong>{" "}
                  {selectedProduct.basePrice.toLocaleString()}đ
                </p>
                <p>
                  <strong>Discount:</strong> {selectedProduct.discountPercent ?? 0}%
                </p>
                <p>
                  <strong>Final Price:</strong>{" "}
                  {selectedProduct.finalPrice.toLocaleString()}đ
                </p>
                <p>
                  <strong>Total Sold:</strong> {selectedProduct.totalSold}
                </p>
              </div>
              <div>
                <p>
                  <strong>Overview:</strong>
                </p>
                <p className="text-gray-400">{selectedProduct.overview}</p>
                <p className="mt-2">
                  <strong>Description:</strong>
                </p>
                <p className="text-gray-400">{selectedProduct.description}</p>
              </div>
            </div>

            {/* Images */}
            <div className="mt-4">
              <h3 className="font-semibold mb-2 text-gray-100">Images</h3>
              {selectedProduct.images?.length > 0 ? (
                <div className="flex gap-3 flex-wrap">
                  {selectedProduct.images.map((img: any, idx: number) => {
                    const imageUrl = typeof img === 'string' ? img : img?.imageUrl;
                    if (!imageUrl) return null;

                    return (
                      <img
                        key={idx}
                        src={imageUrl}
                        alt={`${selectedProduct.name} ${idx + 1}`}
                        className="w-28 h-28 object-cover rounded border border-white/10 shadow-sm"
                        onError={(e) => e.currentTarget.style.display = 'none'}
                      />
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No images</p>
              )}
            </div>

            {/* Specifications */}
            {(selectedProduct.specifications?.length || selectedProduct.specs?.length) > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2 text-gray-100">Specifications</h3>
                <div className="border border-white/10 bg-black/20 rounded-lg p-3 space-y-3 shadow-sm">
                  {(selectedProduct.specifications || selectedProduct.specs || []).map((s: any, idx: number) => {
                    const title = s.attributeName || s.name || s.title || `Attribute ${idx + 1}`;
                    const values = s.values || s.value || s.valuesList || [];
                    return (
                      <div key={idx}>
                        <p className="font-bold text-gray-200">{title}</p>
                        <ul className="list-disc ml-5 text-gray-400">
                          {Array.isArray(values) && values.length > 0 ? (
                            values.map((v: string, i: number) => <li key={i}>{v}</li>)
                          ) : (
                            <li className="text-sm text-gray-500">No values</li>
                          )}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Variants */}
            {selectedProduct.variants?.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2 text-gray-100">Variants</h3>
                <div className="space-y-3">
                  {selectedProduct.variants.map((v: any) => (
                    <div key={v.id} className="border border-white/10 bg-black/20 rounded-lg p-4 shadow-sm">
                      <div className="grid grid-cols-4 gap-4 mb-2">
                        <div>
                          <span className="text-xs text-gray-400">SKU:</span>
                          <p className="font-medium text-gray-200">{v.sku}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-400">Price:</span>
                          <p className="font-medium text-green-400">{v.price.toLocaleString()}đ</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-400">Stock:</span>
                          <p className="font-medium text-gray-200">{v.stock}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-400">Status:</span>
                          <p className="font-medium text-gray-200">{v.status || "Available"}</p>
                        </div>
                      </div>

                      <div className="mt-2">
                        <span className="text-xs text-gray-400">Attributes:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {v.attributes?.map((a: any, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded text-sm shadow-sm"
                            >
                              <strong className="text-gray-200">{a.attributeName || a.name}:</strong>{" "}
                              {Array.isArray(a.value) ? a.value.join(", ") : a.value}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}