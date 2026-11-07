package com.ims.service.serviceInterface.permission.invoiceApproval;



import com.ims.common.PageResponse;
import com.ims.dtos.invoiceApproval.InvoiceApprovalDecisionRequest;
import com.ims.dtos.invoiceApproval.InvoiceApprovalResponse;

import java.util.List;

public interface InvoiceApprovalService {

    InvoiceApprovalResponse submitForApproval(
            Long invoiceId,
            InvoiceApprovalDecisionRequest request
    );

    PageResponse<InvoiceApprovalResponse> getPendingApprovals(
            int page,
            int size
    );

    InvoiceApprovalResponse getApprovalById(Long approvalId);

    InvoiceApprovalResponse approve(
            Long approvalId,
            InvoiceApprovalDecisionRequest request
    );

    InvoiceApprovalResponse reject(
            Long approvalId,
            InvoiceApprovalDecisionRequest request
    );

    InvoiceApprovalResponse cancel(Long approvalId);

    List<InvoiceApprovalResponse> getInvoiceApprovalHistory(
            Long invoiceId
    );
}
