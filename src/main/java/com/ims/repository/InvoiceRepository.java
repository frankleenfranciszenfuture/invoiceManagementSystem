package com.ims.repository;

import com.ims.entity.InvoiceEntity;
import com.ims.enums.InvoiceStatus;
import com.ims.enums.InvoiceType;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface InvoiceRepository
        extends JpaRepository<InvoiceEntity, Long>,
        JpaSpecificationExecutor<InvoiceEntity> {

    // =====================================================
    // FIND ALL
    // =====================================================

    @Override
    List<InvoiceEntity> findAll();


    // =====================================================
    // FIND BY ID
    // =====================================================

    @Override
    @EntityGraph(attributePaths = {
            "customer",
            "party",
            "purchaseOrder",
            "salesOrder",
            "invoiceItems",
            "invoiceItems.product",
            "invoiceItems.unit",
            "invoiceItems.size",
            "invoiceItems.taxMaster"
    })
    Optional<InvoiceEntity> findById(Long id);


    // =====================================================
    // FIND ACTIVE BY ID
    // =====================================================

    @EntityGraph(attributePaths = {
            "customer",
            "party",
            "purchaseOrder",
            "salesOrder",
            "invoiceItems",
            "invoiceItems.product",
            "invoiceItems.unit",
            "invoiceItems.size",
            "invoiceItems.taxMaster"
    })
    Optional<InvoiceEntity> findByIdAndActiveTrue(Long id);


    // =====================================================
    // INVOICE NUMBER
    // =====================================================

    Optional<InvoiceEntity> findByInvoiceNumber(
            String invoiceNumber
    );

    boolean existsByInvoiceNumber(
            String invoiceNumber
    );


    // =====================================================
    // GENERATE INVOICE NUMBER
    // =====================================================

    Optional<InvoiceEntity>
    findTopByInvoiceNumberStartingWithOrderByInvoiceNumberDesc(
            String prefix
    );


    // =====================================================
    // ACTIVE INVOICES
    // =====================================================

    List<InvoiceEntity>
    findByActiveTrueOrderByCreatedAtDesc();


    // =====================================================
    // CUSTOMER
    // =====================================================

    boolean existsByCustomer_IdAndInvoiceType(
            Long customerId,
            InvoiceType invoiceType
    );


    // =====================================================
    // CUSTOMER + INVOICE TYPE
    // =====================================================

    @EntityGraph(attributePaths = {
            "customer",
            "party",
            "purchaseOrder",
            "salesOrder",
            "invoiceItems",
            "invoiceItems.product",
            "invoiceItems.unit",
            "invoiceItems.size",
            "invoiceItems.taxMaster"
    })
    Optional<InvoiceEntity>
    findByCustomer_IdAndInvoiceType(
            Long customerId,
            InvoiceType invoiceType
    );


    // =====================================================
    // INVOICE REPORT
    // =====================================================

    @EntityGraph(attributePaths = {
            "customer",
            "party",
            "purchaseOrder",
            "salesOrder",
            "invoiceItems",
            "invoiceItems.product",
            "invoiceItems.unit",
            "invoiceItems.size",
            "invoiceItems.taxMaster"
    })
    List<InvoiceEntity> findAll(
            Specification<InvoiceEntity> specification
    );


    // =====================================================
    // INVOICE REPORT BY IDS
    // =====================================================

    @Query("""
        SELECT DISTINCT i
        FROM InvoiceEntity i
        LEFT JOIN FETCH i.customer
        LEFT JOIN FETCH i.party
        LEFT JOIN FETCH i.purchaseOrder
        LEFT JOIN FETCH i.salesOrder
        LEFT JOIN FETCH i.invoiceItems ii
        LEFT JOIN FETCH ii.product
        LEFT JOIN FETCH ii.unit
        LEFT JOIN FETCH ii.size
        LEFT JOIN FETCH ii.taxMaster
        WHERE i.id IN :ids
    """)
    List<InvoiceEntity> findReportInvoicesByIds(
            @Param("ids") List<Long> ids
    );


    // =====================================================
    // FIND BY ID FOR AUDIT
    // =====================================================

    @EntityGraph(attributePaths = {
            "customer",
            "party",
            "purchaseOrder",
            "salesOrder",
            "invoiceItems",
            "invoiceItems.product",
            "invoiceItems.unit",
            "invoiceItems.size",
            "invoiceItems.taxMaster"
    })
    @Query("""
        SELECT DISTINCT i
        FROM InvoiceEntity i
        WHERE i.id = :id
    """)
    Optional<InvoiceEntity> findByIdForAudit(
            @Param("id") Long id
    );


    // =====================================================
    // DASHBOARD
    // =====================================================

    @EntityGraph(attributePaths = {
            "customer",
            "party"
    })
    List<InvoiceEntity> findTop5ByActiveTrueOrderByCreatedAtDesc();


    long countByActiveTrue();


    List<InvoiceEntity> findTop10ByActiveTrueAndStatusOrderByCreatedAtDesc(
            InvoiceStatus status
    );


    // =====================================================
    // FIND BY ID FOR UPDATE
    // =====================================================

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT i
        FROM InvoiceEntity i
        WHERE i.id = :id
          AND i.active = true
    """)
    Optional<InvoiceEntity> findByIdForUpdate(
            @Param("id") Long id
    );


    // =====================================================
    // CUSTOMER CHECK
    // =====================================================

    boolean existsByCustomerId(Long customerId);


    // =====================================================
    // SOURCE ORDER DUPLICATE CHECKS
    // =====================================================

    boolean existsByPurchaseOrder_Id(Long purchaseOrderId);

    boolean existsBySalesOrder_Id(Long salesOrderId);


    // =====================================================
    // FIND INVOICE BY SOURCE ORDER
    // =====================================================

    @EntityGraph(attributePaths = {
            "customer",
            "party",
            "purchaseOrder",
            "salesOrder",
            "invoiceItems",
            "invoiceItems.product",
            "invoiceItems.unit",
            "invoiceItems.size",
            "invoiceItems.taxMaster"
    })
    Optional<InvoiceEntity> findByPurchaseOrder_Id(
            Long purchaseOrderId
    );


    @EntityGraph(attributePaths = {
            "customer",
            "party",
            "purchaseOrder",
            "salesOrder",
            "invoiceItems",
            "invoiceItems.product",
            "invoiceItems.unit",
            "invoiceItems.size",
            "invoiceItems.taxMaster"
    })
    Optional<InvoiceEntity> findBySalesOrder_Id(
            Long salesOrderId
    );

}