# Kịch bản Test Luồng Search Product

Tài liệu này hướng dẫn cách chạy project và các bước test luồng search product từ khi tạo mới product đến khi dữ liệu được đồng bộ sang Elasticsearch và có thể search được thông qua API.

## 1. Hướng dẫn chạy project

1. Cài đặt Docker và Docker Compose trên máy của bạn.
2. Mở terminal và di chuyển đến thư mục `infrastructure` của project:
   ```bash
   cd infrastructure
   ```
3. Chạy lệnh sau để build và khởi động tất cả các service:
   ```bash
   docker-compose up --build -d
   ```
4. Đảm bảo tất cả các container đều ở trạng thái `running`. Bạn có thể kiểm tra bằng lệnh:
   ```bash
   docker-compose ps
   ```

Các service sẽ chạy ở các cổng sau:
- API Gateway (Nginx): `http://localhost:8080`
- Product Service: `http://localhost:8081` (internal)
- Order Service: `http://localhost:8082` (internal)
- Search Service: `http://localhost:8083` (internal)
- Payment Service: `http://localhost:8084` (internal)

## 2. Kịch bản Test (Test Scenarios)

### 2.1. Trigger Reindex (Cào dữ liệu ban đầu)
Nếu hệ thống chưa có dữ liệu trong Elasticsearch, bạn cần trigger reindex để kéo dữ liệu từ Product Service sang Search Service.

**Request:**
```bash
curl -X POST http://localhost:8080/api/admin/search/reindex
```

**Expected Result:**
- HTTP Status: `200 OK`
- Dữ liệu trả về có dạng:
  ```json
  {
      "success": true,
      "data": 15, 
      "message": "Reindex completed successfully"
  }
  ```
  *(Số `15` là tổng số product đã được index thành công)*

---

### 2.2. Tìm kiếm cơ bản (Keyword Search)
Tìm kiếm product theo tên hoặc mô tả.

**Request:**
```bash
curl -X GET "http://localhost:8080/api/search/products?query=laptop"
```

**Expected Result:**
- HTTP Status: `200 OK`
- Trả về danh sách các product có chứa từ khóa "laptop".

---

### 2.3. Lọc sản phẩm (Filter)
Tìm kiếm kết hợp lọc theo category và khoảng giá.

**Request:**
```bash
curl -X GET "http://localhost:8080/api/search/products?categoryId=1&minPrice=10000000&maxPrice=25000000"
```

**Expected Result:**
- HTTP Status: `200 OK`
- Trả về danh sách product thuộc `categoryId=1` và có basePrice nằm trong khoảng `10M` đến `25M`.

---

### 2.4. Gợi ý tìm kiếm (Auto-suggest)
Gợi ý từ khóa/sản phẩm khi người dùng đang gõ (type-ahead).

**Request:**
```bash
curl -X GET "http://localhost:8080/api/search/products/suggest?prefix=lap"
```

**Expected Result:**
- HTTP Status: `200 OK`
- Trả về danh sách rút gọn các product bắt đầu bằng từ "lap".

---

### 2.5. Test đồng bộ Real-time qua RabbitMQ (Create Product)
Khi tạo mới một product bên Product Service, sự kiện sẽ được bắn qua RabbitMQ và Search Service sẽ tự động index product đó vào Elasticsearch.

**Bước 1: Tạo product mới (Product Service)**
```bash
curl -X POST http://localhost:8080/api/admin/products \
-H "Content-Type: application/json" \
-d '{
    "name": "Test Realtime Sync Laptop",
    "slug": "test-realtime-sync-laptop",
    "basePrice": 15000000,
    "categoryId": 1,
    "brandId": 1,
    "status": "ACTIVE",
    "specs": [
        {"Name": "CPU", "Value": "Core i7"},
        {"Name": "RAM", "Value": "16GB"}
    ]
}'
```

**Bước 2: Chờ 1-2 giây cho RabbitMQ xử lý**

**Bước 3: Tìm kiếm product vừa tạo bên Search Service**
```bash
curl -X GET "http://localhost:8080/api/search/products?query=Test%20Realtime"
```

**Expected Result:**
- Product vừa tạo xuất hiện trong kết quả tìm kiếm ngay lập tức mà không cần gọi lại API reindex.

---

### 2.6. Test đồng bộ Real-time (Delete Product)
Khi xóa một product, nó cũng phải biến mất khỏi Elasticsearch.

**Bước 1: Lấy ID của product vừa tạo và Xóa (Product Service)**
```bash
curl -X DELETE http://localhost:8080/api/admin/products/{productId}
```

**Bước 2: Tìm kiếm lại product đó**
```bash
curl -X GET "http://localhost:8080/api/search/products?query=Test%20Realtime"
```

**Expected Result:**
- Kết quả tìm kiếm trả về rỗng (hoặc không còn chứa product đã bị xóa).

## 3. Trouble-shooting

- Nếu gọi API bị lỗi `500` hoặc không lấy được data, hãy check log của service:
  ```bash
  docker logs product-service -f
  docker logs search-service -f
  ```
- Nếu ElasticSearch bị lỗi `index_not_found_exception`, gọi API `/api/admin/search/reindex` một lần để cào data khởi tạo.
