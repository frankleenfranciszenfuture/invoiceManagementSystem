package com.ims.dtos.purchaseOrder;


import com.ims.dtos.common.BaseResponse;
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
public class PurchaseOrderItemResponse extends BaseResponse {

    private Long id;

    private Long productId;
    private String productName;
    private String hsnCode;

    private String description;

    private Long unitId;
    private String unitName;

    private Long sizeId;
    private String sizeName;

    private BigDecimal quantity;
    private BigDecimal receivedQuantity;
    private BigDecimal pendingQuantity;

    private BigDecimal baseUnitPrice;
    private BigDecimal unitPrice;

    private BigDecimal grossAmount;

    private PurchaseOrderDiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal discountAmount;

    private BigDecimal taxableAmount;

    private Long taxMasterId;
    private String taxName;

    private PurchaseOrderTaxType taxType;

    private BigDecimal taxPercentage;
    private BigDecimal cgstPercentage;
    private BigDecimal sgstPercentage;
    private BigDecimal igstPercentage;

    private BigDecimal cgstAmount;
    private BigDecimal sgstAmount;
    private BigDecimal igstAmount;

    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
}
