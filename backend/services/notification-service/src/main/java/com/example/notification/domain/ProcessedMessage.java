package com.example.notification.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "processed_messages", uniqueConstraints = @UniqueConstraint(name = "uq_processed_message_id", columnNames = "message_id"))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcessedMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "message_id", nullable = false, unique = true)
    private String messageId;

    @Column(name = "event_type", nullable = false)
    private String eventType;

    @Column(name = "processed_at", nullable = false)
    private LocalDateTime processedAt;

    @PrePersist
    void prePersist() {
        if (processedAt == null) {
            processedAt = LocalDateTime.now();
        }
    }
}
