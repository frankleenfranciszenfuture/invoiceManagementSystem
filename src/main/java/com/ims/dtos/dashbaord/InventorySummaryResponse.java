package com.ims.dtos.dashbaord;


import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventorySummaryResponse {

    private Long totalProducts;
    private Long totalWarehouses;
    private Long totalStockItems;

    private BigDecimal totalStockQuantity;
    private BigDecimal totalAvailableQuantity;
    private BigDecimal totalReservedQuantity;

    private Long lowStockProducts;
    private Long outOfStockProducts;

    private BigDecimal totalInventoryValue;
}
