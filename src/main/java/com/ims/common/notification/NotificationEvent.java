package com.ims.common.notification;


import com.ims.dtos.notification.NotificationResponse;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEvent {

    private String eventType;

    private Long userId;

    private NotificationResponse notification;

    private Long unreadCount;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
