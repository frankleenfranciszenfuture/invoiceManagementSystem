package com.ims.mapper.audit.enitySnapMapper;

import com.ims.common.audit.AuditSnapshotMapper;
import com.ims.dtos.audit.enityAuditSnapShot.PurchaseOrderAuditSnapshot;
import com.ims.entity.PurchaseOrderEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PurchaseOrderAuditMapper extends AuditSnapshotMapper {

    @Mapping(target = "partyId", source = "party.id")
    @Mapping(target = "supplierName", source = "party.companyName")
    @Mapping(target = "warehouseId", source = "warehouse.id")
    @Mapping(target = "warehouseName", source = "warehouse.warehouseName")
    @Mapping(target = "currencyId", source = "currency.id")
    @Mapping(target = "currencyCode", source = "currency.currencyCode")
    PurchaseOrderAuditSnapshot toAuditSnapshot(PurchaseOrderEntity entity);

    @Override
    default boolean supports(String entityName) {
        return "PURCHASE_ORDER".equalsIgnoreCase(entityName);
    }

    @Override
    default Object toSnapshot(Object entity) {

        if (!(entity instanceof PurchaseOrderEntity purchaseOrder)) {
            throw new IllegalArgumentException(
                    "Expected PurchaseOrderEntity but received: "
                            + entity.getClass().getName()
            );
        }

        return toAuditSnapshot(purchaseOrder);
    }
}