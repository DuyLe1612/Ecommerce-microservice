package com.example.notification.infrastructure.persistence;

import com.example.notification.domain.NotificationDelivery;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationDeliveryRepository extends JpaRepository<NotificationDelivery, Long> {}
