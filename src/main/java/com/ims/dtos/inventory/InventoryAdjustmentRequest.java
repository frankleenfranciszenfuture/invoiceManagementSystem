package com.ims.dtos.inventory;


import com.ims.enums.InventoryMovementType;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryAdjustmentRequest {

    @NotNull(message = "Product is required.")
    private Long productId;

    @NotNull(message = "Warehouse is required.")
    private Long warehouseId;

    @NotNull(message = "Unit is required.")
    private Long unitId;

    private Long sizeId;

    @NotNull(message = "Adjustment movement type is required.")
    private InventoryMovementType movementType;

    @NotNull(message = "Adjustment quantity is required.")
    @DecimalMin(value = "0.0001", message = "Adjustment quantity must be greater than zero.")
    private BigDecimal quantity;

    @DecimalMin(value = "0.00", message = "Unit cost cannot be negative.")
    private BigDecimal unitCost;

    private LocalDateTime transactionDate;

    private String notes;
}