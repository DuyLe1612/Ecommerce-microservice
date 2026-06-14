package com.uit.paymentservice.infrastructure.gateway;

import com.uit.paymentservice.domain.gateway.PaymentGateway;
import com.uit.paymentservice.domain.model.PaymentGatewayType;
import com.uit.paymentservice.application.exception.UnsupportedGatewayException;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class PaymentGatewayFactory {

    private static final Logger log = LoggerFactory.getLogger(PaymentGatewayFactory.class);
    private final Map<PaymentGatewayType, PaymentGateway> registry;

    public PaymentGatewayFactory(List<PaymentGateway> gateways) {
        this.registry = gateways.stream()
            .collect(Collectors.toUnmodifiableMap(
                PaymentGateway::getType,
                Function.identity()
            ));
        log.info("Registered {} payment gateway simulators: {}", registry.size(), registry.keySet());
    }

    public PaymentGateway get(PaymentGatewayType type) {
        return registry.get(type);
    }

    public Set<PaymentGatewayType> availableGateways() {
        return registry.keySet();
    }
}
