package com.ims.mapper.notification;

import com.ims.dtos.notification.NotificationResponse;
import com.ims.entity.NotificationRecipientEntity;


import com.ims.mapper.audit.AuditMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(
        componentModel = "spring",
        uses = {
                AuditMapper.class
        }
)
public interface NotificationMapper {

    @Mapping(target = "notificationId", source = "notification.id")
    @Mapping(target = "recipientId", source = "id")

    @Mapping(target = "title", source = "notification.title")
    @Mapping(target = "message", source = "notification.message")

    @Mapping(target = "module", source = "notification.module")
    @Mapping(target = "moduleName", source = "notification.moduleName")
    @Mapping(target = "action", source = "notification.action")

    @Mapping(target = "notificationType", source = "notification.notificationType")
    @Mapping(target = "priority", source = "notification.priority")

    @Mapping(target = "actionUrl", source = "notification.actionUrl")

    @Mapping(target = "referenceId", source = "notification.referenceId")
    @Mapping(target = "referenceNumber", source = "notification.referenceNumber")

    @Mapping(target = "entityName", source = "notification.entityName")
    @Mapping(target = "entityId", source = "notification.entityId")

    @Mapping(target = "senderId", source = "notification.senderId")
    @Mapping(target = "createdByName", source = "notification.createdByName")

    @Mapping(target = "read", source = "read")
    @Mapping(target = "readAt", source = "readAt")
    @Mapping(target = "archived", source = "archived")
    @Mapping(target = "archivedAt", source = "archivedAt")

    @Mapping(target = "receivedAt", source = "createdAt")

    // Map NotificationEntity audit fields into BaseResponse.audit
    @Mapping(target = "audit", source = "notification")
    NotificationResponse toResponse(NotificationRecipientEntity recipient);
}