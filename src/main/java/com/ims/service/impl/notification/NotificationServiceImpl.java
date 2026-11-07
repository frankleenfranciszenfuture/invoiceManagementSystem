package com.ims.service.impl.notification;

import com.ims.common.PageResponse;
import com.ims.dtos.notification.NotificationResponse;
import com.ims.entity.NotificationEntity;
import com.ims.entity.UserEntity;

import com.ims.enums.notification.NotificationPriority;
import com.ims.repository.notification.NotificationRepository;
import com.ims.service.impl.common.CurrentUserService;
import com.ims.service.serviceInterface.notification.NotificationService;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    private final CurrentUserService currentUserService;

    // =========================================================
    // GET MY NOTIFICATIONS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> getMyNotifications(
            int page,
            int size
    ) {

        if (page < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Page number cannot be negative"
            );
        }

        if (size < 1 || size > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Page size must be between 1 and 100"
            );
        }

        UserEntity currentUser = currentUserService.getCurrentUser();

        Page<NotificationEntity> notificationPage =
                notificationRepository
                        .findByRecipient_IdAndActiveTrueOrderByCreatedAtDesc(
                                currentUser.getId(),
                                PageRequest.of(
                                        page,
                                        size,
                                        Sort.by(Sort.Direction.DESC, "createdAt")
                                )
                        );

        return PageResponse.<NotificationResponse>builder()
                .content(
                        notificationPage.getContent()
                                .stream()
                                .map(this::mapToResponse)
                                .toList()
                )
                .pageNumber(notificationPage.getNumber())
                .pageSize(notificationPage.getSize())
                .totalElements(notificationPage.getTotalElements())
                .totalPages(notificationPage.getTotalPages())
                .last(notificationPage.isLast())
                .build();
    }

    // =========================================================
    // UNREAD COUNT
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount() {

        UserEntity currentUser = currentUserService.getCurrentUser();

        return notificationRepository
                .countByRecipient_IdAndActiveTrueAndIsReadFalse(
                        currentUser.getId()
                );
    }

    // =========================================================
    // MARK ONE AS READ
    // =========================================================

    @Override
    public void markAsRead(Long notificationId) {

        UserEntity currentUser = currentUserService.getCurrentUser();

        int updated = notificationRepository.markAsRead(
                notificationId,
                currentUser.getId()
        );

        if (updated == 0) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Notification not found"
            );
        }
    }

    // =========================================================
    // MARK ALL AS READ
    // =========================================================

    @Override
    public void markAllAsRead() {

        UserEntity currentUser = currentUserService.getCurrentUser();

        notificationRepository.markAllAsRead(currentUser.getId());
    }

    // =========================================================
    // SOFT DELETE
    // =========================================================

    @Override
    public void deleteNotification(Long notificationId) {

        UserEntity currentUser = currentUserService.getCurrentUser();

        NotificationEntity notification =
                notificationRepository
                        .findByIdAndRecipient_IdAndActiveTrue(
                                notificationId,
                                currentUser.getId()
                        )
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Notification not found"
                        ));

        notification.setActive(false);

        notificationRepository.save(notification);
    }

    // =========================================================
    // CREATE NOTIFICATION
    // Internal reusable method for other modules
    // =========================================================

    @Override
    public NotificationResponse createNotification(
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
    ) {

        if (recipient == null || recipient.getId() == null) {
            throw new IllegalArgumentException(
                    "Notification recipient is required"
            );
        }

        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException(
                    "Notification title is required"
            );
        }

        if (message == null || message.isBlank()) {
            throw new IllegalArgumentException(
                    "Notification message is required"
            );
        }

        if (module == null || module.isBlank()) {
            throw new IllegalArgumentException(
                    "Notification module is required"
            );
        }

        NotificationEntity notification = NotificationEntity.builder()
                .recipient(recipient)
                .sender(sender)
                .title(title.trim())
                .message(message.trim())
                .module(module.trim())
                .notificationType(
                        notificationType == null || notificationType.isBlank()
                                ? "GENERAL"
                                : notificationType.trim()
                )
                .referenceId(referenceId)
                .referenceNumber(referenceNumber)
                .isRead(false)
                .priority(
                        priority == null
                                ? NotificationPriority.NORMAL
                                : priority
                )
                .actionUrl(actionUrl)
                .active(true)
                .build();

        NotificationEntity saved =
                notificationRepository.save(notification);

        return mapToResponse(saved);
    }

    // =========================================================
    // ENTITY TO RESPONSE
    // =========================================================

    private NotificationResponse mapToResponse(NotificationEntity entity) {

        return NotificationResponse.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .message(entity.getMessage())
                .module(entity.getModule())
                .notificationType(entity.getNotificationType())
                .referenceId(entity.getReferenceId())
                .referenceNumber(entity.getReferenceNumber())
                .isRead(entity.getIsRead())
                .priority(entity.getPriority())
                .actionUrl(entity.getActionUrl())
                .senderName(
                        entity.getSender() != null
                                ? entity.getSender().getName()
                                : null
                )
                .audit(
                        com.ims.dtos.common.AuditResponse.builder()
                                .createdAt(entity.getCreatedAt())
                                .updatedAt(entity.getUpdatedAt())
                                .createdBy(entity.getCreatedBy())
                                .updatedBy(entity.getUpdatedBy())
                                .active(entity.getActive())
                                .build()
                )
                .build();
    }
}
