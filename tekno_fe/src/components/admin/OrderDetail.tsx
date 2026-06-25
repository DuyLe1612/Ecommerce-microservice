"use client";

import React, { useEffect, useState } from "react";
import { X, Package, Truck, CheckCircle, XCircle, Clock, CreditCard, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAdminOrder, OrderStatus, OrderStatusLabels, OrderStatusColors } from "@/services/orders";
import Image from "next/image";

type OrderDetailProps = {
  orderId: number;
  onClose: () => void;
  onActionComplete?: () => void;
};

type OrderItemData = {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  productImageUrl?: string | null;
};

type ShippingAddressData = {
  recipientName?: string;
  phone?: string;
  streetAddress?: string;
  city?: string;
  district?: string;
  ward?: string;
  postalCode?: string;
};

type OrderDetailData = {
  id: number;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  statusName?: string;
  totalAmount: number;
  currency?: string;
  createdAt: string;
  updatedAt?: string;
  items: OrderItemData[];
  shippingAddress: ShippingAddressData;
};

export default function OrderDetail({ orderId, onClose, onActionComplete }: OrderDetailProps) {
  const [order, setOrder] = useState<OrderDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrderDetail();
  }, [orderId]);

  const loadOrderDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAdminOrder(orderId);
      const data = response?.data || response;

      setOrder(data);
    } catch (err) {
      console.error("Failed to load order detail:", err);
      setError(err instanceof Error ? err.message : "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    return OrderStatusColors[status] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING_PAYMENT:
        return <Clock className="w-5 h-5" />;
      case OrderStatus.PROCESSING:
        return <Package className="w-5 h-5" />;
      case OrderStatus.SHIPPING:
        return <Truck className="w-5 h-5" />;
      case OrderStatus.DELIVERED:
        return <CheckCircle className="w-5 h-5" />;
      case OrderStatus.CANCELLED:
        return <XCircle className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAddress = (address: ShippingAddressData | null | undefined) => {
    if (!address) return "No address provided";
    
    const parts = [];
    if (address.streetAddress) parts.push(address.streetAddress);
    if (address.ward) parts.push(address.ward);
    if (address.district) parts.push(address.district);
    if (address.city) parts.push(address.city);
    
    return parts.length > 0 ? parts.join(", ") : "No address details";
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("vi-VN") + "đ";
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
        <div className="bg-[#1a1a1a] p-8 rounded-xl border border-white/10">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <p className="text-gray-300">Đang tải chi tiết đơn hàng...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
        <div className="bg-[#1a1a1a] p-6 rounded-xl border border-white/10 max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-red-400">Lỗi</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X size={24} />
            </button>
          </div>
          <p className="text-gray-300 mb-4">{error}</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} className="border-white/20 text-gray-300">
              Đóng
            </Button>
            <Button onClick={loadOrderDetail}>Thử lại</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
      <div className="bg-[#1a1a1a] rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-white/10">
        {/* Header */}
        <div className="sticky top-0 bg-[#1a1a1a] border-b border-white/10 px-6 py-4 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold text-white">Chi tiết đơn hàng</h2>
            <p className="text-sm text-gray-400">{order.orderNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={28} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Banner */}
          <div
            className={`flex items-center gap-3 p-4 rounded-lg border ${getStatusColor(order.status)}`}
          >
            {getStatusIcon(order.status)}
            <div className="flex-1">
              <p className="font-semibold text-lg">{order.statusName || OrderStatusLabels[order.status]}</p>
              <p className="text-sm opacity-80">Đơn hàng {order.orderNumber}</p>
            </div>
            <div className="text-right text-sm">
              <p className="opacity-80">Ngày tạo</p>
              <p className="font-medium">{formatDate(order.createdAt)}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Customer Information */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-white">
                <User className="w-5 h-5" />
                Thông tin khách hàng
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-400">User ID</p>
                  <p className="font-medium text-white">#{order.userId}</p>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-white">
                <MapPin className="w-5 h-5" />
                Địa chỉ giao hàng
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-400">Người nhận</p>
                  <p className="font-medium text-white">
                    {order.shippingAddress?.recipientName || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Số điện thoại</p>
                  <p className="font-medium text-white">
                    {order.shippingAddress?.phone || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Địa chỉ</p>
                  <p className="font-medium text-white">{formatAddress(order.shippingAddress)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-white">
              <Package className="w-5 h-5" />
              Sản phẩm ({order.items.length})
            </h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 bg-white/5 rounded-lg"
                >
                  {/* Product Image */}
                  <div className="flex-shrink-0 w-20 h-20 bg-white/10 rounded-lg overflow-hidden">
                    {item.productImageUrl ? (
                      <Image
                        src={item.productImageUrl}
                        alt={item.productName}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <Package size={32} />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white mb-1">
                      {item.productName}
                    </h4>
                    <p className="text-sm text-gray-400">
                      SKU: {item.productId}
                    </p>
                  </div>

                  {/* Price Info */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm text-gray-400">Đơn giá</p>
                    <p className="font-medium text-white">{formatCurrency(item.unitPrice)}</p>
                    <p className="text-sm text-gray-400 mt-1">Số lượng: x{item.quantity}</p>
                    <p className="font-bold text-primary mt-1">
                      {formatCurrency(item.subtotal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 rounded-lg p-6">
            <div className="flex justify-between items-center">
              <span className="text-xl font-semibold text-white">
                Tổng cộng
              </span>
              <span className="text-3xl font-bold text-primary">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="border-white/20 text-gray-300 hover:bg-white/10"
            >
              Đóng
            </Button>
            {onActionComplete && (
              <Button 
                onClick={loadOrderDetail}
                className="bg-white/10 hover:bg-white/20 text-white"
              >
                Làm mới
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
