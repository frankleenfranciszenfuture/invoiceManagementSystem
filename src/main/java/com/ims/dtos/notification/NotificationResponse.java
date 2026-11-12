package com.ims.dtos.notification;

import com.ims.dtos.common.BaseResponse;
import com.ims.enums.notification.NotificationAction;
import com.ims.enums.notification.NotificationModule;
import com.ims.enums.notification.NotificationPriority;
import com.ims.enums.notification.NotificationType;

import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse extends BaseResponse {

    private Long notificationId;

    /*
     * ID of the notification_recipients row.
     * Used by read/archive/restore/delete APIs.
     */
    private Long recipientId;

    private String title;

    private String message;

    private String module;

    private NotificationModule moduleName;

    private NotificationAction action;

    private NotificationType notificationType;

    private NotificationPriority priority;

    private String actionUrl;

    private Long referenceId;

    private String referenceNumber;

    private String entityName;

    private String entityId;

    private Long senderId;

    private String createdByName;

    private Boolean read;

    private LocalDateTime readAt;

    private Boolean archived;

    private LocalDateTime archivedAt;

    private LocalDateTime receivedAt;
}