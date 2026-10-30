package com.ims.dtos.inventory;

import lombok.*;

import org.springframework.data.domain.Page;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryDashboardResponse {

    private Summary summary;

    private StockMovement stockMovement;

    private List<MovementChart> movementChart;

    private TransactionSummary transactionSummary;

    private Page<InventoryTransactionResponse> recentTransactions;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Summary {

        private Long totalProducts;
        private Long totalWarehouses;
        private Long totalStockItems;

        private BigDecimal totalStockQuantity;
        private BigDecimal totalAvailableQuantity;
        private BigDecimal totalReservedQuantity;

        private Long lowStockItems;
        private Long outOfStockItems;

        private BigDecimal totalStockValue;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StockMovement {

        private BigDecimal totalStockIn;
        private BigDecimal totalStockOut;
        private BigDecimal netMovement;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MovementChart {

        private LocalDate date;
        private BigDecimal stockIn;
        private BigDecimal stockOut;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransactionSummary {

        private Long totalTransactions;
        private Long openingStock;
        private Long stockAdjustmentIn;
        private Long stockAdjustmentOut;
        private Long sales;
    }
}
