package com.ims.repository.invoiceApproval;

import com.ims.entity.InvoiceApprovalEntity;
import com.ims.enums.InvoiceApprovalStatus;

import jakarta.persistence.LockModeType;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface InvoiceApprovalRepository
        extends JpaRepository<InvoiceApprovalEntity, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @EntityGraph(attributePaths = {
            "invoice",
            "invoice.customer",
            "submittedBy",
            "decidedBy"
    })
    @Query("""
        SELECT a
        FROM InvoiceApprovalEntity a
        WHERE a.id = :id
          AND a.active = true
    """)
    Optional<InvoiceApprovalEntity> findByIdForUpdate(
            @Param("id") Long id
    );

    @EntityGraph(attributePaths = {
            "invoice",
            "invoice.customer",
            "submittedBy",
            "decidedBy"
    })
    Optional<InvoiceApprovalEntity> findByIdAndActiveTrue(Long id);

    @EntityGraph(attributePaths = {
            "invoice",
            "invoice.customer",
            "submittedBy",
            "decidedBy"
    })
    Optional<InvoiceApprovalEntity>
    findFirstByInvoice_IdAndStatusAndActiveTrueOrderBySubmittedAtDesc(
            Long invoiceId,
            InvoiceApprovalStatus status
    );

    @EntityGraph(attributePaths = {
            "invoice",
            "invoice.customer",
            "submittedBy",
            "decidedBy"
    })
    List<InvoiceApprovalEntity>
    findByInvoice_IdAndActiveTrueOrderBySubmittedAtDesc(
            Long invoiceId
    );

    @EntityGraph(attributePaths = {
            "invoice",
            "invoice.customer",
            "submittedBy",
            "decidedBy"
    })
    Page<InvoiceApprovalEntity>
    findByStatusAndActiveTrueOrderBySubmittedAtDesc(
            InvoiceApprovalStatus status,
            Pageable pageable
    );

    boolean existsByInvoice_IdAndStatusAndActiveTrue(
            Long invoiceId,
            InvoiceApprovalStatus status
    );
}