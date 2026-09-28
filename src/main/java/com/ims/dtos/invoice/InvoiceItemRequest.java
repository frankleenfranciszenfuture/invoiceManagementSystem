package com.ims.dtos.invoice;


import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class InvoiceItemRequest {

    // =====================================================
    // PRODUCT
    // =====================================================

    @NotNull(message = "Product is required")
    private Long productId;


    // =====================================================
    // DESCRIPTION
    // =====================================================

    private String description;


    // =====================================================
    // UNIT
    // =====================================================

    private Long unitId;


    // =====================================================
    // SIZE
    // =====================================================

    private Long sizeId;


    // =====================================================
    // QUANTITY
    // =====================================================

    @NotNull(message = "Quantity is required")
    @DecimalMin(
            value = "0.001",
            message = "Quantity must be greater than 0"
    )
    private BigDecimal quantity;


    // =====================================================
    // UNIT PRICE
    // =====================================================

    @NotNull(message = "Unit price is required")
    @DecimalMin(
            value = "0.00",
            message = "Unit price cannot be negative"
    )
    private BigDecimal unitPrice;


    // =====================================================
    // DISCOUNT
    // =====================================================

    @DecimalMin(
            value = "0.00",
            message = "Discount cannot be negative"
    )
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;


    // =====================================================
    // TAX
    // =====================================================

    private Long taxMasterId;
}