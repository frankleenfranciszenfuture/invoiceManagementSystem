package com.ims.dtos.dashbaord;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DashboardKpiResponse {

    private BigDecimal totalSales;
    private BigDecimal salesGrowthPercentage;

    private BigDecimal totalPurchases;
    private BigDecimal purchaseGrowthPercentage;

    private BigDecimal totalExpenses;

    private BigDecimal totalReceivables;
    private BigDecimal overdueReceivables;

    private BigDecimal totalPayables;
    private BigDecimal overduePayables;
}