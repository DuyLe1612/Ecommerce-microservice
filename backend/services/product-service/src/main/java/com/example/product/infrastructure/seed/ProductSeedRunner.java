package com.example.product.infrastructure.seed;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ProductSeedRunner implements ApplicationRunner {

    private final ProductSeedService productSeedService;

    @Value("${app.seed.products.enabled:true}")
    private boolean seedEnabled;

    @Override
    public void run(ApplicationArguments args) {
        if (!seedEnabled) {
            log.info("event=product_seed_skip reason=disabled_by_config");
            return;
        }

        try {
            productSeedService.seedIfNeeded();
        } catch (Exception e) {
            log.error("event=product_seed_failed error={}", e.getMessage());
            // Do not throw to prevent app crash
        }
    }
}
