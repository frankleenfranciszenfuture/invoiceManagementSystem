package com.ims.mapper.audit.enitySnapMapper;

import com.ims.dtos.audit.enityAuditSnapShot.PurchaseOrderGoodsReceiptItemAuditSnapshot;
import com.ims.entity.PurchaseOrderGoodsReceiptItemEntity;
import com.ims.mapper.audit.AuditSnapshotMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PurchaseOrderGoodsReceiptItemAuditMapper
        extends AuditSnapshotMapper {

    @Mapping(target = "goodsReceiptId", source = "goodsReceipt.id")
    @Mapping(target = "receiptNo", source = "goodsReceipt.receiptNo")

    @Mapping(target = "purchaseOrderItemId",
            source = "purchaseOrderItem.id")

    @Mapping(target = "productId",
            source = "purchaseOrderItem.product.id")

    @Mapping(target = "productName",
            source = "purchaseOrderItem.product.productName")

    @Mapping(target = "productCode",
            source = "purchaseOrderItem.product.productCode")
    PurchaseOrderGoodsReceiptItemAuditSnapshot toAuditSnapshot(
            PurchaseOrderGoodsReceiptItemEntity entity
    );

    @Override
    default boolean supports(String entityName) {
        return "PURCHASE_ORDER_GOODS_RECEIPT_ITEM"
                .equalsIgnoreCase(entityName);
    }

    @Override
    default Object toSnapshot(Object entity) {
        if (!(entity instanceof PurchaseOrderGoodsReceiptItemEntity item)) {
            throw new IllegalArgumentException(
                    "Unsupported entity type for PurchaseOrderGoodsReceiptItemAuditMapper"
            );
        }

        return toAuditSnapshot(item);
    }
}

