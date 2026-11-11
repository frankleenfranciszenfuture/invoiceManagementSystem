package com.ims.dtos.audit.enityAuditSnapShot;



import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceItemAuditSnapshot {

    private Long id;

    // Product
    private Long productId;

    // Description
    private String description;

    // Base Unit Price
    private BigDecimal baseUnitPrice;

    // Unit
    private Long unitId;

    // Size
    private Long sizeId;

    // Quantity
    private BigDecimal quantity;

    // Unit Price
    private BigDecimal unitPrice;

    // Amounts
    private BigDecimal grossAmount;
    private BigDecimal discountAmount;
    private BigDecimal taxableAmount;

    // Tax Master
    private Long taxMasterId;

    // Tax Percentages
    private BigDecimal taxPercentage;
    private BigDecimal cgstPercentage;
    private BigDecimal sgstPercentage;
    private BigDecimal igstPercentage;

    // Tax Amounts
    private BigDecimal cgstAmount;
    private BigDecimal sgstAmount;
    private BigDecimal igstAmount;
    private BigDecimal taxAmount;

    // Total
    private BigDecimal totalAmount;
}

