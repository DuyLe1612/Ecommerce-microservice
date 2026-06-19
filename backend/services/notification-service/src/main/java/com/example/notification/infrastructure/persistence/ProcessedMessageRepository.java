package com.example.notification.infrastructure.persistence;

import com.example.notification.domain.ProcessedMessage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProcessedMessageRepository extends JpaRepository<ProcessedMessage, Long> {
    boolean existsByMessageId(String messageId);
}
