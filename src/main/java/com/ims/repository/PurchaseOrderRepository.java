package com.ims.repository;


import com.ims.entity.PurchaseOrderEntity;
import com.ims.enums.PurchaseOrderStatus;

import jakarta.persistence.LockModeType;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface PurchaseOrderRepository
        extends JpaRepository<PurchaseOrderEntity, Long>,
        JpaSpecificationExecutor<PurchaseOrderEntity> {

    Optional<PurchaseOrderEntity> findByIdAndActiveTrue(Long id);

    Optional<PurchaseOrderEntity> findByOrderNoIgnoreCase(String orderNo);

    boolean existsByOrderNoIgnoreCase(String orderNo);

    boolean existsByIdAndActiveTrue(Long id);

    Page<PurchaseOrderEntity> findAllByActiveTrue(Pageable pageable);

    Page<PurchaseOrderEntity> findAllByPartyIdAndActiveTrue(
            Long partyId,
            Pageable pageable
    );

    Page<PurchaseOrderEntity> findAllByPurchaseOrderStatusAndActiveTrue(
            PurchaseOrderStatus status,
            Pageable pageable
    );

    Page<PurchaseOrderEntity> findAllByWarehouseIdAndActiveTrue(
            Long warehouseId,
            Pageable pageable
    );

    Page<PurchaseOrderEntity> findAllByOrderDateBetweenAndActiveTrue(
            LocalDate fromDate,
            LocalDate toDate,
            Pageable pageable
    );

    @EntityGraph(attributePaths = {
            "party",
            "warehouse",
            "currency",
            "items",
            "items.product",
            "items.unit",
            "items.size",
            "items.taxMaster"
    })
    @Query("""
        SELECT DISTINCT po
        FROM PurchaseOrderEntity po
        WHERE po.id = :id
          AND po.active = true
    """)
    Optional<PurchaseOrderEntity> findDetailedById(@Param("id") Long id);

    @EntityGraph(attributePaths = {
            "party",
            "warehouse",
            "currency"
    })
    @Query("""
        SELECT po
        FROM PurchaseOrderEntity po
        WHERE po.active = true
    """)
    Page<PurchaseOrderEntity> findAllActiveWithBasicDetails(
            Pageable pageable
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT po
        FROM PurchaseOrderEntity po
        WHERE po.id = :id
          AND po.active = true
    """)
    Optional<PurchaseOrderEntity> findActiveByIdForUpdate(
            @Param("id") Long id
    );

    long countByPurchaseOrderStatusAndActiveTrue(
            PurchaseOrderStatus status
    );
}