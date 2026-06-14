package com.uit.paymentservice.domain.gateway;

import com.uit.paymentservice.domain.model.Money;
import java.math.BigDecimal;
import java.util.Map;

public interface PaymentGateway {

    com.uit.paymentservice.domain.model.PaymentGatewayType getType();

    GatewayPaymentResult initiate(GatewayPaymentRequest request);

    GatewayCallbackResult processCallback(Map<String, String> params);

    GatewayStatusResult queryStatus(String gatewayTransactionId);

    GatewayRefundResult refund(String gatewayTransactionId, Money amount);

    boolean verifySignature(Map<String, String> params);
}
