package com.ims.dtos.invoice;

import com.ims.dtos.common.BaseResponse;
import com.ims.enums.InvoiceStatus;
import com.ims.enums.InvoiceType;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class InvoiceResponse extends BaseResponse {

    // =====================================================
    // ID
    // =====================================================

    private Long id;


    // =====================================================
    // INVOICE NUMBER
    // =====================================================

    private String invoiceNumber;


    // =====================================================
    // INVOICE TYPE
    // =====================================================

    private InvoiceType invoiceType;


    // =====================================================
    // CUSTOMER
    // =====================================================

    private Long customerId;

    private String customerName;


    // =====================================================
    // DATES
    // =====================================================

    private LocalDate invoiceDate;

    private LocalDate dueDate;


    // =====================================================
    // AMOUNTS
    // =====================================================

    private BigDecimal subtotal;

    private BigDecimal discountAmount;

    private BigDecimal taxAmount;

    private BigDecimal shippingAmount;

    private BigDecimal grandTotal;


    // =====================================================
    // STATUS
    // =====================================================

    private InvoiceStatus status;


    // =====================================================
    // NOTES
    // =====================================================

    private String notes;


    // =====================================================
    // TERMS & CONDITIONS
    // =====================================================

    private String termsAndConditions;


    // =====================================================
    // ITEMS
    // =====================================================

    @Builder.Default
    private List<InvoiceItemResponse> invoiceItems =
            new ArrayList<>();
}