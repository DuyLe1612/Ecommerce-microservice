"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
        alert("Please fill all required fields");
        return;
      }

      if (!form.image) {
        alert("Please select an image");
        return;
      }

      if (form.priority < 0 || form.priority > 100) {
        alert("Priority must be between 0 and 100");
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

      alert("Advertisement created successfully!");
    } catch (e) {
      console.error("Create error", e);
      alert("Failed to create advertisement");
    }
  };

  // Handle Delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this advertisement?")) return;

    try {
      await advertisementApi.delete(id);
      alert("Advertisement deleted successfully!");
      await loadAdvertisements();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete advertisement");
    }
  };

  // Handle Activate
  const handleActivate = async (id: string) => {
    try {
      await advertisementApi.activate(id);
      alert("Advertisement activated successfully!");
      await loadAdvertisements();
    } catch (err) {
      console.error("Activate error:", err);
      alert("Failed to activate advertisement");
    }
  };

  // Handle Deactivate
  const handleDeactivate = async (id: string) => {
    try {
      await advertisementApi.deactivate(id);
      alert("Advertisement deactivated successfully!");
      await loadAdvertisements();
    } catch (err) {
      console.error("Deactivate error:", err);
      alert("Failed to deactivate advertisement");
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-5">
          <h2 className="text-xl font-semibold">Advertisement Management</h2>
            <p className="text-sm text-gray-500 mt-1">
    Tổng số: {advertisements.length} advertisements
    {search && ` (Tìm thấy: ${filteredAdvertisements.length})`}
  </p>
        </div>
        <Button onClick={() => setOpenCreate(true)}>+ Create Advertisement</Button>
      </div>

      {/* Search + Filter UI */}
      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by product name, position, or ID..."
          className="border p-2 rounded w-80"
          value={search}
            onChange={(e) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset to first page
  }}
        />

        <select
          className="border p-2 rounded"
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
          <p className="text-gray-500">Loading advertisements...</p>
        </div>
      ) : advertisements.length === 0 ? (
        <p className="text-gray-500">No advertisements found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm bg-white shadow rounded">
            <thead>
              <tr className="bg-gray-200 text-left">
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
    <tr className="border-b hover:bg-gray-50" key={ad.id}>
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
        <div className="text-xs text-gray-500">ID: {ad.productId}</div>
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
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="View Details"
          >
            <Eye size={16} />
          </button>

          {ad.isActive ? (
            <button
              onClick={() => handleDeactivate(ad.id.toString())}
              className="p-1 text-orange-600 hover:bg-orange-50 rounded"
              title="Deactivate"
            >
              <PowerOff size={16} />
            </button>
          ) : (
            <button
              onClick={() => handleActivate(ad.id.toString())}
              className="p-1 text-green-600 hover:bg-green-50 rounded"
              title="Activate"
            >
              <Power size={16} />
            </button>
          )}

          <button
            onClick={() => handleDelete(ad.id.toString())}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
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
        {filteredAdvertisements.length > 0 && (
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
                {Math.min(currentPage * itemsPerPage, filteredAdvertisements.length)} trong{" "}
                {filteredAdvertisements.length} advertisements
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

      {/* Create Advertisement Modal */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Advertisement</DialogTitle>
          </DialogHeader>

          <div className="grid gap-3 mt-2">
            <div>
              <label className="block text-sm font-medium mb-1">
                Product ID <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Enter product ID"
                type="number"
                value={form.productId}
                onChange={(e) => setForm({ ...form, productId: e.target.value })}
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
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>

                <SelectContent>
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
                placeholder="Priority (higher = more important)"
                type="number"
                min={0}
                max={100}
                value={form.priority}
                onChange={(e) =>
                  setForm({ ...form, priority: Number(e.target.value) })
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                Priority must be between 0 and 100
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Image <span className="text-red-500">*</span>
              </label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setForm({ ...form, image: file });
                }}
              />
              {form.image && (
                <div className="mt-2">
                  <p className="text-xs text-gray-600 mb-1">
                    Selected: {form.image.name}
                  </p>
                  <img
                    src={URL.createObjectURL(form.image)}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded border"
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
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="isActive" className="text-sm font-medium">
                Active immediately
              </label>
            </div>

            <Button onClick={handleCreate} className="mt-3">
              Create Advertisement
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      {openDetail && selectedAd && (
        <Dialog open={openDetail} onOpenChange={setOpenDetail}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                    className="w-full h-64 object-cover rounded border"
                  />
                </div>
              )}

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    ID
                  </label>
                  <p className="text-sm">{selectedAd.id}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Product
                  </label>
                  <p className="text-sm font-medium">
                    {selectedAd.productName || `Product #${selectedAd.productId}`}
                  </p>
                  <p className="text-xs text-gray-500">ID: {selectedAd.productId}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Position
                  </label>
                  <p className="text-sm">{selectedAd.position}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Priority
                  </label>
                  <p className="text-sm">{selectedAd.priority}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Start Date
                  </label>
                  <p className="text-sm">
                    {new Date(selectedAd.startDate).toLocaleString("vi-VN")}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    End Date
                  </label>
                  <p className="text-sm">
                    {new Date(selectedAd.endDate).toLocaleString("vi-VN")}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Status
                  </label>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      selectedAd.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {selectedAd.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setOpenDetail(false)}>
                  Close
                </Button>
                {selectedAd.isActive ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleDeactivate(selectedAd.id.toString());
                      setOpenDetail(false);
                    }}
                    className="text-orange-600 border-orange-600"
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
                    className="bg-green-600 hover:bg-green-700"
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
                  className="text-red-600 border-red-600"
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
