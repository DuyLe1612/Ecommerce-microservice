# Service Mapping - product-service

## Folder should contain
- API module(s): products CRUD, categories, brands, blog, media helper endpoints
- persistence: product_db migrations and aggregate tables
- integration: product write model and read model feeders

## API ownership (from OpenAPI)
- GET /api/products/{slug}
- GET /api/products/variants/{variantId}
- GET /api/categories
- GET /api/categories/list
- GET /api/categories/tree
- GET /api/categories/{id}/attributes
- GET /api/categories/{slug}
- GET /api/categories/{slug}/attributes
- GET /api/brands
- GET /api/brands/list
- GET /api/brands/{slug}
- GET /api/brands/by-category/{categorySlug}
- GET /api/blog
- GET /api/blog/{slug}
- GET /api/blog/{id}/related
- GET /api/blog/recent
- GET /api/blog/tag/{tag}
- DELETE /api/cloudinary
- POST /api/cloudinary/category-icon
- POST /api/cloudinary/product-image
- GET /api/admin/products
- POST /api/admin/products
- PUT /api/admin/products/{id}
- DELETE /api/admin/products/{id}
- GET /api/admin/products/{slug}
- POST /api/admin/products/images
- PUT /api/admin/products/images/{imageId}
- DELETE /api/admin/products/images/{imageId}
- POST /api/admin/products/images/reorder
- POST /api/admin/products/variants
- PUT /api/admin/products/variants/{variantId}
- DELETE /api/admin/products/variants/{variantId}
- GET /api/admin/categories
- GET /api/admin/categories/list
- GET /api/admin/categories/tree
- GET /api/admin/categories/{slug}
- GET /api/admin/categories/{categoryId}/attributes
- POST /api/admin/categories/create
- PUT /api/admin/categories/update
- DELETE /api/admin/categories/delete
- POST /api/admin/categories/attributes
- GET /api/admin/categories/attributes/global
- GET /api/admin/categories/attributes/{attributeId}
- PUT /api/admin/categories/attributes/{attributeId}
- DELETE /api/admin/categories/attributes/{attributeId}
- POST /api/admin/categories/attributes/values
- PUT /api/admin/categories/attributes/values/{valueId}
- DELETE /api/admin/categories/attributes/values/{valueId}
- GET /api/admin/brands
- GET /api/admin/brands/list
- GET /api/admin/brands/{slug}
- POST /api/admin/brands/create
- PUT /api/admin/brands/update
- DELETE /api/admin/brands/delete
- GET /api/admin/blog
- POST /api/admin/blog
- GET /api/admin/blog/{id}
- PUT /api/admin/blog/{id}
- DELETE /api/admin/blog/{id}
- PATCH /api/admin/blog/{id}/publish
- PATCH /api/admin/blog/{id}/unpublish

## Sync calls to other services
- To review-service: optional request for aggregated review summary if not denormalized.
- To promotion-service: optional call for active discount metadata if needed by admin UI.

## Async integration
- Publish: ProductCreated, ProductUpdated, ProductDeleted.
- Consume: PromotionActivated, PromotionPaused for denormalized price projection.