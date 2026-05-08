# Event Schema

## Exchange: `product.events` (Topic)

### `product.created`
```json
{
  "productId": 1,
  "slug": "iphone-15-pro",
  "name": "iPhone 15 Pro",
  "categoryId": 10,
  "brandId": 5,
  "basePrice": 999.0,
  "createdAt": "2023-10-01T12:00:00Z"
}
```

### `product.updated`
```json
{
  "productId": 1,
  "slug": "iphone-15-pro",
  "updatedFields": ["basePrice", "name"],
  "updatedAt": "2023-10-02T12:00:00Z"
}
```

### `product.deleted`
```json
{
  "productId": 1,
  "slug": "iphone-15-pro",
  "deletedAt": "2023-10-03T12:00:00Z"
}
```

## Exchange: `catalog.events` (Topic)

### `category.updated`
```json
{
  "categoryId": 10,
  "slug": "dien-thoai",
  "name": "Điện Thoại",
  "parentId": null,
  "updatedAt": "2023-10-01T12:00:00Z"
}
```
