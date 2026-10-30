
package com.ims.mapper.saleOrder;

import com.ims.entity.SalesOrderEntity;
import com.ims.dtos.saleOrder.SalesOrderResponse;
import com.ims.mapper.audit.AuditMapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(
        componentModel = "spring",
        uses = {
                AuditMapper.class,
                SalesOrderItemMapper.class
        }
)
public interface SaleOrderMapper {

    @Mapping(target = "customer", source = "customer")
    @Mapping(target = "party", source = "party")

    @Mapping(target = "warehouseId", source = "warehouse.id")
    @Mapping(target = "warehouseName", source = "warehouse.warehouseName")

    @Mapping(target = "currencyId", source = "currency.id")
    @Mapping(target = "currencyCode", source = "currency.currencyCode")
    @Mapping(target = "currencyName", source = "currency.currencyName")
    @Mapping(target = "currencySymbol", source = "currency.symbol")

    @Mapping(target = "items", source = "items")

    SalesOrderResponse toResponse(SalesOrderEntity entity);

    List<SalesOrderResponse> toResponseList(
            List<SalesOrderEntity> entities
    );
}
