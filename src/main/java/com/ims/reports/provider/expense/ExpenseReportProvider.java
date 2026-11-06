package com.ims.reports.provider.expense;


import com.ims.dtos.reports.*;
import com.ims.entity.ExpenseEntity;
import com.ims.enums.ExpensePaymentStatus;
import com.ims.enums.ExpenseStatus;
import com.ims.enums.reports.ReportModule;
import com.ims.enums.reports.ReportType;
import com.ims.repository.ExpenseRepository;

import jakarta.persistence.criteria.Predicate;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExpenseReportProvider implements ReportDataProvider {

    private final ExpenseRepository expenseRepository;

    // =========================================================
    // MODULE
    // =========================================================

    @Override
    public ReportModule getModule() {
        return ReportModule.EXPENSE;
    }

    // =========================================================
    // REPORT DEFINITIONS
    // =========================================================

    @Override
    public List<ReportDefinition> getReportDefinitions() {

        return List.of(

                ReportDefinition.builder()
                        .code("EXPENSE_REGISTER")
                        .name("Expense Register")
                        .description(
                                "Complete expense register including expense number, "
                                        + "category, vendor, expense date, amount and status."
                        )
                        .type(ReportType.REGISTER)
                        .columns(getRegisterColumns())
                        .build(),

                ReportDefinition.builder()
                        .code("EXPENSE_DETAILS")
                        .name("Expense Details")
                        .description(
                                "Detailed expense information including currency, "
                                        + "tax breakdown, vendor, warehouse and approval details."
                        )
                        .type(ReportType.DETAILED)
                        .columns(getDetailsColumns())
                        .build(),

                ReportDefinition.builder()
                        .code("EXPENSE_PAYMENT_REPORT")
                        .name("Expense Payment Report")
                        .description(
                                "Expense payment report including total amount, "
                                        + "paid amount, due amount and payment status."
                        )
                        .type(ReportType.DETAILED)
                        .columns(getPaymentColumns())
                        .build()
        );
    }

    // =========================================================
    // GENERATE REPORT
    // =========================================================

    @Override
    public ReportData generate(
            ReportRequest request,
            Pageable pageable
    ) {

        if (request == null || !hasText(request.getReportCode())) {
            throw new IllegalArgumentException(
                    "Expense report code is required."
            );
        }

        String reportCode = request.getReportCode()
                .trim()
                .toUpperCase(Locale.ROOT);

        List<ReportColumn> columns = getColumns(reportCode);

        Specification<ExpenseEntity> specification =
                buildSpecification(request.getFilters());

        Pageable databasePageable = mapSortProperties(pageable);

        Page<ExpenseEntity> expensePage =
                expenseRepository.findAll(
                        specification,
                        databasePageable
                );

        List<Map<String, Object>> rows =
                expensePage.getContent()
                        .stream()
                        .map(expense ->
                                mapExpense(expense, reportCode)
                        )
                        .toList();

        ReportSummaryResponse summary =
                generateSummary(specification);

        return ReportData.builder()
                .columns(columns)
                .rows(rows)
                .totalElements(expensePage.getTotalElements())
                .pageNumber(expensePage.getNumber())
                .pageSize(expensePage.getSize())
                .totalPages(expensePage.getTotalPages())
                .last(expensePage.isLast())
                .summary(summary)
                .build();
    }

    // =========================================================
    // REPORT COLUMN SELECTION
    // =========================================================

    private List<ReportColumn> getColumns(String reportCode) {

        return switch (reportCode) {

            case "EXPENSE_REGISTER" ->
                    getRegisterColumns();

            case "EXPENSE_DETAILS" ->
                    getDetailsColumns();

            case "EXPENSE_PAYMENT_REPORT" ->
                    getPaymentColumns();

            default -> throw new IllegalArgumentException(
                    "Unsupported expense report: " + reportCode
            );
        };
    }

    // =========================================================
    // REGISTER COLUMNS
    // =========================================================

    private List<ReportColumn> getRegisterColumns() {

        return List.of(

                column("id", "Expense ID", "NUMBER"),
                column("expenseNo", "Expense Number", "STRING"),
                column("expenseType", "Expense Type", "STRING"),

                column("expenseCategoryId", "Category ID", "NUMBER"),

                column("expenseDate", "Expense Date", "DATE"),

                column("description", "Description", "STRING"),
                column("referenceNo", "Reference Number", "STRING"),

                column("vendorId", "Vendor ID", "NUMBER"),
                column("vendorName", "Vendor Name", "STRING"),

                column("warehouseId", "Warehouse ID", "NUMBER"),

                column("amount", "Amount", "NUMBER"),
                column("discountAmount", "Discount Amount", "NUMBER"),
                column("taxableAmount", "Taxable Amount", "NUMBER"),
                column("totalTaxAmount", "Total Tax", "NUMBER"),
                column("totalAmount", "Total Amount", "NUMBER"),

                column("currencyCode", "Currency", "STRING"),

                column("expenseStatus", "Expense Status", "STRING"),
                column("paymentStatus", "Payment Status", "STRING"),

                column("active", "Active", "BOOLEAN"),

                column("createdAt", "Created At", "DATETIME"),
                column("updatedAt", "Updated At", "DATETIME"),
                column("createdBy", "Created By", "NUMBER"),
                column("updatedBy", "Updated By", "NUMBER")
        );
    }

    // =========================================================
    // DETAILS COLUMNS
    // =========================================================

    private List<ReportColumn> getDetailsColumns() {

        return List.of(

                column("id", "Expense ID", "NUMBER"),
                column("expenseNo", "Expense Number", "STRING"),
                column("expenseType", "Expense Type", "STRING"),

                column("expenseCategoryId", "Category ID", "NUMBER"),

                column("expenseDate", "Expense Date", "DATE"),
                column("description", "Description", "STRING"),
                column("referenceNo", "Reference Number", "STRING"),

                column("vendorId", "Vendor ID", "NUMBER"),
                column("vendorName", "Vendor Name", "STRING"),

                column("warehouseId", "Warehouse ID", "NUMBER"),

                column("currencyId", "Currency ID", "NUMBER"),
                column("currencyCode", "Currency Code", "STRING"),
                column("exchangeRate", "Exchange Rate", "NUMBER"),

                column("taxMasterId", "Tax Master ID", "NUMBER"),

                column("amount", "Amount", "NUMBER"),
                column("discountAmount", "Discount Amount", "NUMBER"),
                column("taxableAmount", "Taxable Amount", "NUMBER"),

                column("cgstAmount", "CGST Amount", "NUMBER"),
                column("sgstAmount", "SGST Amount", "NUMBER"),
                column("igstAmount", "IGST Amount", "NUMBER"),
                column("totalTaxAmount", "Total Tax Amount", "NUMBER"),
                column("totalAmount", "Total Amount", "NUMBER"),

                column("baseAmount", "Base Amount (INR)", "NUMBER"),
                column("baseDiscountAmount", "Base Discount Amount", "NUMBER"),
                column("baseTaxableAmount", "Base Taxable Amount", "NUMBER"),
                column("baseCgstAmount", "Base CGST Amount", "NUMBER"),
                column("baseSgstAmount", "Base SGST Amount", "NUMBER"),
                column("baseIgstAmount", "Base IGST Amount", "NUMBER"),
                column("baseTotalTaxAmount", "Base Total Tax", "NUMBER"),
                column("baseTotalAmount", "Base Total Amount", "NUMBER"),

                column("expenseStatus", "Expense Status", "STRING"),
                column("paymentStatus", "Payment Status", "STRING"),

                column("approvedBy", "Approved By", "NUMBER"),
                column("approvedAt", "Approved At", "DATETIME"),

                column("rejectedBy", "Rejected By", "NUMBER"),
                column("rejectedAt", "Rejected At", "DATETIME"),
                column("rejectionReason", "Rejection Reason", "STRING"),

                column("notes", "Notes", "STRING"),

                column("active", "Active", "BOOLEAN"),
                column("createdAt", "Created At", "DATETIME"),
                column("updatedAt", "Updated At", "DATETIME")
        );
    }

    // =========================================================
    // PAYMENT COLUMNS
    // =========================================================

    private List<ReportColumn> getPaymentColumns() {

        return List.of(

                column("id", "Expense ID", "NUMBER"),
                column("expenseNo", "Expense Number", "STRING"),

                column("expenseDate", "Expense Date", "DATE"),

                column("expenseCategoryId", "Category ID", "NUMBER"),

                column("vendorId", "Vendor ID", "NUMBER"),
                column("vendorName", "Vendor Name", "STRING"),

                column("currencyCode", "Currency", "STRING"),

                column("totalAmount", "Total Amount", "NUMBER"),
                column("baseTotalAmount", "Base Total Amount (INR)", "NUMBER"),

                column("paidAmount", "Paid Amount", "NUMBER"),
                column("dueAmount", "Due Amount", "NUMBER"),

                column("expenseStatus", "Expense Status", "STRING"),
                column("paymentStatus", "Payment Status", "STRING"),

                column("active", "Active", "BOOLEAN"),

                column("createdAt", "Created At", "DATETIME")
        );
    }

    // =========================================================
    // COMMON COLUMN BUILDER
    // =========================================================

    private ReportColumn column(
            String key,
            String label,
            String dataType
    ) {

        return ReportColumn.builder()
                .key(key)
                .label(label)
                .dataType(dataType)
                .defaultVisible(true)
                .build();
    }

    // =========================================================
    // EXPENSE SPECIFICATION
    // =========================================================

    private Specification<ExpenseEntity> buildSpecification(
            ReportFilterRequest filters
    ) {

        return (root, query, cb) -> {

            List<Predicate> predicates = new ArrayList<>();

            if (filters == null) {
                return cb.conjunction();
            }

            Map<String, Object> customFilters =
                    filters.getFilters() == null
                            ? Map.of()
                            : filters.getFilters();

            // -------------------------------------------------
            // KEYWORD
            // -------------------------------------------------

            if (hasText(filters.getKeyword())) {

                String keyword = containsPattern(
                        filters.getKeyword()
                );

                predicates.add(
                        cb.or(
                                cb.like(
                                        cb.lower(root.get("expenseNo")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(root.get("description")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(root.get("referenceNo")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(
                                                root.get("vendor")
                                                        .get("companyName")
                                        ),
                                        keyword
                                )
                        )
                );
            }

            // -------------------------------------------------
            // EXPENSE NUMBER
            // -------------------------------------------------

            String expenseNo = getFilterValue(
                    customFilters,
                    "expenseNo"
            );

            if (hasText(expenseNo)) {

                predicates.add(
                        cb.like(
                                cb.lower(root.get("expenseNo")),
                                containsPattern(expenseNo)
                        )
                );
            }

            // -------------------------------------------------
            // EXPENSE TYPE
            // -------------------------------------------------

            String expenseType = getFilterValue(
                    customFilters,
                    "expenseType"
            );

            if (hasText(expenseType)
                    && !"ALL".equalsIgnoreCase(expenseType)) {

                predicates.add(
                        cb.equal(
                                cb.upper(root.get("expenseType").as(String.class)),
                                expenseType.trim().toUpperCase(Locale.ROOT)
                        )
                );
            }

            // -------------------------------------------------
            // EXPENSE CATEGORY
            // -------------------------------------------------

            Long expenseCategoryId = getLongFilter(
                    customFilters,
                    "expenseCategoryId"
            );

            if (expenseCategoryId != null) {

                predicates.add(
                        cb.equal(
                                root.get("expenseCategory").get("id"),
                                expenseCategoryId
                        )
                );
            }

            // -------------------------------------------------
            // VENDOR
            // -------------------------------------------------

            Long vendorId = getLongFilter(
                    customFilters,
                    "vendorId"
            );

            if (vendorId != null) {

                predicates.add(
                        cb.equal(
                                root.get("vendor").get("id"),
                                vendorId
                        )
                );
            }

            // -------------------------------------------------
            // WAREHOUSE
            // -------------------------------------------------

            Long warehouseId = getLongFilter(
                    customFilters,
                    "warehouseId"
            );

            if (warehouseId != null) {

                predicates.add(
                        cb.equal(
                                root.get("warehouseId"),
                                warehouseId
                        )
                );
            }

            // -------------------------------------------------
            // CURRENCY
            // -------------------------------------------------

            Long currencyId = getLongFilter(
                    customFilters,
                    "currencyId"
            );

            if (currencyId != null) {

                predicates.add(
                        cb.equal(
                                root.get("currency").get("id"),
                                currencyId
                        )
                );
            }

            String currencyCode = getFilterValue(
                    customFilters,
                    "currencyCode"
            );

            if (hasText(currencyCode)) {

                predicates.add(
                        cb.equal(
                                cb.upper(
                                        root.get("currency").get("currencyCode")
                                ),
                                currencyCode.toUpperCase(Locale.ROOT)
                        )
                );
            }

            // -------------------------------------------------
            // TAX MASTER
            // -------------------------------------------------

            Long taxMasterId = getLongFilter(
                    customFilters,
                    "taxMasterId"
            );

            if (taxMasterId != null) {

                predicates.add(
                        cb.equal(
                                root.get("taxMaster").get("id"),
                                taxMasterId
                        )
                );
            }

            // -------------------------------------------------
            // EXPENSE STATUS
            // -------------------------------------------------

            String expenseStatus = getFilterValue(
                    customFilters,
                    "expenseStatus"
            );

            if (hasText(expenseStatus)
                    && !"ALL".equalsIgnoreCase(expenseStatus)) {

                try {

                    ExpenseStatus status =
                            ExpenseStatus.valueOf(
                                    expenseStatus.trim()
                                            .toUpperCase(Locale.ROOT)
                            );

                    predicates.add(
                            cb.equal(root.get("expenseStatus"), status)
                    );

                } catch (IllegalArgumentException exception) {

                    throw new IllegalArgumentException(
                            "Invalid expense status: " + expenseStatus
                    );
                }
            }

            // -------------------------------------------------
            // PAYMENT STATUS
            // -------------------------------------------------

            String paymentStatus = getFilterValue(
                    customFilters,
                    "paymentStatus"
            );

            if (hasText(paymentStatus)
                    && !"ALL".equalsIgnoreCase(paymentStatus)) {

                try {

                    ExpensePaymentStatus status =
                            ExpensePaymentStatus.valueOf(
                                    paymentStatus.trim()
                                            .toUpperCase(Locale.ROOT)
                            );

                    predicates.add(
                            cb.equal(root.get("paymentStatus"), status)
                    );

                } catch (IllegalArgumentException exception) {

                    throw new IllegalArgumentException(
                            "Invalid expense payment status: " + paymentStatus
                    );
                }
            }

            // -------------------------------------------------
            // REFERENCE NUMBER
            // -------------------------------------------------

            String referenceNo = getFilterValue(
                    customFilters,
                    "referenceNo"
            );

            if (hasText(referenceNo)) {

                predicates.add(
                        cb.like(
                                cb.lower(root.get("referenceNo")),
                                containsPattern(referenceNo)
                        )
                );
            }

            // -------------------------------------------------
            // AMOUNT RANGE
            // -------------------------------------------------

            BigDecimal minAmount = getBigDecimalFilter(
                    customFilters,
                    "minAmount"
            );

            BigDecimal maxAmount = getBigDecimalFilter(
                    customFilters,
                    "maxAmount"
            );

            validateAmountRange(minAmount, maxAmount);

            if (minAmount != null) {

                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("totalAmount"),
                                minAmount
                        )
                );
            }

            if (maxAmount != null) {

                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("totalAmount"),
                                maxAmount
                        )
                );
            }

            // -------------------------------------------------
            // PAID AMOUNT RANGE
            // -------------------------------------------------

            BigDecimal minPaidAmount = getBigDecimalFilter(
                    customFilters,
                    "minPaidAmount"
            );

            BigDecimal maxPaidAmount = getBigDecimalFilter(
                    customFilters,
                    "maxPaidAmount"
            );

            validateAmountRange(minPaidAmount, maxPaidAmount);

            if (minPaidAmount != null) {

                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("paidAmount"),
                                minPaidAmount
                        )
                );
            }

            if (maxPaidAmount != null) {

                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("paidAmount"),
                                maxPaidAmount
                        )
                );
            }

            // -------------------------------------------------
            // DUE AMOUNT RANGE
            // -------------------------------------------------

            BigDecimal minDueAmount = getBigDecimalFilter(
                    customFilters,
                    "minDueAmount"
            );

            BigDecimal maxDueAmount = getBigDecimalFilter(
                    customFilters,
                    "maxDueAmount"
            );

            validateAmountRange(minDueAmount, maxDueAmount);

            if (minDueAmount != null) {

                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("dueAmount"),
                                minDueAmount
                        )
                );
            }

            if (maxDueAmount != null) {

                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("dueAmount"),
                                maxDueAmount
                        )
                );
            }

            // -------------------------------------------------
            // EXPENSE DATE RANGE
            // -------------------------------------------------

            LocalDate expenseDateFrom = getDateFilter(
                    customFilters,
                    "expenseDateFrom"
            );

            LocalDate expenseDateTo = getDateFilter(
                    customFilters,
                    "expenseDateTo"
            );

            validateDateRange(expenseDateFrom, expenseDateTo);

            if (expenseDateFrom != null) {

                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("expenseDate"),
                                expenseDateFrom
                        )
                );
            }

            if (expenseDateTo != null) {

                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("expenseDate"),
                                expenseDateTo
                        )
                );
            }

            // -------------------------------------------------
            // COMMON DATE FILTERS
            // -------------------------------------------------

            LocalDate fromDate = filters.getFromDate();
            LocalDate toDate = filters.getToDate();

            validateDateRange(fromDate, toDate);

            if (fromDate != null) {

                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("expenseDate"),
                                fromDate
                        )
                );
            }

            if (toDate != null) {

                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("expenseDate"),
                                toDate
                        )
                );
            }

            // -------------------------------------------------
            // ACTIVE FILTER
            // -------------------------------------------------

            String active = getFilterValue(
                    customFilters,
                    "active"
            );

            if (hasText(active)
                    && !"ALL".equalsIgnoreCase(active)) {

                boolean activeValue = parseActiveValue(active, "active");

                predicates.add(
                        cb.equal(root.get("active"), activeValue)
                );
            }

            // -------------------------------------------------
            // COMMON STATUS FILTER
            // -------------------------------------------------

            String status = filters.getStatus();

            if (hasText(status)
                    && !"ALL".equalsIgnoreCase(status)) {

                boolean activeValue = parseActiveValue(status, "status");

                predicates.add(
                        cb.equal(root.get("active"), activeValue)
                );
            }

            return cb.and(
                    predicates.toArray(new Predicate[0])
            );
        };
    }

    // =========================================================
    // MAP EXPENSE
    // =========================================================

    private Map<String, Object> mapExpense(
            ExpenseEntity expense,
            String reportCode
    ) {

        Map<String, Object> row = new LinkedHashMap<>();

        switch (reportCode) {

            case "EXPENSE_REGISTER" ->
                    mapRegister(expense, row);

            case "EXPENSE_DETAILS" ->
                    mapDetails(expense, row);

            case "EXPENSE_PAYMENT_REPORT" ->
                    mapPayment(expense, row);

            default -> throw new IllegalArgumentException(
                    "Unsupported expense report: " + reportCode
            );
        }

        return row;
    }

    // =========================================================
    // MAP COMMON DETAILS
    // =========================================================

    private void mapCommonDetails(
            ExpenseEntity expense,
            Map<String, Object> row
    ) {

        row.put("id", expense.getId());
        row.put("expenseNo", expense.getExpenseNo());

        row.put(
                "expenseType",
                expense.getExpenseType() == null
                        ? null
                        : expense.getExpenseType().name()
        );

        row.put(
                "expenseCategoryId",
                expense.getExpenseCategory() == null
                        ? null
                        : expense.getExpenseCategory().getId()
        );

        row.put("expenseDate", expense.getExpenseDate());
        row.put("description", expense.getDescription());
        row.put("referenceNo", expense.getReferenceNo());

        row.put(
                "vendorId",
                expense.getVendor() == null
                        ? null
                        : expense.getVendor().getId()
        );

        row.put(
                "vendorName",
                expense.getVendor() == null
                        ? null
                        : expense.getVendor().getCompanyName()
        );

        row.put("warehouseId", expense.getWarehouseId());

        row.put(
                "currencyId",
                expense.getCurrency() == null
                        ? null
                        : expense.getCurrency().getId()
        );

        row.put(
                "currencyCode",
                expense.getCurrency() == null
                        ? null
                        : expense.getCurrency().getCurrencyCode()
        );

        row.put("exchangeRate", expense.getExchangeRate());

        row.put(
                "taxMasterId",
                expense.getTaxMaster() == null
                        ? null
                        : expense.getTaxMaster().getId()
        );

        row.put("amount", expense.getAmount());
        row.put("discountAmount", expense.getDiscountAmount());
        row.put("taxableAmount", expense.getTaxableAmount());

        row.put("cgstAmount", expense.getCgstAmount());
        row.put("sgstAmount", expense.getSgstAmount());
        row.put("igstAmount", expense.getIgstAmount());

        row.put("totalTaxAmount", expense.getTotalTaxAmount());
        row.put("totalAmount", expense.getTotalAmount());

        row.put("baseAmount", expense.getBaseAmount());
        row.put("baseDiscountAmount", expense.getBaseDiscountAmount());
        row.put("baseTaxableAmount", expense.getBaseTaxableAmount());

        row.put("baseCgstAmount", expense.getBaseCgstAmount());
        row.put("baseSgstAmount", expense.getBaseSgstAmount());
        row.put("baseIgstAmount", expense.getBaseIgstAmount());

        row.put("baseTotalTaxAmount", expense.getBaseTotalTaxAmount());
        row.put("baseTotalAmount", expense.getBaseTotalAmount());

        row.put("paidAmount", expense.getPaidAmount());
        row.put("dueAmount", expense.getDueAmount());

        row.put(
                "expenseStatus",
                expense.getExpenseStatus() == null
                        ? null
                        : expense.getExpenseStatus().name()
        );

        row.put(
                "paymentStatus",
                expense.getPaymentStatus() == null
                        ? null
                        : expense.getPaymentStatus().name()
        );

        row.put("active", expense.getActive());
        row.put("createdAt", expense.getCreatedAt());
        row.put("updatedAt", expense.getUpdatedAt());
    }

    // =========================================================
    // MAP REGISTER
    // =========================================================

    private void mapRegister(
            ExpenseEntity expense,
            Map<String, Object> row
    ) {

        mapCommonDetails(expense, row);

        row.put("createdBy", expense.getCreatedBy());
        row.put("updatedBy", expense.getUpdatedBy());
    }

    // =========================================================
    // MAP DETAILS
    // =========================================================

    private void mapDetails(
            ExpenseEntity expense,
            Map<String, Object> row
    ) {

        mapCommonDetails(expense, row);

        row.put("approvedBy", expense.getApprovedBy());
        row.put("approvedAt", expense.getApprovedAt());

        row.put("rejectedBy", expense.getRejectedBy());
        row.put("rejectedAt", expense.getRejectedAt());
        row.put("rejectionReason", expense.getRejectionReason());

        row.put("notes", expense.getNotes());
    }

    // =========================================================
    // MAP PAYMENT
    // =========================================================

    private void mapPayment(
            ExpenseEntity expense,
            Map<String, Object> row
    ) {

        row.put("id", expense.getId());
        row.put("expenseNo", expense.getExpenseNo());
        row.put("expenseDate", expense.getExpenseDate());

        row.put(
                "expenseCategoryId",
                expense.getExpenseCategory() == null
                        ? null
                        : expense.getExpenseCategory().getId()
        );

        row.put(
                "vendorId",
                expense.getVendor() == null
                        ? null
                        : expense.getVendor().getId()
        );

        row.put(
                "vendorName",
                expense.getVendor() == null
                        ? null
                        : expense.getVendor().getCompanyName()
        );

        row.put(
                "currencyCode",
                expense.getCurrency() == null
                        ? null
                        : expense.getCurrency().getCurrencyCode()
        );

        row.put("totalAmount", expense.getTotalAmount());
        row.put("baseTotalAmount", expense.getBaseTotalAmount());

        row.put("paidAmount", expense.getPaidAmount());
        row.put("dueAmount", expense.getDueAmount());

        row.put(
                "expenseStatus",
                expense.getExpenseStatus() == null
                        ? null
                        : expense.getExpenseStatus().name()
        );

        row.put(
                "paymentStatus",
                expense.getPaymentStatus() == null
                        ? null
                        : expense.getPaymentStatus().name()
        );

        row.put("active", expense.getActive());
        row.put("createdAt", expense.getCreatedAt());
    }

    // =========================================================
    // SUMMARY
    // =========================================================

    private ReportSummaryResponse generateSummary(
            Specification<ExpenseEntity> specification
    ) {

        long totalExpenses =
                expenseRepository.count(specification);

        long draftExpenses =
                expenseRepository.count(
                        specification.and(
                                (root, query, cb) ->
                                        cb.equal(
                                                root.get("expenseStatus"),
                                                ExpenseStatus.DRAFT
                                        )
                        )
                );

        long unpaidExpenses =
                expenseRepository.count(
                        specification.and(
                                (root, query, cb) ->
                                        cb.equal(
                                                root.get("paymentStatus"),
                                                ExpensePaymentStatus.UNPAID
                                        )
                        )
                );

        long activeRecords =
                expenseRepository.count(
                        specification.and(
                                (root, query, cb) ->
                                        cb.isTrue(root.get("active"))
                        )
                );

        long inactiveRecords =
                expenseRepository.count(
                        specification.and(
                                (root, query, cb) ->
                                        cb.isFalse(root.get("active"))
                        )
                );

        Map<String, Object> metrics = new LinkedHashMap<>();

        metrics.put("totalExpenses", totalExpenses);
        metrics.put("draftExpenses", draftExpenses);
        metrics.put("unpaidExpenses", unpaidExpenses);
        metrics.put("activeRecords", activeRecords);
        metrics.put("inactiveRecords", inactiveRecords);

        return ReportSummaryResponse.builder()
                .metrics(metrics)
                .build();
    }

    // =========================================================
    // SORT MAPPING
    // =========================================================

    private Pageable mapSortProperties(Pageable pageable) {

        if (pageable == null || pageable.isUnpaged()) {
            return Pageable.unpaged();
        }

        Sort mappedSort = Sort.unsorted();

        if (pageable.getSort().isSorted()) {

            List<Sort.Order> orders = new ArrayList<>();

            pageable.getSort().forEach(order -> {

                String entityField =
                        mapSortField(order.getProperty());

                orders.add(
                        new Sort.Order(
                                order.getDirection(),
                                entityField
                        )
                );
            });

            mappedSort = Sort.by(orders);
        }

        return PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                mappedSort
        );
    }

    private String mapSortField(String field) {

        return switch (field) {

            case "expenseNo" -> "expenseNo";
            case "expenseType" -> "expenseType";
            case "expenseCategoryId" -> "expenseCategory.id";
            case "expenseDate" -> "expenseDate";
            case "vendorId" -> "vendor.id";
            case "vendorName" -> "vendor.companyName";
            case "warehouseId" -> "warehouseId";
            case "currencyId" -> "currency.id";
            case "currencyCode" -> "currency.currencyCode";
            case "amount" -> "amount";
            case "totalAmount" -> "totalAmount";
            case "baseTotalAmount" -> "baseTotalAmount";
            case "paidAmount" -> "paidAmount";
            case "dueAmount" -> "dueAmount";
            case "expenseStatus" -> "expenseStatus";
            case "paymentStatus" -> "paymentStatus";
            case "createdAt" -> "createdAt";
            case "updatedAt" -> "updatedAt";
            case "id" -> "id";

            default -> "id";
        };
    }

    // =========================================================
    // FILTER HELPERS
    // =========================================================

    private String getFilterValue(
            Map<String, Object> filters,
            String key
    ) {

        Object value = filters.get(key);

        return value == null
                ? null
                : String.valueOf(value).trim();
    }

    private Long getLongFilter(
            Map<String, Object> filters,
            String key
    ) {

        String value = getFilterValue(filters, key);

        if (!hasText(value)) {
            return null;
        }

        try {
            return Long.parseLong(value);

        } catch (NumberFormatException exception) {

            throw new IllegalArgumentException(
                    "Invalid " + key + " filter: " + value
            );
        }
    }

    private BigDecimal getBigDecimalFilter(
            Map<String, Object> filters,
            String key
    ) {

        String value = getFilterValue(filters, key);

        if (!hasText(value)) {
            return null;
        }

        try {
            return new BigDecimal(value);

        } catch (NumberFormatException exception) {

            throw new IllegalArgumentException(
                    "Invalid " + key + " filter: " + value
            );
        }
    }

    private LocalDate getDateFilter(
            Map<String, Object> filters,
            String key
    ) {

        String value = getFilterValue(filters, key);

        if (!hasText(value)) {
            return null;
        }

        try {
            return LocalDate.parse(value);

        } catch (Exception exception) {

            throw new IllegalArgumentException(
                    "Invalid " + key + " date. Expected yyyy-MM-dd."
            );
        }
    }

    // =========================================================
    // VALIDATIONS
    // =========================================================

    private void validateAmountRange(
            BigDecimal minAmount,
            BigDecimal maxAmount
    ) {

        if (minAmount != null
                && maxAmount != null
                && minAmount.compareTo(maxAmount) > 0) {

            throw new IllegalArgumentException(
                    "Minimum amount cannot be greater than maximum amount."
            );
        }
    }

    private void validateDateRange(
            LocalDate fromDate,
            LocalDate toDate
    ) {

        if (fromDate != null
                && toDate != null
                && fromDate.isAfter(toDate)) {

            throw new IllegalArgumentException(
                    "From date cannot be after to date."
            );
        }
    }

    private boolean parseActiveValue(
            String value,
            String fieldName
    ) {

        if ("true".equalsIgnoreCase(value)
                || "ACTIVE".equalsIgnoreCase(value)) {
            return true;
        }

        if ("false".equalsIgnoreCase(value)
                || "INACTIVE".equalsIgnoreCase(value)) {
            return false;
        }

        throw new IllegalArgumentException(
                fieldName + " filter must be ACTIVE, INACTIVE, true or false."
        );
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private String containsPattern(String value) {

        return "%"
                + value.trim().toLowerCase(Locale.ROOT)
                + "%";
    }
}

