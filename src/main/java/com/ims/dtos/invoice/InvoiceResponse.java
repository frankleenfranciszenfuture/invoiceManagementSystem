package com.ims.dtos.invoice;

import com.ims.dtos.common.BaseResponse;
import com.ims.entity.Currency;
import com.ims.entity.ExchangeRate;
import com.ims.entity.SalesPersonEntity;
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


    private Long salesPersonId;
    private String salesPersonName;


    private Long companyId;
    private String companyName;
    private String companyCode;


    private Long bankAccountId;
    private String accountNumber;
    private String bankName;
    private String ifsc;

    private Long emailSignatureId;
    private Long userId;
    private String signatureName;
    private String signatureContent;
    private boolean defaultForNewMessages;
    private boolean defaultForReplies;

    // =====================================================
    // CURRENCY
    // =====================================================

    private Long currencyId;
    private String currencyName;

    private String currencyCode;

    private String logo;

    // =====================================================
    // EXCHANGE RATE
    // =====================================================

    private BigDecimal exchangeRate;

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