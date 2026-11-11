package com.ims.dtos.audit.enityAuditSnapShot;


import com.ims.enums.InvoiceStatus;
import com.ims.enums.InvoiceType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceAuditSnapshot {

    private Long id;

    private String invoiceNumber;

    private InvoiceType invoiceType;

    // Customer
    private Long customerId;

    // Dates
    private LocalDate invoiceDate;
    private LocalDate dueDate;
    private LocalDateTime invoiceSentAt;

    // Amounts
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal taxAmount;
    private BigDecimal shippingAmount;
    private BigDecimal grandTotal;

    // Sales Person
    private Long salesPersonId;

    // Company
    private Long companyId;

    // Bank Account
    private Long bankAccountId;

    // Email Signature
    private Long emailSignatureId;

    // Currency
    private Long currencyId;
    private BigDecimal exchangeRate;

    // Status
    private InvoiceStatus status;

    // Notes
    private String notes;

    // Terms
    private String termsAndConditions;

    // Invoice Items
    @Builder.Default
    private List<InvoiceItemAuditSnapshot> invoiceItems =
            new ArrayList<>();
}

