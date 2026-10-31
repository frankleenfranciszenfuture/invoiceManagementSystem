package com.ims.mapper.purchaseOrder;

import com.ims.dtos.purchaseOrder.PurchaseOrderItemResponse;
import com.ims.entity.PurchaseOrderItemEntity;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface PurchaseOrderItemMapper {

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productName", source = "product.productName")
    @Mapping(target = "hsnCode", source = "product.hsnCode")

    @Mapping(target = "unitId", source = "unit.id")
    @Mapping(target = "unitName", source = "unit.unitName")

    @Mapping(target = "sizeId", source = "size.id")
    @Mapping(target = "sizeName", source = "size.sizeName")

    @Mapping(target = "taxMasterId", source = "taxMaster.id")
    @Mapping(target = "taxName", source = "taxMaster.taxName")

    @Mapping(target = "grossAmount", source = "lineAmount")
    @Mapping(target = "taxPercentage", source = "taxRate")
    @Mapping(target = "cgstPercentage", source = "cgstRate")
    @Mapping(target = "sgstPercentage", source = "sgstRate")
    @Mapping(target = "igstPercentage", source = "igstRate")
    @Mapping(target = "taxAmount", source = "totalTaxAmount")

    @Mapping(
            target = "pendingQuantity",
            expression = "java(source.getPendingQuantity())"
    )
    PurchaseOrderItemResponse toResponse(PurchaseOrderItemEntity source);
}