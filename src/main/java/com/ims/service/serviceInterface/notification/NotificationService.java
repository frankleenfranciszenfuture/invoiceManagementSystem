package com.ims.service.serviceInterface.notification;


import com.ims.dtos.notification.NotificationResponse;
import com.ims.entity.UserEntity;
import com.ims.common.PageResponse;
import com.ims.enums.notification.NotificationPriority;

public interface NotificationService {

    PageResponse<NotificationResponse> getMyNotifications(
            int page,
            int size
    );

    long getUnreadCount();

    void markAsRead(Long notificationId);

    void markAllAsRead();

    void deleteNotification(Long notificationId);

    NotificationResponse createNotification(
            UserEntity recipient,
            UserEntity sender,
            String title,
            String message,
            String module,
            String notificationType,
            Long referenceId,
            String referenceNumber,
            NotificationPriority priority,
            String actionUrl
    );
}