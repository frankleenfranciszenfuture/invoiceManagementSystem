package com.ims.common.notification;


import com.ims.enums.notification.NotificationRecipientType;

public record NotificationRecipientIdentity(
        NotificationRecipientType recipientType,
        Long recipientId
) {}
