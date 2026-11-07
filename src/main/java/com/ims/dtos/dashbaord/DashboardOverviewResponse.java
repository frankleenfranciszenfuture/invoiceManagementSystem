package com.ims.dtos.dashbaord;


import com.ims.dtos.common.BaseResponse;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DashboardOverviewResponse {

    private String period;

    private LocalDateTime generatedAt;

    private DashboardKpiResponse kpis;

    private List<SalesPurchaseTrendResponse> salesPurchaseTrend;

    private ReceivablePayableResponse receivablePayable;

    private List<CustomerGrowthResponse> customerGrowth;

    private List<ExpenseSummaryResponse> topExpenses;

    private BusinessSummaryResponse businessSummary;

    private List<RecentInvoiceResponse> recentInvoices;

    private List<PendingApprovalResponse> pendingApprovals;

    private OrderSummaryResponse orderSummary;

    private PaymentSummaryResponse paymentSummary;

    private BankCashSummaryResponse bankCashSummary;

    private InventorySummaryResponse inventorySummary;

    private List<RecentTransactionResponse> recentTransactions;
}
