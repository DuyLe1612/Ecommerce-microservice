package com.example.product.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity
@Table(name = "\"stock_reservation\"")
public class StockReservationJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "\"id\"")
    private Long id;

    @Column(name = "\"variantId\"")
    private Long variantId;

    @Column(name = "\"orderId\"")
    private Long orderId;

    @Column(name = "\"quantity\"")
    private Integer quantity;

    @Column(name = "\"status\"")
    private String status;

    @Column(name = "\"createdAt\"")
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "\"expiresAt\"")
    private LocalDateTime expiresAt;
}