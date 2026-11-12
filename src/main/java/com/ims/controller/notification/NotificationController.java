package com.ims.controller.notification;


import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.notification.NotificationResponse;
import com.ims.service.serviceInterface.notification.NotificationService;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.domain.Sort;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;


    // =========================================================
    // INBOX
    // GET /notifications
    // =========================================================

    @GetMapping
    public ApiResponse<PageResponse<NotificationResponse>> getInbox(
            @PageableDefault(
                    size = 10,
                    sort = "createdAt",
                    direction = Sort.Direction.DESC
            )
            Pageable pageable
    ) {

        return notificationService.getInbox(pageable);
    }


    // =========================================================
    // ARCHIVED
    // GET /notifications/archived
    // =========================================================

    @GetMapping("/archived")
    public ApiResponse<PageResponse<NotificationResponse>>
    getArchivedNotifications(
            @PageableDefault(size = 10)
            Pageable pageable
    ) {

        return notificationService.getArchivedNotifications(pageable);
    }


    // =========================================================
    // UNREAD COUNT
    // GET /notifications/unread-count
    // =========================================================

    @GetMapping("/unread-count")
    public ApiResponse<Long> getUnreadCount() {

        return notificationService.getUnreadCount();
    }


    // =========================================================
    // MARK AS READ
    // PATCH /notifications/{recipientId}/read
    // =========================================================

    @PatchMapping("/{recipientId}/read")
    public ApiResponse<Void> markAsRead(
            @PathVariable Long recipientId
    ) {

        return notificationService.markAsRead(recipientId);
    }


    // =========================================================
    // MARK ALL AS READ
    // PATCH /notifications/read-all
    // =========================================================

    @PatchMapping("/read-all")
    public ApiResponse<Void> markAllAsRead() {

        return notificationService.markAllAsRead();
    }


    // =========================================================
    // ARCHIVE
    // PATCH /notifications/{recipientId}/archive
    // =========================================================

    @PatchMapping("/{recipientId}/archive")
    public ApiResponse<Void> archiveNotification(
            @PathVariable Long recipientId
    ) {

        return notificationService.archiveNotification(recipientId);
    }


    // =========================================================
    // RESTORE
    // PATCH /notifications/{recipientId}/restore
    // =========================================================

    @PatchMapping("/{recipientId}/restore")
    public ApiResponse<Void> restoreNotification(
            @PathVariable Long recipientId
    ) {

        return notificationService.restoreNotification(recipientId);
    }


    // =========================================================
    // DELETE
    // DELETE /notifications/{recipientId}
    // =========================================================

    @DeleteMapping("/{recipientId}")
    public ApiResponse<Void> deleteNotification(
            @PathVariable Long recipientId
    ) {

        return notificationService.deleteNotification(recipientId);
    }
}