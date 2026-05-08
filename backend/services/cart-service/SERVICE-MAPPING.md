# Service Mapping - cart-service

## Folder should contain
- API module(s): cart, wishlist
- persistence: cart_db for cart sessions and wishlist items
- integration: stock check adapters and checkout preparation

## API ownership (from OpenAPI)
- GET /api/cart
- DELETE /api/cart
- POST /api/cart/items
- PUT /api/cart/items/{variantId}
- DELETE /api/cart/items/{variantId}
- GET /api/wishlist
- GET /api/wishlist/check/{productId}
- POST /api/wishlist/items
- DELETE /api/wishlist/items/{productId}

## Sync calls to other services
- product-service: validate variant, stock, and product state before add/update cart.
- promotion-service: preview coupon applicability (optional at cart stage).

## Async integration
- Consume: ProductUpdated, ProductDeleted to clean invalid cart entries.
- Consume: OrderCompleted/OrderCancelled to clear or restore cart snapshots.