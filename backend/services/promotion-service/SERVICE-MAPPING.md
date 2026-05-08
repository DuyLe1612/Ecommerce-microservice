# Service Mapping - promotion-service

## Folder should contain
- API module(s): promotions and advertisements
- persistence: promotion_db for campaigns and ad placements
- integration: campaign scheduler and pricing rule engine

## API ownership (from OpenAPI)
- GET /api/advertisements
- GET /api/advertisements/active
- GET /api/advertisements/position/{position}
- GET /api/admin/promotions
- POST /api/admin/promotions
- GET /api/admin/promotions/{id}
- PUT /api/admin/promotions/{id}
- DELETE /api/admin/promotions/{id}
- PATCH /api/admin/promotions/{id}/activate
- PATCH /api/admin/promotions/{id}/pause
- GET /api/admin/promotions/active
- GET /api/admin/advertisements
- POST /api/admin/advertisements
- GET /api/admin/advertisements/{id}
- PUT /api/admin/advertisements/{id}
- DELETE /api/admin/advertisements/{id}
- PATCH /api/admin/advertisements/{id}/activate
- PATCH /api/admin/advertisements/{id}/deactivate

## Sync calls to other services
- product-service: validate product/category existence when creating campaigns.
- order-service: optional query for campaign performance aggregation.

## Async integration
- Publish: PromotionActivated, PromotionPaused, AdvertisementChanged.
- Consume: OrderCompleted to update campaign metrics.