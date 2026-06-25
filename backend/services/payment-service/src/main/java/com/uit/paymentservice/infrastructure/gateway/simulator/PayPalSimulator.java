package com.uit.paymentservice.infrastructure.gateway.simulator;

import com.uit.paymentservice.domain.gateway.*;
import com.uit.paymentservice.domain.model.Money;
import com.uit.paymentservice.domain.model.PaymentGatewayType;
import com.uit.paymentservice.infrastructure.gateway.SimulatorConfig;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class PayPalSimulator implements PaymentGateway {

    private static final Logger log = LoggerFactory.getLogger(PayPalSimulator.class);

    // In-memory order store — simulates PayPal's server-side order database.
    private final ConcurrentMap<String, SimulatedPayPalOrder> orders = new ConcurrentHashMap<>();

    private final SimulatorConfig.GatewayConfig config;

    public PayPalSimulator(SimulatorConfig config) {
        this.config = config.paypal();
    }

    @Override
    public PaymentGatewayType getType() {
        return PaymentGatewayType.PAYPAL;
    }

    @Override
    public GatewayPaymentResult initiate(GatewayPaymentRequest request) {
        log.debug("PayPal initiate: orderId={}, amount={}", request.orderId(), request.amount());

        simulateDelay();

        if (shouldSimulateFailure()) {
            return new GatewayPaymentResult(null, null,
                "{\"name\":\"SIMULATION_ERROR\",\"message\":\"Simulated failure\"}",
                false, "Simulated gateway failure");
        }

        // Simulate "Get access token"
        String fakeAccessToken = Base64.getEncoder().encodeToString(
            ("paypal_mock_token:" + System.currentTimeMillis()).getBytes()).toLowerCase();

        // Simulate "Create order"
        String paypalOrderId = "PAYID-" + java.util.UUID.randomUUID()
            .toString().toUpperCase().replace("-", "").substring(0, 17);

        SimulatedPayPalOrder order = new SimulatedPayPalOrder(
            paypalOrderId,
            request.transactionId(),
            request.orderId(),
            request.userId(),
            request.amount(),
            request.currency(),
            OrderStatus.CREATED,
            fakeAccessToken
        );
        orders.put(paypalOrderId, order);

        String redirectUrl = "https://www.sandbox.paypal.com/simulate/checkoutnow?token=" + paypalOrderId;

        String rawResponse = String.format(
            "{\"id\":\"%s\",\"status\":\"CREATED\",\"links\":[{\"href\":\"%s\",\"rel\":\"approve\",\"method\":\"GET\"},{\"href\":\"https://api.paypal.com/v2/checkout/orders/%s\",\"rel\":\"self\",\"method\":\"GET\"}],\"purchase_units\":[{\"reference_id\":\"%s\",\"amount\":{\"currency_code\":\"%s\",\"value\":\"%s\"}}]}",
            paypalOrderId, redirectUrl, paypalOrderId, request.transactionId(), request.currency(), request.amount()
        );

        log.debug("PayPal initiate success: paypalOrderId={}, redirectUrl={}", paypalOrderId, redirectUrl);
        return new GatewayPaymentResult(paypalOrderId, redirectUrl, rawResponse, true, null);
    }

    @Override
    public GatewayCallbackResult processCallback(Map<String, String> params) {
        log.debug("PayPal callback: {}", params);

        String paypalOrderId = params.get("paypalOrderId");
        if (paypalOrderId == null) {
            paypalOrderId = params.get("token");
        }

        if (paypalOrderId == null || !orders.containsKey(paypalOrderId)) {
            log.warn("PayPal callback: order not found: {}", paypalOrderId);
            return new GatewayCallbackResult(false, null, null, params, false);
        }

        if (!verifySignature(params)) {
            log.warn("PayPal callback: invalid signature");
            return new GatewayCallbackResult(false, null, null, params, false);
        }

        SimulatedPayPalOrder order = orders.get(paypalOrderId);
        if (order.status != OrderStatus.CREATED) {
            // Idempotent — already completed
            boolean success = order.status == OrderStatus.COMPLETED;
            return new GatewayCallbackResult(success, paypalOrderId,
                success ? "SUCCESS" : "FAILED", params, true);
        }

        // Simulate payment capture
        order.status = OrderStatus.COMPLETED;

        log.debug("PayPal callback: order {} captured, status={}", paypalOrderId, order.status);
        return new GatewayCallbackResult(true, paypalOrderId, "SUCCESS", params, true);
    }

    @Override
    public GatewayStatusResult queryStatus(String gatewayTransactionId) {
        log.debug("PayPal queryStatus: gatewayTxId={}", gatewayTransactionId);
        SimulatedPayPalOrder order = orders.get(gatewayTransactionId);
        if (order == null) {
            return new GatewayStatusResult(gatewayTransactionId, "UNKNOWN",
                "{\"error\":\"Order not found\"}", false);
        }
        return new GatewayStatusResult(gatewayTransactionId, order.status.name(),
            "{\"status\":\"" + order.status.name() + "\"}", true);
    }

    @Override
    public GatewayRefundResult refund(String gatewayTransactionId, Money amount) {
        SimulatedPayPalOrder order = orders.get(gatewayTransactionId);
        if (order != null) {
            order.status = OrderStatus.REFUNDED;
        }
        String refundId = "REFID-" + java.util.UUID.randomUUID()
            .toString().replace("-", "").substring(0, 12).toUpperCase();
        log.debug("PayPal refund: gatewayTxId={}, amount={}, refundId={}", gatewayTransactionId, amount, refundId);
        return new GatewayRefundResult(refundId, true, amount, null);
    }

    @Override
    public boolean verifySignature(Map<String, String> params) {
        // PayPal webhook signature verification — simulate: check header fields present
        String transmissionId = params.get("paypal-transmission-id");
        String authAlgo = params.get("paypal-auth-algo");
        return transmissionId != null && "SHA256withRSA".equals(authAlgo);
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

    // --- internal state record ---
    private enum OrderStatus { CREATED, COMPLETED, REFUNDED }

    private static class SimulatedPayPalOrder {
        final String paypalOrderId;
        final String transactionId;
        final Long orderId;
        final String userId;
        final java.math.BigDecimal amount;
        final String currency;
        volatile OrderStatus status;
        final String accessToken;

        SimulatedPayPalOrder(String paypalOrderId, String transactionId, Long orderId, String userId,
                             java.math.BigDecimal amount, String currency, OrderStatus status, String accessToken) {
            this.paypalOrderId = paypalOrderId;
            this.transactionId = transactionId;
            this.orderId = orderId;
            this.userId = userId;
            this.amount = amount;
            this.currency = currency;
            this.status = status;
            this.accessToken = accessToken;
        }
    }
}
