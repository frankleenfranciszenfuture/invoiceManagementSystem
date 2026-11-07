package com.ims.dtos.notification;

import com.ims.dtos.common.BaseResponse;


import com.ims.enums.notification.NotificationPriority;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse extends BaseResponse {

    private Long id;

    private String title;
    private String message;

    private String module;
    private String notificationType;

    private Long referenceId;
    private String referenceNumber;

    private Boolean isRead;

    private NotificationPriority priority;

    private String actionUrl;

    private String senderName;
}