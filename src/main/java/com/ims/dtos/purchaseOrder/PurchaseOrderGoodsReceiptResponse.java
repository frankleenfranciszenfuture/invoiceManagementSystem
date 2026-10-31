package com.ims.dtos.purchaseOrder;


import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderGoodsReceiptResponse {

    private Long purchaseOrderId;

    private String orderNo;

    private LocalDate receiptDate;

    private String message;

    private List<PurchaseOrderItemResponse> items;

    private PurchaseOrderResponse purchaseOrder;
}