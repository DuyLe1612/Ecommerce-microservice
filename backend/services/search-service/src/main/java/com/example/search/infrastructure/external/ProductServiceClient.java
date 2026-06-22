package com.example.search.infrastructure.external;

import com.example.search.infrastructure.external.dto.IndexFeedResponse;

public interface ProductServiceClient {
    IndexFeedResponse getIndexFeed(int page, int size, String updatedAfter);
    IndexFeedResponse.ProductFeedDto getProductBySlug(String slug);
}
