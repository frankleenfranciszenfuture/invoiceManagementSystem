package com.ims.mapper.audit.enitySnapMapper;


import com.ims.dtos.audit.enityAuditSnapShot.PurchaseOrderItemAuditSnapshot;
import com.ims.entity.PurchaseOrderItemEntity;
import com.ims.mapper.audit.AuditSnapshotMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PurchaseOrderItemAuditMapper extends AuditSnapshotMapper {

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productName", source = "product.productName")
    @Mapping(target = "productCode", source = "product.productCode")
    @Mapping(target = "hsnCode", source = "product.hsnCode")

    @Mapping(target = "unitId", source = "unit.id")
    @Mapping(target = "unitName", source = "unit.unitName")
    @Mapping(target = "unitShortName", source = "unit.unitShortName")

    @Mapping(target = "sizeId", source = "size.id")
    @Mapping(target = "sizeName", source = "size.sizeName")

    @Mapping(target = "pendingQuantity", expression =
            "java(entity.getPendingQuantity())")

    @Mapping(target = "taxMasterId", source = "taxMaster.id")
    @Mapping(target = "taxName", source = "taxMaster.taxName")
    PurchaseOrderItemAuditSnapshot toAuditSnapshot(
            PurchaseOrderItemEntity entity
    );

    @Override
    default boolean supports(String entityName) {
        return "PURCHASE_ORDER_ITEM".equalsIgnoreCase(entityName);
    }

    @Override
    default Object toSnapshot(Object entity) {
        if (!(entity instanceof PurchaseOrderItemEntity item)) {
            throw new IllegalArgumentException(
                    "Unsupported entity type for PurchaseOrderItemAuditMapper"
            );
        }

        return toAuditSnapshot(item);
    }
}

