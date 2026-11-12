
package com.ims.common.notification;

import lombok.RequiredArgsConstructor;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationEventPublisher {

    private final ApplicationEventPublisher applicationEventPublisher;

    public void publish(
            NotificationSnapshot snapshot,
            Long senderUserId
    ) {

        if (snapshot == null) {
            throw new IllegalArgumentException(
                    "Notification snapshot is required."
            );
        }

        if (senderUserId == null || senderUserId <= 0) {
            throw new IllegalArgumentException(
                    "Notification sender ID is required."
            );
        }

        applicationEventPublisher.publishEvent(
                new NotificationRequestedEvent(
                        snapshot,
                        senderUserId
                )
        );
    }
}
