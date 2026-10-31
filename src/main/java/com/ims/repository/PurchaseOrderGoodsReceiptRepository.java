package com.ims.repository;


import com.ims.entity.PurchaseOrderGoodsReceiptEntity;

import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseOrderGoodsReceiptRepository
        extends JpaRepository<PurchaseOrderGoodsReceiptEntity, Long> {

    Optional<PurchaseOrderGoodsReceiptEntity> findByIdAndActiveTrue(
            Long id
    );

    Optional<PurchaseOrderGoodsReceiptEntity> findByReceiptNoIgnoreCase(
            String receiptNo
    );

    boolean existsByReceiptNoIgnoreCase(String receiptNo);

    List<PurchaseOrderGoodsReceiptEntity>
    findAllByPurchaseOrderIdAndActiveTrueOrderByReceiptDateDesc(
            Long purchaseOrderId
    );

    Page<PurchaseOrderGoodsReceiptEntity>
    findAllByPurchaseOrderIdAndActiveTrue(
            Long purchaseOrderId,
            Pageable pageable
    );

    @EntityGraph(attributePaths = {
            "purchaseOrder",
            "purchaseOrder.party",
            "warehouse",
            "items",
            "items.purchaseOrderItem",
            "items.purchaseOrderItem.product",
            "items.purchaseOrderItem.unit",
            "items.purchaseOrderItem.size"
    })
    @Query("""
        SELECT DISTINCT gr
        FROM PurchaseOrderGoodsReceiptEntity gr
        WHERE gr.id = :id
          AND gr.active = true
    """)
    Optional<PurchaseOrderGoodsReceiptEntity> findDetailedById(
            @Param("id") Long id
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT gr
        FROM PurchaseOrderGoodsReceiptEntity gr
        WHERE gr.id = :id
          AND gr.active = true
    """)
    Optional<PurchaseOrderGoodsReceiptEntity> findActiveByIdForUpdate(
            @Param("id") Long id
    );
}