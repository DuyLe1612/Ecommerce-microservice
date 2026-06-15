package com.uit.paymentservice.infrastructure.gateway.simulator;

import com.uit.paymentservice.domain.gateway.*;
import com.uit.paymentservice.domain.model.Money;
import com.uit.paymentservice.domain.model.PaymentGatewayType;
import com.uit.paymentservice.infrastructure.gateway.SimulatorConfig;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class VNPaySimulator implements PaymentGateway {

    private static final Logger log = LoggerFactory.getLogger(VNPaySimulator.class);
    private static final String SECRET_KEY = "VNPAY_MOCK_SECRET_KEY_FOR_SIMULATION";
    private static final String TMN_CODE = "MOCK_TMN";

    private final SimulatorConfig.GatewayConfig config;

    public VNPaySimulator(SimulatorConfig config) {
        this.config = config.vnpay();
    }

    @Override
    public PaymentGatewayType getType() {
        return PaymentGatewayType.VNPAY;
    }

    @Override
    public GatewayPaymentResult initiate(GatewayPaymentRequest request) {
        log.debug("VNPay initiate: orderId={}, amount={}", request.orderId(), request.amount());

        simulateDelay();

        if (shouldSimulateFailure()) {
            return new GatewayPaymentResult(null, null,
                "{\"vnp_ResponseCode\":\"99\",\"vnp_Message\":\"Simulated failure\"}",
                false, "Simulated gateway failure");
        }

        String gatewayTxId = "VNP" + System.currentTimeMillis();

        // Build params for redirect URL (sorted alphabetically for HMAC)
        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Amount", request.amount().multiply(BigDecimal.valueOf(100)).toBigInteger().toString());
        params.put("vnp_Command", "pay");
        params.put("vnp_CurrCode", request.currency());
        params.put("vnp_IpAddr", "127.0.0.1");
        params.put("vnp_Locale", "vn");
        params.put("vnp_OrderInfo", request.orderId().toString());
        params.put("vnp_ReturnUrl", request.returnUrl() != null ? request.returnUrl() : "");
        params.put("vnp_TmnCode", TMN_CODE);
        params.put("vnp_TxnRef", request.transactionId());
        params.put("vnp_Version", "2.1.0");

        String secureHash = computeHmacSha512(buildQueryString(params));
        String redirectUrl = "https://sandbox.vnpayment.vn/simulate?" +
            buildQueryString(params) + "&vnp_SecureHash=" + secureHash;

        Map<String, Object> rawResponse = new LinkedHashMap<>(params);
        rawResponse.put("vnp_SecureHash", secureHash);
        rawResponse.put("vnp_TransactionNo", "mock_" + System.currentTimeMillis());

        log.debug("VNPay initiate success: gatewayTxId={}, redirectUrl={}", gatewayTxId, redirectUrl);
        return new GatewayPaymentResult(gatewayTxId, redirectUrl, toJson(rawResponse), true, null);
    }

    @Override
    public GatewayCallbackResult processCallback(Map<String, String> params) {
        log.debug("VNPay callback: {}", params);

        if (!verifySignature(params)) {
            log.warn("VNPay callback: invalid signature");
            return new GatewayCallbackResult(false, null, null, params, false);
        }

        String responseCode = params.get("vnp_ResponseCode");
        boolean success = "00".equals(responseCode);
        String txRef = params.get("vnp_TxnRef");
        String status = success ? "SUCCESS" : "FAILED";

        return new GatewayCallbackResult(success, txRef, status, params, true);
    }

    @Override
    public GatewayStatusResult queryStatus(String gatewayTransactionId) {
        log.debug("VNPay queryStatus: gatewayTxId={}", gatewayTransactionId);
        return new GatewayStatusResult(gatewayTransactionId, "SUCCESS",
            "{\"vnp_TransactionStatus\":\"00\"}", true);
    }

    @Override
    public GatewayRefundResult refund(String gatewayTransactionId, Money amount) {
        String refundId = "VNPREF" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        log.debug("VNPay refund: gatewayTxId={}, amount={}, refundId={}", gatewayTransactionId, amount, refundId);
        return new GatewayRefundResult(refundId, true, amount, null);
    }

    @Override
    public boolean verifySignature(Map<String, String> params) {
        String providedHash = params.get("vnp_SecureHash");
        if (providedHash == null) return false;

        // Build a copy without the hash field, sorted alphabetically
        Map<String, String> signedParams = new TreeMap<>(params);
        signedParams.remove("vnp_SecureHash");
        signedParams.remove("vnp_SecureHashType");

        String expectedHash = computeHmacSha512(buildQueryString(signedParams));
        return expectedHash.equalsIgnoreCase(providedHash);
    }

    private String buildQueryString(Map<String, ?> params) {
        StringBuilder sb = new StringBuilder();
        params.forEach((key, value) -> {
            if (value != null && !value.toString().isEmpty()) {
                if (sb.length() > 0) sb.append("&");
                sb.append(key).append("=").append(value.toString().replace(" ", "+"));
            }
        });
        return sb.toString();
    }

    private String computeHmacSha512(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                SECRET_KEY.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            mac.init(secretKeySpec);
            byte[] hmacBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hmacBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to compute HMAC-SHA512", e);
        }
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

    private String toJson(Map<String, Object> map) {
        StringBuilder sb = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<String, Object> entry : map.entrySet()) {
            if (!first) sb.append(",");
            first = false;
            sb.append("\"").append(entry.getKey()).append("\":");
            Object val = entry.getValue();
            if (val instanceof String) {
                sb.append("\"").append(val).append("\"");
            } else {
                sb.append(val);
            }
        }
        sb.append("}");
        return sb.toString();
    }
}
