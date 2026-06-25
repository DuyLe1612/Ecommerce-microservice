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

  // Filters
  const [selectedPeriod, setSelectedPeriod] = useState<DatePeriod>("Last30Days");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [topCount, setTopCount] = useState(10);
  const [chartType, setChartType] = useState<ChartType>("daily");

  // Get token (adjust based on your auth implementation)
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
        setError("No authentication token found. Please log in.");
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

      console.log("[Dashboard] Loading statistics with params:", params);
      const response = await getAdminStatistics(token, params);
      setStatistics(response.data);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof StatisticsError
          ? `${err.message} (Status: ${err.status})`
          : err instanceof Error
          ? err.message
          : "Failed to load statistics. Please try again.";

      console.error("[Dashboard] Error details:", err);
      setError(errorMessage);
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
        setError("No authentication token found. Please log in.");
        return;
      }

      await invalidateStatisticsCache(token);
      await loadStatistics();
      toast.success("Cache invalidated and statistics refreshed!");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof StatisticsError
          ? `${err.message} (Status: ${err.status})`
          : err instanceof Error
          ? err.message
          : "Failed to refresh cache";

      console.error("[Dashboard] Cache invalidation error:", err);
      setError(errorMessage);
      toast.error(errorMessage);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800 font-medium">Error Loading Statistics</p>
          <p className="text-red-700 text-sm mt-2">{error}</p>
          <Button
            onClick={loadStatistics}
            className="mt-4"
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="p-6">
        <p className="text-gray-500">No statistics available</p>
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
    <div className="p-6 bg-transparent min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Dashboard Statistics</h1>
          <p className="text-sm text-gray-400 mt-1">
            Comprehensive overview of your store performance
          </p>
        </div>
        <Button
          onClick={handleInvalidateCache}
          disabled={refreshing}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh Cache
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Time Period
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as DatePeriod)}
            >
              <option value="Today">Today</option>
              <option value="Yesterday">Yesterday</option>
              <option value="Last7Days">Last 7 Days</option>
              <option value="Last30Days">Last 30 Days</option>
              <option value="ThisWeek">This Week</option>
              <option value="LastWeek">Last Week</option>
              <option value="ThisMonth">This Month</option>
              <option value="LastMonth">Last Month</option>
              <option value="ThisQuarter">This Quarter</option>
              <option value="LastQuarter">Last Quarter</option>
              <option value="ThisYear">This Year</option>
              <option value="LastYear">Last Year</option>
              <option value="Custom">Custom Range</option>
            </select>
          </div>

          {selectedPeriod === "Custom" && (
            <>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="w-32">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Top Count
            </label>
            <input
              type="number"
              min="5"
              max="50"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={topCount}
              onChange={(e) => setTopCount(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:-translate-y-1 hover:bg-white/10 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-400">Total Revenue</p>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-100">
            {formatCurrency(overview.totalRevenue)}
          </p>
          {overview.revenueGrowthPercent !== undefined && (
            <div className="flex items-center mt-2 text-sm">
              {overview.revenueGrowthPercent >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
              )}
              <span
                className={
                  overview.revenueGrowthPercent >= 0 ? "text-green-600" : "text-red-600"
                }
              >
                {overview.revenueGrowthPercent.toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:-translate-y-1 hover:bg-white/10 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-400">Total Orders</p>
            <ShoppingCart className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-100">
            {overview.totalOrders.toLocaleString()}
          </p>
          {overview.orderGrowthPercent !== undefined && (
            <div className="flex items-center mt-2 text-sm">
              {overview.orderGrowthPercent >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
              )}
              <span
                className={
                  overview.orderGrowthPercent >= 0 ? "text-green-600" : "text-red-600"
                }
              >
                {overview.orderGrowthPercent.toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:-translate-y-1 hover:bg-white/10 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-400">Total Customers</p>
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-100">
            {overview.totalCustomers.toLocaleString()}
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:-translate-y-1 hover:bg-white/10 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-400">Avg Order Value</p>
            <Package className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-gray-100">
            {formatCurrency(overview.averageOrderValue)}
          </p>
        </div>
      </div>

      {/* Order Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-yellow-50 rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-yellow-700 uppercase tracking-wide">Pending</p>
              <p className="text-2xl font-bold text-yellow-900">{overview.pendingOrders}</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        <div className="bg-blue-50 rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Processing</p>
              <p className="text-2xl font-bold text-blue-900">{overview.processingOrders}</p>
            </div>
            <Package className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-green-50 rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-green-700 uppercase tracking-wide">Completed</p>
              <p className="text-2xl font-bold text-green-900">{overview.completedOrders}</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-red-50 rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-red-700 uppercase tracking-wide">Cancelled</p>
              <p className="text-2xl font-bold text-red-900">{overview.cancelledOrders}</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Order Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:-translate-y-1 hover:bg-white/10 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-400">Order Completion Rate</p>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-100">
            {overview.orderCompletionRate.toFixed(1)}%
          </p>
        </div>
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:-translate-y-1 hover:bg-white/10 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-400">Order Cancellation Rate</p>
            <TrendingDown className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-gray-100">
            {overview.orderCancellationRate.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:-translate-y-1 hover:bg-white/10 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-100">Revenue Trend</h3>
            <div className="flex gap-2">
              <Button
                variant={chartType === "daily" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType("daily")}
              >
                Daily
              </Button>
              <Button
                variant={chartType === "weekly" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType("weekly")}
              >
                Weekly
              </Button>
              <Button
                variant={chartType === "monthly" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType("monthly")}
              >
                Monthly
              </Button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueChart[chartType] || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:-translate-y-1 hover:bg-white/10 transition-all duration-300">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">
            Orders Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueChart[chartType] || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="orderCount" fill="#10b981" name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue by Category & Product Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue by Category */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:-translate-y-1 hover:bg-white/10 transition-all duration-300">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">
            Revenue by Category
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
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Product Performance */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:-translate-y-1 hover:bg-white/10 transition-all duration-300">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">
            Product Performance
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium mb-1">Total Products</p>
              <p className="text-2xl font-bold text-blue-700">
                {productPerformance.totalProducts}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600 font-medium mb-1">Active</p>
              <p className="text-2xl font-bold text-green-700">
                {productPerformance.activeProducts}
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-red-600 font-medium mb-1">Out of Stock</p>
              <p className="text-2xl font-bold text-red-700">
                {productPerformance.outOfStock}
              </p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-sm text-orange-600 font-medium mb-1">Low Stock</p>
              <p className="text-2xl font-bold text-orange-700">
                {productPerformance.lowStock}
              </p>
            </div>
          </div>

          {/* Low Stock Alerts */}
          {lowStockAlerts.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold text-gray-100 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                Low Stock Alerts
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {lowStockAlerts.slice(0, 5).map((lowStockAlert) => (
                  <div key={lowStockAlert.productId} className="flex items-center justify-between p-2 bg-orange-50 rounded text-sm">
                    <span className="text-gray-100 font-medium">{lowStockAlert.productName}</span>
                    <span className="text-orange-600 font-bold">{lowStockAlert.stockLevel} left</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:-translate-y-1 hover:bg-white/10 transition-all duration-300 mb-6">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">
          Top Selling Products
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-gray-400">Product</th>
                <th className="text-center py-3 px-4 font-medium text-gray-400">Category</th>
                <th className="text-right py-3 px-4 font-medium text-gray-400">Units Sold</th>
                <th className="text-right py-3 px-4 font-medium text-gray-400">Revenue</th>
                <th className="text-center py-3 px-4 font-medium text-gray-400">Avg Rating</th>
              </tr>
            </thead>
            <tbody>
              {topSoldProducts.map((product, idx) => (
                <tr key={product.productId} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 font-medium">#{idx + 1}</span>
                      <span className="font-medium">{product.productName}</span>
                    </div>
                  </td>
                  <td className="text-center py-3 px-4 text-gray-400">
                    {product.categoryName}
                  </td>
                  <td className="text-right py-3 px-4 font-medium">
                    {product.unitsSold.toLocaleString()}
                  </td>
                  <td className="text-right py-3 px-4 font-medium text-green-600">
                    {formatCurrency(product.revenue)}
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold">
                      {product.averageRating.toFixed(1)} ⭐ ({product.totalReviews})
                    </span>
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
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:-translate-y-1 hover:bg-white/10 transition-all duration-300">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">
            Top Customers
          </h3>
          <div className="space-y-3">
            {topCustomers.map((customer, idx) => (
              <div
                key={customer.userId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-100">{customer.customerName}</p>
                    <p className="text-xs text-gray-500">{customer.email}</p>
                    <p className="text-xs text-blue-600 font-medium mt-1">{customer.customerSegment}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-100">
                    {formatCurrency(customer.totalSpent)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {customer.orderCount} orders
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:-translate-y-1 hover:bg-white/10 transition-all duration-300">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">
            Recent Orders
          </h3>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.orderId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-100">#{order.orderNumber}</p>
                  <p className="text-xs text-gray-500">{order.itemCount} items</p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      order.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : order.status === "Processing"
                        ? "bg-blue-100 text-blue-700"
                        : order.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-300"
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