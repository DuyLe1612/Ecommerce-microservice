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
import { Eye, Truck, CheckCircle, XCircle, Package, Search } from "lucide-react";
import { toast } from "sonner";
import {
  getAdminOrders,
  cancelOrder,
  deliverOrder,
  shipOrder,
  Order,
  OrderStatus,
  OrderStatusLabels,
  OrderStatusColors,
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
  
  // Pagination (0-based for Spring Data)
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Ship form
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("");

  const loadOrders = useCallback(async () => {
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
      
      // Handle Spring Data Page structure
      const pageData = res?.content || res?.data || res || {};
      const list = Array.isArray(pageData) ? pageData : (pageData?.content || pageData?.data || []);
      
      setOrders(list);
      setTotalCount(pageData?.totalElements || pageData?.totalCount || list.length);
      setTotalPages(pageData?.totalPages || 1);
    } catch (err) {
      console.error("Failed to load orders:", err);
      
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

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleSearch = () => {
    setCurrentPage(0);
  };

  const handleResetFilters = () => {
    setStatusFilter(null);
    setSearchKeyword("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(0);
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

  const getStatusBadge = (status: OrderStatus) => {
    const colorClass = OrderStatusColors[status] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
    const label = OrderStatusLabels[status] || status;
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium border ${colorClass}`}>
        {label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("vi-VN") + "đ";
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getVisiblePages = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(0, 1, 2, 3, -1, totalPages - 1);
      } else if (currentPage >= totalPages - 3) {
        pages.push(0, -1, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1);
      } else {
        pages.push(0, -1, currentPage - 1, currentPage, currentPage + 1, -1, totalPages - 1);
      }
    }
    return pages;
  };

  const canShip = (status: OrderStatus) => status === OrderStatus.PROCESSING;
  const canDeliver = (status: OrderStatus) => status === OrderStatus.SHIPPING;
  const canCancel = (status: OrderStatus) => 
    status === OrderStatus.PENDING_PAYMENT || status === OrderStatus.PROCESSING;

  return (
    <div className="p-6 bg-black/5 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">order management</h2>
        <div className="text-sm text-gray-400">
          total: {totalCount} orders | page {currentPage + 1} of {totalPages}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 space-y-3 bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search by Order ID..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
            />
          </div>

          <select
            className="bg-white/10 border border-white/20 text-gray-300 rounded px-3 py-2 min-w-[180px] focus:outline-none focus:border-white/40"
            value={statusFilter || ""}
            onChange={(e) => {
              setStatusFilter(e.target.value as OrderStatus || null);
              setCurrentPage(0);
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value={OrderStatus.PENDING_PAYMENT}>`PENDING_PAYMENT`</option>
            <option value={OrderStatus.PROCESSING}>`PROCESSING`</option>
            <option value={OrderStatus.SHIPPING}>`SHIPPING`</option>
            <option value={OrderStatus.DELIVERED}>`DELIVERED`</option>
            <option value={OrderStatus.CANCELLED}>`CANCELLED`</option>
            <option value={OrderStatus.REFUND_REQUESTED}>`REFUND_REQUESTED`</option>
            <option value={OrderStatus.REFUNDED}>`REFUNDED`</option>
          </select>

          <Button 
            variant="outline" 
            onClick={handleResetFilters}
            className="border-white/20 text-gray-300 hover:bg-white/10"
          >
            Đặt lại
          </Button>
        </div>

        <div className="flex gap-3 items-center flex-wrap">
          <label className="text-sm font-medium text-gray-400">Date:</label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-auto bg-white/10 border-white/20 text-white"
          />
          <span className="text-sm text-gray-500">to</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-auto bg-white/10 border-white/20 text-white"
          />
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p className="ml-3 text-gray-400">Loading orders...</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/10 text-left text-gray-300 border-b border-white/10">
                  <th className="p-3 font-medium">ID</th>
                  <th className="p-3 font-medium">Customer</th>
                  <th className="p-3 font-medium">status</th>
                  <th className="p-3 font-medium">Amount</th>
                  <th className="p-3 font-medium">date</th>
                  <th className="p-3 font-medium">actions</th>
                </tr>
              </thead>

              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      Cannot find any orders. Try adjusting your filters or search criteria.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-white/5 hover:bg-white/5 cursor-pointer text-gray-300 transition-colors"
                      onClick={() => setSelectedOrderId(order.id)}
                    >
                      <td className="p-3 font-medium text-white">{order.orderNumber}</td>
                      <td className="p-3">
                        <div>
                          <p className="font-medium text-white">
                            {order.shippingAddress?.recipientName || "N/A"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.shippingAddress?.phone || ""}
                          </p>
                        </div>
                      </td>
                      <td className="p-3">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="p-3 font-medium text-white">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="p-3 text-xs text-gray-400">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedOrderId(order.id)}
                            className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                            title="View details"
                          >
                            <Eye size={16} />
                          </button>

                          {canShip(order.status) && (
                            <button
                              onClick={() => openShipForm(order)}
                              className="p-2 text-purple-400 hover:bg-purple-500/20 rounded-lg transition-colors"
                              title="Ship order"
                            >
                              <Truck size={16} />
                            </button>
                          )}

                          {canDeliver(order.status) && (
                            <button
                              onClick={() => handleDeliverOrder(order.id)}
                              className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                              title="Mark as delivered"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}

                          {canCancel(order.status) && (
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                              title="cancel order"
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
            <Pagination className="mt-6 flex justify-center">
              <PaginationContent className="flex gap-1">
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    className="text-gray-300 hover:bg-white/10 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(currentPage - 1);
                    }}
                    aria-disabled={currentPage === 0}
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
                        className={`cursor-pointer ${
                          currentPage === p
                            ? "bg-primary text-black hover:bg-primary/90"
                            : "text-gray-300 hover:bg-white/10"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(p);
                        }}
                      >
                        {p + 1}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    className="text-gray-300 hover:bg-white/10 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(currentPage + 1);
                    }}
                    aria-disabled={currentPage >= totalPages - 1}
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
              <h3 className="text-xl font-semibold">delivery</h3>
              <button
                onClick={() => setOpenShipModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <XCircle size={24} />
              </button>
            </div>

            <p className="text-sm text-gray-400 mb-4">
              order: <strong className="text-white">{shipOrderData.orderNumber}</strong>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">
                  Tracking Number (Optional)
                </label>
                <Input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Nhập mã vận đơn"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">
                  shipping unit (optional)
                </label>
                <Input
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  placeholder="VD: Giao Hàng Nhanh, Viettel Post"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setOpenShipModal(false)}
                className="border-white/20 text-gray-300"
              >
                cancel
              </Button>
              <Button onClick={handleShipOrder}>
                <Truck className="w-4 h-4 mr-2" />
                delivery
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
