package com.ims.dtos.audit.enityAuditSnapShot;


import com.ims.enums.SaleOrderDiscountType;
import com.ims.enums.SaleOrderPartyType;
import com.ims.enums.SaleOrderStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesOrderAuditSnapshot {

    private Long id;

    private String orderNo;

    private SaleOrderPartyType partyType;

    // CUSTOMER
    private Long customerId;
    private String customerName;

    // PARTY
    private Long partyId;
    private String partyName;

    // WAREHOUSE
    private Long warehouseId;
    private String warehouseName;

    // DATES
    private LocalDate orderDate;
    private LocalDate expectedDeliveryDate;

    // STATUS
    private SaleOrderStatus salesOrderStatus;

    private String notes;

    // CURRENCY
    private Long currencyId;
    private String currencyCode;
    private String currencyName;
    private String currencySymbol;

    private BigDecimal exchangeRate;

    // DISCOUNT
    private SaleOrderDiscountType discountType;
    private BigDecimal discountValue;

    // SELECTED CURRENCY FINANCIAL SUMMARY
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal shippingAmount;
    private BigDecimal taxableAmount;

    private BigDecimal cgstAmount;
    private BigDecimal sgstAmount;
    private BigDecimal igstAmount;

    private BigDecimal totalTaxAmount;
    private BigDecimal grandTotal;

    // INR FINANCIAL SUMMARY
    private BigDecimal baseSubtotal;
    private BigDecimal baseDiscountAmount;
    private BigDecimal baseTaxableAmount;

    private BigDecimal baseTotalTaxAmount;
    private BigDecimal baseGrandTotal;

    // ITEMS
    private List<SalesOrderItemAuditSnapshot> items;

    private Boolean active;
}
