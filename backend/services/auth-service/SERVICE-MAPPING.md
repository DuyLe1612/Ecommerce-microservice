# Service Mapping - auth-service

## Folder should contain
- API module(s): auth, profile, location, internal auth verification endpoint
- persistence: auth_db migrations, entities, repositories
- integration: JWT strategy, role policy, token refresh logic
- contracts: DTOs for login/register/profile/address

## API ownership (from OpenAPI)
- POST /api/auth/login
- POST /api/auth/register
- GET /api/profile
- PUT /api/profile
- PUT /api/profile/all
- PUT /api/profile/email
- PUT /api/profile/password
- GET /api/profile/addresses
- POST /api/profile/addresses
- PUT /api/profile/addresses/{addressId}
- DELETE /api/profile/addresses/{addressId}
- PATCH /api/profile/addresses/{addressId}/default
- GET /api/locations/provinces
- GET /api/locations/provinces/{provinceCode}/districts
- GET /api/locations/districts/{districtCode}/wards
- POST /api/admin/locations/import
- POST /api/admin/training-seed/users

## Sync calls to other services
- None required for core auth flows.

## Async integration
- Optional publish: UserRegistered, UserProfileUpdated for notification-service.
- Optional consume: none.