package com.ims.dtos.audit.enityAuditSnapShot;

import com.ims.enums.PurchaseOrderStatus;
import com.ims.enums.PurchaseOrderDiscountType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderAuditSnapshot {

    private Long id;
    private String orderNo;

    private Long partyId;
    private String supplierName;

    private Long warehouseId;
    private String warehouseName;

    private LocalDate orderDate;
    private LocalDate expectedDeliveryDate;

    private PurchaseOrderStatus purchaseOrderStatus;

    private String notes;

    private Long currencyId;
    private String currencyCode;
    private BigDecimal exchangeRate;

    private PurchaseOrderDiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal shippingAmount;

    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal taxableAmount;
    private BigDecimal cgstAmount;
    private BigDecimal sgstAmount;
    private BigDecimal igstAmount;
    private BigDecimal totalTaxAmount;
    private BigDecimal grandTotal;

    private BigDecimal baseSubtotal;
    private BigDecimal baseDiscountAmount;
    private BigDecimal baseTaxableAmount;
    private BigDecimal baseTotalTaxAmount;
    private BigDecimal baseGrandTotal;

    private BigDecimal receivedTotalAmount;
    private BigDecimal baseReceivedTotalAmount;

    private Boolean active;
}