package com.ims.dtos.audit.enityAuditSnapShot;


import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class PurchaseOrderGoodsReceiptAuditSnapshot {

    private Long id;
    private String receiptNo;

    private Long purchaseOrderId;
    private String purchaseOrderNo;

    private Long warehouseId;
    private String warehouseName;
    private String warehouseCode;

    private LocalDate receiptDate;
    private String notes;

    private List<PurchaseOrderGoodsReceiptItemAuditSnapshot> items;

    private Boolean active;
}

