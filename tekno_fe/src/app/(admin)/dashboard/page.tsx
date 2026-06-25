"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  getAdminStatistics,
  invalidateStatisticsCache,
  DatePeriod,
  GetStatisticsParams,
  RevenueByCategory,
  RevenueChartData,
  RecentOrder,
  TopCustomer,
  TopProduct,
  StatisticsResponse,
  StatisticsError,
} from "@/services/statistics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  RefreshCw,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";
import { MOCK_STATISTICS } from "@/data/mockStatistics";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

type ChartType = "daily" | "weekly" | "monthly";

type RevenueChartPoint = {
  label: string;
  revenue: number;
  orderCount: number;
};

type RevenueChartByType = Record<ChartType, RevenueChartPoint[]>;

type CategoryRevenueView = {
  categoryId: number;
  categoryName: string;
  revenue: number;
  revenuePercentage: number;
};

type TopSoldProductView = {
  productId: number;
  productName: string;
  categoryName: string;
  unitsSold: number;
  revenue: number;
  averageRating: number;
  totalReviews: number;
};

type TopCustomerView = {
  userId: number;
  customerName: string;
  email: string;
  customerSegment: string;
  totalSpent: number;
  orderCount: number;
};

type RecentOrderView = {
  orderId: number;
  orderNumber: string;
  itemCount: number;
  createdAt: string;
  status: string;
  totalAmount: number;
  customerName: string;
};

type LowStockAlertView = {
  productId: number;
  productName: string;
  stockLevel: number;
};

type OverviewView = {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  revenueGrowthPercent?: number;
  orderGrowthPercent?: number;
  pendingOrders: number;
  processingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  orderCompletionRate: number;
  orderCancellationRate: number;
};

const getValueFromObject = (value: unknown, key: string): unknown => {
  if (typeof value === "object" && value !== null && key in value) {
    return (value as Record<string, unknown>)[key];
  }
  return undefined;
};

const asNumber = (value: unknown, fallback = 0): number => {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
};

const asString = (value: unknown, fallback = ""): string => {
  return typeof value === "string" ? value : fallback;
};

const buildOverview = (overview: StatisticsResponse["overview"]): OverviewView => {
  const pendingOrders = asNumber(getValueFromObject(overview, "pendingOrders"));
  const processingOrders = asNumber(getValueFromObject(overview, "processingOrders"));
  const completedOrders = asNumber(getValueFromObject(overview, "completedOrders"));
  const cancelledOrders = asNumber(getValueFromObject(overview, "cancelledOrders"));

  const totalOrders = asNumber(overview.totalOrders);
  const completionFromData = getValueFromObject(overview, "orderCompletionRate");
  const cancellationFromData = getValueFromObject(overview, "orderCancellationRate");
  const computedCompletionRate =
    totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
  const computedCancellationRate =
    totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0;

  return {
    totalRevenue: overview.totalRevenue,
    totalOrders,
    totalCustomers: overview.totalCustomers,
    averageOrderValue: overview.averageOrderValue,
    revenueGrowthPercent: overview.revenueGrowth,
    orderGrowthPercent: overview.ordersGrowth,
    pendingOrders,
    processingOrders,
    completedOrders,
    cancelledOrders,
    orderCompletionRate: asNumber(completionFromData, computedCompletionRate),
    orderCancellationRate: asNumber(cancellationFromData, computedCancellationRate),
  };
};

const toTopSoldProducts = (topProducts: TopProduct[]): TopSoldProductView[] => {
  return topProducts.map((product) => ({
    productId: product.id,
    productName: product.name,
    categoryName: "N/A",
    unitsSold: product.totalSold,
    revenue: product.totalRevenue,
    averageRating: 0,
    totalReviews: 0,
  }));
};

const toCategoryRevenue = (
  revenueByCategory: RevenueByCategory[]
): CategoryRevenueView[] => {
  return revenueByCategory.map((item) => ({
    categoryId: item.categoryId,
    categoryName: item.categoryName,
    revenue: item.totalRevenue,
    revenuePercentage: item.percentage,
  }));
};

