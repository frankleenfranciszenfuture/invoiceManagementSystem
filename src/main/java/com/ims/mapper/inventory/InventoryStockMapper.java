package com.ims.mapper.inventory;

import com.ims.dtos.inventory.InventoryStockResponse;
import com.ims.entity.InventoryStockEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface InventoryStockMapper {

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productName", source = "product.productName")
    @Mapping(target = "productCode", source = "product.productCode")

    @Mapping(target = "warehouseId", source = "warehouse.id")
    @Mapping(target = "warehouseName", source = "warehouse.warehouseName")
    @Mapping(target = "warehouseCode", source = "warehouse.warehouseCode")

    @Mapping(target = "unitId", source = "unit.id")
    @Mapping(target = "unitName", source = "unit.unitName")
    @Mapping(target = "unitShortName", source = "unit.unitShortName")

    @Mapping(target = "sizeId", source = "size.id")
    @Mapping(target = "sizeName", source = "size.sizeName")

    InventoryStockResponse toResponse(InventoryStockEntity entity);
}