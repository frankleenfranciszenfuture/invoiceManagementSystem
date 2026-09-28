package com.ims.mapper.invoice;

import com.ims.dtos.invoice.InvoiceItemResponse;
import com.ims.entity.InvoiceItemEntity;
import com.ims.mapper.audit.AuditMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(
        componentModel = "spring",
        uses = {
                AuditMapper.class
        }
)
public interface InvoiceItemMapper {

    // =====================================================
    // ENTITY -> RESPONSE
    // =====================================================

    @Mapping(
            target = "productId",
            source = "product.id"
    )
    @Mapping(
            target = "productName",
            source = "product.productName"
    )
    @Mapping(
            target = "hsnCode",
            source = "product.hsnCode"
    )

    @Mapping(
            target = "unitId",
            source = "unit.id"
    )
    @Mapping(
            target = "unitName",
            source = "unit.unitName"
    )

    @Mapping(
            target = "sizeId",
            source = "size.id"
    )
    @Mapping(
            target = "sizeName",
            source = "size.sizeName"
    )

    @Mapping(
            target = "taxMasterId",
            source = "taxMaster.id"
    )
    @Mapping(
            target = "taxName",
            source = "taxMaster.taxName"
    )

    @Mapping(
            target = "audit",
            source = "."
    )
    InvoiceItemResponse toResponse(
            InvoiceItemEntity entity
    );
}