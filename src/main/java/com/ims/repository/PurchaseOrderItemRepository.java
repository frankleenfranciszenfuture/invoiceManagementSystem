package com.ims.repository;



import com.ims.entity.PurchaseOrderItemEntity;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PurchaseOrderItemRepository
        extends JpaRepository<PurchaseOrderItemEntity, Long> {

    List<PurchaseOrderItemEntity> findAllByPurchaseOrderIdAndActiveTrue(
            Long purchaseOrderId
    );

    List<PurchaseOrderItemEntity> findAllByProductIdAndActiveTrue(
            Long productId
    );

    @Query("""
        SELECT COALESCE(SUM(ri.receivedQuantity), 0)
        FROM PurchaseOrderGoodsReceiptItemEntity ri
        WHERE ri.purchaseOrderItem.id = :purchaseOrderItemId
          AND ri.active = true
          AND ri.goodsReceipt.active = true
    """)
    BigDecimal calculateReceivedQuantity(
            @Param("purchaseOrderItemId") Long purchaseOrderItemId
    );

    @Query("""
        SELECT COALESCE(SUM(ri.receivedTotalCost), 0)
        FROM PurchaseOrderGoodsReceiptItemEntity ri
        WHERE ri.purchaseOrderItem.id = :purchaseOrderItemId
          AND ri.active = true
          AND ri.goodsReceipt.active = true
    """)
    BigDecimal calculateReceivedTotalCost(
            @Param("purchaseOrderItemId") Long purchaseOrderItemId
    );
}
