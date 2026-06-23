package com.example.search.infrastructure.elasticsearch;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch.indices.CreateIndexRequest;
import co.elastic.clients.elasticsearch.indices.ExistsAliasRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.io.InputStream;

@Component
@RequiredArgsConstructor
@Slf4j
public class ProductIndexInitializer implements ApplicationRunner {

    private final ElasticsearchClient client;
    private static final String INDEX_NAME = "products_v1";
    private static final String ALIAS_NAME = "products";

    @Override
    public void run(ApplicationArguments args) {
        try {
            boolean aliasExists = client.indices().existsAlias(ExistsAliasRequest.of(e -> e.name(ALIAS_NAME))).value();
            if (!aliasExists) {
                log.info("Index alias {} does not exist. Creating index {}...", ALIAS_NAME, INDEX_NAME);
                
                try (InputStream mapping = getClass().getResourceAsStream("/elasticsearch/product-mapping.json");
                     InputStream settings = getClass().getResourceAsStream("/elasticsearch/product-settings.json")) {
                     
                    CreateIndexRequest request = CreateIndexRequest.of(b -> b
                        .index(INDEX_NAME)
                        .settings(s -> s.withJson(settings))
                        .mappings(m -> m.withJson(mapping))
                        .aliases(ALIAS_NAME, a -> a.isWriteIndex(true))
                    );
                    
                    client.indices().create(request);
                    log.info("Index {} and alias {} created successfully.", INDEX_NAME, ALIAS_NAME);
                }
            } else {
                log.info("Index alias {} already exists. Skipping initialization.", ALIAS_NAME);
            }
        } catch (Exception e) {
            log.error("Failed to initialize Elasticsearch index", e);
        }
    }
}
