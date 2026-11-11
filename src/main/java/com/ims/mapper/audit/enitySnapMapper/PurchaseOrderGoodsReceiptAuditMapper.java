package com.ims.mapper.audit.enitySnapMapper;


import com.ims.dtos.audit.enityAuditSnapShot.PurchaseOrderGoodsReceiptAuditSnapshot;
import com.ims.entity.PurchaseOrderGoodsReceiptEntity;
import com.ims.mapper.audit.AuditSnapshotMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(
        componentModel = "spring",
        uses = PurchaseOrderGoodsReceiptItemAuditMapper.class
)
public interface PurchaseOrderGoodsReceiptAuditMapper
        extends AuditSnapshotMapper {

    @Mapping(target = "purchaseOrderId",
            source = "purchaseOrder.id")

    @Mapping(target = "purchaseOrderNo",
            source = "purchaseOrder.orderNo")

    @Mapping(target = "warehouseId",
            source = "warehouse.id")

    @Mapping(target = "warehouseName",
            source = "warehouse.warehouseName")

    @Mapping(target = "warehouseCode",
            source = "warehouse.warehouseCode")
    PurchaseOrderGoodsReceiptAuditSnapshot toAuditSnapshot(
            PurchaseOrderGoodsReceiptEntity entity
    );

    @Override
    default boolean supports(String entityName) {
        return "PURCHASE_ORDER_GOODS_RECEIPT"
                .equalsIgnoreCase(entityName);
    }

    @Override
    default Object toSnapshot(Object entity) {
        if (!(entity instanceof PurchaseOrderGoodsReceiptEntity receipt)) {
            throw new IllegalArgumentException(
                    "Unsupported entity type for PurchaseOrderGoodsReceiptAuditMapper"
            );
        }

        return toAuditSnapshot(receipt);
    }
}

