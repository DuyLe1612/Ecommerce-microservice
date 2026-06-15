package com.uit.paymentservice;

import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.client.RestTemplate;

@org.springframework.boot.test.context.SpringBootTest(
    classes = PaymentServiceApplication.class
)
@ActiveProfiles("test")
@Import(PaymentServiceApplicationTests.TestConfig.class)
class PaymentServiceApplicationTests {

    @Test
    void contextLoads() {
    }

    @org.springframework.boot.test.context.TestConfiguration
    static class TestConfig {
        @Bean
        public RestTemplate restTemplate() {
            return new RestTemplate();
        }
    }
}
