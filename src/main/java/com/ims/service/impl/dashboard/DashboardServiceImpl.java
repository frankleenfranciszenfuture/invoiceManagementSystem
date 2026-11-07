
package com.ims.service.impl.dashboard;

import com.ims.common.ApiResponse;

import com.ims.dtos.dashbaord.*;
import com.ims.dtos.exchange.ExchangeRateResponseDTO;
import com.ims.dtos.inventory.InventoryDashboardFilter;
import com.ims.dtos.inventory.InventoryDashboardResponse;

import com.ims.entity.*;
import com.ims.entity.Currency;

import com.ims.enums.ExpenseStatus;
import com.ims.enums.InvoiceStatus;
import com.ims.enums.PaymentStatus;
import com.ims.enums.PaymentType;

import com.ims.repository.*;
import com.ims.repository.dashbaord.*;

import com.ims.service.serviceInterface.currency.ExchangeRateService;
import com.ims.service.serviceInterface.dashboard.*;
import com.ims.service.serviceInterface.inventory.InventoryService;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

import java.time.*;
import java.time.temporal.ChronoUnit;

import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final DashboardSalesOrderRepository salesOrderRepository;
    private final DashboardPurchaseOrderRepository purchaseOrderRepository;
    private final DashboardPaymentRepository paymentRepository;
    private final DashboardPartyRepository partyRepository;
    private final DashboardCustomerRepository customerRepository;

    private final InventoryService inventoryDashboardService;

    private final InvoiceRepository invoiceRepository;
    private final ExpenseRepository expenseRepository;

    // Bank and cash repositories
    private final BankAccountRepository bankAccountRepository;
    private final CashAccountRepository cashAccountRepository;
    private final BankTransactionRepository bankTransactionRepository;
    private final CashBookTransactionRepository cashBookTransactionRepository;

    // Currency repositories and service
    private final CurrencyRepository currencyRepository;
    private final ExchangeRateService exchangeRateService;

    private static final BigDecimal ZERO = BigDecimal.ZERO;

    private static final BigDecimal ONE_HUNDRED =
            new BigDecimal("100");

    private static final int MONEY_SCALE = 2;

    private static final int RECENT_TRANSACTION_LIMIT = 20;

    // =========================================================
    // MAIN DASHBOARD
    // =========================================================

    @Override
    public DashboardOverviewResponse getDashboard(
            DashboardFilterRequest request
    ) {

        DateRange currentRange = resolveDateRange(request);

        DateRange previousRange = getPreviousPeriod(currentRange);

        DashboardOverviewResponse response =
                new DashboardOverviewResponse();

        response.setPeriod(
                request != null && request.getPeriod() != null
                        ? request.getPeriod()
                        : "LAST_30_DAYS"
        );

        response.setGeneratedAt(LocalDateTime.now());

        // KPI SUMMARY
        response.setKpis(
                buildKpis(currentRange, previousRange)
        );

        // SALES AND PURCHASE TREND
        response.setSalesPurchaseTrend(
                buildSalesPurchaseTrend(currentRange)
        );

        // RECEIVABLES AND PAYABLES
        response.setReceivablePayable(
                buildReceivablePayable()
        );

        // INVENTORY SUMMARY - CALCULATE ONLY ONCE
        InventorySummaryResponse inventorySummary =
                buildInventorySummary(currentRange);

        response.setInventorySummary(inventorySummary);

        // BUSINESS SUMMARY
        List<PendingApprovalResponse> pendingApprovals =
                buildPendingApprovals();

        response.setPendingApprovals(pendingApprovals);

        response.setBusinessSummary(
                buildBusinessSummary(inventorySummary, pendingApprovals.size())
        );

        // ORDER SUMMARY
        response.setOrderSummary(
                buildOrderSummary(currentRange)
        );

        // PAYMENT SUMMARY
        response.setPaymentSummary(
                buildPaymentSummary(currentRange)
        );

        // BANK AND CASH SUMMARY
        response.setBankCashSummary(
                buildBankCashSummary()
        );

        // CUSTOMER GROWTH
        response.setCustomerGrowth(
                buildCustomerGrowth(currentRange)
        );

        // TOP EXPENSES
        response.setTopExpenses(
                buildTopExpenses(currentRange)
        );

        // RECENT INVOICES
        response.setRecentInvoices(
                buildRecentInvoices()
        );

        // PENDING APPROVALS
        response.setPendingApprovals(buildPendingApprovals());

        // RECENT TRANSACTIONS
        response.setRecentTransactions(
                buildRecentTransactions(currentRange)
        );

        return response;
    }

    // =========================================================
    // KPI SUMMARY
    // =========================================================

    private DashboardKpiResponse buildKpis(
            DateRange currentRange,
            DateRange previousRange
    ) {

        BigDecimal currentSales = safeAmount(
                salesOrderRepository.getTotalSalesInr(
                        currentRange.fromDate(),
                        currentRange.toDate()
                )
        );

        BigDecimal previousSales = safeAmount(
                salesOrderRepository.getTotalSalesInr(
                        previousRange.fromDate(),
                        previousRange.toDate()
                )
        );

        BigDecimal currentPurchases = safeAmount(
                purchaseOrderRepository.getTotalPurchasesInr(
                        currentRange.fromDate(),
                        currentRange.toDate()
                )
        );

        BigDecimal previousPurchases = safeAmount(
                purchaseOrderRepository.getTotalPurchasesInr(
                        previousRange.fromDate(),
                        previousRange.toDate()
                )
        );

        BigDecimal receivables = safeAmount(
                partyRepository.getTotalOutstandingReceivables()
        );

        BigDecimal payables = safeAmount(
                partyRepository.getTotalOutstandingPayables()
        );

        BigDecimal totalExpenses =
                buildTotalExpenses(currentRange);

        DashboardKpiResponse response =
                new DashboardKpiResponse();

        response.setTotalSales(currentSales);

        response.setSalesGrowthPercentage(
                calculateGrowth(currentSales, previousSales)
        );

        response.setTotalPurchases(currentPurchases);

        response.setPurchaseGrowthPercentage(
                calculateGrowth(currentPurchases, previousPurchases)
        );

        response.setTotalExpenses(totalExpenses);

        response.setTotalReceivables(receivables);

        response.setTotalPayables(payables);

        // Requires invoice and purchase due-date aggregation.
        response.setOverdueReceivables(ZERO);

        response.setOverduePayables(ZERO);

        return response;
    }

    // =========================================================
    // TOTAL EXPENSES
    // =========================================================

    private BigDecimal buildTotalExpenses(DateRange range) {

        BigDecimal total = expenseRepository
                .calculateDashboardTotalExpenses(
                        range.fromDate(),
                        range.toDate(),
                        ExpenseStatus.APPROVED
                );

        return safeAmount(total);
    }

    // =========================================================
    // TOP EXPENSES
    // =========================================================

    private List<ExpenseSummaryResponse> buildTopExpenses(
            DateRange range
    ) {

        return expenseRepository.findDashboardTopExpenses(
                range.fromDate(),
                range.toDate(),
                ExpenseStatus.APPROVED
        ).stream().map(item -> {

            ExpenseSummaryResponse response =
                    new ExpenseSummaryResponse();

            response.setExpenseCategoryId(
                    item.getExpenseCategoryId()
            );

            response.setCategoryName(
                    item.getCategoryName()
            );

            response.setAmount(
                    safeAmount(item.getAmount())
            );

            response.setTransactionCount(
                    item.getTransactionCount()
            );

            return response;

        }).toList();
    }

    // =========================================================
    // RECEIVABLES & PAYABLES
    // =========================================================

    private ReceivablePayableResponse buildReceivablePayable() {

        BigDecimal receivables = safeAmount(
                partyRepository.getTotalOutstandingReceivables()
        );

        BigDecimal payables = safeAmount(
                partyRepository.getTotalOutstandingPayables()
        );

        ReceivablePayableResponse response =
                new ReceivablePayableResponse();

        response.setReceivables(receivables);

        response.setPayables(payables);

        response.setOverdueReceivables(ZERO);

        response.setOverduePayables(ZERO);

        return response;
    }

    // =========================================================
    // SALES & PURCHASE TREND
    // =========================================================

    private List<SalesPurchaseTrendResponse> buildSalesPurchaseTrend(
            DateRange range
    ) {

        Map<YearMonth, SalesPurchaseTrendResponse> trendMap =
                new TreeMap<>();

        List<DashboardMonthlyTrendProjection> sales =
                salesOrderRepository.getMonthlySalesTrend(
                        range.fromDate(),
                        range.toDate()
                );

        List<DashboardMonthlyTrendProjection> purchases =
                purchaseOrderRepository.getMonthlyPurchaseTrend(
                        range.fromDate(),
                        range.toDate()
                );

        YearMonth start = YearMonth.from(range.fromDate());

        YearMonth end = YearMonth.from(range.toDate());

        // Initialise every month in the requested range.
        for (
                YearMonth month = start;
                !month.isAfter(end);
                month = month.plusMonths(1)
        ) {

            SalesPurchaseTrendResponse item =
                    new SalesPurchaseTrendResponse();

            item.setYear(month.getYear());

            item.setMonth(month.getMonth().name());

            item.setSales(ZERO);

            item.setPurchases(ZERO);

            trendMap.put(month, item);
        }

        // Populate sales amounts.
        for (DashboardMonthlyTrendProjection item : sales) {

            YearMonth month = YearMonth.of(
                    item.getYear(),
                    item.getMonth()
            );

            SalesPurchaseTrendResponse trend =
                    trendMap.get(month);

            if (trend != null) {
                trend.setSales(safeAmount(item.getAmount()));
            }
        }

        // Populate purchase amounts.
        for (DashboardMonthlyTrendProjection item : purchases) {

            YearMonth month = YearMonth.of(
                    item.getYear(),
                    item.getMonth()
            );

            SalesPurchaseTrendResponse trend =
                    trendMap.get(month);

            if (trend != null) {
                trend.setPurchases(safeAmount(item.getAmount()));
            }
        }

        return new ArrayList<>(trendMap.values());
    }

    // =========================================================
    // ORDER SUMMARY
    // =========================================================

    private OrderSummaryResponse buildOrderSummary(
            DateRange range
    ) {

        OrderSummaryResponse response =
                new OrderSummaryResponse();

        List<DashboardStatusCountProjection> salesStatuses =
                salesOrderRepository.getSalesOrderStatusSummary(
                        range.fromDate(),
                        range.toDate()
                );

        List<DashboardStatusAmountProjection> salesAmounts =
                salesOrderRepository.getSalesOrderAmountSummary(
                        range.fromDate(),
                        range.toDate()
                );

        List<DashboardStatusCountProjection> purchaseStatuses =
                purchaseOrderRepository.getPurchaseOrderStatusSummary(
                        range.fromDate(),
                        range.toDate()
                );

        List<DashboardStatusAmountProjection> purchaseAmounts =
                purchaseOrderRepository.getPurchaseOrderAmountSummary(
                        range.fromDate(),
                        range.toDate()
                );

        long totalSalesOrders = 0;

        long draftSalesOrders = 0;

        long confirmedSalesOrders = 0;

        long completedSalesOrders = 0;

        long cancelledSalesOrders = 0;

        for (DashboardStatusCountProjection item : salesStatuses) {

            String status = normalizeStatus(item.getStatus());

            long count = safeCount(item.getCount());

            totalSalesOrders += count;

            if (isStatus(status, "DRAFT")) {

                draftSalesOrders += count;

            } else if (isStatus(status, "CONFIRMED")) {

                confirmedSalesOrders += count;

            } else if (isStatus(status, "COMPLETED", "FULFILLED")) {

                completedSalesOrders += count;

            } else if (isStatus(status, "CANCELLED", "CANCELED")) {

                cancelledSalesOrders += count;
            }
        }

        BigDecimal salesOrderAmount = ZERO;

        for (DashboardStatusAmountProjection item : salesAmounts) {

            salesOrderAmount = salesOrderAmount.add(
                    safeAmount(item.getAmount())
            );
        }

        long totalPurchaseOrders = 0;

        long draftPurchaseOrders = 0;

        long confirmedPurchaseOrders = 0;

        long receivedPurchaseOrders = 0;

        long cancelledPurchaseOrders = 0;

        for (DashboardStatusCountProjection item : purchaseStatuses) {

            String status = normalizeStatus(item.getStatus());

            long count = safeCount(item.getCount());

            totalPurchaseOrders += count;

            if (isStatus(status, "DRAFT")) {

                draftPurchaseOrders += count;

            } else if (isStatus(status, "CONFIRMED")) {

                confirmedPurchaseOrders += count;

            } else if (isStatus(status, "RECEIVED", "COMPLETED")) {

                receivedPurchaseOrders += count;

            } else if (isStatus(status, "CANCELLED", "CANCELED")) {

                cancelledPurchaseOrders += count;
            }
        }

        BigDecimal purchaseOrderAmount = ZERO;

        for (DashboardStatusAmountProjection item : purchaseAmounts) {

            purchaseOrderAmount = purchaseOrderAmount.add(
                    safeAmount(item.getAmount())
            );
        }

        response.setTotalSalesOrders(totalSalesOrders);

        response.setDraftSalesOrders(draftSalesOrders);

        response.setConfirmedSalesOrders(confirmedSalesOrders);

        response.setCompletedSalesOrders(completedSalesOrders);

        response.setCancelledSalesOrders(cancelledSalesOrders);

        response.setSalesOrderAmount(salesOrderAmount);

        response.setTotalPurchaseOrders(totalPurchaseOrders);

        response.setDraftPurchaseOrders(draftPurchaseOrders);

        response.setConfirmedPurchaseOrders(confirmedPurchaseOrders);

        response.setReceivedPurchaseOrders(receivedPurchaseOrders);

        response.setCancelledPurchaseOrders(cancelledPurchaseOrders);

        response.setPurchaseOrderAmount(purchaseOrderAmount);

        // Goods receipt aggregation repository not connected yet.
        response.setTotalGoodsReceipts(0L);

        response.setPendingGoodsReceipts(0L);

        response.setCompletedGoodsReceipts(0L);

        return response;
    }

    // =========================================================
    // PAYMENT SUMMARY
    // =========================================================

    private PaymentSummaryResponse buildPaymentSummary(
            DateRange range
    ) {

        PaymentSummaryResponse response =
                new PaymentSummaryResponse();

        List<DashboardPaymentProjection> paymentRows =
                paymentRepository.getPaymentSummary(
                        range.fromDate(),
                        range.toDate()
                );

        long totalPayments = 0;

        long completedPayments = 0;

        long pendingPayments = 0;

        long cancelledPayments = 0;

        long failedPayments = 0;

        long reversedPayments = 0;

        BigDecimal totalCollections = ZERO;

        BigDecimal totalPaymentsMade = ZERO;

        BigDecimal totalCashCollections = ZERO;

        BigDecimal totalBankCollections = ZERO;

        for (DashboardPaymentProjection item : paymentRows) {

            String direction = normalizeStatus(item.getDirection());

            String status = normalizeStatus(item.getStatus());

            String channel = normalizeStatus(item.getChannel());

            long count = safeCount(item.getCount());

            BigDecimal amount = safeAmount(item.getAmount());

            totalPayments += count;

            switch (status) {

                case "COMPLETED" ->
                        completedPayments += count;

                case "PENDING" ->
                        pendingPayments += count;

                case "CANCELLED", "CANCELED" ->
                        cancelledPayments += count;

                case "FAILED" ->
                        failedPayments += count;

                case "REVERSED" ->
                        reversedPayments += count;

                default -> {
                    // Ignore unknown statuses.
                }
            }

            // Only completed payments affect financial totals.
            if (!"COMPLETED".equals(status)) {
                continue;
            }

            // PARTY_CREDIT and OTHER channels are not actual
            // cash/bank movements.
            boolean isCash = "CASH".equals(channel);

            boolean isBank = "BANK".equals(channel);

            if (!isCash && !isBank) {
                continue;
            }

            if ("RECEIVED".equals(direction) ||
                    "IN".equals(direction)) {

                totalCollections =
                        totalCollections.add(amount);

                if (isCash) {

                    totalCashCollections =
                            totalCashCollections.add(amount);

                } else {

                    totalBankCollections =
                            totalBankCollections.add(amount);
                }

            } else if ("PAID".equals(direction) ||
                    "OUT".equals(direction)) {

                totalPaymentsMade =
                        totalPaymentsMade.add(amount);
            }
        }

        response.setTotalPayments(totalPayments);

        response.setCompletedPayments(completedPayments);

        response.setPendingPayments(pendingPayments);

        response.setCancelledPayments(cancelledPayments);

        response.setFailedPayments(failedPayments);

        response.setReversedPayments(reversedPayments);

        response.setTotalCollections(totalCollections);

        response.setTotalPaymentsMade(totalPaymentsMade);

        response.setTotalCashCollections(totalCashCollections);

        response.setTotalBankCollections(totalBankCollections);

        return response;
    }

    // =========================================================
    // BUSINESS SUMMARY
    // =========================================================

    private BusinessSummaryResponse buildBusinessSummary(
            InventorySummaryResponse inventorySummary,
            int pendingApprovalCount
    ) {
        BusinessSummaryResponse response = new BusinessSummaryResponse();

        response.setTotalCustomers(
                safeCount(customerRepository.countActiveCustomers())
        );

        response.setTotalParties(
                safeCount(partyRepository.countActiveParties())
        );

        response.setTotalInvoices(invoiceRepository.countByActiveTrue());

        response.setTotalProducts(inventorySummary != null
                ? safeCount(inventorySummary.getTotalProducts()) : 0L);

        response.setTotalWarehouses(inventorySummary != null
                ? safeCount(inventorySummary.getTotalWarehouses()) : 0L);

        response.setTotalPendingApprovals((long) pendingApprovalCount);

        return response;
    }
    // =========================================================
    // CUSTOMER GROWTH
    // =========================================================

    private List<CustomerGrowthResponse> buildCustomerGrowth(
            DateRange range
    ) {
        LocalDateTime fromDate = range.fromDate().atStartOfDay();
        LocalDateTime toDate = range.toDate().atTime(LocalTime.MAX);

        return customerRepository
                .getMonthlyCustomerGrowth(fromDate, toDate)
                .stream()
                .map(item -> {
                    CustomerGrowthResponse response =
                            new CustomerGrowthResponse();

                    response.setMonth(
                            Month.of(item.getMonth()).name()
                    );

                    response.setYear(item.getYear());

                    response.setCustomers(item.getCustomers());

                    return response;
                })
                .toList();
    }

    // =========================================================
    // RECENT FIVE INVOICES
    // =========================================================

    private List<RecentInvoiceResponse> buildRecentInvoices() {

        List<InvoiceEntity> invoices =
                invoiceRepository.findTop5ByActiveTrueOrderByCreatedAtDesc();

        return invoices.stream().map(invoice -> {

            BigDecimal totalAmount =
                    safeAmount(invoice.getGrandTotal());

            BigDecimal paidAmount = safeAmount(
                    paymentRepository.calculateCompletedPaymentAmount(
                            PaymentType.INVOICE,
                            invoice.getId(),
                            PaymentStatus.COMPLETED
                    )
            );

            // Paid amount must not exceed invoice total.
            paidAmount = paidAmount.min(totalAmount);

            BigDecimal balanceAmount = totalAmount
                    .subtract(paidAmount)
                    .max(ZERO);

            RecentInvoiceResponse response =
                    new RecentInvoiceResponse();

            response.setId(invoice.getId());

            response.setInvoiceNumber(
                    invoice.getInvoiceNumber()
            );

            response.setCustomerName(
                    invoice.getCustomer() != null
                            ? invoice.getCustomer().getDisplayName()
                            : null
            );

            response.setInvoiceDate(
                    invoice.getInvoiceDate()
            );

            response.setDueDate(
                    invoice.getDueDate()
            );

            response.setTotalAmount(totalAmount);

            response.setPaidAmount(paidAmount);

            response.setBalanceAmount(balanceAmount);

            response.setStatus(
                    invoice.getStatus() != null
                            ? invoice.getStatus().name()
                            : null
            );

            return response;

        }).toList();
    }

    // =========================================================
    // BANK & CASH SUMMARY
    // ALL BALANCES ARE CONVERTED TO INR
    // =========================================================

    private BankCashSummaryResponse buildBankCashSummary() {

        BankCashSummaryResponse response =
                new BankCashSummaryResponse();

        LocalDate conversionDate = LocalDate.now();

        Currency inrCurrency = currencyRepository
                .findByCurrencyCodeIgnoreCase("INR")
                .orElseThrow(() ->
                        new IllegalStateException(
                                "INR currency is not configured."
                        )
                );

        Long inrCurrencyId = inrCurrency.getId();

        // Cache exchange rates during this dashboard request.
        Map<String, BigDecimal> exchangeRateCache =
                new HashMap<>();

        // BANK ACCOUNTS
        List<BankAccount> bankAccounts =
                bankAccountRepository.findAll();

        BigDecimal totalBankBalance = ZERO;

        long totalBankAccounts = 0L;

        for (BankAccount account : bankAccounts) {

            if (!isActiveBankAccount(account)) {
                continue;
            }

            totalBankAccounts++;

            BigDecimal balance =
                    safeAmount(account.getCurrentBalance());

            BigDecimal inrBalance =
                    convertAccountBalanceToInr(
                            balance,
                            account.getCurrency(),
                            inrCurrencyId,
                            conversionDate,
                            exchangeRateCache
                    );

            totalBankBalance =
                    totalBankBalance.add(inrBalance);
        }

        // CASH ACCOUNTS
        List<CashAccountEntity> cashAccounts =
                cashAccountRepository.findAll();

        BigDecimal totalCashBalance = ZERO;

        long totalCashAccounts = 0L;

        for (CashAccountEntity account : cashAccounts) {

            if (!isActiveCashAccount(account)) {
                continue;
            }

            totalCashAccounts++;

            BigDecimal balance =
                    safeAmount(account.getCurrentBalance());

            BigDecimal inrBalance =
                    convertAccountBalanceToInr(
                            balance,
                            account.getCurrency(),
                            inrCurrencyId,
                            conversionDate,
                            exchangeRateCache
                    );

            totalCashBalance =
                    totalCashBalance.add(inrBalance);
        }

        // RESPONSE
        totalBankBalance = totalBankBalance.setScale(
                MONEY_SCALE,
                RoundingMode.HALF_UP
        );

        totalCashBalance = totalCashBalance.setScale(
                MONEY_SCALE,
                RoundingMode.HALF_UP
        );

        response.setTotalBankBalance(totalBankBalance);

        response.setTotalCashBalance(totalCashBalance);

        response.setTotalAvailableBalance(
                totalBankBalance
                        .add(totalCashBalance)
                        .setScale(
                                MONEY_SCALE,
                                RoundingMode.HALF_UP
                        )
        );

        response.setTotalBankAccounts(totalBankAccounts);

        response.setTotalCashAccounts(totalCashAccounts);

        return response;
    }

    // =========================================================
    // ACCOUNT ACTIVE CHECKS
    // =========================================================

    private boolean isActiveBankAccount(BankAccount account) {

        if (account == null) {
            return false;
        }

        if (!Boolean.TRUE.equals(account.getActive())) {
            return false;
        }

        return account.getStatus() != null
                && "ACTIVE".equalsIgnoreCase(
                account.getStatus().toString()
        );
    }

    private boolean isActiveCashAccount(
            CashAccountEntity account
    ) {

        if (account == null) {
            return false;
        }

        return Boolean.TRUE.equals(account.getActive())
                && account.getStatus() != null
                && "ACTIVE".equalsIgnoreCase(
                account.getStatus()
        );
    }

    // =========================================================
    // ACCOUNT BALANCE CONVERSION
    // =========================================================

    private BigDecimal convertAccountBalanceToInr(
            BigDecimal balance,
            String currencyCode,
            Long inrCurrencyId,
            LocalDate conversionDate,
            Map<String, BigDecimal> exchangeRateCache
    ) {

        balance = safeAmount(balance);

        if (balance.compareTo(ZERO) == 0) {
            return ZERO;
        }

        if (currencyCode == null || currencyCode.isBlank()) {

            throw new IllegalStateException(
                    "Account currency is missing."
            );
        }

        String normalizedCurrency =
                currencyCode.trim().toUpperCase(Locale.ROOT);

        if ("INR".equals(normalizedCurrency)) {

            return balance.setScale(
                    MONEY_SCALE,
                    RoundingMode.HALF_UP
            );
        }

        BigDecimal exchangeRate =
                exchangeRateCache.get(normalizedCurrency);

        if (exchangeRate == null) {

            Currency sourceCurrency = currencyRepository
                    .findByCurrencyCodeIgnoreCase(normalizedCurrency)
                    .orElseThrow(() ->
                            new IllegalStateException(
                                    "Currency not found: " +
                                            normalizedCurrency
                            )
                    );

            ApiResponse<ExchangeRateResponseDTO> rateResponse =
                    exchangeRateService.getRate(
                            sourceCurrency.getId(),
                            inrCurrencyId,
                            conversionDate
                    );

            if (rateResponse == null ||
                    rateResponse.getData() == null ||
                    rateResponse.getData().getRate() == null) {

                throw new IllegalStateException(
                        "Unable to retrieve exchange rate for " +
                                normalizedCurrency + " to INR."
                );
            }

            exchangeRate = rateResponse.getData().getRate();

            if (exchangeRate.compareTo(ZERO) <= 0) {

                throw new IllegalStateException(
                        "Invalid exchange rate for currency: " +
                                normalizedCurrency
                );
            }

            exchangeRateCache.put(
                    normalizedCurrency,
                    exchangeRate
            );
        }

        return balance
                .multiply(exchangeRate)
                .setScale(
                        MONEY_SCALE,
                        RoundingMode.HALF_UP
                );
    }

    // =========================================================
    // RECENT BANK & CASH TRANSACTIONS
    // =========================================================

    private List<RecentTransactionResponse> buildRecentTransactions(
            DateRange range
    ) {

        Pageable pageable = PageRequest.of(
                0,
                RECENT_TRANSACTION_LIMIT,
                Sort.by(
                        Sort.Order.desc("transactionDate"),
                        Sort.Order.desc("id")
                )
        );

        List<RecentTransactionResponse> transactions =
                new ArrayList<>();

        // BANK TRANSACTIONS
        Specification<BankTransactionEntity> bankSpecification =
                (root, query, cb) -> cb.and(
                        cb.isTrue(root.get("active")),
                        cb.isTrue(
                                root.get("bankAccount").get("active")
                        ),
                        cb.between(
                                root.get("transactionDate"),
                                range.fromDate(),
                                range.toDate()
                        )
                );

        Page<BankTransactionEntity> bankPage =
                bankTransactionRepository.findAll(
                        bankSpecification,
                        pageable
                );

        for (BankTransactionEntity transaction :
                bankPage.getContent()) {

            if (!isActiveBankAccount(
                    transaction.getBankAccount()
            )) {
                continue;
            }

            transactions.add(
                    mapBankTransaction(transaction)
            );
        }

        // CASH TRANSACTIONS
        Specification<CashBookTransactionEntity> cashSpecification =
                (root, query, cb) -> cb.and(
                        cb.isTrue(root.get("active")),
                        cb.isTrue(
                                root.get("cashAccount").get("active")
                        ),
                        cb.equal(
                                root.get("cashAccount").get("status"),
                                "ACTIVE"
                        ),
                        cb.between(
                                root.get("transactionDate"),
                                range.fromDate(),
                                range.toDate()
                        )
                );

        Page<CashBookTransactionEntity> cashPage =
                cashBookTransactionRepository.findAll(
                        cashSpecification,
                        pageable
                );

        for (CashBookTransactionEntity transaction :
                cashPage.getContent()) {

            if (!isActiveCashAccount(
                    transaction.getCashAccount()
            )) {
                continue;
            }

            transactions.add(
                    mapCashTransaction(transaction)
            );
        }

        // MERGE AND SORT
        transactions.sort(
                Comparator.comparing(
                                RecentTransactionResponse::getTransactionDate,
                                Comparator.nullsLast(
                                        Comparator.reverseOrder()
                                )
                        )
                        .thenComparing(
                                RecentTransactionResponse::getTransactionNumber,
                                Comparator.nullsLast(
                                        Comparator.reverseOrder()
                                )
                        )
        );

        return transactions.stream()
                .limit(RECENT_TRANSACTION_LIMIT)
                .toList();
    }

    private List<PendingApprovalResponse> buildPendingApprovals() {

        List<InvoiceEntity> pendingInvoices =
                invoiceRepository
                        .findTop10ByActiveTrueAndStatusOrderByCreatedAtDesc(
                                InvoiceStatus.DRAFT
                        );

        return pendingInvoices.stream()
                .map(invoice -> {

                    PendingApprovalResponse response =
                            new PendingApprovalResponse();

                    response.setId(invoice.getId());
                    response.setReferenceNumber(
                            invoice.getInvoiceNumber()
                    );

                    response.setRequesterName(
                            invoice.getCreatedBy() != null
                                    ? "User #" + invoice.getCreatedBy()
                                    : "System"
                    );
                    response.setRequesterEmail(null);

                    response.setApprovalType("INVOICE");
                    response.setStatus(invoice.getStatus().name());
                    response.setRequestedAt(invoice.getCreatedAt());

                    return response;
                })
                .toList();
    }

    // =========================================================
    // BANK TRANSACTION MAPPER
    // =========================================================

    private RecentTransactionResponse mapBankTransaction(
            BankTransactionEntity transaction
    ) {

        RecentTransactionResponse response =
                new RecentTransactionResponse();

        response.setId(transaction.getId());

        response.setTransactionNumber(
                transaction.getTransactionNumber()
        );

        response.setTransactionType(
                "BANK_" + transaction.getDirection().name()
        );

        response.setPartyName(
                getBankTransactionPartyName(transaction)
        );

        response.setTransactionDate(
                transaction.getTransactionDate()
        );

        // baseAmount is the INR reporting amount.
        response.setAmount(
                safeAmount(transaction.getBaseAmount())
        );

        PaymentEntity payment = getOriginalPayment(
                transaction.getPayment(),
                transaction.getReversalOf() != null
                        ? transaction.getReversalOf().getPayment()
                        : null
        );

        response.setPaymentMethod(
                payment != null && payment.getPaymentMethod() != null
                        ? payment.getPaymentMethod().name()
                        : null
        );

        response.setStatus(
                getLedgerTransactionStatus(
                        payment,
                        transaction.getReversalOf() != null
                )
        );

        return response;
    }

    // =========================================================
    // CASH TRANSACTION MAPPER
    // =========================================================

    private RecentTransactionResponse mapCashTransaction(
            CashBookTransactionEntity transaction
    ) {

        RecentTransactionResponse response =
                new RecentTransactionResponse();

        response.setId(transaction.getId());

        response.setTransactionNumber(
                transaction.getTransactionNumber()
        );

        response.setTransactionType(
                "CASH_" + transaction.getDirection().name()
        );

        response.setPartyName(
                getCashTransactionPartyName(transaction)
        );

        response.setTransactionDate(
                transaction.getTransactionDate()
        );

        // baseAmount is the INR reporting amount.
        response.setAmount(
                safeAmount(transaction.getBaseAmount())
        );

        PaymentEntity payment = getOriginalPayment(
                transaction.getPayment(),
                transaction.getReversalOf() != null
                        ? transaction.getReversalOf().getPayment()
                        : null
        );

        response.setPaymentMethod(
                payment != null && payment.getPaymentMethod() != null
                        ? payment.getPaymentMethod().name()
                        : "CASH"
        );

        response.setStatus(
                getLedgerTransactionStatus(
                        payment,
                        transaction.getReversalOf() != null
                )
        );

        return response;
    }

    // =========================================================
    // ORIGINAL PAYMENT RESOLUTION
    // =========================================================

    private PaymentEntity getOriginalPayment(
            PaymentEntity directPayment,
            PaymentEntity reversalPayment
    ) {

        if (directPayment != null) {
            return directPayment;
        }

        return reversalPayment;
    }

    // =========================================================
    // BANK TRANSACTION PARTY NAME
    // =========================================================

    private String getBankTransactionPartyName(
            BankTransactionEntity transaction
    ) {

        if (transaction == null) {
            return null;
        }

        if (transaction.getParty() != null) {
            return transaction.getParty().getCompanyName();
        }

        PaymentEntity payment = getOriginalPayment(
                transaction.getPayment(),
                transaction.getReversalOf() != null
                        ? transaction.getReversalOf().getPayment()
                        : null
        );

        return getPaymentPartyName(payment);
    }

    // =========================================================
    // CASH TRANSACTION PARTY NAME
    // =========================================================

    private String getCashTransactionPartyName(
            CashBookTransactionEntity transaction
    ) {

        if (transaction == null) {
            return null;
        }

        PaymentEntity payment = getOriginalPayment(
                transaction.getPayment(),
                transaction.getReversalOf() != null
                        ? transaction.getReversalOf().getPayment()
                        : null
        );

        return getPaymentPartyName(payment);
    }

    // =========================================================
    // PAYMENT PARTY NAME
    // =========================================================

    private String getPaymentPartyName(PaymentEntity payment) {

        if (payment == null) {
            return null;
        }

        if (payment.getParty() != null) {
            return payment.getParty().getCompanyName();
        }

        if (payment.getCustomer() != null) {
            return payment.getCustomer().getDisplayName();
        }

        return null;
    }

    // =========================================================
    // LEDGER TRANSACTION STATUS
    // =========================================================

    private String getLedgerTransactionStatus(
            PaymentEntity payment,
            boolean reversal
    ) {

        if (reversal) {
            return "REVERSAL";
        }

        if (payment != null &&
                payment.getPaymentStatus() != null) {

            return payment.getPaymentStatus().toString();
        }

        return "COMPLETED";
    }

    // =========================================================
    // INVENTORY SUMMARY
    // =========================================================

    private InventorySummaryResponse buildInventorySummary(
            DateRange range
    ) {

        InventoryDashboardFilter filter =
                new InventoryDashboardFilter();

        filter.setFromDate(
                range.fromDate().atStartOfDay()
        );

        filter.setToDate(
                range.toDate().atTime(LocalTime.MAX)
        );

        filter.setPage(0);

        filter.setSize(1);

        filter.setSortBy("transactionDate");

        filter.setSortDirection("DESC");

        InventoryDashboardResponse inventory =
                inventoryDashboardService.getInventoryDashboard(filter);

        if (inventory == null || inventory.getSummary() == null) {

            return InventorySummaryResponse.builder()
                    .totalProducts(0L)
                    .totalWarehouses(0L)
                    .totalStockItems(0L)
                    .totalStockQuantity(ZERO)
                    .totalAvailableQuantity(ZERO)
                    .totalReservedQuantity(ZERO)
                    .lowStockProducts(0L)
                    .outOfStockProducts(0L)
                    .totalInventoryValue(ZERO)
                    .build();
        }

        InventoryDashboardResponse.Summary summary =
                inventory.getSummary();

        return InventorySummaryResponse.builder()
                .totalProducts(
                        safeCount(summary.getTotalProducts())
                )
                .totalWarehouses(
                        safeCount(summary.getTotalWarehouses())
                )
                .totalStockItems(
                        safeCount(summary.getTotalStockItems())
                )
                .totalStockQuantity(
                        safeAmount(summary.getTotalStockQuantity())
                )
                .totalAvailableQuantity(
                        safeAmount(summary.getTotalAvailableQuantity())
                )
                .totalReservedQuantity(
                        safeAmount(summary.getTotalReservedQuantity())
                )
                .lowStockProducts(
                        safeCount(summary.getLowStockItems())
                )
                .outOfStockProducts(
                        safeCount(summary.getOutOfStockItems())
                )
                .totalInventoryValue(
                        safeAmount(summary.getTotalStockValue())
                )
                .build();
    }

    // =========================================================
    // DATE RANGE
    // =========================================================

    private DateRange resolveDateRange(
            DashboardFilterRequest request
    ) {

        LocalDate today = LocalDate.now();

        if (request == null) {
            return lastDays(today, 30);
        }

        String period = request.getPeriod() == null
                ? "LAST_30_DAYS"
                : request.getPeriod()
                .trim()
                .toUpperCase(Locale.ROOT);

        if ("CUSTOM".equals(period)) {

            LocalDate fromDate = request.getFromDate();

            LocalDate toDate = request.getToDate();

            if (fromDate == null || toDate == null) {

                throw new IllegalArgumentException(
                        "From date and to date are required for CUSTOM period."
                );
            }

            if (fromDate.isAfter(toDate)) {

                throw new IllegalArgumentException(
                        "From date cannot be after to date."
                );
            }

            return new DateRange(fromDate, toDate);
        }

        return switch (period) {

            case "TODAY" ->
                    new DateRange(today, today);

            case "YESTERDAY" ->
                    new DateRange(
                            today.minusDays(1),
                            today.minusDays(1)
                    );

            case "LAST_7_DAYS" ->
                    lastDays(today, 7);

            case "LAST_30_DAYS" ->
                    lastDays(today, 30);

            case "LAST_90_DAYS" ->
                    lastDays(today, 90);

            case "THIS_MONTH" ->
                    new DateRange(
                            today.withDayOfMonth(1),
                            today
                    );

            case "LAST_MONTH" -> {

                LocalDate lastMonth = today.minusMonths(1);

                yield new DateRange(
                        lastMonth.withDayOfMonth(1),
                        lastMonth.withDayOfMonth(
                                lastMonth.lengthOfMonth()
                        )
                );
            }

            case "THIS_YEAR" ->
                    new DateRange(
                            today.withDayOfYear(1),
                            today
                    );

            case "THIS_FINANCIAL_YEAR" -> {

                LocalDate financialYearStart =
                        today.getMonthValue() >= Month.APRIL.getValue()
                                ? LocalDate.of(today.getYear(), 4, 1)
                                : LocalDate.of(
                                today.getYear() - 1,
                                4,
                                1
                        );

                yield new DateRange(financialYearStart, today);
            }

            default ->
                    lastDays(today, 30);
        };
    }

    private DateRange lastDays(
            LocalDate today,
            int days
    ) {

        return new DateRange(
                today.minusDays(days - 1),
                today
        );
    }

    private DateRange getPreviousPeriod(
            DateRange currentRange
    ) {

        long days = ChronoUnit.DAYS.between(
                currentRange.fromDate(),
                currentRange.toDate()
        ) + 1;

        LocalDate previousTo =
                currentRange.fromDate().minusDays(1);

        LocalDate previousFrom =
                previousTo.minusDays(days - 1);

        return new DateRange(previousFrom, previousTo);
    }

    // =========================================================
    // CALCULATIONS & HELPERS
    // =========================================================

    private BigDecimal calculateGrowth(
            BigDecimal current,
            BigDecimal previous
    ) {

        current = safeAmount(current);

        previous = safeAmount(previous);

        if (previous.compareTo(ZERO) == 0) {

            return current.compareTo(ZERO) == 0
                    ? ZERO
                    : new BigDecimal("100.00");
        }

        return current
                .subtract(previous)
                .multiply(ONE_HUNDRED)
                .divide(previous, 2, RoundingMode.HALF_UP);
    }

    private BigDecimal safeAmount(BigDecimal value) {

        return value == null ? ZERO : value;
    }

    private long safeCount(Long value) {

        return value == null ? 0L : value;
    }

    private String normalizeStatus(Object value) {

        if (value == null) {
            return "";
        }

        return value.toString()
                .trim()
                .toUpperCase(Locale.ROOT);
    }

    private boolean isStatus(
            String actual,
            String... expected
    ) {

        for (String value : expected) {

            if (value.equals(actual)) {
                return true;
            }
        }

        return false;
    }

    // =========================================================
    // INTERNAL DATE RANGE
    // =========================================================

    private record DateRange(
            LocalDate fromDate,
            LocalDate toDate
    ) {
    }
}
