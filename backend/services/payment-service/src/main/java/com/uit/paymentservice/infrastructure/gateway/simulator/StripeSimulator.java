package com.uit.paymentservice.infrastructure.gateway.simulator;

import com.uit.paymentservice.domain.gateway.*;
import com.uit.paymentservice.domain.model.Money;
import com.uit.paymentservice.domain.model.PaymentGatewayType;
import com.uit.paymentservice.infrastructure.gateway.SimulatorConfig;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class StripeSimulator implements PaymentGateway {

    private static final Logger log = LoggerFactory.getLogger(StripeSimulator.class);
    private static final String WEBHOOK_SECRET = "STRIPE_MOCK_WEBHOOK_SECRET";

    private final ConcurrentMap<String, SimulatedStripeIntent> intents = new ConcurrentHashMap<>();
    private final SimulatorConfig.GatewayConfig config;

    public StripeSimulator(SimulatorConfig config) {
        this.config = config.stripe();
    }

    @Override
    public PaymentGatewayType getType() {
        return PaymentGatewayType.STRIPE;
    }

    @Override
    public GatewayPaymentResult initiate(GatewayPaymentRequest request) {
        log.debug("Stripe initiate: orderId={}, amount={}", request.orderId(), request.amount());

        simulateDelay();

        if (shouldSimulateFailure()) {
            return new GatewayPaymentResult(null, null,
                "{\"error\":{\"type\":\"simulation_error\",\"message\":\"Simulated failure\"}}",
                false, "Simulated gateway failure");
        }

        String intentId = "pi_" + randomAlphanumeric(24);
        String clientSecret = intentId + "_secret_" + randomAlphanumeric(24);

        SimulatedStripeIntent intent = new SimulatedStripeIntent(
            intentId, clientSecret, request.orderId(), request.userId(),
            request.amount(), request.currency(), IntentStatus.REQUIRES_PAYMENT_METHOD
        );
        intents.put(intentId, intent);

        String redirectUrl = "https://checkout.stripe.com/simulate/pay/" + clientSecret;

        long epochSeconds = System.currentTimeMillis() / 1000;
        String rawResponse = String.format(
            "{\"id\":\"%s\",\"object\":\"payment_intent\",\"amount\":%d,\"currency\":\"%s\"," +
            "\"status\":\"requires_payment_method\",\"client_secret\":\"%s\"," +
            "\"metadata\":{\"orderId\":\"%s\",\"userId\":\"%s\"},\"created\":%d}",
            intentId,
            request.amount().multiply(java.math.BigDecimal.valueOf(100)).toBigInteger(),
            request.currency(), clientSecret,
            request.orderId(), request.userId(), epochSeconds
        );

        log.debug("Stripe initiate success: intentId={}, redirectUrl={}", intentId, redirectUrl);
        return new GatewayPaymentResult(intentId, redirectUrl, rawResponse, true, null);
    }

    @Override
    public GatewayCallbackResult processCallback(Map<String, String> params) {
        log.debug("Stripe callback: {}", params);

        String stripeEventType = params.get("type");
        String intentId = extractIntentId(params);

        if (intentId == null || !intents.containsKey(intentId)) {
            log.warn("Stripe callback: intent not found: {}", intentId);
            return new GatewayCallbackResult(false, null, null, params, false);
        }

        if (!verifySignature(params)) {
            log.warn("Stripe callback: invalid signature");
            return new GatewayCallbackResult(false, null, null, params, false);
        }

        SimulatedStripeIntent intent = intents.get(intentId);

        if ("payment_intent.succeeded".equals(stripeEventType)) {
            intent.status = IntentStatus.SUCCEEDED;
            log.debug("Stripe callback: intent {} succeeded", intentId);
            return new GatewayCallbackResult(true, intentId, "SUCCESS", params, true);
        } else if ("payment_intent.payment_failed".equals(stripeEventType)) {
            intent.status = IntentStatus.REQUIRES_PAYMENT_METHOD;
            log.debug("Stripe callback: intent {} payment failed", intentId);
            return new GatewayCallbackResult(false, intentId, "FAILED", params, true);
        } else if ("charge.refunded".equals(stripeEventType)) {
            intent.status = IntentStatus.CANCELED;
            return new GatewayCallbackResult(true, intentId, "REFUNDED", params, true);
        }

        return new GatewayCallbackResult(false, intentId, intent.status.name(), params, true);
    }

    @Override
    public GatewayStatusResult queryStatus(String gatewayTransactionId) {
        log.debug("Stripe queryStatus: gatewayTxId={}", gatewayTransactionId);
        SimulatedStripeIntent intent = intents.get(gatewayTransactionId);
        if (intent == null) {
            return new GatewayStatusResult(gatewayTransactionId, "UNKNOWN", "{\"error\":\"not_found\"}", false);
        }
        return new GatewayStatusResult(gatewayTransactionId, intent.status.name(),
            "{\"id\":\"" + gatewayTransactionId + "\",\"status\":\"" + intent.status.name() + "\"}", true);
    }

    @Override
    public GatewayRefundResult refund(String gatewayTransactionId, Money amount) {
        SimulatedStripeIntent intent = intents.get(gatewayTransactionId);
        if (intent != null) {
            intent.status = IntentStatus.CANCELED;
        }
        String refundId = "re_" + randomAlphanumeric(24);
        log.debug("Stripe refund: gatewayTxId={}, amount={}, refundId={}", gatewayTransactionId, amount, refundId);
        return new GatewayRefundResult(refundId, true, amount, null);
    }

    @Override
    public boolean verifySignature(Map<String, String> params) {
        String stripeSignature = params.get("stripe-signature");
        if (stripeSignature == null) return false;

        String timestamp = null;
        String hmacValue = null;
        for (String part : stripeSignature.split(",")) {
            String[] kv = part.split("=", 2);
            if (kv.length == 2) {
                if ("t".equals(kv[0])) timestamp = kv[1];
                if ("v1".equals(kv[0])) hmacValue = kv[1];
            }
        }
        if (timestamp == null || hmacValue == null) return false;

        String payload = params.getOrDefault("_payload", "");
        String expectedHmac = computeHmacSha256(timestamp + "." + payload, WEBHOOK_SECRET);
        return expectedHmac.equals(hmacValue);
    }

    private String extractIntentId(Map<String, String> params) {
        String id = params.get("data.object.id");
        if (id != null) return id;
        id = params.get("id");
        if (id != null && id.startsWith("pi_")) return id;
        return params.get("payment_intent");
    }

    private String computeHmacSha256(String data, String key) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hmacBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hmacBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to compute HMAC-SHA256", e);
        }
    }

    private String randomAlphanumeric(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt((int)(Math.random() * chars.length())));
        }
        return sb.toString();
    }

    private void simulateDelay() {
        try {
            Thread.sleep(config.processingDelayMs());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private boolean shouldSimulateFailure() {
        return Math.random() < config.failureRate();
    }

    private enum IntentStatus {
        REQUIRES_PAYMENT_METHOD, REQUIRES_CONFIRMATION, PROCESSING, SUCCEEDED, CANCELED
    }

    private static class SimulatedStripeIntent {
        final String id;
        final String clientSecret;
        final Long orderId;
        final Long userId;
        final java.math.BigDecimal amount;
        final String currency;
        volatile IntentStatus status;

        SimulatedStripeIntent(String id, String clientSecret, Long orderId, Long userId,
                             java.math.BigDecimal amount, String currency, IntentStatus status) {
            this.id = id;
            this.clientSecret = clientSecret;
            this.orderId = orderId;
            this.userId = userId;
            this.amount = amount;
            this.currency = currency;
            this.status = status;
        }
    }
}
