package com.example.search.infrastructure.elasticsearch;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.SortOrder;
import co.elastic.clients.elasticsearch.core.BulkRequest;
import co.elastic.clients.elasticsearch.core.BulkResponse;
import co.elastic.clients.elasticsearch.core.SearchRequest;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import co.elastic.clients.elasticsearch.core.bulk.BulkOperation;
import co.elastic.clients.elasticsearch.core.bulk.DeleteOperation;
import co.elastic.clients.elasticsearch.core.bulk.IndexOperation;
import co.elastic.clients.elasticsearch.core.search.Hit;
import com.example.search.domain.model.ProductDocument;
import com.example.search.domain.repository.ProductSearchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
@Slf4j
public class ProductSearchRepositoryImpl implements ProductSearchRepository {

    private final ElasticsearchClient client;
    private static final String ALIAS_NAME = "products";

    @Override
    public void save(ProductDocument product) {
        try {
            client.index(i -> i
                .index(ALIAS_NAME)
                .id(product.getId())
                .document(product)
            );
        } catch (IOException e) {
            log.error("Error saving product to ES: " + product.getId(), e);
            throw new RuntimeException("Error saving product", e);
        }
    }

    @Override
    public void saveAll(List<ProductDocument> products) {
        if (products.isEmpty()) return;
        
        try {
            List<BulkOperation> bulkOperations = new ArrayList<>();
            for (ProductDocument product : products) {
                bulkOperations.add(new BulkOperation.Builder()
                    .index(i -> i.index(ALIAS_NAME).id(product.getId()).document(product))
                    .build());
            }

            BulkResponse response = client.bulk(b -> b.operations(bulkOperations));
            if (response.errors()) {
                log.error("Bulk save had errors: {}", response.items());
            }
        } catch (IOException e) {
            log.error("Error bulk saving products", e);
            throw new RuntimeException("Error bulk saving products", e);
        }
    }

    @Override
    public void deleteById(String id) {
        try {
            client.delete(d -> d.index(ALIAS_NAME).id(id));
        } catch (IOException e) {
            log.error("Error deleting product from ES: " + id, e);
        }
    }

    @Override
    public void deleteAllById(List<String> ids) {
        if (ids.isEmpty()) return;
        
        try {
            List<BulkOperation> bulkOperations = new ArrayList<>();
            for (String id : ids) {
                bulkOperations.add(new BulkOperation.Builder()
                    .delete(d -> d.index(ALIAS_NAME).id(id))
                    .build());
            }

            BulkResponse response = client.bulk(b -> b.operations(bulkOperations));
            if (response.errors()) {
                log.error("Bulk delete had errors");
            }
        } catch (IOException e) {
            log.error("Error bulk deleting products", e);
        }
    }

    @Override
    public Set<String> findAllIds() {
        try {
            SearchResponse<Map> response = client.search(s -> s
                .index(ALIAS_NAME)
                .source(src -> src.filter(f -> f.includes("id")))
                .size(10000), Map.class);
            
            return response.hits().hits().stream()
                .map(Hit::id)
                .collect(Collectors.toSet());
        } catch (Exception e) {
            log.error("Error fetching all IDs", e);
            return Set.of();
        }
    }

    @Override
    public com.example.search.application.dto.SearchResponse<ProductDocument> search(
            String query, String categoryId, String brandId, Double minPrice, Double maxPrice, String status, int page, int size) {
        
        try {
            SearchResponse<ProductDocument> response = client.search(s -> {
                s.index(ALIAS_NAME)
                 .from(page * size)
                 .size(size);
                
                s.query(q -> q.bool(b -> {
                    if (StringUtils.hasText(query)) {
                        b.must(m -> m.multiMatch(mm -> mm
                            .query(query)
                            .fields(List.of("name^3", "categoryName", "brandName"))
                        ));
                    }
                    if (StringUtils.hasText(categoryId)) {
                        b.filter(f -> f.term(t -> t.field("categoryId").value(categoryId)));
                    }
                    if (StringUtils.hasText(brandId)) {
                        b.filter(f -> f.term(t -> t.field("brandId").value(brandId)));
                    }
                    if (StringUtils.hasText(status)) {
                        b.filter(f -> f.term(t -> t.field("status").value(status)));
                    }
                    if (minPrice != null || maxPrice != null) {
                        b.filter(f -> f.range(r -> {
                            r.field("basePrice");
                            if (minPrice != null) {
                                r.gte(co.elastic.clients.json.JsonData.of(minPrice));
                            }
                            if (maxPrice != null) {
                                r.lte(co.elastic.clients.json.JsonData.of(maxPrice));
                            }
                            return r;
                        }));
                    }
                    return b;
                }));
                
                return s;
            }, ProductDocument.class);

            List<ProductDocument> content = response.hits().hits().stream()
                .map(Hit::source)
                .collect(Collectors.toList());
            
            long total = response.hits().total() != null ? response.hits().total().value() : 0;
            
            return new com.example.search.application.dto.SearchResponse<>(
                content, total, (int) Math.ceil((double) total / size), size, page
            );

        } catch (Exception e) {
            log.error("Error searching products", e);
            return new com.example.search.application.dto.SearchResponse<>(List.of(), 0L, 0, size, page);
        }
    }

    @Override
    public Object suggest(String prefix, int size) {
        try {
            SearchResponse<ProductDocument> response = client.search(s -> s
                .index(ALIAS_NAME)
                .size(size)
                .query(q -> q.matchPhrasePrefix(mpp -> mpp.field("name").query(prefix))),
                ProductDocument.class
            );
            return response.hits().hits().stream().map(Hit::source).collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error suggesting products", e);
            return List.of();
        }
    }

    @Override
    public Object aggregateFacets() {
        return null;
    }

    @Override
    public void updateCategoryName(String categoryId, String categoryName) {
        try {
            client.updateByQuery(u -> u
                .index(ALIAS_NAME)
                .query(q -> q.term(t -> t.field("categoryId").value(categoryId)))
                .script(sc -> sc.inline(i -> i.source("ctx._source.categoryName = params.name").params("name", co.elastic.clients.json.JsonData.of(categoryName))))
            );
        } catch (IOException e) {
            log.error("Error updating category name", e);
        }
    }
}
