package com.ims.mapper.invoice;

import com.ims.dtos.invoice.InvoiceResponse;
import com.ims.entity.InvoiceEntity;

import com.ims.mapper.audit.AuditMapper;
import com.ims.mapper.company.CompanyMapper;
import com.ims.mapper.customer.CustomerMapper;
import com.ims.mapper.party.PartyMapper;
import com.ims.mapper.salesPerson.SalesPersonMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(
        componentModel = "spring",
        uses = {
                AuditMapper.class,
                InvoiceItemMapper.class,
                SalesPersonMapper.class,
                CompanyMapper.class,
                CustomerMapper.class,
                PartyMapper.class
        },
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface InvoiceMapper {

    // =========================================================
    // ENTITY TO RESPONSE
    // =========================================================

    @Mapping(target = "audit", source = ".")
    @Mapping(target = "customer", source = "customer")
    @Mapping(target = "customerId", source = "customer.id")
    @Mapping(target = "customerName", source = "customer.displayName")

    @Mapping(target = "party", source = "party")
    @Mapping(target = "partyId", source = "party.id")
    @Mapping(target = "partyName", source = "party.companyName")

    @Mapping(target = "partyType", source = "partyType")
    @Mapping(target = "sourceType", source = "sourceType")

    @Mapping(target = "purchaseOrderId", source = "purchaseOrder.id")
    @Mapping(target = "purchaseOrderNumber", source = "purchaseOrder.orderNo")

    @Mapping(target = "salesOrderId", source = "salesOrder.id")
    @Mapping(target = "salesOrderNumber", source = "salesOrder.orderNo")

    @Mapping(target = "salesPerson", source = "salesPerson")
    @Mapping(target = "salesPersonId", source = "salesPerson.id")
    @Mapping(target = "salesPersonName", source = "salesPerson.salesPersonName")

    @Mapping(target = "company", source = "companyDetails")
    @Mapping(target = "companyId", source = "companyDetails.id")
    @Mapping(target = "companyName", source = "companyDetails.companyName")

    @Mapping(target = "bankAccount", source = "bankAccount")
    @Mapping(target = "bankAccountId", source = "bankAccount.id")
    @Mapping(target = "bankAccountName", source = "bankAccount.accountName")

    @Mapping(target = "emailSignature", source = "emailSignature")
    @Mapping(target = "emailSignatureId", source = "emailSignature.id")
    @Mapping(target = "emailSignatureName", source = "emailSignature.signatureName")

    @Mapping(target = "currencyId", source = "currency.id")
    @Mapping(target = "currencyName", source = "currency.currencyName")
    @Mapping(target = "currencyCode", source = "currency.currencyCode")
    @Mapping(target = "currencySymbol", source = "currency.symbol")
    @Mapping(target = "decimalPlaces", source = "currency.decimalPlaces")

    @Mapping(target = "invoiceItems", source = "invoiceItems")
    InvoiceResponse toResponse(InvoiceEntity entity);


    // =========================================================
    // ENTITY LIST TO RESPONSE LIST
    // =========================================================

    List<InvoiceResponse> toResponseList(
            List<InvoiceEntity> entities
    );
}