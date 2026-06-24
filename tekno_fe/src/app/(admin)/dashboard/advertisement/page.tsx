"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Trash2, Power, PowerOff } from "lucide-react";
import { API_BASE, advertisementApi } from "@/services/advertisementApi";
import { postForm } from "@/lib/api";
import { toast } from "sonner";

export default function AdvertisementPage() {
  const [advertisements, setAdvertisements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedAd, setSelectedAd] = useState<any>(null);

  const POSITIONS = [
    { value: "HomeTop" },
    { value: "HomeMiddle" },
    { value: "HomeBottom" },
    { value: "CategoryTop" },
    { value: "ProductSidebar" },
  ];

  // Search + Filter
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [form, setForm] = useState({
    productId: "",
    position: "",
    priority: 100,
    startDate: "",
    endDate: "",
    isActive: true,
    image: null as File | null,
  });

  // Fetch advertisements
  useEffect(() => {
    loadAdvertisements();
  }, []);

const loadAdvertisements = async () => {
  try {
    setLoading(true);
    
    const allAds: any[] = [];
    let page = 1;
    const pageSize = 20;
    let hasMore = true;

    // ✅ Loop load all pages
    while (hasMore) {
      const json = await advertisementApi.getAll({ page, pageSize });
      
      const list = Array.isArray(json?.data?.data)
        ? json.data.data
        : Array.isArray(json?.data)
        ? json.data
        : [];

      if (list.length === 0) {
        hasMore = false;
      } else {
        allAds.push(...list);
        console.log(`📄 Loaded page ${page} (${list.length} items)`);
        page++;
      }
    }

    console.log(`✅ Total loaded: ${allAds.length} advertisements`);
    setAdvertisements(allAds);
    setCurrentPage(1);
  } catch (err) {
    console.error("Fetch error:", err);
    setAdvertisements([]);
  } finally {
    setLoading(false);
  }
};

  // Handle Create with FormData (for image upload)
  const handleCreate = async () => {
    try {
      if (!form.productId || !form.position || !form.startDate || !form.endDate) {
        toast.error("Please fill all required fields");
        return;
      }

      if (!form.image) {
        toast.error("Please select an image");
        return;
      }

      if (form.priority < 0 || form.priority > 100) {
        toast.error("Priority must be between 0 and 100");
        return;
      }

      const formData = new FormData();
      formData.append("image", form.image);
      formData.append("ProductId", form.productId);
      formData.append("Position", form.position);
      formData.append("Priority", String(form.priority));
      formData.append("StartDate", new Date(form.startDate).toISOString());
      formData.append("EndDate", new Date(form.endDate).toISOString());
      formData.append("IsActive", String(form.isActive));

      await postForm(API_BASE, formData);

      // Refresh list
      await loadAdvertisements();

      setOpenCreate(false);
      setForm({
        productId: "",
        position: "",
        priority: 100,
        startDate: "",
        endDate: "",
        isActive: true,
        image: null,
      });

      toast.success("Advertisement created successfully!");
    } catch (e) {
      console.error("Create error", e);
      toast.error("Failed to create advertisement");
    }
  };

  // Handle Delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this advertisement?")) return;

    try {
      await advertisementApi.delete(id);
      toast.success("Advertisement deleted successfully!");
      await loadAdvertisements();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete advertisement");
    }
  };

  // Handle Activate
  const handleActivate = async (id: string) => {
    try {
      await advertisementApi.activate(id);
      toast.success("Advertisement activated successfully!");
      await loadAdvertisements();
    } catch (err) {
      console.error("Activate error:", err);
      toast.error("Failed to activate advertisement");
    }
  };

  // Handle Deactivate
  const handleDeactivate = async (id: string) => {
    try {
      await advertisementApi.deactivate(id);
      toast.success("Advertisement deactivated successfully!");
      await loadAdvertisements();
    } catch (err) {
      console.error("Deactivate error:", err);
      toast.error("Failed to deactivate advertisement");
    }
  };

  // View Detail
  const handleViewDetail = async (ad: any) => {
    try {
      const detail = await advertisementApi.getById(ad.id.toString());
      const data = detail?.data || detail;
      setSelectedAd(data);
      setOpenDetail(true);
    } catch (err) {
      console.error("Failed to load detail:", err);
      setSelectedAd(ad);
      setOpenDetail(true);
    }
  };

