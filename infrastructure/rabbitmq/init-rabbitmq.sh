#!/bin/sh
# RabbitMQ initialization script — runs on first Docker volume creation
# Mounted into rabbitmq container at /docker-entrypoint-initdb.d/

set -e

RABBITMQ_HOST="${RABBITMQ_HOST:-localhost}"
RABBITMQ_PORT="${RABBITMQ_PORT:-15672}"
RABBITMQ_USER="${RABBITMQ_USER:-tekno}"
RABBITMQ_PASS="${RABBITMQ_PASS:-tekno123}"

echo "Waiting for RabbitMQ management API..."
until wget -q "http://${RABBITMQ_HOST}:${RABBITMQ_PORT}/api/overview" \
    --user="${RABBITMQ_USER}" --password="${RABBITMQ_PASS}"; do
    echo "RabbitMQ not ready, retrying in 2s..."
    sleep 2
done
echo "RabbitMQ is ready."

# ── Helper functions ─────────────────────────────────────────────────────────

delete_queue() {
    queue="$1"
    echo "Deleting queue ${queue} (if exists)..."
    curl -s -u "${RABBITMQ_USER}:${RABBITMQ_PASS}" \
        -X DELETE "http://${RABBITMQ_HOST}:${RABBITMQ_PORT}/api/queues/%2F/${queue}" \
        2>/dev/null || true
}

# ── 1. Delete any stale queue definitions ────────────────────────────────────
# This ensures a clean slate on every Docker volume (re)creation

for queue in \
    "order-service.payment.succeeded" \
    "order-service.payment.failed" \
    "order-service.payment.refunded"; do
    delete_queue "${queue}"
done

# ── 2. Declare exchanges ──────────────────────────────────────────────────────

declare_exchange() {
    name="$1"
    echo "Declaring exchange: ${name}"
    curl -s -u "${RABBITMQ_USER}:${RABBITMQ_PASS}" \
        -X PUT "http://${RABBITMQ_HOST}:${RABBITMQ_PORT}/api/exchanges/%2F/${name}" \
        -H "Content-Type: application/json" \
        -d '{"type":"topic","durable":true}'
}

declare_exchange "payment.events"
declare_exchange "payment.events.dlx"
declare_exchange "order.events"
declare_exchange "order.events.dlx"

# ── 3. Declare queues with correct DLX ────────────────────────────────────────

# These queues are consumed by order-service.
# DLX points to payment.events.dlx so failed messages land in the dead-letter exchange.
for entry in \
    "order-service.payment.succeeded:payment.events.dlx" \
    "order-service.payment.failed:payment.events.dlx" \
    "order-service.payment.refunded:payment.events.dlx"; do
    queue="${entry%%:*}"
    dlx="${entry##*:}"

    echo "Declaring queue: ${queue} (DLX=${dlx})"
    curl -s -u "${RABBITMQ_USER}:${RABBITMQ_PASS}" \
        -X PUT "http://${RABBITMQ_HOST}:${RABBITMQ_PORT}/api/queues/%2F/${queue}" \
        -H "Content-Type: application/json" \
        -d "{\"durable\":true,\"arguments\":{\"x-dead-letter-exchange\":\"${dlx}\"}}"
done

# ── 4. Bind queues to payment.events exchange ─────────────────────────────────

bind_queue() {
    queue="$1"; routing_key="$2"
    echo "Binding queue ${queue} → ${routing_key}"
    curl -s -u "${RABBITMQ_USER}:${RABBITMQ_PASS}" \
        -X POST "http://${RABBITMQ_HOST}:${RABBITMQ_PORT}/api/bindings/%2F/e/payment.events/q/${queue}" \
        -H "Content-Type: application/json" \
        -d "{\"routing_key\":\"${routing_key}\"}"
}

bind_queue "order-service.payment.succeeded" "payment.succeeded"
bind_queue "order-service.payment.failed"    "payment.failed"
bind_queue "order-service.payment.refunded"  "payment.refunded"

echo "RabbitMQ initialization complete."
