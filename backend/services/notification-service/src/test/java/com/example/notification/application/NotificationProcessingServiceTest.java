package com.example.notification.application;

import com.example.notification.infrastructure.persistence.NotificationDeliveryRepository;
import com.example.notification.infrastructure.persistence.ProcessedMessageRepository;
import java.util.Map;
import org.junit.jupiter.api.Test;

import static org.mockito.Mockito.*;

class NotificationProcessingServiceTest {
    @Test
    void skipsDuplicateMessageId() {
        ProcessedMessageRepository processedRepository = mock(ProcessedMessageRepository.class);
        NotificationDeliveryRepository deliveryRepository = mock(NotificationDeliveryRepository.class);
        NotificationTemplateService templateService = new NotificationTemplateService();
        NotificationSender sender = mock(NotificationSender.class);
        NotificationProcessingService service = new NotificationProcessingService(
            processedRepository,
            deliveryRepository,
            templateService,
            sender
        );

        when(processedRepository.existsByMessageId("msg-1")).thenReturn(true);

        service.process("msg-1", "OrderShipped", Map.of("userId", 42));

        verifyNoInteractions(sender);
        verify(deliveryRepository, never()).save(any());
    }
}
