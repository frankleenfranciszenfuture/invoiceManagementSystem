package com.ims.mapper.audit.enitySnapMapper;


import com.ims.common.audit.AuditSnapshotMapper;
import com.ims.dtos.audit.enityAuditSnapShot.InvoiceAuditSnapshot;
import com.ims.dtos.audit.enityAuditSnapShot.InvoiceItemAuditSnapshot;
import com.ims.entity.InvoiceEntity;
import com.ims.entity.InvoiceItemEntity;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class InvoiceAuditSnapshotMapper implements AuditSnapshotMapper {

    @Override
    public boolean supports(String entityName) {
        return "INVOICE".equalsIgnoreCase(entityName);
    }

    @Override
    public Object toSnapshot(Object entity) {

        if (!(entity instanceof InvoiceEntity invoice)) {
            return null;
        }

        List<InvoiceItemAuditSnapshot> items =
                invoice.getInvoiceItems() == null
                        ? Collections.emptyList()
                        : invoice.getInvoiceItems()
                        .stream()
                        .map(this::mapItem)
                        .toList();

        return InvoiceAuditSnapshot.builder()

                .id(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .invoiceType(invoice.getInvoiceType())

                // Customer
                .customerId(
                        invoice.getCustomer() != null
                                ? invoice.getCustomer().getId()
                                : null
                )

                // Dates
                .invoiceDate(invoice.getInvoiceDate())
                .dueDate(invoice.getDueDate())
                .invoiceSentAt(invoice.getInvoiceSentAt())

                // Amounts
                .subtotal(invoice.getSubtotal())
                .discountAmount(invoice.getDiscountAmount())
                .taxAmount(invoice.getTaxAmount())
                .shippingAmount(invoice.getShippingAmount())
                .grandTotal(invoice.getGrandTotal())

                // Sales Person
                .salesPersonId(
                        invoice.getSalesPerson() != null
                                ? invoice.getSalesPerson().getId()
                                : null
                )

                // Company
                .companyId(
                        invoice.getCompanyDetails() != null
                                ? invoice.getCompanyDetails().getId()
                                : null
                )

                // Bank Account
                .bankAccountId(
                        invoice.getBankAccount() != null
                                ? invoice.getBankAccount().getId()
                                : null
                )

                // Email Signature
                .emailSignatureId(
                        invoice.getEmailSignature() != null
                                ? invoice.getEmailSignature().getId()
                                : null
                )

                // Currency
                .currencyId(
                        invoice.getCurrency() != null
                                ? invoice.getCurrency().getId()
                                : null
                )
                .exchangeRate(invoice.getExchangeRate())

                // Status
                .status(invoice.getStatus())

                // Notes
                .notes(invoice.getNotes())
                .termsAndConditions(invoice.getTermsAndConditions())

                // Items
                .invoiceItems(items)

                .build();
    }

    private InvoiceItemAuditSnapshot mapItem(
            InvoiceItemEntity item
    ) {

        return InvoiceItemAuditSnapshot.builder()

                .id(item.getId())

                // Product
                .productId(
                        item.getProduct() != null
                                ? item.getProduct().getId()
                                : null
                )

                // Description
                .description(item.getDescription())

                // Base Unit Price
                .baseUnitPrice(item.getBaseUnitPrice())

                // Unit
                .unitId(
                        item.getUnit() != null
                                ? item.getUnit().getId()
                                : null
                )

                // Size
                .sizeId(
                        item.getSize() != null
                                ? item.getSize().getId()
                                : null
                )

                // Quantity
                .quantity(item.getQuantity())

                // Unit Price
                .unitPrice(item.getUnitPrice())

                // Amounts
                .grossAmount(item.getGrossAmount())
                .discountAmount(item.getDiscountAmount())
                .taxableAmount(item.getTaxableAmount())

                // Tax Master
                .taxMasterId(
                        item.getTaxMaster() != null
                                ? item.getTaxMaster().getId()
                                : null
                )

                // Tax Percentages
                .taxPercentage(item.getTaxPercentage())
                .cgstPercentage(item.getCgstPercentage())
                .sgstPercentage(item.getSgstPercentage())
                .igstPercentage(item.getIgstPercentage())

                // Tax Amounts
                .cgstAmount(item.getCgstAmount())
                .sgstAmount(item.getSgstAmount())
                .igstAmount(item.getIgstAmount())
                .taxAmount(item.getTaxAmount())

                // Total
                .totalAmount(item.getTotalAmount())

                .build();
    }
}

