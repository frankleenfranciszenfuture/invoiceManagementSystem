package com.ims.dtos.audit.enityAuditSnapShot;



import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class PurchaseOrderGoodsReceiptItemAuditSnapshot {

    private Long id;

    private Long goodsReceiptId;
    private String receiptNo;

    private Long purchaseOrderItemId;
    private Long productId;
    private String productName;
    private String productCode;

    private BigDecimal receivedQuantity;
    private BigDecimal receivedUnitCost;
    private BigDecimal receivedTotalCost;

    private Boolean active;
}

