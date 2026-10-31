package com.ims.mapper.purchaseOrder;

import com.ims.dtos.purchaseOrder.PurchaseOrderResponse;
import com.ims.entity.PurchaseOrderEntity;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(
        componentModel = "spring",
        uses = {
                PurchaseOrderItemMapper.class
        },
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface PurchaseOrderMapper {

    @Mapping(target = "partyId", source = "party.id")
    @Mapping(target = "partyCode", source = "party.partyCode")
    @Mapping(target = "supplierName", source = "party.companyName")
    @Mapping(target = "party", source = "party")

    @Mapping(target = "warehouseId", source = "warehouse.id")
    @Mapping(target = "warehouseName", source = "warehouse.warehouseName")

    @Mapping(target = "currencyId", source = "currency.id")
    @Mapping(target = "currencyCode", source = "currency.currencyCode")
    @Mapping(target = "currencyName", source = "currency.currencyName")
    @Mapping(target = "currencySymbol", source = "currency.symbol")

    @Mapping(
            target = "purchaseOrderStatus",
            source = "purchaseOrderStatus"
    )

    @Mapping(target = "items", source = "items")

    PurchaseOrderResponse toResponse(
            PurchaseOrderEntity source
    );

    List<PurchaseOrderResponse> toResponseList(
            List<PurchaseOrderEntity> sources
    );
}