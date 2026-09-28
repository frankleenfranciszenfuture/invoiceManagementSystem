package com.ims.mapper.invoice;

import com.ims.dtos.invoice.InvoiceResponse;
import com.ims.entity.InvoiceEntity;
import com.ims.mapper.audit.AuditMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(
        componentModel = "spring",
        uses = {
                AuditMapper.class,
                InvoiceItemMapper.class
        }
)
public interface InvoiceMapper {

    // =====================================================
    // ENTITY -> RESPONSE
    // =====================================================

    @Mapping(
            target = "customerId",
            source = "customer.id"
    )
    @Mapping(
            target = "customerName",
            source = "customer.companyName"
    )
    @Mapping(
            target = "invoiceItems",
            source = "invoiceItems"
    )
    @Mapping(
            target = "audit",
            source = "."
    )
    InvoiceResponse toResponse(
            InvoiceEntity entity
    );


    // =====================================================
    // ENTITY LIST -> RESPONSE LIST
    // =====================================================

    List<InvoiceResponse> toResponseList(
            List<InvoiceEntity> entities
    );
}