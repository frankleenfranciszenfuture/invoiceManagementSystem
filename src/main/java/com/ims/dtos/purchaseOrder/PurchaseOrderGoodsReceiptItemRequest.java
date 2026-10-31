package com.ims.dtos.purchaseOrder;


import jakarta.validation.constraints.*;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderGoodsReceiptItemRequest {

    @NotNull(message = "Purchase Order item ID is required.")
    private Long purchaseOrderItemId;

    @NotNull(message = "Received quantity is required.")
    @DecimalMin(
            value = "0.001",
            message = "Received quantity must be greater than zero."
    )
    private BigDecimal receivedQuantity;

    /**
     * Optional actual unit cost in INR.
     * If omitted, the Purchase Order item's base unit price is used.
     */
    @DecimalMin(
            value = "0.00",
            message = "Received unit cost cannot be negative."
    )
    private BigDecimal receivedUnitCost;
}