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
import { voucherApi } from "@/services/voucherApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Trash2, Edit2, Power, PowerOff, BarChart3, History, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export default function VoucherPage() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [openStatistics, setOpenStatistics] = useState(false);
  const [openUsage, setOpenUsage] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [usage, setUsage] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingUsage, setLoadingUsage] = useState(false);

  // Search + Filter
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [form, setForm] = useState({
    code: "",
    name: "",
    value: 0,
    quantity: 0,
    startDate: "",
    endDate: "",
    note: "",
  });

  // Fetch vouchers
  useEffect(() => {
    loadVouchers();
  }, []);

  const loadVouchers = async () => {
    try {
      setLoading(true);
      const json = await voucherApi.getAll();
      const list = Array.isArray(json?.data?.data)
        ? json.data.data
        : Array.isArray(json?.data)
        ? json.data
        : [];
      setVouchers(list);
    } catch (err) {
      console.error("Fetch error:", err);
      setVouchers([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle Statistics
  const handleViewStatistics = async (voucher: any) => {
    try {
      setLoadingStats(true);
      setSelectedVoucher(voucher);
      setOpenStatistics(true);
      
      const statsData = await voucherApi.getStatistics(voucher.id.toString());
      setStatistics(statsData?.data || statsData);
    } catch (err) {
      console.error("Failed to load statistics:", err);
      toast.error("Failed to load statistics");
      setOpenStatistics(false);
    } finally {
      setLoadingStats(false);
    }
  };

  // Handle Usage History
  const handleViewUsage = async (voucher: any) => {
    try {
      setLoadingUsage(true);
      setSelectedVoucher(voucher);
      setOpenUsage(true);
      
      const usageData = await voucherApi.getUsage(voucher.id.toString());
      const usageList = Array.isArray(usageData?.data?.data)
        ? usageData.data.data
        : Array.isArray(usageData?.data)
        ? usageData.data
        : Array.isArray(usageData)
        ? usageData
        : [];
      setUsage(usageList);
    } catch (err) {
      console.error("Failed to load usage:", err);
      toast.error("Failed to load usage history");
      setOpenUsage(false);
    } finally {
      setLoadingUsage(false);
    }
  };

  // Handle Create
  const handleCreate = async () => {
    try {
      if (!form.code || !form.name || !form.startDate || !form.endDate) {
        toast.error("Please fill all required fields");
        return;
      }

      if (form.value <= 0) {
        toast.error("Value must be greater than 0");
        return;
      }

      if (form.quantity <= 0) {
        toast.error("Quantity must be greater than 0");
        return;
      }

      const payload = {
        code: form.code.toUpperCase(),
        name: form.name,
        type: "FixedAmount",
        value: Number(form.value),
        quantity: Number(form.quantity),
        note: form.note || "",
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        applicableCategoryIds: [],
        applicableProductIds: [],
      };

      await voucherApi.create(payload);
      toast.success("Voucher created successfully!");
      
      await loadVouchers();
      setOpenCreate(false);
      resetForm();
    } catch (e) {
      console.error("Create error", e);
      toast.error("Failed to create voucher");
    }
  };

  // Handle Edit
  const openEditModal = async (voucher: any) => {
    try {
      const detail = await voucherApi.getById(voucher.id.toString());
      const data = detail?.data || detail;
      
      setSelectedVoucher(data);
      setForm({
        code: data.code,
        name: data.name,
        value: data.value,
        quantity: data.quantity,
        startDate: new Date(data.startDate).toISOString().slice(0, 16),
        endDate: new Date(data.endDate).toISOString().slice(0, 16),
        note: data.note || "",
      });
      setOpenEdit(true);
    } catch (err) {
      console.error("Failed to load voucher detail:", err);
      toast.error("Failed to load voucher details");
    }
  };

  const handleUpdate = async () => {
    try {
      if (!selectedVoucher) return;

      if (!form.code || !form.name || !form.startDate || !form.endDate) {
        toast.error("Please fill all required fields");
        return;
      }

      const payload = {
        code: form.code.toUpperCase(),
        name: form.name,
        type: "FixedAmount",
        value: Number(form.value),
        quantity: Number(form.quantity),
        note: form.note || "",
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        applicableCategoryIds: [],
        applicableProductIds: [],
      };

      await voucherApi.update(selectedVoucher.id.toString(), payload);
      toast.success("Voucher updated successfully!");
      
      await loadVouchers();
      setOpenEdit(false);
      resetForm();
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Failed to update voucher");
    }
  };

  // Handle Delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this voucher?")) return;

    try {
      await voucherApi.delete(id);
      toast.success("Voucher deleted successfully!");
      await loadVouchers();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete voucher");
    }
  };

  // Handle Activate
  const handleActivate = async (id: string) => {
    try {
      await voucherApi.activate(id);
      toast.success("Voucher activated successfully!");
      await loadVouchers();
    } catch (err) {
      console.error("Activate error:", err);
      toast.error("Failed to activate voucher");
    }
  };

  // Handle Deactivate
  const handleDeactivate = async (id: string) => {
    try {
      await voucherApi.deactivate(id);
      toast.success("Voucher deactivated successfully!");
      await loadVouchers();
    } catch (err) {
      console.error("Deactivate error:", err);
      toast.error("Failed to deactivate voucher");
    }
  };

  // View Detail
  const handleViewDetail = async (voucher: any) => {
    try {
      const detail = await voucherApi.getById(voucher.id.toString());
      const data = detail?.data || detail;
      setSelectedVoucher(data);
      setOpenDetail(true);
    } catch (err) {
      console.error("Failed to load detail:", err);
      setSelectedVoucher(voucher);
      setOpenDetail(true);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setCurrentPage(1);
  };

  const resetForm = () => {
    setForm({
      code: "",
      name: "",
      value: 0,
      quantity: 0,
      startDate: "",
      endDate: "",
      note: "",
    });
    setSelectedVoucher(null);
  };

  // Filter + Search Logic + Pagination
  const { filteredVouchers, totalPages } = useMemo(() => {
    const today = new Date();

    const filtered = vouchers
      .map((v) => {
        const start = new Date(v.startDate);
        const end = new Date(v.endDate);

        let status = v.status || "Active";
        if (start > today) status = "Scheduled";
        else if (end < today) status = "Expired";
        else if (v.status === "Inactive") status = "Inactive";

        return { ...v, status };
      })
      .filter((v) => {
        const matchSearch =
          v.code?.toLowerCase().includes(search.toLowerCase()) ||
          v.name?.toLowerCase().includes(search.toLowerCase());

        const matchStatus = statusFilter === "All" || v.status === statusFilter;

        return matchSearch && matchStatus;
      });

    // Tính pagination
    const total = Math.ceil(filtered.length / pageSize);
    const startIdx = (currentPage - 1) * pageSize;
    const paginatedData = filtered.slice(startIdx, startIdx + pageSize);

    return { filteredVouchers: paginatedData, totalPages: total };
  }, [vouchers, search, statusFilter, currentPage, pageSize]);

  // Page change - định nghĩa sau useMemo để có quyền truy cập totalPages
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
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
          <h2 className="text-xl font-semibold">Voucher Management</h2>
        </div>
        <Button onClick={() => setOpenCreate(true)}>+ Create Voucher</Button>
      </div>

      {/* Search + Filter UI */}
      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by code or name..."
          className="border border-white/10 bg-black/20 text-gray-200 p-2 rounded w-64 focus:outline-none focus:border-white/30"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="bg-black/20 border border-white/10 text-gray-300 rounded p-2 focus:outline-none focus:border-white/30"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
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
          <p className="text-gray-400">Loading vouchers...</p>
        </div>
      ) : filteredVouchers.length === 0 ? (
        <p className="text-gray-400">No vouchers found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm bg-white/5 backdrop-blur-md shadow-none rounded-xl border border-white/10 overflow-hidden">
            <thead>
              <tr className="bg-white/10 text-left text-gray-200 border-b border-white/10">
                <th className="p-2">Code</th>
                <th>Name</th>
                <th>Value</th>
                <th>Quantity</th>
                <th>Start</th>
                <th>End</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVouchers.map((v) => (
                <tr className="border-b border-white/5 hover:bg-white/5 text-gray-300 transition-colors" key={v.id}>
                  <td className="p-2 font-mono font-medium text-blue-600">
                    {v.code}
                  </td>
                  <td>{v.name}</td>
                  <td className="font-medium">{v.value.toLocaleString()}đ</td>
                  <td>{v.quantity}</td>
                  <td className="text-xs">
                    {new Date(v.startDate).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="text-xs">
                    {new Date(v.endDate).toLocaleDateString("vi-VN")}
                  </td>
                  <td>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        v.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : v.status === "Scheduled"
                          ? "bg-blue-100 text-blue-700"
                          : v.status === "Expired"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {v.status}
                    </span>
                  </td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetail(v)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        onClick={() => handleViewStatistics(v)}
                        className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                        title="View Statistics"
                      >
                        <BarChart3 size={16} />
                      </button>

                      <button
                        onClick={() => handleViewUsage(v)}
                        className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
                        title="View Usage History"
                      >
                        <History size={16} />
                      </button>

                      <button
                        onClick={() => openEditModal(v)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>

                      {v.status === "Active" || v.status === "Scheduled" ? (
                        <button
                          onClick={() => handleDeactivate(v.id.toString())}
                          className="p-1 text-orange-600 hover:bg-orange-50 rounded"
                          title="Deactivate"
                        >
                          <PowerOff size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(v.id.toString())}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                          title="Activate"
                        >
                          <Power size={16} />
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(v.id.toString())}
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
        </div>
      )}

        {/* Pagination Controls */}
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

      {/* Create Voucher Modal */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="bg-[#121212] border-white/10 text-gray-200 max-w-md">
          <DialogHeader>
            <DialogTitle>Create Voucher</DialogTitle>
          </DialogHeader>

          <div className="grid gap-3 mt-2">
            <div>
              <label className="block text-sm font-medium mb-1">
                Code <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g., SUMMER2025"
                value={form.code}
                onChange={(e) =>
                  setForm({ ...form, code: e.target.value.toUpperCase() })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Voucher name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Value (đ) <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Discount amount"
                type="number"
                min={0}
                value={form.value}
                onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Quantity <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Number of vouchers"
                type="number"
                min={1}
                value={form.quantity}
                onChange={(e) =>
                  setForm({ ...form, quantity: Number(e.target.value) })
                }
              />
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

            <div>
              <label className="block text-sm font-medium mb-1">Note</label>
              <Input
                placeholder="Optional note"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </div>

            <Button onClick={handleCreate} className="mt-3">
              Create Voucher
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Voucher Modal */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="bg-[#121212] border-white/10 text-gray-200 max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Voucher</DialogTitle>
          </DialogHeader>

          <div className="grid gap-3 mt-2">
            <div>
              <label className="block text-sm font-medium mb-1">
                Code <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g., SUMMER2025"
                value={form.code}
                onChange={(e) =>
                  setForm({ ...form, code: e.target.value.toUpperCase() })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Voucher name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Value (đ) <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Discount amount"
                type="number"
                min={0}
                value={form.value}
                onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Quantity <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Number of vouchers"
                type="number"
                min={1}
                value={form.quantity}
                onChange={(e) =>
                  setForm({ ...form, quantity: Number(e.target.value) })
                }
              />
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

            <div>
              <label className="block text-sm font-medium mb-1">Note</label>
              <Input
                placeholder="Optional note"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </div>

            <div className="flex gap-3 mt-3">
              <Button
                variant="outline"
                onClick={() => {
                  setOpenEdit(false);
                  resetForm();
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleUpdate} className="flex-1">
                Update Voucher
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      {openDetail && selectedVoucher && (
        <Dialog open={openDetail} onOpenChange={setOpenDetail}>
          <DialogContent className="bg-[#121212] border-white/10 text-gray-200 max-w-2xl">
            <DialogHeader>
              <DialogTitle>Voucher Details</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400">
                    Code
                  </label>
                  <p className="text-lg font-mono font-bold text-blue-600">
                    {selectedVoucher.code}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400">
                    Status
                  </label>
                  <span
                    className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                      selectedVoucher.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : selectedVoucher.status === "Scheduled"
                        ? "bg-blue-100 text-blue-700"
                        : selectedVoucher.status === "Expired"
                        ? "bg-gray-100 text-gray-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {selectedVoucher.status || "Active"}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400">
                    Name
                  </label>
                  <p className="text-sm font-medium">{selectedVoucher.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400">
                    Discount Value
                  </label>
                  <p className="text-lg font-bold text-green-600">
                    {selectedVoucher.value.toLocaleString()}đ
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400">
                    Quantity
                  </label>
                  <p className="text-sm">{selectedVoucher.quantity}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400">
                    Type
                  </label>
                  <p className="text-sm">{selectedVoucher.type || "FixedAmount"}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400">
                    Start Date
                  </label>
                  <p className="text-sm">
                    {new Date(selectedVoucher.startDate).toLocaleString("vi-VN")}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400">
                    End Date
                  </label>
                  <p className="text-sm">
                    {new Date(selectedVoucher.endDate).toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>

              {selectedVoucher.note && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Note
                  </label>
                  <p className="text-sm bg-yellow-50 border border-yellow-200 rounded p-3">
                    {selectedVoucher.note}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setOpenDetail(false)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setOpenDetail(false);
                    openEditModal(selectedVoucher);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    handleDelete(selectedVoucher.id.toString());
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

      {/* Statistics Modal */}
      {openStatistics && selectedVoucher && (
        <Dialog open={openStatistics} onOpenChange={setOpenStatistics}>
          <DialogContent className="bg-[#121212] border-white/10 text-gray-200 max-w-3xl">
            <DialogHeader>
              <DialogTitle>Voucher Statistics - {selectedVoucher.code}</DialogTitle>
            </DialogHeader>

            {loadingStats ? (
              <div className="flex justify-center items-center py-12">
                <p className="text-gray-400">Loading statistics...</p>
              </div>
            ) : statistics ? (
              <div className="space-y-6 mt-4">
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-xs text-blue-600 font-medium mb-1">Total Used</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {statistics.totalUsed || 0}
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-xs text-green-600 font-medium mb-1">Total Discount</p>
                    <p className="text-2xl font-bold text-green-700">
                      {(statistics.totalDiscount || 0).toLocaleString()}đ
                    </p>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-xs text-purple-600 font-medium mb-1">Remaining</p>
                    <p className="text-2xl font-bold text-purple-700">
                      {(statistics.remaining || selectedVoucher.quantity)}
                    </p>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <p className="text-xs text-orange-600 font-medium mb-1">Usage Rate</p>
                    <p className="text-2xl font-bold text-orange-700">
                      {statistics.usageRate || '0%'}
                    </p>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-xs text-red-600 font-medium mb-1">Days Remaining</p>
                    <p className="text-2xl font-bold text-red-700">
                      {statistics.daysRemaining || 0} days
                    </p>
                  </div>
                </div>

                {/* Additional Stats */}
                {statistics.avgOrderValue && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Average Order Value</p>
                    <p className="text-xl font-bold text-gray-100">
                      {statistics.avgOrderValue.toLocaleString()}đ
                    </p>
                  </div>
                )}

                {statistics.topUsers && statistics.topUsers.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">Top Users</p>
                    <div className="space-y-2">
                      {statistics.topUsers.map((user: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0">
                          <span className="text-sm">{user.email || user.name}</span>
                          <span className="text-sm font-medium">{user.count} times</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-4 border-t">
                  <Button variant="outline" onClick={() => setOpenStatistics(false)}>
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                No statistics available
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Usage History Modal */}
      {openUsage && selectedVoucher && (
        <Dialog open={openUsage} onOpenChange={setOpenUsage}>
          <DialogContent className="bg-[#121212] border-white/10 text-gray-200 max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Usage History - {selectedVoucher.code}</DialogTitle>
            </DialogHeader>

            {loadingUsage ? (
              <div className="flex justify-center items-center py-12">
                <p className="text-gray-400">Loading usage history...</p>
              </div>
            ) : usage.length > 0 ? (
              <div className="mt-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-white/5 text-left text-gray-200 border-b border-white/10">
                        <th className="p-3 font-medium">Date</th>
                        <th className="p-3 font-medium">Order ID</th>
                        <th className="p-3 font-medium">Customer</th>
                        <th className="p-3 font-medium">Discount</th>
                        <th className="p-3 font-medium">Order Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usage.map((item: any, idx: number) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="p-3 text-xs">
                            {new Date(item.usedAt || item.createdAt).toLocaleString("vi-VN")}
                          </td>
                          <td className="p-3 font-mono text-blue-600">
                            #{item.orderId || item.id}
                          </td>
                          <td className="p-3">
                            <div>
                              <p className="font-medium">{item.customerName || item.userName}</p>
                              <p className="text-xs text-gray-400">{item.customerEmail || item.userEmail}</p>
                            </div>
                          </td>
                          <td className="p-3 font-medium text-green-600">
                            -{(item.discountAmount || selectedVoucher.value).toLocaleString()}đ
                          </td>
                          <td className="p-3 font-medium">
                            {(item.orderTotal || item.totalAmount || 0).toLocaleString()}đ
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-400">
                      Total Usage Records:
                    </span>
                    <span className="text-lg font-bold text-gray-100">
                      {usage.length}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end mt-4 pt-4 border-t">
                  <Button variant="outline" onClick={() => setOpenUsage(false)}>
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                No usage history found
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}