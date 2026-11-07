package com.ims.entity;



import com.ims.enums.notification.NotificationPriority;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(
        name = "notifications",
        indexes = {
                @Index(
                        name = "idx_notification_recipient_created",
                        columnList = "recipient_id, created_at"
                ),
                @Index(
                        name = "idx_notification_recipient_read",
                        columnList = "recipient_id, is_read"
                ),
                @Index(
                        name = "idx_notification_reference",
                        columnList = "module, reference_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class NotificationEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // User receiving the notification
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private UserEntity recipient;

    // User who generated the notification; null for system events
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id")
    private UserEntity sender;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 1000)
    private String message;

    // INVOICE, PAYMENT, SALES_ORDER, PURCHASE_ORDER, etc.
    @Column(nullable = false, length = 50)
    private String module;

    // INVOICE_CREATED, APPROVAL_REQUESTED, PAYMENT_RECEIVED, etc.
    @Column(nullable = false, length = 80)
    private String notificationType;

    private Long referenceId;

    @Column(length = 100)
    private String referenceNumber;

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private NotificationPriority priority =
            NotificationPriority.NORMAL;

    @Column(length = 500)
    private String actionUrl;

    @PrePersist
    protected void onCreate() {
        super.prePersist();

        if (isRead == null) {
            isRead = false;
        }

        if (priority == null) {
            priority = NotificationPriority.NORMAL;
        }
    }
}