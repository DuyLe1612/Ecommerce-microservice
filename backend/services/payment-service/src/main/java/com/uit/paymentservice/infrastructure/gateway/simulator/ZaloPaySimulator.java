package com.uit.paymentservice.infrastructure.gateway.simulator;

import com.uit.paymentservice.domain.gateway.*;
import com.uit.paymentservice.domain.model.Money;
import com.uit.paymentservice.domain.model.PaymentGatewayType;
import com.uit.paymentservice.infrastructure.gateway.SimulatorConfig;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class ZaloPaySimulator implements PaymentGateway {

    private static final Logger log = LoggerFactory.getLogger(ZaloPaySimulator.class);
    private static final String KEY1 = "ZALOPAY_MOCK_KEY1";
    private static final String KEY2 = "ZALOPAY_MOCK_KEY2";
    private static final String APP_ID = "MOCK_APP_ID";

    private final SimulatorConfig.GatewayConfig config;

    public ZaloPaySimulator(SimulatorConfig config) {
        this.config = config.zalopay();
    }

    @Override
    public PaymentGatewayType getType() {
        return PaymentGatewayType.ZALOPAY;
    }

    @Override
    public GatewayPaymentResult initiate(GatewayPaymentRequest request) {
        log.debug("ZaloPay initiate: orderId={}, amount={}", request.orderId(), request.amount());

        simulateDelay();

        if (shouldSimulateFailure()) {
            return new GatewayPaymentResult(null, null,
                "{\"return_code\":1,\"return_message\":\"Simulated failure\"}", false, "Simulated gateway failure");
        }

        String apptransid = LocalDate.now().format(DateTimeFormatter.ofPattern("yyMMdd")) + "_" + request.transactionId();
        String transactionId = "ZLP" + apptransid;

        Map<String, Object> embedData = new LinkedHashMap<>();
        embedData.put("redirecturl", request.returnUrl());

        Map<String, Object> item = new LinkedHashMap<>();
        item.put("itemid", request.orderId().toString());
        item.put("itemname", request.description());
        item.put("itemprice", request.amount());

        String embedDataJson = toJson(embedData);
        String itemJson = "[" + toJson(item) + "]";

        String rawForMac = String.format("%s|%s|%s|%s|%s|%s|%s",
            APP_ID, apptransid, request.userId(), request.amount(),
            System.currentTimeMillis(), embedDataJson, itemJson);
        String mac = hmacSha256(rawForMac, KEY1);

        String orderToken = Base64.getEncoder().encodeToString(
            String.format("{\"appid\":\"%s\",\"apptransid\":\"%s\",\"appuser\":\"%s\",\"amount\":%s,\"apptime\":%s,\"embeddata\":%s,\"item\":%s}",
                APP_ID, apptransid, request.userId(), request.amount(),
                System.currentTimeMillis(), embedDataJson, itemJson).getBytes(StandardCharsets.UTF_8)
        );

        String redirectUrl = "https://sandbox.zalopay.vn/simulate?token=" + orderToken + "&appid=" + APP_ID + "&mac=" + mac;

        Map<String, Object> rawResponse = new LinkedHashMap<>();
        rawResponse.put("return_code", 0);
        rawResponse.put("return_message", "Success");
        rawResponse.put("sub_return_code", 0);
        rawResponse.put("sub_return_message", "Success");
        rawResponse.put("zp_trans_token", orderToken);
        rawResponse.put("order_url", redirectUrl);
        rawResponse.put("apptransid", apptransid);

        String rawJson = toJson(rawResponse);
        log.debug("ZaloPay initiate success: gatewayTxId={}, redirectUrl={}", transactionId, redirectUrl);

        return new GatewayPaymentResult(transactionId, redirectUrl, rawJson, true, null);
    }

    @Override
    public GatewayCallbackResult processCallback(Map<String, String> params) {
        log.debug("ZaloPay callback: {}", params);

        String data = params.get("data");
        String providedMac = params.get("mac");

        if (data == null || providedMac == null) {
            return new GatewayCallbackResult(false, null, null, params, false);
        }

        boolean verified = verifySignature(params);
        if (!verified) {
            return new GatewayCallbackResult(false, null, null, params, false);
        }

        Map<String, Object> dataMap = parseJson(data);
        String apptransid = (String) dataMap.get("apptransid");
        String zptransid = (String) dataMap.getOrDefault("zptransid", "mock_" + apptransid);
        int type = ((Number) dataMap.getOrDefault("type", 0)).intValue();

        boolean success = type == 1;
        String status = success ? "SUCCESS" : "FAILED";

        return new GatewayCallbackResult(success, "ZLP" + apptransid, status, params, true);
    }

    @Override
    public GatewayStatusResult queryStatus(String gatewayTransactionId) {
        log.debug("ZaloPay queryStatus: gatewayTxId={}", gatewayTransactionId);
        return new GatewayStatusResult(gatewayTransactionId, "SUCCESS",
            "{\"status\":\"COMPLETED\"}", true);
    }

    @Override
    public GatewayRefundResult refund(String gatewayTransactionId, Money amount) {
        String refundId = "ZLPRef" + java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        log.debug("ZaloPay refund: gatewayTxId={}, amount={}, refundId={}", gatewayTransactionId, amount, refundId);
        return new GatewayRefundResult(refundId, true, amount, null);
    }

    @Override
    public boolean verifySignature(Map<String, String> params) {
        String data = params.get("data");
        String providedMac = params.get("mac");
        if (data == null || providedMac == null) return false;

        String expectedMac = hmacSha256(data, KEY2);
        return expectedMac.equals(providedMac);
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

    private Map<String, Object> parseJson(String json) {
        Map<String, Object> result = new LinkedHashMap<>();
        json = json.trim();
        if (json.startsWith("{")) json = json.substring(1);
        if (json.endsWith("}")) json = json.substring(0, json.length() - 1);

        String[] pairs = json.split(",");
        for (String pair : pairs) {
            String[] keyValue = pair.split(":", 2);
            if (keyValue.length == 2) {
                String key = keyValue[0].trim().replace("\"", "");
                String value = keyValue[1].trim().replace("\"", "");
                if (value.matches("\\d+")) {
                    result.put(key, Long.parseLong(value));
                } else if (value.matches("\\d+\\.\\d+")) {
                    result.put(key, Double.parseDouble(value));
                } else {
                    result.put(key, value);
                }
            }
        }
        return result;
    }
}
