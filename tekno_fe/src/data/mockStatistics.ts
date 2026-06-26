// Mock data for statistics when API is unavailable

export const MOCK_STATISTICS = {
  overview: {
    totalRevenue: 156789000,
    totalOrders: 14,
    totalCustomers: 5,
    averageOrderValue: 23050331,
    revenueGrowth: 12.5,
    ordersGrowth: 8.3,

    pendingOrders: 10,
    processingOrders: 2,
    completedOrders: 2,
    cancelledOrders: 0,
    orderCompletionRate: 85.7,
    orderCancellationRate: 0,
  },
  topProducts: [
    { id: 1, name: "iPhone 15 Pro Max", totalSold: 45, totalRevenue: 225000000, imageUrl: null },
    { id: 2, name: "Samsung Galaxy S24 Ultra", totalSold: 38, totalRevenue: 190000000, imageUrl: null },
    { id: 3, name: "MacBook Pro M3", totalSold: 25, totalRevenue: 312500000, imageUrl: null },
    { id: 4, name: "iPad Air M2", totalSold: 32, totalRevenue: 128000000, imageUrl: null },
    { id: 5, name: "AirPods Pro 2", totalSold: 89, totalRevenue: 71200000, imageUrl: null },
    { id: 6, name: "Apple Watch Series 9", totalSold: 41, totalRevenue: 123000000, imageUrl: null },
    { id: 7, name: "Sony WH-1000XM5", totalSold: 28, totalRevenue: 56000000, imageUrl: null },
    { id: 8, name: "Dell XPS 15", totalSold: 18, totalRevenue: 162000000, imageUrl: null },
    { id: 9, name: "Logitech MX Master 3", totalSold: 56, totalRevenue: 44800000, imageUrl: null },
    { id: 10, name: "Anker PowerCore 20000", totalSold: 124, totalRevenue: 37200000, imageUrl: null },
  ],
  revenueByCategory: [
    { categoryId: 1, categoryName: "Smartphone", totalRevenue: 450000000, percentage: 32.5 },
    { categoryId: 2, categoryName: "Laptop", totalRevenue: 520000000, percentage: 37.5 },
    { categoryId: 3, categoryName: "Tablet", totalRevenue: 180000000, percentage: 13.0 },
    { categoryId: 4, categoryName: "Accessories", totalRevenue: 150000000, percentage: 10.8 },
    { categoryId: 5, categoryName: "Smart Watch", totalRevenue: 87000000, percentage: 6.3 },
  ],
  topCustomers: [
    { id: 1, name: "Nguyễn Lê Duy", email: "duy.nguyen@email.com", totalOrders: 15, totalSpent: 45000000 },
    { id: 2, name: "Phạm Hà Anh Thư", email: "thu.pham@email.com", totalOrders: 12, totalSpent: 38000000 },
    { id: 3, name: "Vũ Phạm Quốc Thắng", email: "thang.vu@email.com", totalOrders: 10, totalSpent: 32000000 },
    { id: 4, name: "Phạm Thu Hà", email: "ha.pham@email.com", totalOrders: 8, totalSpent: 28000000 },
    { id: 5, name: "Đặng Diễm Quỳnh", email: "quynh.dang@email.com", totalOrders: 7, totalSpent: 25000000 },
  ],
  revenueChart: [
    { date: "2026-06-19", revenue: 12500000, orders: 12 },
    { date: "2026-06-20", revenue: 15800000, orders: 15 },
    { date: "2026-06-21", revenue: 18200000, orders: 18 },
    { date: "2026-06-22", revenue: 14500000, orders: 14 },
    { date: "2026-06-23", revenue: 21000000, orders: 21 },
    { date: "2026-06-24", revenue: 23500000, orders: 24 },
    { date: "2026-06-25", revenue: 19800000, orders: 19 },
  ],
  recentOrders: [
    { id: 21, orderDate: "2026-06-25T10:10:27", customerName: "Nguyễn Lê Duy", totalAmount: 28990000, status: "PROCESSING" },
    { id: 20, orderDate: "2026-06-25T10:10:27", customerName: "Nguyễn Lê Duy", totalAmount: 28990000, status: "PENDING_PAYMENT" },
    { id: 19, orderDate: "2026-06-25T10:10:27", customerName: "Nguyễn Lê Duy", totalAmount: 28990000, status: "PENDING_PAYMENT" },
    { id: 18, orderDate: "2026-06-25T10:10:27", customerName: "Nguyễn Lê Duy", totalAmount: 28990000, status: "PENDING_PAYMENT" },
    { id: 17, orderDate: "2026-06-25T10:10:26", customerName: "Nguyễn Lê Duy", totalAmount: 28990000, status: "PENDING_PAYMENT" },
  ],
  productPerformance: {
    totalProducts: 500,
    activeProducts: 500,
    outOfStock: 10,
    lowStock: 5,
    lowStockAlerts: [
      { productId: 101, productName: "iPhone 14 Pro - Black", stockLevel: 3 },
      { productId: 102, productName: "AirPods Pro 2 - White", stockLevel: 5 },
      { productId: 103, productName: "MacBook Air M2 - 256GB", stockLevel: 2 },
      { productId: 104, productName: "iPad Mini 6 - WiFi", stockLevel: 4 },
      { productId: 105, productName: "Apple Watch SE - Blue", stockLevel: 6 },
    ],
  },
  period: "Last30Days" as const,
};

export const generateMockStatistics = (period: string = "Last30Days") => {
  return {
    ...MOCK_STATISTICS,
    period,
  };
};
