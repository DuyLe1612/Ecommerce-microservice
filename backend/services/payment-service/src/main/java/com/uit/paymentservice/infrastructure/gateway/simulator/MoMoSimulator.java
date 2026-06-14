package com.uit.paymentservice.infrastructure.gateway.simulator;

import com.uit.paymentservice.domain.gateway.*;
import com.uit.paymentservice.domain.model.Money;
import com.uit.paymentservice.domain.model.PaymentGatewayType;
import com.uit.paymentservice.infrastructure.gateway.SimulatorConfig;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class MoMoSimulator implements PaymentGateway {

    private static final Logger log = LoggerFactory.getLogger(MoMoSimulator.class);
    private static final String SECRET_KEY = "MOMO_MOCK_SECRET_KEY_FOR_SIMULATION";
    private static final String ACCESS_KEY = "MOCK_ACCESS_KEY";
    private static final String PARTNER_CODE = "MOCK_PARTNER";

    private final SimulatorConfig.GatewayConfig config;

    public MoMoSimulator(SimulatorConfig config) {
        this.config = config.momo();
    }

    @Override
    public PaymentGatewayType getType() {
        return PaymentGatewayType.MOMO;
    }

    @Override
    public GatewayPaymentResult initiate(GatewayPaymentRequest request) {
        log.debug("MoMo initiate: orderId={}, amount={}", request.orderId(), request.amount());

        simulateDelay();

        if (shouldSimulateFailure()) {
            return new GatewayPaymentResult(null, null,
                "{\"resultCode\":\"99\",\"message\":\"Simulated failure\"}", false, "Simulated gateway failure");
        }

        String transactionId = "MOMO" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();

        String qrContent = String.format(
            "momo://payment?partnerCode=%s&requestId=%s&amount=%s&orderId=%s&orderInfo=%s",
            PARTNER_CODE, request.transactionId(), request.amount(), request.orderId(), request.orderId()
        );

        String payUrl = "https://test-payment.momo.vn/simulate/qr?data=" +
            Base64.getEncoder().encodeToString(qrContent.getBytes(StandardCharsets.UTF_8));

        String signature = generateSignature(request);

        Map<String, Object> rawResponse = new LinkedHashMap<>();
        rawResponse.put("partnerCode", PARTNER_CODE);
        rawResponse.put("requestId", request.transactionId());
        rawResponse.put("orderId", request.orderId());
        rawResponse.put("amount", request.amount());
        rawResponse.put("responseTime", System.currentTimeMillis());
        rawResponse.put("resultCode", "0");
        rawResponse.put("message", "Success");
        rawResponse.put("payUrl", payUrl);
        rawResponse.put("qrCodeUrl", payUrl);
        rawResponse.put("signature", signature);

        String rawJson = toJson(rawResponse);
        log.debug("MoMo initiate success: gatewayTxId={}, redirectUrl={}", transactionId, payUrl);

        return new GatewayPaymentResult(transactionId, payUrl, rawJson, true, null);
    }

    @Override
    public GatewayCallbackResult processCallback(Map<String, String> params) {
        log.debug("MoMo callback: {}", params);

        boolean verified = verifySignature(params);
        if (!verified) {
            return new GatewayCallbackResult(false, null, null, params, false);
        }

        String resultCode = params.get("resultCode");
        boolean success = "0".equals(resultCode);

        String transactionId = params.get("requestId");
        String status = success ? "SUCCESS" : "FAILED";

        return new GatewayCallbackResult(success, transactionId, status, params, true);
    }

    @Override
    public GatewayStatusResult queryStatus(String gatewayTransactionId) {
        log.debug("MoMo queryStatus: gatewayTxId={}", gatewayTransactionId);
        return new GatewayStatusResult(gatewayTransactionId, "SUCCESS",
            "{\"status\":\"COMPLETED\"}", true);
    }

    @Override
    public GatewayRefundResult refund(String gatewayTransactionId, Money amount) {
        String refundId = "MOMOREF" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        log.debug("MoMo refund: gatewayTxId={}, amount={}, refundId={}", gatewayTransactionId, amount, refundId);
        return new GatewayRefundResult(refundId, true, amount, null);
    }

    @Override
    public boolean verifySignature(Map<String, String> params) {
        String providedSignature = params.get("signature");
        if (providedSignature == null) return false;

        StringBuilder rawBuilder = new StringBuilder();
        rawBuilder.append("accessKey=").append(ACCESS_KEY).append("&");
        rawBuilder.append("amount=").append(params.getOrDefault("amount", "")).append("&");
        rawBuilder.append("extraData=").append(params.getOrDefault("extraData", "")).append("&");
        rawBuilder.append("message=").append(params.getOrDefault("message", "")).append("&");
        rawBuilder.append("orderId=").append(params.getOrDefault("orderId", "")).append("&");
        rawBuilder.append("orderInfo=").append(params.getOrDefault("orderInfo", "")).append("&");
        rawBuilder.append("orderType=").append(params.getOrDefault("orderType", "")).append("&");
        rawBuilder.append("partnerCode=").append(params.getOrDefault("partnerCode", "")).append("&");
        rawBuilder.append("payType=").append(params.getOrDefault("payType", "")).append("&");
        rawBuilder.append("requestId=").append(params.getOrDefault("requestId", "")).append("&");
        rawBuilder.append("responseTime=").append(params.getOrDefault("responseTime", "")).append("&");
        rawBuilder.append("resultCode=").append(params.getOrDefault("resultCode", "")).append("&");
        rawBuilder.append("transId=").append(params.getOrDefault("transId", ""));

        String expectedSignature = hmacSha256(rawBuilder.toString(), SECRET_KEY);
        return expectedSignature.equals(providedSignature);
    }

    private String generateSignature(GatewayPaymentRequest request) {
        String raw = String.format(
            "accessKey=%s&amount=%s&extraData=&ipnUrl=%s&orderId=%s&orderInfo=%s&partnerCode=%s&redirectUrl=%s&requestId=%s&requestType=captureWallet",
            ACCESS_KEY, request.amount(), "", request.transactionId(), request.orderId(),
            PARTNER_CODE, "", request.transactionId()
        );
        return hmacSha256(raw, SECRET_KEY);
    }

    private String hmacSha256(String data, String key) {
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
            } else if (val instanceof Number) {
                sb.append(val);
            } else {
                sb.append(val);
            }
        }
        sb.append("}");
        return sb.toString();
    }
}
