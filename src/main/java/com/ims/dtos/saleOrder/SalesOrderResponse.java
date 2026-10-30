package com.ims.dtos.saleOrder;

import com.ims.dtos.customer.CustomerResponse;
import com.ims.dtos.party.PartyResponse;
import com.ims.entity.CustomerEntity;
import com.ims.entity.PartyEntity;
import com.ims.enums.SaleOrderDiscountType;
import com.ims.enums.SaleOrderPartyType;
import com.ims.enums.SaleOrderStatus;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class SalesOrderResponse {

    private Long id;

    private String orderNo;

    private SaleOrderPartyType partyType;

    private CustomerResponse customer;

    private PartyResponse party;

    private Long warehouseId;
    private String warehouseName;

    private LocalDate orderDate;
    private LocalDate expectedDeliveryDate;

    private SaleOrderStatus salesOrderStatus;

    private String notes;

    private Long currencyId;
    private String currencyCode;
    private String currencyName;
    private String currencySymbol;

    private BigDecimal exchangeRate;

    // Order discount
    private SaleOrderDiscountType discountType;
    private BigDecimal discountValue;

    // Financial summary in selected currency
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal taxableAmount;

    private BigDecimal cgstAmount;
    private BigDecimal sgstAmount;
    private BigDecimal igstAmount;

    private BigDecimal totalTaxAmount;
    private BigDecimal grandTotal;

    // Financial summary in INR
    private BigDecimal baseSubtotal;
    private BigDecimal baseDiscountAmount;
    private BigDecimal baseTaxableAmount;

    private BigDecimal baseTotalTaxAmount;
    private BigDecimal baseGrandTotal;

    private List<SalesOrderItemResponse> items;
}