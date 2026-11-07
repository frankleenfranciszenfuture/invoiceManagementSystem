package com.ims.entity;


import com.ims.enums.InvoiceApprovalStatus;

import jakarta.persistence.*;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "invoice_approvals",
        indexes = {
                @Index(
                        name = "idx_invoice_approval_invoice",
                        columnList = "invoice_id"
                ),
                @Index(
                        name = "idx_invoice_approval_status",
                        columnList = "approval_status"
                ),
                @Index(
                        name = "idx_invoice_approval_submitted_by",
                        columnList = "submitted_by"
                )
        }
)
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceApprovalEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private InvoiceEntity invoice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submitted_by", nullable = false)
    private UserEntity submittedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "decided_by")
    private UserEntity decidedBy;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "approval_status",
            nullable = false,
            length = 20
    )
    private InvoiceApprovalStatus status;

    @Column(length = 1000)
    private String submissionComment;

    @Column(length = 1000)
    private String decisionComment;

    @Column(nullable = false)
    private LocalDateTime submittedAt;

    private LocalDateTime decidedAt;

    @PrePersist
    protected void onCreate() {
        super.prePersist();

        if (status == null) {
            status = InvoiceApprovalStatus.PENDING;
        }

        if (submittedAt == null) {
            submittedAt = LocalDateTime.now();
        }
    }
}