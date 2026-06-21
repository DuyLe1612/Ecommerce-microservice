# Product Service - API Testing Scenarios

Kịch bản này cung cấp các lệnh `cURL` để bạn dễ dàng test toàn bộ luồng nghiệp vụ của `product-service`. 
Đảm bảo rằng service đang chạy ở cổng `8082`.

Tất cả các API `admin` yêu cầu Header `X-User-Roles: ROLE_ADMIN`. Đối với các request tạo dữ liệu, cần có Header `Content-Type: application/json`.

---

## 1. Category Management (Quản lý Danh mục)

### 1.1. Tạo Category mới
Tạo một danh mục gốc (ví dụ: Điện thoại).
```bash
curl -X POST http://localhost:8082/api/admin/categories \
  -H "X-User-Roles: ROLE_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Điện thoại thông minh",
    "slug": "dien-thoai-thong-minh",
    "description": "Các sản phẩm điện thoại thông minh",
    "iconPath": "/icons/phone.png",
    "imageUrl": "/images/phone.png",
    "parentId": null
  }'
```

### 1.2. Thêm thuộc tính cho Category
Tạo các thuộc tính mà danh mục này yêu cầu (VD: Dung lượng RAM, Màu sắc). Giả sử `categoryId` vừa tạo là `1`.
```bash
curl -X POST http://localhost:8082/api/admin/categories/attributes \
  -H "X-User-Roles: ROLE_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": 1,
    "name": "Màu sắc",
    "type": "TEXT",
    "displayOrder": 1,
    "isRequired": true
  }'
```

### 1.3. Thêm giá trị cho thuộc tính
Thêm các giá trị có thể chọn (VD: Xanh, Đen) cho thuộc tính vừa tạo. Giả sử `attributeId` vừa tạo là `1`.
```bash
curl -X POST http://localhost:8082/api/admin/categories/attributes/values \
  -H "X-User-Roles: ROLE_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "attributeId": 1,
    "value": "Đen",
    "displayOrder": 1
  }'
```

### 1.4. Lấy danh sách Categories (Public API)
```bash
curl -X GET http://localhost:8082/api/categories
```

---

## 2. Brand Management (Quản lý Thương hiệu)

### 2.1. Tạo Brand mới
```bash
curl -X POST http://localhost:8082/api/admin/brands/create \
  -H "X-User-Roles: ROLE_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Apple",
    "slug": "apple",
    "description": "Apple Inc.",
    "logoUrl": "/logos/apple.png",
    "websiteUrl": "https://apple.com"
  }'
```

### 2.2. Lấy danh sách Brand (Public API)
```bash
curl -X GET http://localhost:8082/api/brands
```

---

## 3. Product Management (Quản lý Sản phẩm)

### 3.1. Tạo Product mới (Base Product)
Giả sử `categoryId = 1` và `brandId = 1`.
```bash
curl -X POST http://localhost:8082/api/admin/products \
  -H "X-User-Roles: ROLE_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15 Pro Max",
    "slug": "iphone-15-pro-max",
    "shortDescription": "iPhone 15 Pro Max 256GB",
    "description": "Mô tả chi tiết iPhone 15 Pro Max...",
    "categoryId": 1,
    "brandId": 1,
    "isPublished": true,
    "tags": ["smartphone", "apple"]
  }'
```

### 3.2. Upload Hình ảnh cho Product
(Thay thế đường dẫn `/path/to/image.jpg` bằng một tệp thực tế trên máy của bạn). Giả sử `productId = 1`.
```bash
curl -X POST http://localhost:8082/api/admin/products/images?productId=1 \
  -H "X-User-Roles: ROLE_ADMIN" \
  -F "file=@/path/to/image.jpg"
```

### 3.3. Tạo Variant (Biến thể sản phẩm)
Thêm một tuỳ chọn sản phẩm với cấu hình thuộc tính cụ thể.
```bash
curl -X POST http://localhost:8082/api/admin/products/variants \
  -H "X-User-Roles: ROLE_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "sku": "IP15PM-256-BLK",
    "price": 29000000.0,
    "stock": 100,
    "status": "available",
    "attributes": [
      {
        "attributeId": 1,
        "valueId": 1
      }
    ]
  }'
```

### 3.4. Cập nhật Số lượng tồn kho (Stock)
Giả sử `variantId = 1`.
```bash
curl -X POST http://localhost:8082/api/admin/products/variants/1/stock \
  -H "X-User-Roles: ROLE_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 50,
    "reason": "Nhập hàng đợt 2"
  }'
```

---

## 4. Blog Management (Quản lý Bài viết)

### 4.1. Tạo Blog Post mới
```bash
curl -X POST http://localhost:8082/api/admin/blog \
  -H "X-User-Roles: ROLE_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Đánh giá chi tiết iPhone 15 Pro Max",
    "slug": "danh-gia-chi-tiet-iphone-15-pro-max",
    "content": "Nội dung bài đánh giá...",
    "excerpt": "Đánh giá tổng quan iPhone mới...",
    "featuredImageUrl": "/images/blog/ip15.jpg",
    "authorId": 1,
    "status": "PUBLISHED",
    "tags": ["review", "apple"]
  }'
```

### 4.2. Lấy danh sách Blog (Public API)
```bash
curl -X GET http://localhost:8082/api/blog
```

---

## 5. End-User Shopping Flows (Luồng mua sắm)

### 5.1. Lấy danh sách Sản phẩm
```bash
curl -X GET "http://localhost:8082/api/products?page=0&size=10&sort=createdAt,desc"
```

### 5.2. Lấy thông tin Chi tiết Sản phẩm
```bash
curl -X GET http://localhost:8082/api/products/iphone-15-pro-max
```

### 5.3. Tìm kiếm Sản phẩm nâng cao
```bash
curl -X GET "http://localhost:8082/api/products/search?keyword=iPhone&minPrice=20000000&maxPrice=30000000"
```
