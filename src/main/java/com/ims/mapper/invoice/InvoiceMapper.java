package com.ims.mapper.invoice;

import com.ims.dtos.invoice.InvoiceResponse;
import com.ims.entity.InvoiceEntity;
import com.ims.mapper.audit.AuditMapper;
import com.ims.mapper.salesPerson.SalesPersonMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(
        componentModel = "spring",
        uses = {
                AuditMapper.class,
                InvoiceItemMapper.class,
                SalesPersonMapper.class
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
            target = "salesPersonId",
            source = "salesPerson.id")

    @Mapping(
            target = "salesPersonName",
            source = "salesPerson.salesPersonName")

    @Mapping(
            target = "companyId",
            source = "companyDetails.id"
    )
    @Mapping(
            target = "companyName",
            source = "companyDetails.companyName")

    @Mapping(
            target = "companyCode",
            source = "companyDetails.companyCode"
    )

    @Mapping(
            target = "logo",
            source = "companyDetails.logo"
    )

    @Mapping(
            target = "bankAccountId",
            source = "bankAccount.id"
    )
    @Mapping(
            target = "bankName",
            source = "bankAccount.bankName")
    @Mapping(
            target = "accountNumber",
            source = "bankAccount.accountNumber")

    @Mapping(
            target = "ifsc",
            source = "bankAccount.ifsc"
    )

    @Mapping(
            target = "emailSignatureId",
            source = "emailSignature.id"
    )
    @Mapping(
            target = "userId",
            source = "emailSignature.userId"
    )
    @Mapping(
            target = "signatureName",
            source = "emailSignature.signatureName"
    )
    @Mapping(
            target = "signatureContent",
            source = "emailSignature.signatureContent"
    )
    @Mapping(
            target = "defaultForNewMessages",
            source = "emailSignature.defaultForNewMessages"
    )
    @Mapping(
            target = "defaultForReplies",
            source = "emailSignature.defaultForReplies"
    )

    @Mapping(
            target = "currencyId",
            source = "currency.id"
    )
    @Mapping(
            target = "currencyCode",
            source = "currency.currencyCode"
    )
    @Mapping(
            target = "currencyName",
            source = "currency.currencyName"
    )
    @Mapping(
            target = "exchangeRate",
            source = "exchangeRate"
    )
    @Mapping(
            target = "audit",
            source = "."
    )
    InvoiceResponse toResponse(InvoiceEntity entity);

    // =====================================================
    // ENTITY LIST -> RESPONSE LIST
    // =====================================================

    List<InvoiceResponse> toResponseList(
            List<InvoiceEntity> entities
    );
}