// Filter + Search Logic
const filteredAdvertisements = useMemo(() => {
  const today = new Date();

  return advertisements
    .map((ad) => {
      const start = new Date(ad.startDate);
      const end = new Date(ad.endDate);

      let status = "Active";
      if (!ad.isActive) status = "Inactive";
      else if (start > today) status = "Scheduled";
      else if (end < today) status = "Expired";

      return { ...ad, status };
    })
    .filter((ad) => {
      const matchSearch =
        ad.productName?.toLowerCase().includes(search.toLowerCase()) ||
        ad.position?.toLowerCase().includes(search.toLowerCase()) ||
        ad.productId?.toString().includes(search);

      const matchStatus =
        statusFilter === "All" || ad.status === statusFilter;

      return matchSearch && matchStatus;
    });
}, [advertisements, search, statusFilter]);

// ✅ Paginate filtered advertisements
const paginatedAdvertisements = useMemo(() => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return filteredAdvertisements.slice(startIndex, endIndex);
}, [filteredAdvertisements, currentPage, itemsPerPage]);

const totalPages = Math.ceil(filteredAdvertisements.length / itemsPerPage);

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
          <h2 className="text-xl font-semibold">Advertisement Management</h2>
            <p className="text-sm text-gray-400 mt-1">
              Total: {advertisements.length} advertisements
              {search && ` (Found: ${filteredAdvertisements.length})`}
            </p>
        </div>
        <Button onClick={() => setOpenCreate(true)} className="bg-primary hover:bg-primary/90 text-black font-medium">
          + Create Advertisement
        </Button>
      </div>

      {/* Search + Filter UI */}
      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by product name, position, or ID..."
          className="border border-white/10 bg-black/20 text-gray-200 p-2 rounded w-80 focus:outline-none focus:border-white/30"
          value={search}
            onChange={(e) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset to first page
  }}
        />

        <select
          className="bg-black/20 border border-white/10 text-gray-300 rounded p-2 focus:outline-none focus:border-white/30 [&>option]:bg-[#121212] [&>option]:text-gray-300"
          value={statusFilter}
  onChange={(e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page
  }}
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Expired">Expired</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-400">Loading advertisements...</p>
        </div>
      ) : advertisements.length === 0 ? (
        <p className="text-gray-400">No advertisements found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm bg-white/5 backdrop-blur-md shadow-none rounded-xl border border-white/10 overflow-hidden">
            <thead>
              <tr className="bg-white/10 text-left text-gray-200 border-b border-white/10">
                <th className="p-2">ID</th>
                <th>Image</th>
                <th>Product</th>
                <th>Position</th>
                <th>Priority</th>
                <th>Start</th>
                <th>End</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
<tbody>
  {paginatedAdvertisements.map((ad) => (
    <tr className="border-b border-white/5 hover:bg-white/5 text-gray-300 transition-colors" key={ad.id}>
      <td className="p-2">{ad.id}</td>
      <td>
        {ad.imageUrl && (
          <img
            src={ad.imageUrl}
            alt={ad.productName || "Ad"}
            className="w-20 h-12 object-cover rounded"
          />
        )}
      </td>
      <td>
        <div className="font-medium">
          {ad.productName || `Product #${ad.productId}`}
        </div>
        <div className="text-xs text-gray-400">ID: {ad.productId}</div>
      </td>
      <td>{ad.position}</td>
      <td>{ad.priority}</td>
      <td className="text-xs">
        {new Date(ad.startDate).toLocaleDateString("vi-VN")}
      </td>
      <td className="text-xs">
        {new Date(ad.endDate).toLocaleDateString("vi-VN")}
      </td>
      <td>
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            ad.status === "Active"
              ? "bg-green-100 text-green-700"
              : ad.status === "Scheduled"
              ? "bg-blue-100 text-blue-700"
              : ad.status === "Expired"
              ? "bg-gray-100 text-gray-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {ad.status}
        </span>
      </td>
      <td className="p-2">
        <div className="flex gap-2">
          <button
            onClick={() => handleViewDetail(ad)}
            className="p-1 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 rounded transition-colors"
            title="View Details"
          >
            <Eye size={16} />
          </button>

          {ad.isActive ? (
            <button
              onClick={() => handleDeactivate(ad.id.toString())}
              className="p-1 text-orange-400 hover:bg-orange-500/10 hover:text-orange-300 rounded transition-colors"
              title="Deactivate"
            >
              <PowerOff size={16} />
            </button>
          ) : (
            <button
              onClick={() => handleActivate(ad.id.toString())}
              className="p-1 text-green-400 hover:bg-green-500/10 hover:text-green-300 rounded transition-colors"
              title="Activate"
            >
              <Power size={16} />
            </button>
          )}

          <button
            onClick={() => handleDelete(ad.id.toString())}
            className="p-1 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded transition-colors"
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
                      className={`cursor-pointer transition-colors ${
                        currentPage === p
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

      {/* Create Advertisement Modal */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="bg-[#121212] backdrop-blur-md border border-white/10 rounded-xl shadow-2xl text-gray-200 max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Advertisement</DialogTitle>
          </DialogHeader>

          <div className="grid gap-3 mt-2">
            <div>
              <label className="block text-sm font-medium mb-1">
                Product ID <span className="text-red-500">*</span>
              </label>
              <Input
                className="bg-black/20 border-white/10 text-gray-200 focus-visible:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Position <span className="text-red-500">*</span>
              </label>

              <Select
                value={form.position}
                onValueChange={(value) => setForm({ ...form, position: value })}
              >
                <SelectTrigger className="bg-black/20 border-white/10 text-gray-200 focus:ring-primary/50">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>

                <SelectContent className="bg-[#121212] border-white/10 text-gray-200">
                  {POSITIONS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <Input
                className="bg-black/20 border-white/10 text-gray-200 focus-visible:ring-primary/50"
              />
              <p className="text-xs text-gray-400 mt-1">
                Priority must be between 0 and 100
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Image <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setForm({ ...form, image: file });
                }}
                className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 bg-black/20 border border-white/10 rounded-md"
              />
              {form.image && (
                <div className="mt-2">
                  <p className="text-xs text-gray-400 mb-1">
                    Selected: {form.image.name}
                  </p>
                  <img
                    src={URL.createObjectURL(form.image)}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded border border-white/10"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <Input
                type="datetime-local"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="bg-black/20 border-white/10 text-gray-200 [color-scheme:dark]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                End Date <span className="text-red-500">*</span>
              </label>
              <Input
                type="datetime-local"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="bg-black/20 border-white/10 text-gray-200 [color-scheme:dark]"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4 accent-primary"
              />
              <label htmlFor="isActive" className="text-sm font-medium">
                Active immediately
              </label>
            </div>

            <Button onClick={handleCreate} className="mt-3 bg-primary hover:bg-primary/90 text-black font-medium">
              Create Advertisement
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      {openDetail && selectedAd && (
        <Dialog open={openDetail} onOpenChange={setOpenDetail}>
          <DialogContent className="bg-[#121212] backdrop-blur-md border border-white/10 rounded-xl shadow-2xl text-gray-200 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Advertisement Details</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              {/* Image */}
              {selectedAd.imageUrl && (
                <div>
                  <label className="block text-sm font-medium mb-2">Image</label>
                  <img
                    src={selectedAd.imageUrl}
                    alt={selectedAd.productName || "Advertisement"}
                    className="w-full h-64 object-cover rounded border border-white/10"
                  />
                </div>
              )}

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400">
                    ID
                  </label>
                  <p className="text-sm">{selectedAd.id}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400">
                    Product
                  </label>
                  <p className="text-sm font-medium">
                    {selectedAd.productName || `Product #${selectedAd.productId}`}
                  </p>
                  <p className="text-xs text-gray-400">ID: {selectedAd.productId}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400">
                    Position
                  </label>
                  <p className="text-sm">{selectedAd.position}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400">
                    Priority
                  </label>
                  <p className="text-sm">{selectedAd.priority}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400">
                    Start Date
                  </label>
                  <p className="text-sm">
                    {new Date(selectedAd.startDate).toLocaleString("vi-VN")}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400">
                    End Date
                  </label>
                  <p className="text-sm">
                    {new Date(selectedAd.endDate).toLocaleString("vi-VN")}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400">
                    Status
                  </label>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      selectedAd.isActive
                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}
                  >
                    {selectedAd.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button variant="outline" onClick={() => setOpenDetail(false)} className="bg-transparent border-white/10 text-gray-300 hover:bg-white/10 hover:text-white">
                  Close
                </Button>
                {selectedAd.isActive ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleDeactivate(selectedAd.id.toString());
                      setOpenDetail(false);
                    }}
                    className="bg-transparent border-orange-500/20 text-orange-400 hover:bg-orange-500/10"
                  >
                    <PowerOff className="w-4 h-4 mr-2" />
                    Deactivate
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      handleActivate(selectedAd.id.toString());
                      setOpenDetail(false);
                    }}
                    className="bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20"
                  >
                    <Power className="w-4 h-4 mr-2" />
                    Activate
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    handleDelete(selectedAd.id.toString());
                    setOpenDetail(false);
                  }}
                  className="bg-transparent border-red-500/20 text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
