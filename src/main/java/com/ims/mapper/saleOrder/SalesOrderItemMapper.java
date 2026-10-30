
package com.ims.mapper.saleOrder;

import com.ims.dtos.saleOrder.SalesOrderItemResponse;
import com.ims.entity.SalesOrderItemEntity;
import com.ims.mapper.audit.AuditMapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(
        componentModel = "spring",
        uses = {
                AuditMapper.class
        }
)
public interface SalesOrderItemMapper {

    // =====================================================
    // ENTITY -> RESPONSE
    // =====================================================

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productName", source = "product.productName")
    @Mapping(target = "hsnCode", source = "product.hsnCode")

    @Mapping(target = "unitId", source = "unit.id")
    @Mapping(target = "unitName", source = "unit.unitName")

    @Mapping(target = "sizeId", source = "size.id")
    @Mapping(target = "sizeName", source = "size.sizeName")

    @Mapping(target = "taxMasterId", source = "taxMaster.id")
    @Mapping(target = "taxName", source = "taxMaster.taxName")

    // Audit
    @Mapping(target = "audit", source = ".")

    // Prices
    @Mapping(target = "baseUnitPrice", source = "baseUnitPrice")
    @Mapping(target = "unitPrice", source = "unitPrice")

    // Gross amount
    @Mapping(target = "grossAmount", source = "lineAmount")

    // Discount
    @Mapping(target = "discountAmount", source = "discountAmount")

    // Taxable amount
    @Mapping(target = "taxableAmount", source = "taxableAmount")

    // Tax percentage
    @Mapping(target = "taxPercentage", source = "taxRate")
    @Mapping(target = "cgstPercentage", source = "cgstRate")
    @Mapping(target = "sgstPercentage", source = "sgstRate")
    @Mapping(target = "igstPercentage", source = "igstRate")

    // Tax amounts
    @Mapping(target = "cgstAmount", source = "cgstAmount")
    @Mapping(target = "sgstAmount", source = "sgstAmount")
    @Mapping(target = "igstAmount", source = "igstAmount")
    @Mapping(target = "taxAmount", source = "totalTaxAmount")

    // Final amount
    @Mapping(target = "totalAmount", source = "totalAmount")

    SalesOrderItemResponse toResponse(
            SalesOrderItemEntity entity
    );
}
