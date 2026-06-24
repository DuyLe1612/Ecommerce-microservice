"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Eye, Truck, CheckCircle, XCircle, ChevronLeft, ChevronRight, Package, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import {
  getAdminOrders,
  cancelOrder,
  deliverOrder,
  shipOrder,
  Order,
  OrderStatus,
  OrderStatusLabels,
} from "@/services/orders";
import OrderDetail from "@/components/admin/OrderDetail";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [openShipModal, setOpenShipModal] = useState(false);
  const [shipOrderData, setShipOrderData] = useState<Order | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<OrderStatus | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Ship form
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("");

  // ✅ Wrap loadOrders bằng useCallback (ĐẶT TRƯỚC useEffect)
  const loadOrders = useCallback(async () => {
      console.log("🔍 loadOrders called with:", {
    keyword: searchKeyword,
    status: statusFilter,
    page: currentPage,
  });
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Please login first!");
        setLoading(false);
        window.location.href = '/login';
        return;
      }
      
      const res = await getAdminOrders({
        status: statusFilter,
        keyword: searchKeyword || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page: currentPage,
        pageSize: pageSize,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      
      const responseData = res?.data || res;
      const list = responseData?.data || [];
      
      setOrders(list);
      setTotalCount(responseData?.totalCount || 0);
      setTotalPages(responseData?.totalPages || 1);
    } catch (err) {
      console.error("❌ Failed to load orders:", err);
      
      if ((err as any)?.status === 401) {
        toast.error("Session expired. Please login again!");
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchKeyword, startDate, endDate, currentPage, pageSize]);

  // ✅ useEffect gọi loadOrders
  useEffect(() => {
    loadOrders();
  }, [loadOrders]); // ✅ CHỈ loadOrders - vì loadOrders đã wrap các dependencies khác

  const handleSearch = () => {
    setCurrentPage(1); // ✅ Thay đổi currentPage → loadOrders tạo lại → useEffect trigger
  };

  const handleResetFilters = () => {
    setStatusFilter(null);
    setSearchKeyword("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1); // ✅ Reset page → loadOrders trigger
  };


  const handleCancelOrder = async (orderId: number) => {
    const reason = prompt("Enter cancellation reason (optional):");
    if (reason === null) return;
    
    try {
      await cancelOrder(orderId, reason);
      toast.success("Order cancelled successfully!");
      await loadOrders();
    } catch (err) {
      console.error("Failed to cancel order:", err);
      toast.error("Failed to cancel order");
    }
  };

  const handleDeliverOrder = async (orderId: number) => {
    if (!confirm("Mark this order as delivered?")) return;
    
    try {
      await deliverOrder(orderId);
      toast.success("Order marked as delivered!");
      await loadOrders();
    } catch (err) {
      console.error("Failed to deliver order:", err);
      toast.error("Failed to mark as delivered");
    }
  };

  const openShipForm = (order: Order) => {
    setShipOrderData(order);
    setTrackingNumber("");
    setCarrier("");
    setOpenShipModal(true);
  };

  const handleShipOrder = async () => {
    if (!shipOrderData) return;
    
    try {
      await shipOrder(shipOrderData.id, trackingNumber, carrier);
      toast.success("Order shipped successfully!");
      await loadOrders();
      setOpenShipModal(false);
    } catch (err) {
      console.error("Failed to ship order:", err);
      toast.error("Failed to ship order");
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Pending:
        return "bg-yellow-100 text-yellow-800";
      case OrderStatus.Processing:
        return "bg-blue-100 text-blue-800";
      case OrderStatus.Shipping:
        return "bg-purple-100 text-purple-800";
      case OrderStatus.Delivered:
        return "bg-green-100 text-green-800";
      case OrderStatus.Cancelled:
        return "bg-red-100 text-red-800";
      case OrderStatus.RefundRequested:
        return "bg-orange-100 text-orange-800";
      case OrderStatus.Refunded:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("vi-VN") + "đ";
  };

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
        <h2 className="text-xl font-semibold">Orders Management</h2>
      </div>

      {/* Filters */}
      <div className="mb-4 space-y-3">
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by order number (ORD-20241222) or user ID (123)..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>

          <select
            className="bg-black/20 border border-white/10 text-gray-300 rounded px-3 py-2 min-w-[150px] focus:outline-none focus:border-white/30"
            value={statusFilter === null ? "" : statusFilter}
            onChange={(e) => setStatusFilter(e.target.value === "" ? null : Number(e.target.value) as OrderStatus)}
          >
            <option value="">All Status</option>
            <option value={OrderStatus.Pending}>Pending</option>
            <option value={OrderStatus.Processing}>Processing</option>
            <option value={OrderStatus.Shipping}>Shipping</option>
            <option value={OrderStatus.Delivered}>Delivered</option>
            <option value={OrderStatus.Cancelled}>Cancelled</option>
            <option value={OrderStatus.RefundRequested}>Refund Requested</option>
            <option value={OrderStatus.Refunded}>Refunded</option>
          </select>

          <Button variant="outline" onClick={handleResetFilters}>Reset</Button>
        </div>

        <div className="flex gap-3 items-center">
          <label className="text-sm font-medium">Date Range:</label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-auto"
          />
          <span className="text-sm text-gray-400">to</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-auto"
          />
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-400">Loading orders...</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm bg-white/5 backdrop-blur-md shadow-none rounded-xl border border-white/10 overflow-hidden">
              <thead>
                <tr className="bg-white/10 text-left text-gray-200 border-b border-white/10">
                  <th className="p-2">Order #</th>
                  <th>User ID</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-400">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-white/5 border-b border-white/5 cursor-pointer text-gray-300 transition-colors"
                      onClick={() => setSelectedOrderId(order.id)}
                    >
                      <td className="p-2 font-medium text-blue-600">{order.orderNumber}</td>
                      <td className="p-2 text-gray-400">#{order.userId}</td>
                      <td className="p-2">
                        <div>
                          <p className="font-medium">{order.userName || "N/A"}</p>
                          <p className="text-xs text-gray-400">{order.userEmail}</p>
                          <p className="text-xs text-gray-400">{order.phoneNumber}</p>
                        </div>
                      </td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {OrderStatusLabels[order.status]}
                        </span>
                      </td>
                      <td className="p-2 font-medium">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="p-2">
                        <div>
                          <p className="text-xs">{order.paymentMethod || "N/A"}</p>
                          <span
                            className={`text-xs px-1 py-0.5 rounded ${
                              order.paymentStatus === "Paid"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {order.paymentStatus || "Pending"}
                          </span>
                        </div>
                      </td>
                      <td className="p-2 text-xs">{formatDate(order.createdAt)}</td>
                      <td className="p-2">
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedOrderId(order.id)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>

                          {order.status === OrderStatus.Processing && (
                            <button
                              onClick={() => openShipForm(order)}
                              className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                              title="Ship Order"
                            >
                              <Truck size={16} />
                            </button>
                          )}

                          {order.status === OrderStatus.Shipping && (
                            <button
                              onClick={() => handleDeliverOrder(order.id)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="Mark as Delivered"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}

                          {[OrderStatus.Pending, OrderStatus.Processing].includes(order.status) && (
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Cancel Order"
                            >
                              <XCircle size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="mt-8 flex flex-wrap justify-center overflow-hidden mb-4">
              <PaginationContent className="flex-wrap gap-1 sm:gap-2">
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    className="text-gray-300 hover:text-white hover:bg-gray-800 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(currentPage - 1);
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
                          handlePageChange(p);
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
                      handlePageChange(currentPage + 1);
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      {/* Order Detail Modal */}
      {selectedOrderId && (
        <OrderDetail
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          onActionComplete={loadOrders}
        />
      )}

      {/* Ship Order Modal */}
      {openShipModal && shipOrderData && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] border border-white/10 text-gray-200 w-full max-w-md rounded-2xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Ship Order</h3>
              <button
                onClick={() => setOpenShipModal(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <XCircle size={24} />
              </button>
            </div>

            <p className="text-sm text-gray-400 mb-4">
              Order: <strong>{shipOrderData.orderNumber}</strong>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tracking Number (optional)
                </label>
                <Input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Carrier (optional)
                </label>
                <Input
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  placeholder="e.g., Giao Hàng Nhanh, Viettel Post"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setOpenShipModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleShipOrder}>
                <Truck className="w-4 h-4 mr-2" />
                Ship Order
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}