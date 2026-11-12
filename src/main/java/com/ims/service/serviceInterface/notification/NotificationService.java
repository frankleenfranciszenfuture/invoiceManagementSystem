package com.ims.service.serviceInterface.notification;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.common.notification.NotificationSnapshot;
import com.ims.dtos.notification.NotificationResponse;

import org.springframework.data.domain.Pageable;

public interface NotificationService {

    ApiResponse<NotificationResponse> createNotification(
            NotificationSnapshot snapshot
    );

    ApiResponse<NotificationResponse> createNotification(
            NotificationSnapshot snapshot,
            Long senderUserId
    );

    ApiResponse<PageResponse<NotificationResponse>> getInbox(
            Pageable pageable
    );

    ApiResponse<PageResponse<NotificationResponse>> getArchivedNotifications(
            Pageable pageable
    );

    ApiResponse<Long> getUnreadCount();

    ApiResponse<Void> markAsRead(Long recipientId);

    ApiResponse<Void> markAllAsRead();

    ApiResponse<Void> archiveNotification(Long recipientId);

    ApiResponse<Void> restoreNotification(Long recipientId);

    ApiResponse<Void> deleteNotification(Long recipientId);


}