package com.ims.dtos.invoice;

import com.ims.entity.SalesPersonEntity;
import com.ims.enums.InvoiceStatus;
import com.ims.enums.InvoiceType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceUpdateRequest {

    // =====================================================
    // INVOICE TYPE
    // =====================================================

    @NotNull(message = "Invoice type is required")
    private InvoiceType invoiceType;


    // =====================================================
    // CUSTOMER
    // =====================================================

    @NotNull(message = "Customer is required")
    private Long customerId;


    // =====================================================
    // DATES
    // =====================================================

    @NotNull(message = "Invoice date is required")
    private LocalDate invoiceDate;

    private LocalDate dueDate;


    // =====================================================
    // SHIPPING
    // =====================================================

    @Builder.Default
    private BigDecimal shippingAmount = BigDecimal.ZERO;


    // =====================================================
    // NOTES
    // =====================================================

    private String notes;


    // =====================================================
    // TERMS & CONDITIONS
    // =====================================================

    private String termsAndConditions;


    // =====================================================
    // SALES PERSON
    // =====================================================
    private Long salesPersonId;

// =====================================================
// CURRENCY
// =====================================================

    @NotNull(message = "Currency is required")
    private Long currencyId;


    // =====================================================
// COMPANY
// =====================================================


    private Long companyId;


    // =====================================================
    // BANK DETAILS
    // =====================================================
    private Long bankAccountId;


    // =====================================================
    // EMAIL SIGNATURE
    // =====================================================
    private Long emailSignatureId;

// =====================================================
// EXCHANGE RATE
// =====================================================

    private BigDecimal exchangeRate;

    // =====================================================
    // STATUS
    // =====================================================

    private InvoiceStatus invoiceStatus;


    // =====================================================
    // ITEMS
    // =====================================================

    @NotEmpty(message = "Invoice must contain at least one item")
    @Valid
    @Builder.Default
    private List<InvoiceItemRequest> invoiceItems =
            new ArrayList<>();
}