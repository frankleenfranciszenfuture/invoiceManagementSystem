package com.ims.dtos.audit.enityAuditSnapShot;


import com.ims.enums.SaleOrderDiscountType;
import com.ims.enums.SaleOrderTaxType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesOrderItemAuditSnapshot {

    private Long id;

    // PRODUCT
    private Long productId;
    private String productName;
    private String productCode;
    private String hsnCode;

    // DESCRIPTION
    private String description;

    // UNIT
    private Long unitId;
    private String unitName;
    private String unitShortName;

    // SIZE
    private Long sizeId;
    private String sizeName;

    // QUANTITY
    private BigDecimal quantity;

    // PRICE
    private BigDecimal baseUnitPrice;
    private BigDecimal unitPrice;

    // LINE AMOUNTS
    private BigDecimal lineAmount;
    private BigDecimal baseLineAmount;

    // DISCOUNT
    private SaleOrderDiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal discountAmount;
    private BigDecimal baseDiscountAmount;

    // TAX MASTER
    private Long taxMasterId;
    private String taxName;

    // TAX CONFIGURATION
    private SaleOrderTaxType taxType;
    private BigDecimal taxRate;
    private BigDecimal cgstRate;
    private BigDecimal sgstRate;
    private BigDecimal igstRate;

    // TAXABLE AMOUNTS
    private BigDecimal taxableAmount;
    private BigDecimal baseTaxableAmount;

    // TAX AMOUNTS
    private BigDecimal cgstAmount;
    private BigDecimal sgstAmount;
    private BigDecimal igstAmount;
    private BigDecimal totalTaxAmount;
    private BigDecimal baseTotalTaxAmount;

    // FINAL AMOUNTS
    private BigDecimal totalAmount;
    private BigDecimal baseTotalAmount;

    private Boolean active;
}

