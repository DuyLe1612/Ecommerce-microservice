# Service Mapping - notification-service

## Folder should contain
- API module(s): optional internal/admin notification endpoints
- persistence: notification_db for templates, deliveries, retries, DLQ references
- integration: email/SMS/push adapters, queue consumers

## API ownership (from OpenAPI)
- No public endpoint currently defined in `apidocs.json`.
- Reserved route (planned): /api/notifications/*

## Sync calls to other services
- None in normal design.

## Async integration
- Consume: UserRegistered, OrderCreated, OrderShipped, OrderDelivered, PaymentSuccess, PaymentFailed, ReviewApproved.
- Publish (optional): NotificationDelivered, NotificationFailed.