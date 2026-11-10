package com.ims.entity;

import com.ims.enums.audit.AuditAction;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "audit_logs",
        indexes = {
                @Index(
                        name = "idx_audit_entity",
                        columnList = "entityName, entityId"
                ),
                @Index(
                        name = "idx_audit_action",
                        columnList = "action"
                ),
                @Index(
                        name = "idx_audit_user",
                        columnList = "performedBy"
                ),
                @Index(
                        name = "idx_audit_created",
                        columnList = "createdAt"
                )
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String entityName;

    @Column(length = 100)
    private String entityId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AuditAction action;

    @Column(length = 1000)
    private String description;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String oldValue;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String newValue;

    private Long performedBy;

    @Column(length = 150)
    private String performedByName;

    @Column(length = 30)
    private String performedByType;

    @Column(length = 100)
    private String ipAddress;

    @Column(length = 100)
    private String moduleName;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
