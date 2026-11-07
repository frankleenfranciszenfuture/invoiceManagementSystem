package com.ims.dtos.dashbaord;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderSummaryResponse {

    // Sales Orders
    private Long totalSalesOrders;

    private Long draftSalesOrders;

    private Long confirmedSalesOrders;

    private Long completedSalesOrders;

    private Long cancelledSalesOrders;

    private BigDecimal salesOrderAmount;

    // Purchase Orders
    private Long totalPurchaseOrders;

    private Long draftPurchaseOrders;

    private Long confirmedPurchaseOrders;

    private Long receivedPurchaseOrders;

    private Long cancelledPurchaseOrders;

    private BigDecimal purchaseOrderAmount;

    // Goods Receipts
    private Long totalGoodsReceipts;

    private Long pendingGoodsReceipts;

    private Long completedGoodsReceipts;
}

