package com.example.product.application.usecase;

import com.example.product.domain.exception.DomainException;
import com.example.product.infrastructure.persistence.entity.*;
import com.example.product.infrastructure.persistence.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class StockManagementUseCase {
    private final ProductVariantRepository variantRepository;
    private final StockReservationRepository reservationRepository;

    // Check available stock = total stock - reserved
    @Transactional(readOnly = true)
    public int getAvailableStock(Long variantId) {
        ProductVariantJpaEntity variant = variantRepository.findById(variantId)
            .orElseThrow(() -> new DomainException("Variant not found: " + variantId));
        int reserved = reservationRepository.sumReservedQuantity(variantId);
        return Math.max(0, variant.getStock() - reserved);
    }

    // Reserve stock for order (called by order-service via internal API)
    @Transactional
    public void reserveStock(Long variantId, Long orderId, int quantity) {
        int available = getAvailableStock(variantId);
        if (available < quantity) {
            throw new DomainException(
                "Insufficient stock for variant " + variantId + 
                ". Available: " + available + ", Requested: " + quantity);
        }
        StockReservationJpaEntity reservation = StockReservationJpaEntity.builder()
            .variantId(variantId)
            .orderId(orderId)
            .quantity(quantity)
            .status("RESERVED")
            .expiresAt(LocalDateTime.now().plusMinutes(30))
            .build();
        reservationRepository.save(reservation);
        log.info("Stock reserved: variantId={}, orderId={}, qty={}", variantId, orderId, quantity);
    }

    // Confirm reservation (after payment success)
    @Transactional
    public void confirmReservation(Long orderId) {
        reservationRepository.findByOrderId(orderId).forEach(r -> {
            if ("RESERVED".equals(r.getStatus())) {
                // Deduct actual stock
                variantRepository.findById(r.getVariantId()).ifPresent(v -> {
                    v.setStock(Math.max(0, v.getStock() - r.getQuantity()));
                    variantRepository.save(v);
                });
                r.setStatus("CONFIRMED");
                reservationRepository.save(r);
            }
        });
        log.info("Stock confirmed for orderId={}", orderId);
    }

    // Release reservation (order cancelled)
    @Transactional
    public void releaseReservation(Long orderId) {
        reservationRepository.findByOrderId(orderId).forEach(r -> {
            if ("RESERVED".equals(r.getStatus())) {
                r.setStatus("RELEASED");
                reservationRepository.save(r);
                log.info("Stock released: variantId={}, orderId={}, qty={}", r.getVariantId(), orderId, r.getQuantity());
            }
        });
    }

    // Admin: adjust stock directly
    @Transactional
    public void adjustStock(Long variantId, int delta, String reason) {
        ProductVariantJpaEntity variant = variantRepository.findById(variantId)
            .orElseThrow(() -> new DomainException("Variant not found: " + variantId));
        int newStock = variant.getStock() + delta;
        if (newStock < 0) {
            throw new DomainException("Cannot reduce stock below 0. Current: " + variant.getStock() + ", Delta: " + delta);
        }
        variant.setStock(newStock);
        variantRepository.save(variant);
        log.info("Stock adjusted: variantId={}, delta={}, newStock={}, reason={}", variantId, delta, newStock, reason);
    }
}
