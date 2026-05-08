package com.example.promotion.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "product_advertisements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Advertisement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "\"Id\"")
    private Integer id;

    @Column(name = "\"ProductId\"", nullable = false)
    private Integer productId;

    @Column(name = "\"ImageUrl\"", nullable = false, length = 500)
    private String imageUrl;

    @Column(name = "\"Position\"", nullable = false, length = 50)
    private String position;

    @Column(name = "\"Priority\"", nullable = false)
    private Integer priority;

    @Column(name = "\"IsActive\"", nullable = false)
    private Boolean isActive;

    @Column(name = "\"StartDate\"")
    private LocalDateTime startDate;

    @Column(name = "\"EndDate\"")
    private LocalDateTime endDate;

    @Column(name = "\"CreatedAt\"", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.isActive == null) {
            this.isActive = true;
        }
        if (this.priority == null) {
            this.priority = 0;
        }
        if (this.position == null) {
            this.position = "HomeTop";
        }
    }
}
