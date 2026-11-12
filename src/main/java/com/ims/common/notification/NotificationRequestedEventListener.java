
package com.ims.common.notification;

import com.ims.service.serviceInterface.notification.NotificationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationRequestedEventListener {

    private final NotificationService notificationService;

    @TransactionalEventListener(
            phase = TransactionPhase.AFTER_COMMIT,
            fallbackExecution = true
    )
    public void handleNotificationRequested(
            NotificationRequestedEvent event
    ) {

        log.info("========== NOTIFICATION EVENT RECEIVED ==========");
        log.info("Sender ID: {}", event.getSenderUserId());
        log.info("Title: {}", event.getSnapshot().getTitle());
        log.info("Entity ID: {}", event.getSnapshot().getEntityId());

        try {

            notificationService.createNotification(
                    event.getSnapshot(),
                    event.getSenderUserId()
            );

            log.info("Notification creation completed.");

        } catch (Exception exception) {

            log.error(
                    "Failed to create notification. Sender ID: {}",
                    event.getSenderUserId(),
                    exception
            );
        }
    }
}
