package com.ims.dtos.audit.enityAuditSnapShot;


import com.ims.enums.InvoiceApprovalStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceApprovalAuditSnapshot {

    private Long id;

    private Long invoiceId;
    private String invoiceNumber;

    private Long submittedById;
    private String submittedByName;

    private Long decidedById;
    private String decidedByName;

    private InvoiceApprovalStatus status;

    private String submissionComment;
    private String decisionComment;

    private LocalDateTime submittedAt;
    private LocalDateTime decidedAt;
}
