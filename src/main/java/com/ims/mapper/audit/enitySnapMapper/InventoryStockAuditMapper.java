package com.ims.mapper.audit.enitySnapMapper;


import com.ims.dtos.audit.enityAuditSnapShot.InventoryStockAuditSnapshot;
import com.ims.entity.InventoryStockEntity;
import com.ims.mapper.audit.AuditSnapshotMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface InventoryStockAuditMapper extends AuditSnapshotMapper {

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productName", source = "product.productName")
    @Mapping(target = "productCode", source = "product.productCode")

    @Mapping(target = "warehouseId", source = "warehouse.id")
    @Mapping(target = "warehouseName", source = "warehouse.warehouseName")

    @Mapping(target = "unitId", source = "unit.id")
    @Mapping(target = "unitName", source = "unit.unitName")
    @Mapping(target = "unitShortName", source = "unit.unitShortName")

    @Mapping(target = "sizeId", source = "size.id")
    @Mapping(target = "sizeName", source = "size.sizeName")

    InventoryStockAuditSnapshot toAuditSnapshot(InventoryStockEntity entity);

    @Override
    default boolean supports(String entityName) {
        return "INVENTORY_STOCK".equalsIgnoreCase(entityName);
    }

    @Override
    default Object toSnapshot(Object entity) {

        if (!(entity instanceof InventoryStockEntity inventoryStock)) {
            throw new IllegalArgumentException(
                    "Unsupported entity type for InventoryStockAuditMapper"
            );
        }

        return toAuditSnapshot(inventoryStock);
    }
}

