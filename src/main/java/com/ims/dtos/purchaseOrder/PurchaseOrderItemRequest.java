package com.ims.dtos.purchaseOrder;


import com.ims.enums.PurchaseOrderDiscountType;
import jakarta.validation.constraints.*;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderItemRequest {

    @NotNull(message = "Product is required.")
    private Long productId;

    private String description;

    @NotNull(message = "Unit is required.")
    private Long unitId;

    private Long sizeId;

    @NotNull(message = "Quantity is required.")
    @DecimalMin(value = "0.001", message = "Quantity must be greater than zero.")
    private BigDecimal quantity;

    /**
     * Base unit price in INR.
     */
    @NotNull(message = "Base unit price in INR is required.")
    @DecimalMin(value = "0.00", message = "Base unit price cannot be negative.")
    private BigDecimal baseUnitPrice;

    private PurchaseOrderDiscountType discountType;

    @DecimalMin(value = "0.00", message = "Discount value cannot be negative.")
    @Builder.Default
    private BigDecimal discountValue = BigDecimal.ZERO;

    private Long taxMasterId;
}
