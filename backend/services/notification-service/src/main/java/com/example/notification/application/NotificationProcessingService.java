package com.example.notification.application;

import com.example.notification.domain.NotificationDelivery;
import com.example.notification.domain.ProcessedMessage;
import com.example.notification.infrastructure.persistence.NotificationDeliveryRepository;
import com.example.notification.infrastructure.persistence.ProcessedMessageRepository;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationProcessingService {
    private final ProcessedMessageRepository processedMessageRepository;
    private final NotificationDeliveryRepository deliveryRepository;
    private final NotificationTemplateService templateService;
    private final NotificationSender sender;

    @Transactional
    public void process(String messageId, String eventType, Map<String, Object> payload) {
        if (processedMessageRepository.existsByMessageId(messageId)) {
            log.info("Skipping duplicate notification event: messageId={} type={}", messageId, eventType);
            return;
        }

        NotificationMessage message = templateService.render(messageId, eventType, payload);
        try {
            sender.send(message);
            deliveryRepository.save(NotificationDelivery.builder()
                .messageId(messageId)
                .eventType(eventType)
                .recipient(message.recipient())
                .subject(message.subject())
                .status("DELIVERED")
                .build());
            processedMessageRepository.save(ProcessedMessage.builder()
                .messageId(messageId)
                .eventType(eventType)
                .build());
        } catch (DataIntegrityViolationException duplicate) {
            log.info("Duplicate message recorded concurrently: messageId={}", messageId);
        } catch (Exception ex) {
            deliveryRepository.save(NotificationDelivery.builder()
                .messageId(messageId)
                .eventType(eventType)
                .recipient(message.recipient())
                .subject(message.subject())
                .status("FAILED")
                .errorMessage(ex.getMessage())
                .build());
            throw ex;
        }
    }
}