const toRevenueChartByType = (
  revenueChart: RevenueChartData[]
): RevenueChartByType => {
  const points = revenueChart.map((point) => ({
    label: point.date,
    revenue: point.revenue,
    orderCount: point.orders,
  }));

  return {
    daily: points,
    weekly: points,
    monthly: points,
  };
};

const toTopCustomers = (customers: TopCustomer[]): TopCustomerView[] => {
  return customers.map((customer) => ({
    userId: customer.id,
    customerName: customer.name,
    email: customer.email,
    customerSegment: customer.totalSpent >= 10_000_000 ? "VIP" : "Regular",
    totalSpent: customer.totalSpent,
    orderCount: customer.totalOrders,
  }));
};

const toRecentOrders = (orders: RecentOrder[]): RecentOrderView[] => {
  return orders.map((order) => ({
    orderId: order.id,
    orderNumber: String(order.id),
    itemCount: 0,
    createdAt: order.orderDate,
    status: order.status,
    totalAmount: order.totalAmount,
    customerName: order.customerName,
  }));
};

const toLowStockAlerts = (productPerformance: StatisticsResponse["productPerformance"]) => {
  const rawValue = getValueFromObject(productPerformance, "lowStockAlerts");

  if (!Array.isArray(rawValue)) {
    return [] as LowStockAlertView[];
  }

  return rawValue.reduce<LowStockAlertView[]>((acc, item) => {
    if (typeof item !== "object" || item === null) {
      return acc;
    }

    const record = item as Record<string, unknown>;
    const productId = asNumber(record.productId, -1);
    const productName = asString(record.productName, "Unknown product");
    const stockLevel = asNumber(record.stockLevel);

    if (productId < 0) {
      return acc;
    }

    acc.push({
      productId,
      productName,
      stockLevel,
    });

    return acc;
  }, []);
};

