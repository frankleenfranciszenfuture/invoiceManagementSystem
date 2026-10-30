package com.ims.mapper.inventory;

import com.ims.dtos.inventory.InventoryTransactionResponse;
import com.ims.entity.InventoryTransactionEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface InventoryTransactionMapper {

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
    InventoryTransactionResponse toResponse(
            InventoryTransactionEntity entity
    );

    List<InventoryTransactionResponse> toResponseList(
            List<InventoryTransactionEntity> entities
    );
}