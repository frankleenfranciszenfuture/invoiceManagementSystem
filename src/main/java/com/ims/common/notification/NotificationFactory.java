package com.ims.common.notification;


import com.ims.enums.notification.NotificationAction;
import com.ims.enums.notification.NotificationModule;
import com.ims.enums.notification.NotificationPriority;
import com.ims.enums.notification.NotificationType;
import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;
import java.util.Set;

@Component
public class NotificationFactory {

    public NotificationSnapshot create(
            String title,
            String message,
            NotificationModule module,
            NotificationAction action,
            String entityName,
            Object entityId,
            String actionUrl,
            Set<Long> recipientUserIds
    ) {

        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException(
                    "Notification title is required."
            );
        }

        if (message == null || message.isBlank()) {
            throw new IllegalArgumentException(
                    "Notification message is required."
            );
        }

        if (module == null || action == null) {
            throw new IllegalArgumentException(
                    "Notification module and action are required."
            );
        }

        return NotificationSnapshot.builder()
                .title(title.trim())
                .message(message.trim())
                .moduleName(module)
                .action(action)
                .entityName(entityName)
                .entityId(entityId == null ? null : entityId.toString())
                .notificationType(resolveType(action))
                .priority(NotificationPriority.NORMAL)
                .actionUrl(actionUrl)
                .recipientUserIds(
                        recipientUserIds == null
                                ? new LinkedHashSet<>()
                                : new LinkedHashSet<>(recipientUserIds)
                )
                .build();
    }

    private NotificationType resolveType(NotificationAction action) {

        return switch (action) {
            case CREATED, APPROVED, COMPLETED, PAYMENT_RECEIVED ->
                    NotificationType.SUCCESS;

            case REJECTED, CANCELLED, DELETED ->
                    NotificationType.WARNING;

            default -> NotificationType.INFO;
        };
    }
}
