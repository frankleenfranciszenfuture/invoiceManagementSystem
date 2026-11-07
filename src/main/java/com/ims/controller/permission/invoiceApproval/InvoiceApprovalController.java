package com.ims.controller.permission.invoiceApproval;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.invoiceApproval.InvoiceApprovalDecisionRequest;
import com.ims.dtos.invoiceApproval.InvoiceApprovalResponse;
import com.ims.service.serviceInterface.permission.invoiceApproval.InvoiceApprovalService;
import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/invoice-approvals")
@RequiredArgsConstructor
public class InvoiceApprovalController {

    private final InvoiceApprovalService approvalService;

    // =========================================================
    // SUBMIT INVOICE
    // POST /invoice-approvals/{invoiceId}/send
    // =========================================================

    @PostMapping("/{invoiceId}/send")
    public ApiResponse<InvoiceApprovalResponse> submitForApproval(
            @PathVariable Long invoiceId,
            @Valid @RequestBody(required = false)
            InvoiceApprovalDecisionRequest request
    ) {

        return ApiResponse.success(
                approvalService.submitForApproval(invoiceId, request),
                "Invoice submitted for approval successfully"
        );
    }

    // =========================================================
    // GET PENDING APPROVALS
    // GET /invoice-approvals/pending?page=0&size=20
    // =========================================================

    @GetMapping("/pending")
    public ApiResponse<PageResponse<InvoiceApprovalResponse>> getPending(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {

        return ApiResponse.success(
                approvalService.getPendingApprovals(page, size),
                "Pending invoice approvals fetched successfully"
        );
    }

    // =========================================================
    // GET APPROVAL BY ID
    // GET /invoice-approvals/{id}
    // =========================================================

    @GetMapping("/{id}")
    public ApiResponse<InvoiceApprovalResponse> getById(
            @PathVariable Long id
    ) {

        return ApiResponse.success(
                approvalService.getApprovalById(id),
                "Invoice approval fetched successfully"
        );
    }

    // =========================================================
    // APPROVE
    // PATCH /invoice-approvals/{id}/approve
    // =========================================================

    @PatchMapping("/{id}/approve")
    public ApiResponse<InvoiceApprovalResponse> approve(
            @PathVariable Long id,
            @Valid @RequestBody InvoiceApprovalDecisionRequest request
    ) {

        return ApiResponse.success(
                approvalService.approve(id, request),
                "Invoice approved successfully"
        );
    }

    // =========================================================
    // REJECT
    // PATCH /invoice-approvals/{id}/reject
    // =========================================================

    @PatchMapping("/{id}/reject")
    public ApiResponse<InvoiceApprovalResponse> reject(
            @PathVariable Long id,
            @Valid @RequestBody InvoiceApprovalDecisionRequest request
    ) {

        return ApiResponse.success(
                approvalService.reject(id, request),
                "Invoice rejected successfully"
        );
    }

    // =========================================================
    // CANCEL
    // PATCH /invoice-approvals/{id}/cancel
    // =========================================================

    @PatchMapping("/{id}/cancel")
    public ApiResponse<InvoiceApprovalResponse> cancel(
            @PathVariable Long id
    ) {

        return ApiResponse.success(
                approvalService.cancel(id),
                "Invoice approval request cancelled successfully"
        );
    }

    // =========================================================
    // INVOICE APPROVAL HISTORY
    // GET /invoice-approvals/invoice/{invoiceId}
    // =========================================================

    @GetMapping("/invoice/{invoiceId}")
    public ApiResponse<List<InvoiceApprovalResponse>> getInvoiceHistory(
            @PathVariable Long invoiceId
    ) {

        return ApiResponse.success(
                approvalService.getInvoiceApprovalHistory(invoiceId),
                "Invoice approval history fetched successfully"
        );
    }
}