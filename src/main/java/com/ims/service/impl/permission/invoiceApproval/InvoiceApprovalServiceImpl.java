package com.ims.service.impl.permission.invoiceApproval;


import com.ims.common.PageResponse;
import com.ims.common.audit.Auditable;
import com.ims.dtos.common.AuditResponse;
import com.ims.dtos.invoiceApproval.InvoiceApprovalDecisionRequest;
import com.ims.dtos.invoiceApproval.InvoiceApprovalResponse;

import com.ims.entity.InvoiceApprovalEntity;
import com.ims.entity.InvoiceEntity;
import com.ims.entity.UserEntity;
import com.ims.enums.InvoiceApprovalStatus;
import com.ims.enums.InvoiceStatus;

import com.ims.enums.audit.AuditAction;
import com.ims.enums.notification.NotificationPriority;
import com.ims.exception.ResourceNotFoundException;
import com.ims.exception.ValidationException;
import com.ims.repository.InvoiceRepository;
import com.ims.repository.invoiceApproval.InvoiceApprovalRepository;
import com.ims.service.impl.common.CurrentUserService;
import com.ims.service.serviceInterface.notification.NotificationService;

import com.ims.service.serviceInterface.permission.invoiceApproval.InvoiceApprovalPermissionService;
import com.ims.service.serviceInterface.permission.invoiceApproval.InvoiceApprovalService;
import com.ims.utils.base.BaseEntityUtil;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class InvoiceApprovalServiceImpl implements InvoiceApprovalService {

    private final InvoiceApprovalRepository approvalRepository;
    private final InvoiceRepository invoiceRepository;
    private final CurrentUserService currentUserService;
    private final InvoiceApprovalPermissionService permissionService;
    private final NotificationService notificationService;
    private final BaseEntityUtil baseEntityUtil;
    // =========================================================
    // SUBMIT INVOICE FOR APPROVAL
    // =========================================================

    @Override
    @Auditable(
            action = AuditAction.SUBMITTED,
            entity = "INVOICE_APPROVAL",
            recordId = "",
            description = "Invoice approval submitted"
    )
    public InvoiceApprovalResponse submitForApproval(
            Long invoiceId,
            InvoiceApprovalDecisionRequest request
    ) {

        UserEntity currentUser = currentUserService.getCurrentUser();

        InvoiceEntity invoice = invoiceRepository.findByIdForUpdate(invoiceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Invoice not found.")
                );

        if (invoice.getStatus() != InvoiceStatus.DRAFT) {
            throw new ValidationException(
                    "Only draft invoices can be submitted for approval. Current status: "
                            + invoice.getStatus()
            );
        }

        if (request == null
                || request.getComment() == null
                || request.getComment().isBlank()) {
            throw new ValidationException(
                    "Submission comment is required."
            );
        }

        if (request.getComment().length() > 1000) {
            throw new ValidationException(
                    "Submission comment cannot exceed 1000 characters."
            );
        }

        boolean pendingExists =
                approvalRepository.existsByInvoice_IdAndStatusAndActiveTrue(
                        invoiceId,
                        InvoiceApprovalStatus.PENDING
                );

        if (pendingExists) {
            throw new ValidationException(
                    "This invoice already has a pending approval request."
            );
        }

        List<UserEntity> approvers = permissionService.findApprovers();

        if (approvers.isEmpty()) {
            throw new ValidationException(
                    "No active user has Invoices APPROVE permission."
            );
        }

        // Prepare approval entity
        InvoiceApprovalEntity approval = InvoiceApprovalEntity.builder()
                .invoice(invoice)
                .submittedBy(currentUser)
                .status(InvoiceApprovalStatus.PENDING)
                .submissionComment(trimToNull(request.getComment()))
                .submittedAt(LocalDateTime.now())
                .active(true)
                .build();

        // Prepare audit information BEFORE saving
        baseEntityUtil.prepareForCreate(approval);

        InvoiceApprovalEntity saved = approvalRepository.save(approval);

        // IMPORTANT: Update the actual invoice status
        invoice.setStatus(InvoiceStatus.PENDING_APPROVAL);

        baseEntityUtil.prepareForUpdate(invoice);

        invoiceRepository.save(invoice);

        // Notify all authorized approvers
        String invoiceNumber = invoice.getInvoiceNumber();

        for (UserEntity approver : approvers) {

            notificationService.createNotification(
                    approver,
                    currentUser,
                    "Invoice approval required",
                    "Invoice " + invoiceNumber
                            + " is waiting for your approval.",
                    "INVOICES",
                    "INVOICE_APPROVAL",
                    invoice.getId(),
                    invoiceNumber,
                    NotificationPriority.HIGH,
                    "/invoices/view/" + invoice.getId()
            );
        }

        return mapToResponse(saved);
    }

    // =========================================================
    // GET PENDING APPROVALS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public PageResponse<InvoiceApprovalResponse> getPendingApprovals(
            int page,
            int size
    ) {

        validatePagination(page, size);

        UserEntity currentUser = currentUserService.getCurrentUser();

        if (!permissionService.hasApprovePermission(currentUser)) {
            throw new AccessDeniedException(
                    "You do not have permission to view pending invoice approvals."
            );
        }

        Page<InvoiceApprovalEntity> result =
                approvalRepository
                        .findByStatusAndActiveTrueOrderBySubmittedAtDesc(
                                InvoiceApprovalStatus.PENDING,
                                PageRequest.of(page, size)
                        );

        return PageResponse.<InvoiceApprovalResponse>builder()
                .content(
                        result.getContent()
                                .stream()
                                .map(this::mapToResponse)
                                .toList()
                )
                .pageNumber(result.getNumber())
                .pageSize(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .last(result.isLast())
                .build();
    }

    // =========================================================
    // GET APPROVAL BY ID
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public InvoiceApprovalResponse getApprovalById(Long approvalId) {

        UserEntity currentUser = currentUserService.getCurrentUser();

        InvoiceApprovalEntity approval =
                approvalRepository.findByIdAndActiveTrue(approvalId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Invoice approval not found."
                                )
                        );

        ensureCanView(approval, currentUser);

        return mapToResponse(approval);
    }

    // =========================================================
    // APPROVE
    // =========================================================

    @Override
    @Auditable(
            action = AuditAction.APPROVE,
            entity = "INVOICE_APPROVAL",
            recordId = "#p0",
            description = "Invoice approval approved"
    )
    public InvoiceApprovalResponse approve(
            Long approvalId,
            InvoiceApprovalDecisionRequest request
    ) {

        UserEntity currentUser = currentUserService.getCurrentUser();

        validateDecisionRequest(request);

        InvoiceApprovalEntity approval =
                approvalRepository.findByIdForUpdate(approvalId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Invoice approval not found."
                                )
                        );

        ensureCanApprove(currentUser);

        validatePending(approval);

        InvoiceEntity invoice = invoiceRepository.findByIdForUpdate(
                        approval.getInvoice().getId()
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException("Invoice not found.")
                );

        if (invoice.getStatus() != InvoiceStatus.PENDING_APPROVAL) {
            throw new ValidationException(
                    "Only invoices pending approval can be approved. Current status: "
                            + invoice.getStatus()
            );
        }

        approval.setStatus(InvoiceApprovalStatus.APPROVED);
        approval.setDecidedBy(currentUser);
        approval.setDecisionComment(trimToNull(request.getComment()));
        approval.setDecidedAt(LocalDateTime.now());

        invoice.setStatus(InvoiceStatus.APPROVED);

        approvalRepository.save(approval);
        invoiceRepository.save(invoice);

        notifySubmitter(
                approval,
                currentUser,
                "Invoice approved",
                "Your invoice " + invoice.getInvoiceNumber()
                        + " has been approved.",
                "INVOICE_APPROVED"
        );

        baseEntityUtil.prepareForUpdate(
                approval
        );

        return mapToResponse(approval);
    }

    // =========================================================
    // REJECT
    // =========================================================

    @Override
    @Auditable(
            action = AuditAction.REJECT,
            entity = "INVOICE_APPROVAL",
            recordId = "#p0",
            description = "Invoice approval rejected"
    )
    public InvoiceApprovalResponse reject(
            Long approvalId,
            InvoiceApprovalDecisionRequest request
    ) {

        UserEntity currentUser = currentUserService.getCurrentUser();

        validateDecisionRequest(request);

        InvoiceApprovalEntity approval =
                approvalRepository.findByIdForUpdate(approvalId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Invoice approval not found."
                                )
                        );

        ensureCanApprove(currentUser);

        validatePending(approval);

        InvoiceEntity invoice = invoiceRepository.findByIdForUpdate(
                        approval.getInvoice().getId()
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException("Invoice not found.")
                );

        approval.setStatus(InvoiceApprovalStatus.REJECTED);
        approval.setDecidedBy(currentUser);
        approval.setDecisionComment(trimToNull(request.getComment()));
        approval.setDecidedAt(LocalDateTime.now());

        // Rejected invoices return to DRAFT for correction.
        invoice.setStatus(InvoiceStatus.DRAFT);

        baseEntityUtil.prepareForUpdate(approval);
        baseEntityUtil.prepareForUpdate(invoice);

        approvalRepository.save(approval);
        invoiceRepository.save(invoice);

        notifySubmitter(
                approval,
                currentUser,
                "Invoice rejected",
                "Your invoice " + invoice.getInvoiceNumber()
                        + " was rejected. Reason: " + request.getComment(),
                "INVOICE_REJECTED"
        );

        return mapToResponse(approval);
    }

    // =========================================================
    // CANCEL PENDING REQUEST
    // =========================================================

    @Override
    @Auditable(
            action = AuditAction.CANCEL,
            entity = "INVOICE_APPROVAL",
            recordId = "#p0",
            description = "Invoice approval canceled"
    )
    public InvoiceApprovalResponse cancel(Long approvalId) {

        UserEntity currentUser = currentUserService.getCurrentUser();

        InvoiceApprovalEntity approval =
                approvalRepository.findByIdForUpdate(approvalId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Invoice approval not found."
                                )
                        );

        validatePending(approval);

        boolean isSubmitter =
                approval.getSubmittedBy().getId().equals(currentUser.getId());

        if (!isSubmitter && !isAdmin(currentUser)) {
            throw new AccessDeniedException(
                    "Only the submitter or an administrator can cancel this request."
            );
        }

        approval.setStatus(InvoiceApprovalStatus.CANCELLED);
        approval.setDecidedBy(currentUser);
        approval.setDecidedAt(LocalDateTime.now());

        InvoiceApprovalEntity saved = approvalRepository.save(approval);

        notifySubmitter(
                approval,
                currentUser,
                "Invoice approval cancelled",
                "The approval request for invoice "
                        + approval.getInvoice().getInvoiceNumber()
                        + " has been cancelled.",
                "INVOICE_APPROVAL_CANCELLED"
        );

        return mapToResponse(saved);
    }

    // =========================================================
    // GET INVOICE APPROVAL HISTORY
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<InvoiceApprovalResponse> getInvoiceApprovalHistory(
            Long invoiceId
    ) {

        UserEntity currentUser = currentUserService.getCurrentUser();

        InvoiceEntity invoice = invoiceRepository.findByIdAndActiveTrue(invoiceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Invoice not found.")
                );

        boolean isSubmitterOrApprover =
                invoice.getCreatedBy() != null
                        && invoice.getCreatedBy().equals(currentUser.getId());

        if (!isSubmitterOrApprover
                && !permissionService.hasApprovePermission(currentUser)
                && !isAdmin(currentUser)) {

            throw new AccessDeniedException(
                    "You do not have permission to view this approval history."
            );
        }

        return approvalRepository
                .findByInvoice_IdAndActiveTrueOrderBySubmittedAtDesc(invoiceId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // PERMISSION / VALIDATION HELPERS
    // =========================================================

    private void ensureCanApprove(UserEntity user) {

        if (!permissionService.hasApprovePermission(user)) {
            throw new AccessDeniedException(
                    "You do not have Invoices APPROVE permission."
            );
        }
    }

    private void ensureCanView(
            InvoiceApprovalEntity approval,
            UserEntity user
    ) {

        boolean isSubmitter =
                approval.getSubmittedBy().getId().equals(user.getId());

        if (!isSubmitter
                && !permissionService.hasApprovePermission(user)
                && !isAdmin(user)) {

            throw new AccessDeniedException(
                    "You do not have permission to view this approval."
            );
        }
    }

    private void validatePending(InvoiceApprovalEntity approval) {

        if (approval.getStatus() != InvoiceApprovalStatus.PENDING) {
            throw new ValidationException(
                    "This approval request has already been decided."
            );
        }
    }

    private void validateDecisionRequest(
            InvoiceApprovalDecisionRequest request
    ) {

        if (request == null
                || request.getComment() == null
                || request.getComment().isBlank()) {

            throw new ValidationException(
                    "A decision comment is required."
            );
        }

        if (request.getComment().length() > 1000) {
            throw new ValidationException(
                    "Decision comment cannot exceed 1000 characters."
            );
        }
    }

    private void validatePagination(int page, int size) {

        if (page < 0 || size < 1 || size > 100) {
            throw new ValidationException(
                    "Page must be non-negative and size must be between 1 and 100."
            );
        }
    }

    private boolean isAdmin(UserEntity user) {

        String roleName = user.getRole() != null
                ? user.getRole().getRoleName()
                : null;

        return "ADMIN".equalsIgnoreCase(roleName)
                || "SUPER_ADMIN".equalsIgnoreCase(roleName);
    }

    private String trimToNull(String value) {

        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    // =========================================================
    // NOTIFY SUBMITTER
    // =========================================================

    private void notifySubmitter(
            InvoiceApprovalEntity approval,
            UserEntity sender,
            String title,
            String message,
            String notificationType
    ) {

        InvoiceEntity invoice = approval.getInvoice();

        notificationService.createNotification(
                approval.getSubmittedBy(),
                sender,
                title,
                message,
                "INVOICES",
                notificationType,
                invoice.getId(),
                invoice.getInvoiceNumber(),
                NotificationPriority.NORMAL,
                "/invoices/view/" + invoice.getId()
        );
    }

    // =========================================================
    // ENTITY TO RESPONSE
    // =========================================================

    private InvoiceApprovalResponse mapToResponse(
            InvoiceApprovalEntity entity
    ) {

        InvoiceEntity invoice = entity.getInvoice();

        return InvoiceApprovalResponse.builder()
                .id(entity.getId())
                .invoiceId(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .invoiceType(
                        invoice.getInvoiceType() != null
                                ? invoice.getInvoiceType().name()
                                : null
                )
                .grandTotal(invoice.getGrandTotal())
                .status(entity.getStatus())
                .submittedById(entity.getSubmittedBy().getId())
                .submittedByName(entity.getSubmittedBy().getName())
                .decidedById(
                        entity.getDecidedBy() != null
                                ? entity.getDecidedBy().getId()
                                : null
                )
                .decidedByName(
                        entity.getDecidedBy() != null
                                ? entity.getDecidedBy().getName()
                                : null
                )
                .submissionComment(entity.getSubmissionComment())
                .decisionComment(entity.getDecisionComment())
                .submittedAt(entity.getSubmittedAt())
                .decidedAt(entity.getDecidedAt())
                .audit(
                        AuditResponse.builder()
                                .createdAt(entity.getCreatedAt())
                                .updatedAt(entity.getUpdatedAt())
                                .createdBy(entity.getCreatedBy())
                                .updatedBy(entity.getUpdatedBy())
                                .active(entity.getActive())
                                .build()
                )
                .build();
    }
}