package com.ims.mapper.audit.enitySnapMapper;


import com.ims.common.audit.AuditSnapshotMapper;
import com.ims.dtos.audit.enityAuditSnapShot.InvoiceApprovalAuditSnapshot;
import com.ims.entity.InvoiceApprovalEntity;
import org.springframework.stereotype.Component;

@Component
public class InvoiceApprovalAuditSnapshotMapper implements AuditSnapshotMapper {

    @Override
    public boolean supports(String entityName) {
        return "INVOICE_APPROVAL".equalsIgnoreCase(entityName);
    }

    @Override
    public Object toSnapshot(Object entity) {

        if (!(entity instanceof InvoiceApprovalEntity approval)) {
            return null;
        }

        return InvoiceApprovalAuditSnapshot.builder()

                .id(approval.getId())

                // Invoice
                .invoiceId(
                        approval.getInvoice() != null
                                ? approval.getInvoice().getId()
                                : null
                )
                .invoiceNumber(
                        approval.getInvoice() != null
                                ? approval.getInvoice().getInvoiceNumber()
                                : null
                )

                // Submitted By
                .submittedById(
                        approval.getSubmittedBy() != null
                                ? approval.getSubmittedBy().getId()
                                : null
                )
                .submittedByName(
                        approval.getSubmittedBy() != null
                                ? approval.getSubmittedBy().getName()
                                : null
                )

                // Decided By
                .decidedById(
                        approval.getDecidedBy() != null
                                ? approval.getDecidedBy().getId()
                                : null
                )
                .decidedByName(
                        approval.getDecidedBy() != null
                                ? approval.getDecidedBy().getName()
                                : null
                )

                // Approval Status
                .status(approval.getStatus())

                // Comments
                .submissionComment(approval.getSubmissionComment())
                .decisionComment(approval.getDecisionComment())

                // Dates
                .submittedAt(approval.getSubmittedAt())
                .decidedAt(approval.getDecidedAt())

                .build();
    }
}

