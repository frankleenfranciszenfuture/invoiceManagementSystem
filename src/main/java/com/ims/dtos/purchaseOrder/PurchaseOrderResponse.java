package com.ims.dtos.purchaseOrder;

import com.ims.dtos.customer.CustomerResponse;
import com.ims.dtos.party.PartyResponse;
import com.ims.enums.PurchaseOrderDiscountType;
import com.ims.enums.PurchaseOrderPartyType;
import com.ims.enums.PurchaseOrderStatus;

import com.ims.enums.SaleOrderPartyType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderResponse {

    private Long id;

    private String orderNo;

    private PurchaseOrderPartyType partyType;

    private CustomerResponse customer;

    private PartyResponse party;

    private Long warehouseId;
    private String warehouseName;

    private LocalDate orderDate;
    private LocalDate expectedDeliveryDate;

    private PurchaseOrderStatus purchaseOrderStatus;

    private String notes;

    // Currency
    private Long currencyId;
    private String currencyCode;
    private String currencyName;
    private String currencySymbol;
    private BigDecimal exchangeRate;

    // Discount
    private PurchaseOrderDiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal shippingAmount;
    // Selected currency totals
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal taxableAmount;
    private BigDecimal cgstAmount;
    private BigDecimal sgstAmount;
    private BigDecimal igstAmount;
    private BigDecimal totalTaxAmount;
    private BigDecimal grandTotal;

    // INR totals
    private BigDecimal baseSubtotal;
    private BigDecimal baseDiscountAmount;
    private BigDecimal baseTaxableAmount;
    private BigDecimal baseTotalTaxAmount;
    private BigDecimal baseGrandTotal;

    // Goods receipt totals
    private BigDecimal receivedTotalAmount;
    private BigDecimal baseReceivedTotalAmount;

    private List<PurchaseOrderItemResponse> items;
}