package com.ims.controller.notification;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.notification.NotificationResponse;
import com.ims.service.serviceInterface.notification.NotificationService;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // =========================================================
    // GET MY NOTIFICATIONS
    // GET /notifications?page=0&size=20
    // =========================================================

    @GetMapping
    public ApiResponse<PageResponse<NotificationResponse>> getMyNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {

        return ApiResponse.success(
                notificationService.getMyNotifications(page, size),
                "Notifications fetched successfully"
        );
    }

    // =========================================================
    // GET UNREAD COUNT
    // GET /notifications/unread-count
    // =========================================================

    @GetMapping("/unread-count")
    public ApiResponse<Long> getUnreadCount() {

        return ApiResponse.success(
                notificationService.getUnreadCount(),
                "Unread notification count fetched successfully"
        );
    }

    // =========================================================
    // MARK ONE AS READ
    // PATCH /notifications/{id}/read
    // =========================================================

    @PatchMapping("/{id}/read")
    public ApiResponse<Void> markAsRead(
            @PathVariable Long id
    ) {

        notificationService.markAsRead(id);

        return ApiResponse.success(
                null,
                "Notification marked as read"
        );
    }

    // =========================================================
    // MARK ALL AS READ
    // PATCH /notifications/read-all
    // =========================================================

    @PatchMapping("/read-all")
    public ApiResponse<Void> markAllAsRead() {

        notificationService.markAllAsRead();

        return ApiResponse.success(
                null,
                "All notifications marked as read"
        );
    }

    // =========================================================
    // DELETE NOTIFICATION
    // DELETE /notifications/{id}
    // =========================================================

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteNotification(
            @PathVariable Long id
    ) {

        notificationService.deleteNotification(id);

        return ApiResponse.success(
                null,
                "Notification deleted successfully"
        );
    }
}
