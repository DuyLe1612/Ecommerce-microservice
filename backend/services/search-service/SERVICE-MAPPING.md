# Service Mapping - search-service

## Folder should contain
- API module(s): product search/browse and recommendations
- persistence: search_db (optional), index metadata, query snapshots
- integration: search indexing jobs, cache strategy, filter parser

## API ownership (from OpenAPI)
- GET /api/products
- GET /api/products/new/{categorySlug}
- GET /api/products/on-sale
- GET /api/recommend/cf/{userId}
- GET /api/recommend/cf/products/{userId}
- GET /api/recommend/content/{userId}
- GET /api/recommend/content/products/{userId}
- GET /api/recommend/predict/{productId}

## Sync calls to other services
- product-service: fetch canonical product snapshot for index backfill.
- promotion-service: fetch active campaign and coupon visibility for search cards.

## Async integration
- Consume: ProductCreated, ProductUpdated, ProductDeleted.
- Consume: PromotionActivated, PromotionPaused.
- Publish (optional): SearchQueryTracked for analytics-service/future BI.