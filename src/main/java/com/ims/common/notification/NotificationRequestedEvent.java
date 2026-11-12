package com.ims.common.notification;


import lombok.Getter;

@Getter
public class NotificationRequestedEvent {

    private final NotificationSnapshot snapshot;
    private final Long senderUserId;

    public NotificationRequestedEvent(
            NotificationSnapshot snapshot,
            Long senderUserId
    ) {
        this.snapshot = snapshot;
        this.senderUserId = senderUserId;
    }
}
