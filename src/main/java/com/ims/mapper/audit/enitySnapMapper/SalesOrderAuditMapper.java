package com.ims.mapper.audit.enitySnapMapper;


import com.ims.common.audit.AuditSnapshotMapper;

import com.ims.dtos.audit.enityAuditSnapShot.SalesOrderAuditSnapshot;
import com.ims.dtos.audit.enityAuditSnapShot.SalesOrderItemAuditSnapshot;

import com.ims.entity.SalesOrderEntity;
import com.ims.entity.SalesOrderItemEntity;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SalesOrderAuditMapper extends AuditSnapshotMapper {

    // =====================================================
    // SALES ORDER SNAPSHOT
    // =====================================================

    @Mapping(target = "customerId", source = "customer.id")
    @Mapping(target = "customerName", source = "customer.displayName")

    @Mapping(target = "partyId", source = "party.id")
    @Mapping(target = "partyName", source = "party.companyName")

    @Mapping(target = "warehouseId", source = "warehouse.id")
    @Mapping(target = "warehouseName", source = "warehouse.warehouseName")

    @Mapping(target = "currencyId", source = "currency.id")
    @Mapping(target = "currencyCode", source = "currency.currencyCode")
    @Mapping(target = "currencyName", source = "currency.currencyName")
    @Mapping(target = "currencySymbol", source = "currency.symbol")

    SalesOrderAuditSnapshot toAuditSnapshot(
            SalesOrderEntity entity
    );


    // =====================================================
    // SALES ORDER ITEM SNAPSHOT
    // =====================================================

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productName", source = "product.productName")
    @Mapping(target = "productCode", source = "product.productCode")
    @Mapping(target = "hsnCode", source = "product.hsnCode")

    @Mapping(target = "unitId", source = "unit.id")
    @Mapping(target = "unitName", source = "unit.unitName")
    @Mapping(target = "unitShortName", source = "unit.unitShortName")

    @Mapping(target = "sizeId", source = "size.id")
    @Mapping(target = "sizeName", source = "size.sizeName")

    @Mapping(target = "taxMasterId", source = "taxMaster.id")
    @Mapping(target = "taxName", source = "taxMaster.taxName")

    SalesOrderItemAuditSnapshot toItemAuditSnapshot(
            SalesOrderItemEntity entity
    );


    // =====================================================
    // ENTITY SUPPORT
    // =====================================================

    @Override
    default boolean supports(String entityName) {

        return "SALES_ORDER".equalsIgnoreCase(entityName)
                || "SALES_ORDERS".equalsIgnoreCase(entityName);
    }


    // =====================================================
    // OBJECT TO SNAPSHOT
    // =====================================================

    @Override
    default Object toSnapshot(Object entity) {

        if (!(entity instanceof SalesOrderEntity salesOrder)) {

            throw new IllegalArgumentException(
                    "Expected SalesOrderEntity but received: "
                            + (entity == null
                            ? "null"
                            : entity.getClass().getName())
            );
        }

        return toAuditSnapshot(salesOrder);
    }
}

