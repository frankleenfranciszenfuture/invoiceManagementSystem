package com.ims.service.impl.notification;


import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.common.notification.NotificationEvent;
import com.ims.common.notification.NotificationRecipientResolver;
import com.ims.common.notification.NotificationSnapshot;

import com.ims.dtos.notification.NotificationResponse;

import com.ims.entity.NotificationEntity;
import com.ims.entity.NotificationRecipientEntity;
import com.ims.entity.UserEntity;

import com.ims.enums.notification.NotificationPriority;

import com.ims.mapper.notification.NotificationMapper;

import com.ims.repository.UserRepository;
import com.ims.repository.notification.NotificationRecipientRepository;
import com.ims.repository.notification.NotificationRepository;


import com.ims.service.serviceInterface.common.CurrentSessionService;
import com.ims.service.serviceInterface.notification.NotificationService;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    private final NotificationRecipientRepository recipientRepository;

    private final UserRepository userRepository;

    private final CurrentSessionService currentSessionService;

    private final NotificationRecipientResolver recipientResolver;

    private final NotificationMapper notificationMapper;

    private final com.ims.common.notification.NotificationPublisher notificationPublisher;


    // =========================================================
    // CURRENT USER
    // =========================================================

    private Long getCurrentUserId() {

        if (!currentSessionService.isUser()) {
            throw new IllegalStateException(
                    "Only authenticated users can access notifications."
            );
        }

        Long userId = currentSessionService.getUserId();

        if (userId == null || userId <= 0) {
            throw new IllegalStateException(
                    "Authenticated user could not be identified."
            );
        }

        return userId;
    }



    // =========================================================
    // CREATE NOTIFICATION
    // =========================================================

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public ApiResponse<NotificationResponse> createNotification(
            NotificationSnapshot snapshot,
            Long senderUserId
    ) {
        return createNotificationInternal(snapshot, senderUserId);
    }

    @Override
    public ApiResponse<NotificationResponse> createNotification(
            NotificationSnapshot snapshot
    ) {
        Long senderId = getCurrentUserId();

        return createNotificationInternal(snapshot, senderId);
    }

    private ApiResponse<NotificationResponse> createNotificationInternal(
            NotificationSnapshot snapshot,
            Long senderId
    ) {

        if (snapshot == null) {
            throw new IllegalArgumentException(
                    "Notification details are required."
            );
        }

        if (senderId == null || senderId <= 0) {
            throw new IllegalArgumentException(
                    "Notification sender is required."
            );
        }

        // Validate sender
        UserEntity sender = userRepository.findById(senderId)
                .filter(user -> Boolean.TRUE.equals(user.getActive()))
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Notification sender is inactive or unavailable."
                        )
                );

        // Resolve recipients
        Set<Long> recipientIds =
                recipientResolver.resolveRecipients(snapshot);

        if (recipientIds == null || recipientIds.isEmpty()) {
            throw new IllegalStateException(
                    "No notification recipients were found."
            );
        }

        // Validate active recipients
        List<UserEntity> activeUsers =
                userRepository.findAllById(recipientIds)
                        .stream()
                        .filter(user ->
                                Boolean.TRUE.equals(user.getActive())
                        )
                        .toList();

        Set<Long> activeRecipientIds = new LinkedHashSet<>();

        for (UserEntity user : activeUsers) {
            activeRecipientIds.add(user.getId());
        }

        if (activeRecipientIds.isEmpty()) {
            throw new IllegalStateException(
                    "No active notification recipients were found."
            );
        }

        if (!activeRecipientIds.containsAll(recipientIds)) {
            throw new IllegalArgumentException(
                    "One or more notification recipients do not exist or are inactive."
            );
        }

        // Create shared notification
        NotificationEntity notification =
                NotificationEntity.builder()
                        .title(snapshot.getTitle())
                        .message(snapshot.getMessage())
                        .module(snapshot.getModuleName().name())
                        .moduleName(snapshot.getModuleName())
                        .action(snapshot.getAction())
                        .notificationType(snapshot.getNotificationType())
                        .priority(
                                snapshot.getPriority() == null
                                        ? NotificationPriority.NORMAL
                                        : snapshot.getPriority()
                        )
                        .actionUrl(snapshot.getActionUrl())
                        .recipientId(null)
                        .senderId(senderId)
                        .read(false)
                        .referenceId(
                                parseReferenceId(snapshot.getEntityId())
                        )
                        .referenceNumber(null)
                        .entityName(snapshot.getEntityName())
                        .entityId(snapshot.getEntityId())
                        .createdByName(sender.getName())
                        .active(true)
                        .recipients(new ArrayList<>())
                        .build();

        NotificationEntity savedNotification =
                notificationRepository.save(notification);

        // Create individual recipient records
        List<NotificationRecipientEntity> recipientEntities =
                new ArrayList<>();

        for (Long userId : activeRecipientIds) {

            NotificationRecipientEntity recipient =
                    NotificationRecipientEntity.builder()
                            .notification(savedNotification)
                            .userId(userId)
                            .read(false)
                            .archived(false)
                            .build();

            recipientEntities.add(recipient);
        }

        List<NotificationRecipientEntity> savedRecipients =
                recipientRepository.saveAll(recipientEntities);

        // Publish WebSocket events
        NotificationResponse senderResponse = null;

        for (NotificationRecipientEntity recipient : savedRecipients) {

            NotificationResponse response =
                    notificationMapper.toResponse(recipient);

            if (senderId.equals(recipient.getUserId())) {
                senderResponse = response;
            }

            NotificationEvent event = NotificationEvent.builder()
                    .eventType("NEW_NOTIFICATION")
                    .userId(recipient.getUserId())
                    .notification(response)
                    .unreadCount(
                            recipientRepository
                                    .countByUserIdAndReadFalseAndArchivedFalse(
                                            recipient.getUserId()
                                    )
                    )
                    .build();

            notificationPublisher.publishToUser(
                    recipient.getUserId(),
                    event
            );
        }

        // Build fallback response when sender is not a recipient
        if (senderResponse == null) {

            senderResponse = NotificationResponse.builder()
                    .notificationId(savedNotification.getId())
                    .title(savedNotification.getTitle())
                    .message(savedNotification.getMessage())
                    .module(savedNotification.getModule())
                    .moduleName(savedNotification.getModuleName())
                    .action(savedNotification.getAction())
                    .notificationType(savedNotification.getNotificationType())
                    .priority(savedNotification.getPriority())
                    .actionUrl(savedNotification.getActionUrl())
                    .referenceId(savedNotification.getReferenceId())
                    .referenceNumber(savedNotification.getReferenceNumber())
                    .entityName(savedNotification.getEntityName())
                    .entityId(savedNotification.getEntityId())
                    .senderId(savedNotification.getSenderId())
                    .createdByName(savedNotification.getCreatedByName())
                    .read(false)
                    .archived(false)
                    .build();
        }

        return ApiResponse.success(
                senderResponse,
                "Notification created successfully."
        );
    }



    // =========================================================
    // INBOX
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PageResponse<NotificationResponse>> getInbox(
            Pageable pageable
    ) {

        Long userId = getCurrentUserId();

        Page<NotificationRecipientEntity> page =
                recipientRepository.findInboxByUserId(
                        userId,
                        pageable
                );

        List<NotificationResponse> content =
                page.getContent()
                        .stream()
                        .map(notificationMapper::toResponse)
                        .toList();

        PageResponse<NotificationResponse> response =
                PageResponse.<NotificationResponse>builder()
                        .content(content)
                        .pageNumber(page.getNumber())
                        .pageSize(page.getSize())
                        .totalElements(page.getTotalElements())
                        .totalPages(page.getTotalPages())
                        .last(page.isLast())
                        .build();

        return ApiResponse.success(
                response,
                "Notifications fetched successfully."
        );
    }


    // =========================================================
    // ARCHIVED NOTIFICATIONS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PageResponse<NotificationResponse>>
    getArchivedNotifications(Pageable pageable) {

        Long userId = getCurrentUserId();

        Page<NotificationRecipientEntity> page =
                recipientRepository.findArchivedByUserId(
                        userId,
                        pageable
                );

        List<NotificationResponse> content =
                page.getContent()
                        .stream()
                        .map(notificationMapper::toResponse)
                        .toList();

        PageResponse<NotificationResponse> response =
                PageResponse.<NotificationResponse>builder()
                        .content(content)
                        .pageNumber(page.getNumber())
                        .pageSize(page.getSize())
                        .totalElements(page.getTotalElements())
                        .totalPages(page.getTotalPages())
                        .last(page.isLast())
                        .build();

        return ApiResponse.success(
                response,
                "Archived notifications fetched successfully."
        );
    }


    // =========================================================
    // UNREAD COUNT
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<Long> getUnreadCount() {

        Long userId = getCurrentUserId();

        long count =
                recipientRepository
                        .countByUserIdAndReadFalseAndArchivedFalse(userId);

        return ApiResponse.success(
                count,
                "Unread notification count fetched successfully."
        );
    }


    // =========================================================
    // MARK ONE AS READ
    // =========================================================

    @Override
    public ApiResponse<Void> markAsRead(Long recipientId) {

        Long userId = getCurrentUserId();

        int updated =
                recipientRepository.markAsRead(
                        recipientId,
                        userId
                );

        if (updated == 0) {
            throw new IllegalArgumentException(
                    "Notification not found, already read, or archived."
            );
        }

        publishStatusEvent(
                userId,
                "NOTIFICATION_READ"
        );

        return ApiResponse.success(
                null,
                "Notification marked as read."
        );
    }


    // =========================================================
    // MARK ALL AS READ
    // =========================================================

    @Override
    public ApiResponse<Void> markAllAsRead() {

        Long userId = getCurrentUserId();

        recipientRepository.markAllAsRead(userId);

        publishStatusEvent(
                userId,
                "ALL_NOTIFICATIONS_READ"
        );

        return ApiResponse.success(
                null,
                "All notifications marked as read."
        );
    }


    // =========================================================
    // ARCHIVE
    // =========================================================

    @Override
    public ApiResponse<Void> archiveNotification(Long recipientId) {

        Long userId = getCurrentUserId();

        int updated =
                recipientRepository.archiveNotification(
                        recipientId,
                        userId
                );

        if (updated == 0) {
            throw new IllegalArgumentException(
                    "Notification not found or already archived."
            );
        }

        publishStatusEvent(
                userId,
                "NOTIFICATION_ARCHIVED"
        );

        return ApiResponse.success(
                null,
                "Notification archived successfully."
        );
    }


    // =========================================================
    // RESTORE
    // =========================================================

    @Override
    public ApiResponse<Void> restoreNotification(Long recipientId) {

        Long userId = getCurrentUserId();

        int updated =
                recipientRepository.restoreNotification(
                        recipientId,
                        userId
                );

        if (updated == 0) {
            throw new IllegalArgumentException(
                    "Archived notification not found."
            );
        }

        publishStatusEvent(
                userId,
                "NOTIFICATION_RESTORED"
        );

        return ApiResponse.success(
                null,
                "Notification restored successfully."
        );
    }


    // =========================================================
    // DELETE
    // =========================================================

    @Override
    public ApiResponse<Void> deleteNotification(Long recipientId) {

        Long userId = getCurrentUserId();

        int deleted =
                recipientRepository.deleteRecipientNotification(
                        recipientId,
                        userId
                );

        if (deleted == 0) {
            throw new IllegalArgumentException(
                    "Notification not found."
            );
        }

        publishStatusEvent(
                userId,
                "NOTIFICATION_DELETED"
        );

        return ApiResponse.success(
                null,
                "Notification deleted successfully."
        );
    }


    // =========================================================
    // STATUS EVENT
    // =========================================================

    private void publishStatusEvent(
            Long userId,
            String eventType
    ) {

        long unreadCount =
                recipientRepository
                        .countByUserIdAndReadFalseAndArchivedFalse(userId);

        NotificationEvent event =
                NotificationEvent.builder()
                        .eventType(eventType)
                        .userId(userId)
                        .unreadCount(unreadCount)
                        .build();

        notificationPublisher.publishToUser(
                userId,
                event
        );
    }


    // =========================================================
    // REFERENCE ID
    // =========================================================

    private Long parseReferenceId(String entityId) {

        if (entityId == null || entityId.isBlank()) {
            return null;
        }

        try {
            return Long.valueOf(entityId);
        } catch (NumberFormatException exception) {
            return null;
        }
    }
}