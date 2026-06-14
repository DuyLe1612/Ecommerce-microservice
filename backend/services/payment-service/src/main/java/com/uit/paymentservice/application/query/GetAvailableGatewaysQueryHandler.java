package com.uit.paymentservice.application.query;

import com.uit.paymentservice.domain.model.PaymentGatewayType;
import com.uit.paymentservice.infrastructure.gateway.PaymentGatewayFactory;
import com.uit.paymentservice.application.dto.GatewayInfo;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class GetAvailableGatewaysQueryHandler {

    private final PaymentGatewayFactory gatewayFactory;

    public GetAvailableGatewaysQueryHandler(PaymentGatewayFactory gatewayFactory) {
        this.gatewayFactory = gatewayFactory;
    }

    public List<GatewayInfo> execute() {
        return gatewayFactory.availableGateways().stream()
            .map(this::toGatewayInfo)
            .toList();
    }

    private GatewayInfo toGatewayInfo(PaymentGatewayType type) {
        String displayName = switch (type) {
            case VNPAY -> "VNPay (Simulator)";
            case MOMO -> "MoMo (Simulator)";
            case ZALOPAY -> "ZaloPay (Simulator)";
            case PAYPAL -> "PayPal (Simulator)";
            case STRIPE -> "Stripe (Simulator)";
        };

        String description = switch (type) {
            case VNPAY -> "Vietnamese payment gateway simulator";
            case MOMO -> "MoMo e-wallet simulator";
            case ZALOPAY -> "ZaloPay gateway simulator";
            case PAYPAL -> "PayPal payment simulator";
            case STRIPE -> "Stripe payment simulator";
        };

        return new GatewayInfo(type.name(), displayName, description, true);
    }
}
