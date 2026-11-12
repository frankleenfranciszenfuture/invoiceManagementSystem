package com.ims.entity;

import com.ims.enums.notification.NotificationAction;
import com.ims.enums.notification.NotificationModule;
import com.ims.enums.notification.NotificationPriority;
import com.ims.enums.notification.NotificationType;

import jakarta.persistence.*;

import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 1000)
    private String message;

    /*
     * Legacy module column.
     * Retained to preserve compatibility with existing records.
     */
    @Column(name = "module", length = 50)
    private String module;

    /*
     * Structured notification module.
     * Must match the existing MySQL enum.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "module_name", nullable = false, length = 50)
    private NotificationModule moduleName;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "notification_action",
            nullable = false,
            length = 40
    )
    private NotificationAction action;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "notification_type",
            nullable = false,
            length = 80
    )
    private NotificationType notificationType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private NotificationPriority priority;

    @Column(name = "action_url", length = 500)
    private String actionUrl;

    /*
     * Legacy single-recipient field.
     * Nullable to support shared notification events.
     */
    @Column(name = "recipient_id")
    private Long recipientId;

    /*
     * Notification sender.
     */
    @Column(name = "sender_id")
    private Long senderId;

    /*
     * Legacy read field.
     * New individual read state is maintained in
     * notification_recipients.
     */
    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private Boolean read = false;

    @Column(name = "reference_id")
    private Long referenceId;

    @Column(name = "reference_number", length = 100)
    private String referenceNumber;

    @Column(name = "entity_name", length = 100)
    private String entityName;

    @Column(name = "entity_id", length = 100)
    private String entityId;

    @Column(name = "created_by_name", length = 150)
    private String createdByName;

    @OneToMany(
            mappedBy = "notification",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @Builder.Default
    private List<NotificationRecipientEntity> recipients =
            new ArrayList<>();

    @PrePersist
    protected void prePersistNotification() {

        if (read == null) {
            read = false;
        }

        if (priority == null) {
            priority = NotificationPriority.NORMAL;
        }

    }

    public void addRecipient(NotificationRecipientEntity recipient) {

        if (recipient == null) {
            return;
        }

        recipients.add(recipient);
        recipient.setNotification(this);
    }
}