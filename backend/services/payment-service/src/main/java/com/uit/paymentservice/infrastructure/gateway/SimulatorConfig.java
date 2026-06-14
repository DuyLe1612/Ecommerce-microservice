package com.uit.paymentservice.infrastructure.gateway;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "payment.simulator")
public class SimulatorConfig {

    private GatewayConfig vnpay = new GatewayConfig();
    private GatewayConfig momo = new GatewayConfig();
    private GatewayConfig zalopay = new GatewayConfig();
    private GatewayConfig paypal = new GatewayConfig();
    private GatewayConfig stripe = new GatewayConfig();

    public GatewayConfig vnpay() {
        return vnpay;
    }

    public void setVnpay(GatewayConfig vnpay) {
        this.vnpay = vnpay;
    }

    public GatewayConfig momo() {
        return momo;
    }

    public void setMomo(GatewayConfig momo) {
        this.momo = momo;
    }

    public GatewayConfig zalopay() {
        return zalopay;
    }

    public void setZalopay(GatewayConfig zalopay) {
        this.zalopay = zalopay;
    }

    public GatewayConfig paypal() {
        return paypal;
    }

    public void setPaypal(GatewayConfig paypal) {
        this.paypal = paypal;
    }

    public GatewayConfig stripe() {
        return stripe;
    }

    public void setStripe(GatewayConfig stripe) {
        this.stripe = stripe;
    }

    public static class GatewayConfig {
        private double failureRate = 0.0;
        private long processingDelayMs = 0;

        public double failureRate() {
            return failureRate;
        }

        public void setFailureRate(double failureRate) {
            this.failureRate = failureRate;
        }

        public long processingDelayMs() {
            return processingDelayMs;
        }

        public void setProcessingDelayMs(long processingDelayMs) {
            this.processingDelayMs = processingDelayMs;
        }
    }
}
