package com.ims.dtos.audit.enityAuditSnapShot;

import com.ims.enums.PurchaseOrderDiscountType;
import com.ims.enums.PurchaseOrderTaxType;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class PurchaseOrderItemAuditSnapshot {

    private Long id;

    private Long productId;
    private String productName;
    private String productCode;
    private String hsnCode;

    private String description;

    private Long unitId;
    private String unitName;
    private String unitShortName;

    private Long sizeId;
    private String sizeName;

    private BigDecimal quantity;
    private BigDecimal receivedQuantity;
    private BigDecimal pendingQuantity;

    private BigDecimal baseUnitPrice;
    private BigDecimal unitPrice;

    private BigDecimal lineAmount;
    private BigDecimal baseLineAmount;

    private PurchaseOrderDiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal discountAmount;
    private BigDecimal baseDiscountAmount;

    private Long taxMasterId;
    private String taxName;

    private PurchaseOrderTaxType taxType;
    private BigDecimal taxRate;

    private BigDecimal cgstRate;
    private BigDecimal sgstRate;
    private BigDecimal igstRate;

    private BigDecimal taxableAmount;
    private BigDecimal baseTaxableAmount;

    private BigDecimal cgstAmount;
    private BigDecimal sgstAmount;
    private BigDecimal igstAmount;

    private BigDecimal totalTaxAmount;
    private BigDecimal baseTotalTaxAmount;

    private BigDecimal totalAmount;
    private BigDecimal baseTotalAmount;

    private Boolean active;
}

