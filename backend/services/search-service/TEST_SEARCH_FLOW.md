# Kịch Bản Kiểm Thử Luồng Search & Đồng Bộ Dữ Liệu

Tài liệu này hướng dẫn cách khởi chạy project và thực hiện kiểm thử end-to-end cho luồng tìm kiếm (`search-service`) tích hợp với `product-service` trong hệ thống E-commerce Microservices.

## 1. Khởi chạy hệ thống

### Yêu cầu
- Docker và Docker Compose đã được cài đặt.
- Java 21 & Maven (nếu bạn muốn chạy service ở chế độ local thay vì qua docker).

### Bước 1: Khởi động Infrastructure (Bắt buộc)
Di chuyển vào thư mục `infrastructure` và khởi chạy các container cần thiết (Postgres, Redis, RabbitMQ, Elasticsearch, Nginx Gateway):

```bash
cd infrastructure
docker-compose up -d
```
*Lưu ý:* Lần đầu tiên pull image Elasticsearch 8.x có thể mất một vài phút. Đảm bảo container `elasticsearch` báo trạng thái `healthy`.

### Bước 2: Khởi động các Microservices
Hệ thống Gateway (Nginx) đã được cấu hình route requests đến cổng `8082` (`product-service`) và `8083` (`search-service`). Bạn có thể chạy qua Docker hoặc chạy trực tiếp bằng Maven.

**Chạy bằng Maven (Mở 2 Terminal):**
```bash
# Terminal 1: Product Service
cd backend/services/product-service
mvn spring-boot:run

# Terminal 2: Search Service
cd backend/services/search-service
mvn spring-boot:run
```

---

## 2. Kiểm thử đồng bộ toàn bộ (Full Reindex)

Khi hệ thống mới bật lên, Elasticsearch chưa có dữ liệu. Chúng ta sẽ test API `ReindexAll` để đồng bộ dữ liệu từ `product-service` sang `search-service`.

**1. Gọi API Reindex (Admin):**
```bash
curl -X POST http://localhost:8080/api/admin/search/reindex \
     -H "Authorization: Bearer mock-admin-token"
```
*Kết quả mong đợi:* Hệ thống trả về số lượng bản ghi đã được index thành công (ví dụ: `{"status": 200, "data": 150}`). Xem log của `search-service` để thấy tiến trình lấy dữ liệu từ endpoint `/internal/products/index-feed` của `product-service`.

**2. Kiểm tra dữ liệu đã vào Elasticsearch:**
```bash
curl -X GET "http://localhost:8080/api/search?size=10"
```
*Kết quả mong đợi:* Trả về danh sách các sản phẩm cùng với metadata phân trang (`totalElements`, `totalPages`).

---

## 3. Kiểm thử các chức năng tìm kiếm (Search API)

**1. Tìm kiếm theo từ khóa (Keyword Search):**
```bash
curl -X GET "http://localhost:8080/api/search?q=laptop"
```
*Kết quả mong đợi:* Trả về các sản phẩm có tên, hoặc tên danh mục, hoặc tên thương hiệu chứa từ "laptop".

**2. Lọc theo danh mục và giá (Filters):**
```bash
curl -X GET "http://localhost:8080/api/search?categoryId=1&minPrice=10000000&maxPrice=25000000"
```
*Kết quả mong đợi:* Chỉ hiển thị các sản phẩm thuộc category ID 1 và có giá gốc (`basePrice`) nằm trong khoảng 10 triệu đến 25 triệu.

**3. Gợi ý tự động (Suggest/Autocomplete):**
```bash
curl -X GET "http://localhost:8080/api/search/suggest?q=lap"
```
*Kết quả mong đợi:* Trả về danh sách nhỏ các sản phẩm bắt đầu bằng từ "lap" để hiển thị dropdown gợi ý trên Frontend.

---

## 4. Kiểm thử đồng bộ thời gian thực (Real-time Event Sync)

Tính năng này sử dụng RabbitMQ. Khi có thay đổi ở `product-service`, event sẽ được bắn qua RabbitMQ và `search-service` sẽ tự động cập nhật Elasticsearch.

### Kịch bản 4.1: Thêm/Cập nhật sản phẩm mới
**1. Tạo sản phẩm mới trên `product-service` (Admin API):**
```bash
curl -X POST http://localhost:8080/api/admin/products \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer mock-admin-token" \
     -d '{
           "name": "Sản phẩm Test Realtime",
           "slug": "san-pham-test-realtime",
           "basePrice": 999000,
           "categoryId": 1,
           "brandId": 1
         }'
```
*Kết quả mong đợi:* 
- `product-service` insert vào PostgreSQL và gửi message `product.created` (hoặc `product.updated`) vào RabbitMQ.
- Xem log của `search-service`: `Received event product.created with payload...` và `Indexed product: <ID>`.

**2. Tìm kiếm sản phẩm vừa tạo ở `search-service`:**
```bash
# Đợi khoảng 1-2 giây để Elasticsearch refresh index
curl -X GET "http://localhost:8080/api/search?q=Realtime"
```
*Kết quả mong đợi:* Sản phẩm "Sản phẩm Test Realtime" xuất hiện trong kết quả tìm kiếm.

### Kịch bản 4.2: Xóa sản phẩm
**1. Xóa sản phẩm vừa tạo:**
```bash
curl -X DELETE "http://localhost:8080/api/admin/products/<ID_SAN_PHAM_TEST>" \
     -H "Authorization: Bearer mock-admin-token"
```
*Kết quả mong đợi:* 
- Log của `search-service` báo nhận event `product.deleted`.
- Gọi lại API tìm kiếm với từ khóa "Realtime", kết quả sẽ trống (hoặc không còn sản phẩm vừa test).

### Kịch bản 4.3: Cập nhật tên danh mục (Catalog Event)
**1. Cập nhật Category Name ở `product-service`:**
```bash
curl -X PUT http://localhost:8080/api/admin/categories/1 \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer mock-admin-token" \
     -d '{
           "name": "Laptop Gaming Mới"
         }'
```
*Kết quả mong đợi:*
- `product-service` gửi event `category.updated`.
- `search-service` bắt được event ở `handleCatalogEvent`, gọi Elasticsearch UpdateByQuery để cập nhật hàng loạt trường `categoryName` thành "Laptop Gaming Mới" cho tất cả các Document đang mang `categoryId=1`.
- Kiểm tra lại bằng GET `/api/search`, bạn sẽ thấy các sản phẩm thuộc category 1 đã được cập nhật `categoryName`.

---

## Lời khuyên khi Debug

- **Kiểm tra RabbitMQ**: Truy cập vào RabbitMQ Management UI tại `http://localhost:15672` (user: `tekno`, pass: `tekno123`) để kiểm tra xem các queue `product_events_queue` và `catalog_events_queue` có message kẹt hay không.
- **Kiểm tra Elasticsearch**: Truy cập trực tiếp Elasticsearch để kiểm tra số lượng Document hiện tại:
  ```bash
  curl -X GET "http://localhost:9200/products/_count"
  ```
- Nếu `search-service` lỗi khi startup: Hãy đảm bảo Elasticsearch đã khởi động hoàn toàn (trạng thái `green` hoặc `yellow`) trước khi `search-service` chạy. Mặc định Spring Boot sẽ tự retry, hoặc bạn có thể khởi động lại `search-service`.
