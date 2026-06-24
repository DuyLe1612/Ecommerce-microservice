package com.example.cart.application;

import com.example.cart.application.dto.WishlistItemResponse;
import com.example.cart.domain.WishlistItem;
import com.example.cart.infrastructure.persistence.WishlistRepository;
import com.example.cart.infrastructure.product.ProductClient;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class WishlistService {
    private final WishlistRepository wishlistRepository;
    private final ProductClient productClient;

    @Transactional(readOnly = true)
    public List<WishlistItemResponse> list(String userId) {
        return wishlistRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
            .map(item -> new WishlistItemResponse(item.getProductId(), item.getCreatedAt()))
            .toList();
    }

    @Transactional
    public List<WishlistItemResponse> add(String userId, Long productId) {
        productClient.ensureProductExists(productId);
        if (!wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            try {
                wishlistRepository.save(WishlistItem.builder()
                    .userId(userId)
                    .productId(productId)
                    .build());
            } catch (DataIntegrityViolationException ignored) {
                // Another concurrent request added it first; endpoint remains idempotent.
            }
        }
        return list(userId);
    }

    @Transactional
    public List<WishlistItemResponse> remove(String userId, Long productId) {
        wishlistRepository.deleteByUserIdAndProductId(userId, productId);
        return list(userId);
    }

    @Transactional(readOnly = true)
    public boolean isWishlisted(String userId, Long productId) {
        return wishlistRepository.existsByUserIdAndProductId(userId, productId);
    }
}
