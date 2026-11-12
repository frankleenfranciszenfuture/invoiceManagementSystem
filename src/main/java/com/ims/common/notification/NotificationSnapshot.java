
package com.ims.common.notification;

import com.ims.enums.notification.NotificationAction;
import com.ims.enums.notification.NotificationModule;
import com.ims.enums.notification.NotificationPriority;
import com.ims.enums.notification.NotificationType;

import lombok.*;

import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationSnapshot {

    private String title;

    private String message;

    private NotificationModule moduleName;

    private NotificationAction action;

    private String entityName;

    private String entityId;

    private NotificationType notificationType;

    private NotificationPriority priority;

    private String actionUrl;

    private String createdByName;

    // Explicit recipients, when supplied.
    @Builder.Default
    private Set<Long> recipientUserIds = new LinkedHashSet<>();

    // Permission-based recipient configuration.
    private String permissionModule;

    private String permissionAction;
}
