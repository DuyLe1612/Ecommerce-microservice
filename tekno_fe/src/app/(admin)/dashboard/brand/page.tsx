"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import  Actions  from "@/components/admin/Actions";
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


  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-5">
          <h2 className="text-xl font-semibold">Brands</h2>
            <p className="text-sm text-gray-500 mt-1">
    Tổng số: {brands.length} brands
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
          className="border p-2 rounded w-80"
          onChange={(e) => {
  setSearch(e.target.value);
  setCurrentPage(1); // Reset to first page when searching
}}
        />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : filteredBrands.length === 0 ? (
        <p className="text-gray-500">No brands found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm bg-white shadow rounded">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-2">ID</th>
                <th>Logo</th>
                <th>Name</th>
                <th>Country</th>
                <th>  </th>
              </tr>
            </thead>
<tbody>
  {paginatedBrands.map((b) => (
    <tr className="border-b hover:bg-gray-50" key={b.id}>
      <td className="p-2">{b.id}</td>
      <td>
        {b.logoPath && (
          <img src={b.logoPath} alt={b.name || 'Brand'} className="h-12 w-auto object-contain" />
        )}
      </td>
      <td>{b.name}</td>
      <td>{b.country}</td>
      <td>
        <Actions
          onEdit={() => handleEdit(b)}
          onDelete={() => handleDelete(b.id)}
        />
      </td>
    </tr>
  ))}
</tbody>
          </table>

        {/* === PAGINATION CONTROLS === */}
        {filteredBrands.length > 0 && (
          <div className="flex justify-between items-center mt-4 px-4 py-3 bg-gray-50 rounded">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                Hiển thị:
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border rounded px-2 py-1"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </label>
              <span className="text-sm text-gray-600">
                Từ {(currentPage - 1) * itemsPerPage + 1} đến{" "}
                {Math.min(currentPage * itemsPerPage, filteredBrands.length)} trong{" "}
                {filteredBrands.length} brands
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Trước
              </button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 border rounded ${
                      currentPage === page
                        ? "bg-blue-500 text-white border-blue-500"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau →
              </button>
            </div>
          </div>
        )}
        </div>
      )}

{/*EDIT DIALOG*/}
<Dialog open={openEdit} onOpenChange={setOpenEdit}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>Edit Brand</DialogTitle>
    </DialogHeader>

    <div className="grid gap-3 mt-2">
      
      <label className="block text-sm font-medium mb-1">Brand Name*</label>
      <Input
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <label className="block text-sm font-medium mb-1">Slug*</label>
      <Input
        value={form.slug}
        onChange={(e) => setForm({ ...form, slug: e.target.value })}
      />

      <label className="block text-sm font-medium mb-1">Country</label>
      <Input
        value={form.country}
        onChange={(e) => setForm({ ...form, country: e.target.value })}
      />

      <label className="block text-sm font-medium mb-1">Logo</label>
      <Input
        type="file"
        accept="image/*"
        onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })}
      />


      <Button onClick={handleUpdate}>Update Brand</Button>
    </div>
  </DialogContent>
</Dialog>

      {/*CREATE DIALOG*/}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Brand</DialogTitle>
          </DialogHeader>

          <div className="grid gap-3 mt-2">
            <div>
              <label className="block text-sm font-medium mb-1">Name*</label>
              <Input placeholder="Brand name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Slug*</label>
              <Input placeholder="e.g., brand-slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Country</label>
              <Input placeholder="e.g., USA, Vietnam" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Image</label>
              <Input type="file" accept="image/*" onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })} />
              {form.image && <p className="text-xs text-gray-600 mt-1">Selected: {form.image.name}</p>}
            </div>

            <Button onClick={handleCreate} className="mt-3">Create Brand</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}