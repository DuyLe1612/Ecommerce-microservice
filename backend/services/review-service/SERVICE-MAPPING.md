# Service Mapping - review-service

## Folder should contain
- API module(s): review CRUD, moderation, helpful votes
- persistence: review_db for reviews, votes, moderation state
- integration: verified-purchase policy and admin moderation policy

## API ownership (from OpenAPI)
- GET /api/products/{productId}/reviews
- POST /api/products/{productId}/reviews
- PUT /api/products/{productId}/reviews/{reviewId}
- DELETE /api/products/{productId}/reviews/{reviewId}
- POST /api/products/{productId}/reviews/{reviewId}/vote
- GET /api/products/{productId}/reviews/can-review
- GET /api/products/{productId}/reviews/summary
- PATCH /api/admin/reviews/{reviewId}/approve
- PATCH /api/admin/reviews/{reviewId}/reject
- GET /api/admin/reviews/product/{productId}

## Sync calls to other services
- order-service: verify purchase eligibility for review creation.
- product-service: verify product existence and active state.

## Async integration
- Consume: OrderCompleted to mark products review-eligible.
- Publish: ReviewApproved, ReviewRejected for search index/materialized ratings.