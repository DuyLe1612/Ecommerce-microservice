"use client";

import React, { useEffect, useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Edit2, Trash2 } from "lucide-react";
import Actions from "@/components/admin/Actions";
import { getBrandList, createBrand, updateBrand, deleteBrand, uploadBrandLogo } from "@/services/brand";

export default function BrandPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [search, setSearch] = useState("");

  const [openEdit, setOpenEdit] = useState(false);
  const [editingBrand, setEditingBrand] = useState<any>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    country: "",
    image: null as File | null,
  });

  const fetchBrands = async () => {
    try {
      const res = await getBrandList();

      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
          ? res.data.data
          : [];

      setBrands(list);
    } catch (err) {
      console.error(err);
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchBrands();
  }, []);

  const handleCreate = async () => {
    try {
      if (!form.name || !form.slug) {
        alert("Name and Slug are required");
        return;
      }

      let logoUrl = "";
      if (form.image) {
        const uploadRes = await uploadBrandLogo(form.image);
        if (uploadRes?.success) logoUrl = uploadRes.data.url;
      }

      const payload = {
        name: form.name,
        slug: form.slug,
        logoUrl: logoUrl,
      };

      await createBrand(payload);

      await fetchBrands(); // refresh list

      setOpenCreate(false);
      setForm({ name: "", slug: "", country: "", image: null });
    } catch (e: any) {
      alert(e.message || "Create brand failed");
    }
  };

  // ✅ Filter brands by search
  const filteredBrands = brands.filter((b) =>
    (b.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (b.country || "").toLowerCase().includes(search.toLowerCase()) ||
    String(b.id).includes(search)
  );

  // ✅ Paginate filtered brands
  const paginatedBrands = (() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredBrands.slice(startIndex, endIndex);
  })();

  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage);

  const handleEdit = (brand: any) => {
    setEditingBrand(brand);
    setForm({
      name: brand.name || "",
      slug: brand.slug || "",
      country: brand.country || "",
      image: null,
    });
    setOpenEdit(true);
  };

  const handleUpdate = async () => {
    if (!editingBrand?.id) return;

    if (!form.name || !form.slug) {
      alert("Name and Slug are required");
      return;
    }

    try {
      let logoUrl = editingBrand?.logoPath || "";
      if (form.image) {
        const uploadRes = await uploadBrandLogo(form.image);
        if (uploadRes?.success) logoUrl = uploadRes.data.url;
      }

      const payload = {
        name: form.name,
        slug: form.slug,
        logoUrl: logoUrl,
      };

      await updateBrand(editingBrand.id, payload);

      await fetchBrands();

      setOpenEdit(false);
      setEditingBrand(null);
      setForm({ name: "", slug: "", country: "", image: null });
    } catch (e: any) {
      alert(e.message || "Update brand failed");
    }
  };


  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this brand?")) return;

    try {
      await deleteBrand(id);
      setBrands((prev) => prev.filter((b) => b.id !== id));
    } catch (e: any) {
      alert(e.message || "Delete brand failed");
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
        <div className="flex items-center gap-5">
          <h2 className="text-xl font-semibold">Brands</h2>
          <p className="text-sm text-gray-400 mt-1">
            Total: {brands.length} brands
            {search && ` (Tìm thấy: ${filteredBrands.length})`}
          </p>
        </div>
        <Button
          onClick={() => {
            setForm({ name: "", slug: "", country: "", image: null });
            setEditingBrand(null);
            setOpenCreate(true);
          }}
        >
          + Create Brand
        </Button>

      </div>

      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Search brands..."
          className="border border-white/10 bg-black/20 text-gray-200 p-2 rounded w-80 focus:outline-none focus:border-white/30"
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1); // Reset to first page when searching
          }}
        />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : filteredBrands.length === 0 ? (
        <p className="text-gray-400">No brands found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm bg-white/5 backdrop-blur-md shadow-none rounded-xl border border-white/10 overflow-hidden">
            <thead>
              <tr className="bg-white/10 text-left text-gray-200 border-b border-white/10">
                <th className="py-3 px-4 font-medium text-gray-400">ID</th>
                <th className="py-3 px-4 font-medium text-gray-400">Logo</th>
                <th className="py-3 px-4 font-medium text-gray-400">Name</th>
                <th className="py-3 px-4 font-medium text-gray-400">Country</th>
                <th className="py-3 px-4 font-medium text-gray-400 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBrands.map((b) => (
                <tr className="border-b border-white/5 hover:bg-white/5 text-gray-300 transition-colors" key={b.id}>
                  <td className="py-3 px-4 font-mono text-xs text-gray-400">{b.id}</td>
                  <td className="py-3 px-4">
                    {b.logoPath && (
                      <div className="bg-black/20 border border-white/10 rounded p-1 inline-block">
                        <img src={b.logoPath} alt={b.name || 'Brand'} className="h-8 w-auto object-contain" />
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-100">{b.name}</td>
                  <td className="py-3 px-4">{b.country}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(b)}
                        className="p-1 text-green-400 hover:bg-green-500/10 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="p-1 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

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

      {/*EDIT DIALOG*/}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="bg-[#121212] backdrop-blur-md border border-white/10 rounded-xl shadow-2xl text-gray-200 max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Brand</DialogTitle>
          </DialogHeader>

          <div className="grid gap-3 mt-2">

            <label className="block text-sm font-medium mb-1 text-gray-300">Brand Name*</label>
            <Input
              className="bg-black/20 border-white/10 text-gray-200"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <label className="block text-sm font-medium mb-1 text-gray-300">Slug*</label>
            <Input
              className="bg-black/20 border-white/10 text-gray-200"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />

            <label className="block text-sm font-medium mb-1 text-gray-300">Country</label>
            <Input
              className="bg-black/20 border-white/10 text-gray-200"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
            />

            <label className="block text-sm font-medium mb-1 text-gray-300">Logo</label>
            <input
              className="w-full bg-black/20 border border-white/10 rounded-md text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:border-0 file:border-r file:border-white/10 file:bg-white/10 file:text-white file:font-medium hover:file:bg-white/20 cursor-pointer transition-all"
              type="file"
              accept="image/*"
              onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })}
            />


            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" className="bg-transparent border-white/10 text-gray-300 hover:bg-white/10 hover:text-white" onClick={() => setOpenEdit(false)}>Cancel</Button>
              <Button onClick={handleUpdate}>Update Brand</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/*CREATE DIALOG*/}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="bg-[#121212] backdrop-blur-md border border-white/10 rounded-xl shadow-2xl text-gray-200 max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Brand</DialogTitle>
          </DialogHeader>

          <div className="grid gap-3 mt-2">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Name*</label>
              <Input className="bg-black/20 border-white/10 text-gray-200" placeholder="Brand name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Slug*</label>
              <Input className="bg-black/20 border-white/10 text-gray-200" placeholder="e.g., brand-slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Country</label>
              <Input className="bg-black/20 border-white/10 text-gray-200" placeholder="e.g., USA, Vietnam" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Image</label>
              <input className="w-full bg-black/20 border border-white/10 rounded-md text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:border-0 file:border-r file:border-white/10 file:bg-white/10 file:text-white file:font-medium hover:file:bg-white/20 cursor-pointer transition-all" type="file" accept="image/*" onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })} />
              {form.image && <p className="text-xs text-gray-400 mt-1">Selected: {form.image.name}</p>}
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" className="bg-transparent border-white/10 text-gray-300 hover:bg-white/10 hover:text-white" onClick={() => setOpenCreate(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Create Brand</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}