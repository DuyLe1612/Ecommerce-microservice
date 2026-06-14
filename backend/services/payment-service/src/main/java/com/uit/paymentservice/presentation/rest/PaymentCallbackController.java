package com.uit.paymentservice.presentation.rest;

import com.uit.paymentservice.domain.model.PaymentGatewayType;
import com.uit.paymentservice.infrastructure.gateway.PaymentGatewayFactory;
import com.uit.paymentservice.presentation.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment/callback")
@Tag(name = "Payment Callbacks", description = "Gateway IPN (Instant Payment Notification) and return URL handlers")
public class PaymentCallbackController {

    private final PaymentGatewayFactory gatewayFactory;

    public PaymentCallbackController(PaymentGatewayFactory gatewayFactory) {
        this.gatewayFactory = gatewayFactory;
    }

    @Operation(
        summary = "Handle gateway callback / IPN",
        description = "Receives and processes callbacks from payment gateways (MoMo, ZaloPay, PayPal, Stripe). " +
            "Signature verification is performed. No authentication required — " +
            "gateways call this endpoint directly with signed payloads."
    )
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Callback processed",
            content = @Content),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400",
            description = "Unsupported gateway or invalid signature",
            content = @Content)
    })
    @PostMapping("/{gatewayType}")
    public ResponseEntity<?> handleCallback(
            @Parameter(description = "Gateway type: MOMO, ZALOPAY, PAYPAL, STRIPE", example = "MOMO")
            @PathVariable String gatewayType,
            @Parameter(description = "Raw callback parameters from the gateway")
            @RequestParam Map<String, String> params) {

        try {
            PaymentGatewayType type = PaymentGatewayType.valueOf(gatewayType.toUpperCase());
            var gateway = gatewayFactory.get(type);
            if (gateway == null) {
                return ResponseEntity.badRequest().body("{\"error\":\"Unsupported gateway\"}");
            }

            var result = gateway.processCallback(params);
            if (result.success()) {
                return ResponseEntity.ok("{\"returnCode\":1,\"returnMessage\":\"OK\"}");
            } else {
                return ResponseEntity.ok("{\"returnCode\":0,\"returnMessage\":\"Failed\"}");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    @Operation(
        summary = "VNPay IPN handler",
        description = "Special VNPay IPN endpoint that returns VNPay-specific response format (RspCode). " +
            "Called by VNPay server after payment completion."
    )
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "IPN response with VNPay RspCode",
            content = @Content)
    })
    @GetMapping("/vnpay/ipn")
    public ResponseEntity<String> handleVnpayIpn(
            @Parameter(description = "VNPay callback parameters")
            @RequestParam Map<String, String> params) {

        var gateway = gatewayFactory.get(PaymentGatewayType.VNPAY);
        if (gateway == null) {
            return ResponseEntity.badRequest().body("RspCode=99&Message=ERROR");
        }

        var result = gateway.processCallback(params);
        String responseCode = result.success() ? "00" : "99";
        return ResponseEntity.ok("RspCode=" + responseCode + "&Message=OK");
    }

    @Operation(
        summary = "VNPay return URL handler",
        description = "Handles the return redirect from VNPay after customer completes or cancels payment on VNPay's page."
    )
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Return handled",
            content = @Content)
    })
    @GetMapping("/vnpay/return")
    public ResponseEntity<Void> handleVnpayReturn(
            @Parameter(description = "VNPay return parameters")
            @RequestParam Map<String, String> params) {
        return ResponseEntity.ok().build();
    }
}
