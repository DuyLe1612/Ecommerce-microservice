package com.example.product.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_reservation")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StockReservationJpaEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false) private Long variantId;
    @Column(nullable = false) private Long orderId;
    @Column(nullable = false) private Integer quantity;
    @Column(nullable = false, length = 20) private String status; // RESERVED, RELEASED, CONFIRMED
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false) private LocalDateTime createdAt;
    @Column private LocalDateTime expiresAt;
}
