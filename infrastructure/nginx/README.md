# Nginx Gateway Configuration Guide

## Architecture

The nginx gateway sits in front of the API gateway to provide an additional layer of routing, SSL termination, and load balancing.

```
Internet → Nginx (Port 80/443) → Gateway (Internal) → Microservices
```

## Setup

### 1. SSL Certificates (Optional but Recommended)

Place your SSL certificates in `ssl/` directory:

```
nginx/ssl/
├── cert.pem      # SSL certificate
└── key.pem       # Private key
```

To enable HTTPS, uncomment the SSL server block in `conf.d/ssl.conf`.

### 2. Generate Self-Signed Certificate (Development)

```bash
# Generate self-signed certificate for development
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem -out ssl/cert.pem \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
```

### 3. Start Services

```bash
# Start all services
docker-compose up -d

# View nginx logs
docker-compose logs -f nginx

# Check nginx configuration
docker exec nginx-proxy nginx -t
```

## Configuration Files

| File | Purpose |
|------|---------|
| `nginx.conf` | Main configuration with upstream definitions and routes |
| `conf.d/defaults.conf` | Rate limiting, proxy settings, and compression |
| `conf.d/proxy-headers.conf` | Common proxy headers for upstream services |
| `conf.d/ssl.conf` | SSL/TLS configuration template |

## Route Overview

| Path | Service | Auth Required |
|------|---------|---------------|
| `/api/auth/*` | auth-service | No |
| `/api/products*` | product-service/search-service | No |
| `/api/categories/*` | product-service | No |
| `/api/brands/*` | product-service | No |
| `/api/coupons/*` | coupon-service | No |
| `/api/promotions/*` | promotion-service | No |
| `/api/advertisements/*` | promotion-service | No |
| `/api/review*` | review-service | No |
| `/api/products/*/reviews` | review-service | No |
| `/api/orders*` | order-service | Yes |
| `/api/payment*` | payment-service | Partial |
| `/api/cart*` | cart-service | Yes |
| `/api/wishlist*` | cart-service | Yes |
| `/api/profile*` | auth-service | Yes |
| `/api/notifications*` | notification-service | No |
| `/api/blog*` | product-service | No |
| `/api/cloudinary*` | product-service | No |
| `/api/locations*` | auth-service | No |

## Rate Limiting

| Zone | Rate | Purpose |
|------|------|---------|
| `api_limit` | 100 req/s | General API endpoints |
| `auth_limit` | 10 req/s | Authentication endpoints |
| `payment_limit` | 50 req/s | Payment endpoints |

## Health Check

```bash
# Check health endpoint
curl http://localhost/health
# Returns: ok
```

## Common Commands

```bash
# Reload nginx configuration without restarting
docker exec nginx-proxy nginx -s reload

# View access logs
docker exec nginx-proxy tail -f /var/log/nginx/access.log

# View error logs
docker exec nginx-proxy tail -f /var/log/nginx/error.log

# Test configuration syntax
docker exec nginx-proxy nginx -t
```

## Troubleshooting

### 1. 502 Bad Gateway
- Check if gateway container is running
- Verify service names in upstream blocks match docker-compose service names
- Check network connectivity between containers

### 2. 504 Gateway Timeout
- Increase proxy timeouts in `conf.d/defaults.conf`
- Check if backend service is responding

### 3. Rate Limiting Too Aggressive
- Adjust rate limits in `nginx.conf` and `conf.d/defaults.conf`
- Add IP to whitelist if needed

### 4. SSL Certificate Issues
- Verify certificate paths in `conf.d/ssl.conf`
- Check certificate validity with:
  ```bash
  openssl x509 -in ssl/cert.pem -text -noout
  ```
