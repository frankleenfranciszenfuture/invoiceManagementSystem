package com.ims.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "email_signatures",
        indexes = {
                @Index(
                        name = "idx_email_signature_user",
                        columnList = "user_id"
                )
        }
)
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class EmailSignatureEntity extends BaseEntity{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "signature_name", nullable = false, length = 150)
    private String signatureName;

    @Lob
    @Column(name = "signature_content", nullable = false)
    private String signatureContent;

    @Column(name = "default_for_new_messages", nullable = false)
    @Builder.Default
    private boolean defaultForNewMessages = false;

    @Column(name = "default_for_replies", nullable = false)
    @Builder.Default
    private boolean defaultForReplies = false;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "ACTIVE";

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}