export default function AdminStatisticsPage() {
  const [statistics, setStatistics] = useState<StatisticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);

  // Filters
  const [selectedPeriod, setSelectedPeriod] = useState<DatePeriod>("Last30Days");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [topCount, setTopCount] = useState(10);
  const [chartType, setChartType] = useState<ChartType>("daily");

  const getToken = useCallback(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token") || "";
    }
    return "";
  }, []);

  const loadStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();

      if (!token) {
        // Use mock data when not logged in
        setStatistics(MOCK_STATISTICS as unknown as StatisticsResponse);
        setUsingMockData(true);
        setLoading(false);
        return;
      }

      const params: GetStatisticsParams = {
        period: selectedPeriod || "Last30Days",
        topCount: Math.max(5, Math.min(50, topCount)),
      };

      if (selectedPeriod === "Custom") {
        if (customStartDate) params.startDate = customStartDate;
        if (customEndDate) params.endDate = customEndDate;
      }

      const response = await getAdminStatistics(token, params);
      setStatistics(response.data);
      setUsingMockData(false);
    } catch (err: unknown) {
      console.warn("[Dashboard] Using mock data due to error:", err);
      // Use mock data when API fails
      setStatistics(MOCK_STATISTICS as unknown as StatisticsResponse);
      setUsingMockData(true);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [
    customEndDate,
    customStartDate,
    getToken,
    selectedPeriod,
    topCount,
  ]);

  useEffect(() => {
    void loadStatistics();
  }, [loadStatistics]);

  const handleInvalidateCache = async () => {
    try {
      setRefreshing(true);
      const token = getToken();

      if (!token) {
        toast.error("Vui lòng đăng nhập để làm mới cache");
        return;
      }

      await invalidateStatisticsCache(token);
      await loadStatistics();
      toast.success("Đã làm mới cache thành công!");
    } catch (err: unknown) {
      toast.error("Không thể làm mới cache");
    } finally {
      setRefreshing(false);
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString("vi-VN") + "đ";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Đang tải thống kê...</p>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Không có dữ liệu thống kê</p>
      </div>
    );
  }

  const overview = buildOverview(statistics.overview);
  const topSoldProducts = toTopSoldProducts(statistics.topProducts);
  const categoryRevenue = toCategoryRevenue(statistics.revenueByCategory);
  const topCustomers = toTopCustomers(statistics.topCustomers);
  const revenueChart = toRevenueChartByType(statistics.revenueChart);
  const recentOrders = toRecentOrders(statistics.recentOrders);
  const lowStockAlerts = toLowStockAlerts(statistics.productPerformance);
  const { productPerformance } = statistics;

  return (
    <div className="p-6 bg-black/5 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Thống kê Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">
            Tổng quan về hoạt động cửa hàng của bạn
            {usingMockData && (
              <span className="ml-2 text-yellow-500">(Dữ liệu demo)</span>
            )}
          </p>
        </div>
        <Button
          onClick={handleInvalidateCache}
          disabled={refreshing}
          variant="outline"
          className="flex items-center gap-2 border-white/20 text-gray-300 hover:bg-white/10"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Làm mới
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Thời gian
            </label>
            <select
              className="w-full border border-white/20 rounded-lg px-3 py-2 bg-white/10 text-white focus:outline-none focus:border-white/40"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as DatePeriod)}
            >
              <option value="Today">Hôm nay</option>
              <option value="Yesterday">Hôm qua</option>
              <option value="Last7Days">7 ngày qua</option>
              <option value="Last30Days">30 ngày qua</option>
              <option value="ThisWeek">Tuần này</option>
              <option value="LastWeek">Tuần trước</option>
              <option value="ThisMonth">Tháng này</option>
              <option value="LastMonth">Tháng trước</option>
              <option value="ThisQuarter">Quý này</option>
              <option value="LastQuarter">Quý trước</option>
              <option value="ThisYear">Năm nay</option>
              <option value="LastYear">Năm trước</option>
              <option value="Custom">Tùy chỉnh</option>
            </select>
          </div>

          {selectedPeriod === "Custom" && (
            <>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ngày bắt đầu
                </label>
                <Input
                  type="date"
                  className="bg-white/10 border-white/20 text-white"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ngày kết thúc
                </label>
                <Input
                  type="date"
                  className="bg-white/10 border-white/20 text-white"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:-translate-y-1 hover:bg-white/10 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-400">Tổng doanh thu</p>
            <DollarSign className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {formatCurrency(overview.totalRevenue)}
          </p>
          {overview.revenueGrowthPercent !== undefined && (
            <div className="flex items-center mt-2 text-sm">
              {overview.revenueGrowthPercent >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400 mr-1" />
              )}
              <span
                className={
                  overview.revenueGrowthPercent >= 0 ? "text-green-400" : "text-red-400"
                }
              >
                {overview.revenueGrowthPercent.toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:-translate-y-1 hover:bg-white/10 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-400">Tổng đơn hàng</p>
            <ShoppingCart className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {overview.totalOrders.toLocaleString()}
          </p>
          {overview.orderGrowthPercent !== undefined && (
            <div className="flex items-center mt-2 text-sm">
              {overview.orderGrowthPercent >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400 mr-1" />
              )}
              <span
                className={
                  overview.orderGrowthPercent >= 0 ? "text-green-400" : "text-red-400"
                }
              >
                {overview.orderGrowthPercent.toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:-translate-y-1 hover:bg-white/10 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-400">Tổng khách hàng</p>
            <Users className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {overview.totalCustomers.toLocaleString()}
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:-translate-y-1 hover:bg-white/10 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-400">Giá trị đơn TB</p>
            <Package className="w-5 h-5 text-orange-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {formatCurrency(overview.averageOrderValue)}
          </p>
        </div>
      </div>

      {/* Order Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-yellow-400 uppercase tracking-wide">Chờ xử lý</p>
              <p className="text-2xl font-bold text-yellow-300">{overview.pendingOrders}</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-yellow-400/50" />
          </div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-400 uppercase tracking-wide">Đang xử lý</p>
              <p className="text-2xl font-bold text-blue-300">{overview.processingOrders}</p>
            </div>
            <Package className="w-8 h-8 text-blue-400/50" />
          </div>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-green-400 uppercase tracking-wide">Hoàn thành</p>
              <p className="text-2xl font-bold text-green-300">{overview.completedOrders}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400/50" />
          </div>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-red-400 uppercase tracking-wide">Đã hủy</p>
              <p className="text-2xl font-bold text-red-300">{overview.cancelledOrders}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-400/50" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Doanh thu</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueChart[chartType] || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="label" stroke="#ffffff50" />
              <YAxis tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`} stroke="#ffffff50" />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff20' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Doanh thu"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Đơn hàng
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueChart[chartType] || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="label" stroke="#ffffff50" />
              <YAxis stroke="#ffffff50" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff20' }}
              />
              <Legend />
              <Bar dataKey="orderCount" fill="#10b981" name="Đơn hàng" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Doanh thu theo danh mục
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryRevenue.map((item) => ({
                  ...item,
                  value: item.revenue,
                }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: { payload?: CategoryRevenueView }) => {
                  const payload = entry.payload;
                  if (!payload) {
                    return "Unknown";
                  }
                  return `${payload.categoryName} (${payload.revenuePercentage.toFixed(1)}%)`;
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryRevenue.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff20' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Product Performance */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Hiệu suất sản phẩm
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <p className="text-sm text-blue-400 font-medium mb-1">Tổng sản phẩm</p>
              <p className="text-2xl font-bold text-white">
                {productPerformance.totalProducts}
              </p>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <p className="text-sm text-green-400 font-medium mb-1">Đang bán</p>
              <p className="text-2xl font-bold text-white">
                {productPerformance.activeProducts}
              </p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <p className="text-sm text-red-400 font-medium mb-1">Hết hàng</p>
              <p className="text-2xl font-bold text-white">
                {productPerformance.outOfStock}
              </p>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
              <p className="text-sm text-orange-400 font-medium mb-1">Sắp hết</p>
              <p className="text-2xl font-bold text-white">
                {productPerformance.lowStock}
              </p>
            </div>
          </div>

          {/* Low Stock Alerts */}
          {lowStockAlerts.length > 0 && (
            <div className="border-t border-white/10 pt-4">
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                Cảnh báo sắp hết hàng
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {lowStockAlerts.slice(0, 5).map((lowStockAlert) => (
                  <div key={lowStockAlert.productId} className="flex items-center justify-between p-2 bg-orange-500/10 border border-orange-500/20 rounded-lg text-sm">
                    <span className="text-white font-medium">{lowStockAlert.productName}</span>
                    <span className="text-orange-400 font-bold">Còn {lowStockAlert.stockLevel}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Sản phẩm bán chạy
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 font-medium text-gray-400">Sản phẩm</th>
                <th className="text-center py-3 px-4 font-medium text-gray-400">Đã bán</th>
                <th className="text-right py-3 px-4 font-medium text-gray-400">Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {topSoldProducts.map((product, idx) => (
                <tr key={product.productId} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 font-medium">#{idx + 1}</span>
                      <span className="font-medium text-white">{product.productName}</span>
                    </div>
                  </td>
                  <td className="text-center py-3 px-4 text-gray-300">
                    {product.unitsSold.toLocaleString()}
                  </td>
                  <td className="text-right py-3 px-4 font-medium text-green-400">
                    {formatCurrency(product.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Customers & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Customers */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Khách hàng hàng đầu
          </h3>
          <div className="space-y-3">
            {topCustomers.map((customer, idx) => (
              <div
                key={customer.userId}
                className="flex items-center justify-between p-3 bg-white/5 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary text-black rounded-full flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-medium text-white">{customer.customerName}</p>
                    <p className="text-xs text-gray-500">{customer.email}</p>
                    <p className="text-xs text-primary font-medium mt-1">{customer.customerSegment}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-400">
                    {formatCurrency(customer.totalSpent)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {customer.orderCount} đơn
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Đơn hàng gần đây
          </h3>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.orderId}
                className="flex items-center justify-between p-3 bg-white/5 rounded-xl"
              >
                <div>
                  <p className="font-medium text-white">#{order.orderNumber}</p>
                  <p className="text-xs text-gray-500">{order.customerName}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">
                    {formatCurrency(order.totalAmount)}
                  </p>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      order.status === "DELIVERED"
                        ? "bg-green-500/20 text-green-400"
                        : order.status === "PROCESSING"
                        ? "bg-blue-500/20 text-blue-400"
                        : order.status === "PENDING_PAYMENT"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Import CheckCircle and XCircle
import { CheckCircle, XCircle } from "lucide-react";
