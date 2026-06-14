package com.uit.paymentservice.presentation.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Value("${server.port:8086}")
    private String serverPort;

    @Bean
    public OpenAPI paymentServiceOpenAPI() {
        final String securitySchemeName = "bearerAuth";

        return new OpenAPI()
                .info(new Info()
                        .title("Payment Service API")
                        .description("Payment gateway service supporting VNPay, MoMo, ZaloPay, PayPal, and Stripe. " +
                                "Provides idempotent payment initiation, order validation, gateway callback handling, " +
                                "and domain event publishing via RabbitMQ.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Tekno E-Commerce")
                                .email("dev@tekno.com"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:" + serverPort)
                                .description("Local development"),
                        new Server()
                                .url("http://localhost:8080")
                                .description("API Gateway")))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description(
                                                "JWT Bearer token. " +
                                                "In mock mode (default): use `mock-user-{userId}-{role}`, e.g. `mock-user-1-CUSTOMER`. " +
                                                "In real mode: use a valid JWT issued by auth-service.")));
    }
}
