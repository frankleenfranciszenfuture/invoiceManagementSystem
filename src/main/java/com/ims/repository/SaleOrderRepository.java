
package com.ims.repository;

import com.ims.entity.SalesOrderEntity;
import com.ims.enums.SaleOrderStatus;

import jakarta.persistence.LockModeType;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface SaleOrderRepository extends
        JpaRepository<SalesOrderEntity, Long>,
        JpaSpecificationExecutor<SalesOrderEntity> {

    // =====================================================
    // BASIC RETRIEVAL
    // =====================================================

    Optional<SalesOrderEntity> findByIdAndActiveTrue(Long id);

    Optional<SalesOrderEntity> findByOrderNoIgnoreCase(
            String orderNo
    );

    boolean existsByOrderNoIgnoreCase(String orderNo);

    boolean existsByOrderNoIgnoreCaseAndIdNot(
            String orderNo,
            Long id
    );

    boolean existsByIdAndActiveTrue(Long id);


    // =====================================================
    // PAGINATION
    // =====================================================

    Page<SalesOrderEntity> findAllByActiveTrue(
            Pageable pageable
    );

    Page<SalesOrderEntity> findAllByParty_IdAndActiveTrue(
            Long partyId,
            Pageable pageable
    );

    Page<SalesOrderEntity> findAllByCustomer_IdAndActiveTrue(
            Long customerId,
            Pageable pageable
    );


    // =====================================================
    // FILTERED RETRIEVAL
    // =====================================================

    Page<SalesOrderEntity> findAllBySalesOrderStatusAndActiveTrue(
            SaleOrderStatus salesOrderStatus,
            Pageable pageable
    );

    Page<SalesOrderEntity> findAllByOrderDateBetweenAndActiveTrue(
            LocalDate fromDate,
            LocalDate toDate,
            Pageable pageable
    );

    Page<SalesOrderEntity> findAllByCurrency_IdAndActiveTrue(
            Long currencyId,
            Pageable pageable
    );

    Page<SalesOrderEntity> findAllByWarehouse_IdAndActiveTrue(
            Long warehouseId,
            Pageable pageable
    );


    // =====================================================
    // ORDER DETAILS
    // =====================================================

    @Query("""
        SELECT DISTINCT s
        FROM SalesOrderEntity s
        LEFT JOIN FETCH s.customer
        LEFT JOIN FETCH s.party
        LEFT JOIN FETCH s.warehouse
        LEFT JOIN FETCH s.currency
        LEFT JOIN FETCH s.items i
        LEFT JOIN FETCH i.product
        LEFT JOIN FETCH i.unit
        LEFT JOIN FETCH i.size
        LEFT JOIN FETCH i.taxMaster
        WHERE s.id = :id
          AND s.active = true
    """)
    Optional<SalesOrderEntity> findDetailedById(
            @Param("id") Long id
    );


    // =====================================================
    // PAGINATED BASIC DETAILS
    // =====================================================

    @EntityGraph(attributePaths = {
            "customer",
            "party",
            "warehouse",
            "currency"
    })
    @Query("""
        SELECT s
        FROM SalesOrderEntity s
        WHERE s.active = true
    """)
    Page<SalesOrderEntity> findAllActiveWithBasicDetails(
            Pageable pageable
    );


    // =====================================================
    // PESSIMISTIC LOCK
    // =====================================================

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT s
        FROM SalesOrderEntity s
        WHERE s.id = :id
          AND s.active = true
    """)
    Optional<SalesOrderEntity> findActiveByIdForUpdate(
            @Param("id") Long id
    );


    // =====================================================
    // STATUS COUNTS
    // =====================================================

    long countBySalesOrderStatusAndActiveTrue(
            SaleOrderStatus salesOrderStatus
    );


    // =====================================================
    // PARTY ORDER HISTORY
    // =====================================================

    Page<SalesOrderEntity> findAllByParty_IdAndOrderDateBetweenAndActiveTrue(
            Long partyId,
            LocalDate fromDate,
            LocalDate toDate,
            Pageable pageable
    );


    // =====================================================
    // CUSTOMER ORDER HISTORY
    // =====================================================

    Page<SalesOrderEntity> findAllByCustomer_IdAndOrderDateBetweenAndActiveTrue(
            Long customerId,
            LocalDate fromDate,
            LocalDate toDate,
            Pageable pageable
    );
}
