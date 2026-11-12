
package com.ims.reports.provider.expense;

import com.ims.dtos.reports.*;
import com.ims.entity.ExpenseEntity;
import com.ims.enums.ExpensePaymentStatus;
import com.ims.enums.ExpenseStatus;
import com.ims.enums.reports.ReportModule;
import com.ims.enums.reports.ReportType;
import com.ims.repository.ExpenseRepository;

import jakarta.persistence.criteria.JoinType;
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
    // SINGLE REPORT DEFINITION
    // =========================================================

    @Override
    public List<ReportDefinition> getReportDefinitions() {

        return List.of(
                ReportDefinition.builder()
                        .code("EXPENSE_REPORT")
                        .name("Expense Report")
                        .description(
                                "Complete expense report containing expense identification, " +
                                        "category, vendor, warehouse, currency, tax breakdown, " +
                                        "amounts, payment information, approval details, " +
                                        "rejection details, status and audit information."
                        )
                        .type(ReportType.REGISTER)
                        .columns(getColumns())
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

        if (!"EXPENSE_REPORT".equals(reportCode)) {
            throw new IllegalArgumentException(
                    "Unsupported expense report: " + reportCode
            );
        }

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
                        .map(this::mapExpense)
                        .toList();

        ReportSummaryResponse summary =
                generateSummary(specification);

        return ReportData.builder()
                .columns(getColumns())
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
    // REPORT COLUMNS
    // =========================================================

    private List<ReportColumn> getColumns() {

        return List.of(

                // Expense identification
                column("id", "Expense ID", "NUMBER"),
                column("expenseNo", "Expense Number", "STRING"),
                column("expenseType", "Expense Type", "STRING"),

                // Category
                column("expenseCategoryId", "Category ID", "NUMBER"),

                // Expense information
                column("expenseDate", "Expense Date", "DATE"),
                column("description", "Description", "STRING"),
                column("referenceNo", "Reference Number", "STRING"),

                // Vendor
                column("vendorId", "Vendor ID", "NUMBER"),
                column("vendorName", "Vendor Name", "STRING"),

                // Warehouse
                column("warehouseId", "Warehouse ID", "NUMBER"),

                // Currency
                column("currencyId", "Currency ID", "NUMBER"),
                column("currencyCode", "Currency Code", "STRING"),
                column("exchangeRate", "Exchange Rate", "DECIMAL"),

                // Tax master
                column("taxMasterId", "Tax Master ID", "NUMBER"),

                // Expense amounts
                column("amount", "Amount", "DECIMAL"),
                column("discountAmount", "Discount Amount", "DECIMAL"),
                column("taxableAmount", "Taxable Amount", "DECIMAL"),

                // Tax breakdown
                column("cgstAmount", "CGST Amount", "DECIMAL"),
                column("sgstAmount", "SGST Amount", "DECIMAL"),
                column("igstAmount", "IGST Amount", "DECIMAL"),
                column("totalTaxAmount", "Total Tax Amount", "DECIMAL"),
                column("totalAmount", "Total Amount", "DECIMAL"),

                // Base currency amounts
                column("baseAmount", "Base Amount (INR)", "DECIMAL"),
                column("baseDiscountAmount", "Base Discount Amount", "DECIMAL"),
                column("baseTaxableAmount", "Base Taxable Amount", "DECIMAL"),
                column("baseCgstAmount", "Base CGST Amount", "DECIMAL"),
                column("baseSgstAmount", "Base SGST Amount", "DECIMAL"),
                column("baseIgstAmount", "Base IGST Amount", "DECIMAL"),
                column("baseTotalTaxAmount", "Base Total Tax", "DECIMAL"),
                column("baseTotalAmount", "Base Total Amount (INR)", "DECIMAL"),

                // Payment information
                column("paidAmount", "Paid Amount", "DECIMAL"),
                column("dueAmount", "Due Amount", "DECIMAL"),

                // Status
                column("expenseStatus", "Expense Status", "STRING"),
                column("paymentStatus", "Payment Status", "STRING"),

                // Approval information
                column("approvedBy", "Approved By", "NUMBER"),
                column("approvedAt", "Approved At", "DATETIME"),

                // Rejection information
                column("rejectedBy", "Rejected By", "NUMBER"),
                column("rejectedAt", "Rejected At", "DATETIME"),
                column("rejectionReason", "Rejection Reason", "STRING"),

                // Additional information
                column("notes", "Notes", "STRING"),

                // Active and audit information
                column("active", "Active", "BOOLEAN"),
                column("createdAt", "Created At", "DATETIME"),
                column("updatedAt", "Updated At", "DATETIME"),
                column("createdBy", "Created By", "NUMBER"),
                column("updatedBy", "Updated By", "NUMBER")
        );
    }

    // =========================================================
    // COLUMN BUILDER
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
    // MAP EXPENSE
    // =========================================================

    private Map<String, Object> mapExpense(
            ExpenseEntity expense
    ) {

        Map<String, Object> row = new LinkedHashMap<>();

        // Expense identification
        row.put("id", expense.getId());
        row.put("expenseNo", expense.getExpenseNo());

        row.put(
                "expenseType",
                enumValue(expense.getExpenseType())
        );

        // Category
        row.put(
                "expenseCategoryId",
                expense.getExpenseCategory() == null
                        ? null
                        : expense.getExpenseCategory().getId()
        );

        // Expense information
        row.put("expenseDate", expense.getExpenseDate());
        row.put("description", expense.getDescription());
        row.put("referenceNo", expense.getReferenceNo());

        // Vendor
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

        // Warehouse
        row.put("warehouseId", expense.getWarehouseId());

        // Currency
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

        // Tax master
        row.put(
                "taxMasterId",
                expense.getTaxMaster() == null
                        ? null
                        : expense.getTaxMaster().getId()
        );

        // Expense amounts
        row.put("amount", expense.getAmount());
        row.put("discountAmount", expense.getDiscountAmount());
        row.put("taxableAmount", expense.getTaxableAmount());

        // Tax breakdown
        row.put("cgstAmount", expense.getCgstAmount());
        row.put("sgstAmount", expense.getSgstAmount());
        row.put("igstAmount", expense.getIgstAmount());
        row.put("totalTaxAmount", expense.getTotalTaxAmount());
        row.put("totalAmount", expense.getTotalAmount());

        // Base currency amounts
        row.put("baseAmount", expense.getBaseAmount());
        row.put("baseDiscountAmount", expense.getBaseDiscountAmount());
        row.put("baseTaxableAmount", expense.getBaseTaxableAmount());

        row.put("baseCgstAmount", expense.getBaseCgstAmount());
        row.put("baseSgstAmount", expense.getBaseSgstAmount());
        row.put("baseIgstAmount", expense.getBaseIgstAmount());

        row.put("baseTotalTaxAmount", expense.getBaseTotalTaxAmount());
        row.put("baseTotalAmount", expense.getBaseTotalAmount());

        // Payment information
        row.put("paidAmount", expense.getPaidAmount());
        row.put("dueAmount", expense.getDueAmount());

        // Status
        row.put(
                "expenseStatus",
                enumValue(expense.getExpenseStatus())
        );

        row.put(
                "paymentStatus",
                enumValue(expense.getPaymentStatus())
        );

        // Approval information
        row.put("approvedBy", expense.getApprovedBy());
        row.put("approvedAt", expense.getApprovedAt());

        // Rejection information
        row.put("rejectedBy", expense.getRejectedBy());
        row.put("rejectedAt", expense.getRejectedAt());
        row.put("rejectionReason", expense.getRejectionReason());

        // Additional information
        row.put("notes", expense.getNotes());

        // Active and audit information
        row.put("active", expense.getActive());
        row.put("createdAt", expense.getCreatedAt());
        row.put("updatedAt", expense.getUpdatedAt());
        row.put("createdBy", expense.getCreatedBy());
        row.put("updatedBy", expense.getUpdatedBy());

        return row;
    }

    // =========================================================
    // ENUM HELPER
    // =========================================================

    private String enumValue(Enum<?> value) {
        return value == null ? null : value.name();
    }

    // =========================================================
    // SPECIFICATION / FILTERS
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

            var vendorJoin = root.join("vendor", JoinType.LEFT);

            // Keyword search
            if (hasText(filters.getKeyword())) {

                String keyword = containsPattern(filters.getKeyword());

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
                                        cb.lower(vendorJoin.get("companyName")),
                                        keyword
                                )
                        )
                );
            }

            // Expense number
            String expenseNo =
                    getFilterValue(customFilters, "expenseNo");

            if (hasText(expenseNo)) {
                predicates.add(
                        cb.like(
                                cb.lower(root.get("expenseNo")),
                                containsPattern(expenseNo)
                        )
                );
            }

            // Expense type
            String expenseType =
                    getFilterValue(customFilters, "expenseType");

            if (hasText(expenseType)
                    && !"ALL".equalsIgnoreCase(expenseType)) {

                predicates.add(
                        cb.equal(
                                cb.upper(root.get("expenseType").as(String.class)),
                                expenseType.trim().toUpperCase(Locale.ROOT)
                        )
                );
            }

            // Expense category
            Long expenseCategoryId =
                    getLongFilter(customFilters, "expenseCategoryId");

            if (expenseCategoryId != null) {
                predicates.add(
                        cb.equal(
                                root.get("expenseCategory").get("id"),
                                expenseCategoryId
                        )
                );
            }

            // Vendor
            Long vendorId =
                    getLongFilter(customFilters, "vendorId");

            if (vendorId != null) {
                predicates.add(
                        cb.equal(vendorJoin.get("id"), vendorId)
                );
            }

            // Warehouse
            Long warehouseId =
                    getLongFilter(customFilters, "warehouseId");

            if (warehouseId != null) {
                predicates.add(
                        cb.equal(root.get("warehouseId"), warehouseId)
                );
            }

            // Currency ID
            Long currencyId =
                    getLongFilter(customFilters, "currencyId");

            if (currencyId != null) {
                predicates.add(
                        cb.equal(
                                root.get("currency").get("id"),
                                currencyId
                        )
                );
            }

            // Currency code
            String currencyCode =
                    getFilterValue(customFilters, "currencyCode");

            if (hasText(currencyCode)) {
                predicates.add(
                        cb.equal(
                                cb.upper(root.get("currency").get("currencyCode")),
                                currencyCode.toUpperCase(Locale.ROOT)
                        )
                );
            }

            // Tax master
            Long taxMasterId =
                    getLongFilter(customFilters, "taxMasterId");

            if (taxMasterId != null) {
                predicates.add(
                        cb.equal(
                                root.get("taxMaster").get("id"),
                                taxMasterId
                        )
                );
            }

            // Expense status
            String expenseStatus =
                    getFilterValue(customFilters, "expenseStatus");

            if (hasText(expenseStatus)
                    && !"ALL".equalsIgnoreCase(expenseStatus)) {

                try {

                    ExpenseStatus status = ExpenseStatus.valueOf(
                            expenseStatus.trim().toUpperCase(Locale.ROOT)
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

            // Payment status
            String paymentStatus =
                    getFilterValue(customFilters, "paymentStatus");

            if (hasText(paymentStatus)
                    && !"ALL".equalsIgnoreCase(paymentStatus)) {

                try {

                    ExpensePaymentStatus status =
                            ExpensePaymentStatus.valueOf(
                                    paymentStatus.trim().toUpperCase(Locale.ROOT)
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

            // Reference number
            String referenceNo =
                    getFilterValue(customFilters, "referenceNo");

            if (hasText(referenceNo)) {
                predicates.add(
                        cb.like(
                                cb.lower(root.get("referenceNo")),
                                containsPattern(referenceNo)
                        )
                );
            }

            // Total amount range
            BigDecimal minAmount =
                    getBigDecimalFilter(customFilters, "minAmount");

            BigDecimal maxAmount =
                    getBigDecimalFilter(customFilters, "maxAmount");

            validateAmountRange(minAmount, maxAmount, "Total amount");

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

            // Paid amount range
            BigDecimal minPaidAmount =
                    getBigDecimalFilter(customFilters, "minPaidAmount");

            BigDecimal maxPaidAmount =
                    getBigDecimalFilter(customFilters, "maxPaidAmount");

            validateAmountRange(minPaidAmount, maxPaidAmount, "Paid amount");

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

            // Due amount range
            BigDecimal minDueAmount =
                    getBigDecimalFilter(customFilters, "minDueAmount");

            BigDecimal maxDueAmount =
                    getBigDecimalFilter(customFilters, "maxDueAmount");

            validateAmountRange(minDueAmount, maxDueAmount, "Due amount");

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

            // Expense date range
            LocalDate expenseDateFrom =
                    getDateFilter(customFilters, "expenseDateFrom");

            LocalDate expenseDateTo =
                    getDateFilter(customFilters, "expenseDateTo");

            validateDateRange(
                    expenseDateFrom,
                    expenseDateTo,
                    "Expense date"
            );

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

            // Common date filters
            LocalDate fromDate = filters.getFromDate();
            LocalDate toDate = filters.getToDate();

            validateDateRange(fromDate, toDate, "Date");

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

            // Active filter
            String active =
                    getFilterValue(customFilters, "active");

            if (hasText(active)
                    && !"ALL".equalsIgnoreCase(active)) {

                boolean activeValue = parseActiveValue(active, "active");

                predicates.add(
                        cb.equal(root.get("active"), activeValue)
                );
            }

            // Common status filter
            // In this provider, filters.getStatus() represents
            // the record active/inactive filter, not ExpenseStatus.
            String status = filters.getStatus();

            if (hasText(status)
                    && !"ALL".equalsIgnoreCase(status)) {

                boolean activeValue = parseActiveValue(status, "status");

                predicates.add(
                        cb.equal(root.get("active"), activeValue)
                );
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
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

                orders.add(
                        new Sort.Order(
                                order.getDirection(),
                                mapSortField(order.getProperty())
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

            case "id" -> "id";
            case "expenseNo" -> "expenseNo";
            case "expenseType" -> "expenseType";
            case "expenseCategoryId" -> "expenseCategory.id";
            case "expenseDate" -> "expenseDate";
            case "description" -> "description";
            case "referenceNo" -> "referenceNo";
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
            case "active" -> "active";
            case "createdAt" -> "createdAt";
            case "updatedAt" -> "updatedAt";

            default -> "id";
        };
    }

    // =========================================================
    // VALIDATION HELPERS
    // =========================================================

    private void validateAmountRange(
            BigDecimal minimum,
            BigDecimal maximum,
            String fieldName
    ) {

        if (minimum != null
                && maximum != null
                && minimum.compareTo(maximum) > 0) {

            throw new IllegalArgumentException(
                    "Minimum " + fieldName.toLowerCase(Locale.ROOT) +
                            " cannot be greater than maximum " +
                            fieldName.toLowerCase(Locale.ROOT) + "."
            );
        }
    }

    private void validateDateRange(
            LocalDate fromDate,
            LocalDate toDate,
            String label
    ) {

        if (fromDate != null
                && toDate != null
                && fromDate.isAfter(toDate)) {

            throw new IllegalArgumentException(
                    label + " from date cannot be after to date."
            );
        }
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
            return Long.valueOf(value);

        } catch (NumberFormatException exception) {

            throw new IllegalArgumentException(
                    "Invalid numeric filter: " + key
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
                    "Invalid amount filter: " + key
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

        } catch (RuntimeException exception) {

            throw new IllegalArgumentException(
                    "Invalid date filter: " + key
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
        return "%" + value.trim().toLowerCase(Locale.ROOT) + "%";
    }
}
