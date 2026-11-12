package com.ims.common.notification;

import lombok.RequiredArgsConstructor;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Component
@RequiredArgsConstructor
public class NotificationPublisher {

    private static final String DESTINATION =
            "/queue/notifications";

    private final SimpMessagingTemplate messagingTemplate;


    public void publishToUser(
            Long userId,
            NotificationEvent event
    ) {

        if (userId == null || userId <= 0 || event == null) {
            return;
        }

        Runnable delivery = () ->
                messagingTemplate.convertAndSendToUser(
                        userId.toString(),
                        DESTINATION,
                        event
                );

        if (TransactionSynchronizationManager
                .isSynchronizationActive()
                && TransactionSynchronizationManager
                .isActualTransactionActive()) {

            TransactionSynchronizationManager
                    .registerSynchronization(
                            new TransactionSynchronization() {

                                @Override
                                public void afterCommit() {
                                    delivery.run();
                                }
                            }
                    );

        } else {
            delivery.run();
        }
    }
}
