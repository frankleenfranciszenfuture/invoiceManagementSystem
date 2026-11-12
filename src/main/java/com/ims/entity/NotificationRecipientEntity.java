package com.ims.entity;

import jakarta.persistence.*;

import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "notification_recipients",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_notification_recipient",
                        columnNames = {
                                "notification_id",
                                "user_id"
                        }
                )
        },
        indexes = {
                @Index(
                        name = "idx_notification_recipient_user",
                        columnList = "user_id"
                ),
                @Index(
                        name = "idx_notification_recipient_read",
                        columnList = "user_id, is_read"
                ),
                @Index(
                        name = "idx_notification_recipient_archive",
                        columnList = "user_id, is_archived"
                )
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRecipientEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "notification_id",
            nullable = false
    )
    private NotificationEntity notification;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Builder.Default
    @Column(name = "is_read", nullable = false)
    private Boolean read = false;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Builder.Default
    @Column(name = "is_archived", nullable = false)
    private Boolean archived = false;

    @Column(name = "archived_at")
    private LocalDateTime archivedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void prePersist() {

        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }

        if (read == null) {
            read = false;
        }

        if (archived == null) {
            archived = false;
        }
    }
}