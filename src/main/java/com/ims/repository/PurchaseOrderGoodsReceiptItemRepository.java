package com.ims.repository;


import com.ims.entity.PurchaseOrderGoodsReceiptItemEntity;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseOrderGoodsReceiptItemRepository
        extends JpaRepository<PurchaseOrderGoodsReceiptItemEntity, Long> {

    List<PurchaseOrderGoodsReceiptItemEntity>
    findAllByGoodsReceiptIdAndActiveTrue(Long goodsReceiptId);

    List<PurchaseOrderGoodsReceiptItemEntity>
    findAllByPurchaseOrderItemIdAndActiveTrue(Long purchaseOrderItemId);

    @Query("""
        SELECT ri
        FROM PurchaseOrderGoodsReceiptItemEntity ri
        JOIN FETCH ri.goodsReceipt gr
        WHERE ri.purchaseOrderItem.id = :purchaseOrderItemId
          AND ri.active = true
          AND gr.active = true
        ORDER BY gr.receiptDate DESC
    """)
    List<PurchaseOrderGoodsReceiptItemEntity>
    findReceiptHistoryByPurchaseOrderItemId(
            @Param("purchaseOrderItemId") Long purchaseOrderItemId
    );
}
