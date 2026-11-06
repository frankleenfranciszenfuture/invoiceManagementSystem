package com.ims.reports.provider.bankTransaction;

import com.ims.dtos.reports.*;
import com.ims.entity.BankTransactionEntity;
import com.ims.enums.BankTransactionDirection;
import com.ims.enums.reports.ReportModule;
import com.ims.enums.reports.ReportType;
import com.ims.repository.BankTransactionRepository;

import jakarta.persistence.criteria.Join;
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
public class BankTransactionReportProvider implements ReportDataProvider {

    private final BankTransactionRepository bankTransactionRepository;

    // =========================================================
    // MODULE
    // =========================================================

    @Override
    public ReportModule getModule() {
        return ReportModule.BANK_TRANSACTION;
    }

    // =========================================================
    // REPORT DEFINITIONS
    // =========================================================

    @Override
    public List<ReportDefinition> getReportDefinitions() {

        return List.of(

                ReportDefinition.builder()
                        .code("BANK_TRANSACTION_REGISTER")
                        .name("Bank Transaction Register")
                        .description(
                                "Complete bank transaction register including " +
                                        "transaction number, bank account, direction, " +
                                        "amount, currency, transaction date and status."
                        )
                        .type(ReportType.REGISTER)
                        .columns(getRegisterColumns())
                        .build(),

                ReportDefinition.builder()
                        .code("BANK_TRANSACTION_DETAILS")
                        .name("Bank Transaction Details")
                        .description(
                                "Detailed bank transaction information including " +
                                        "payment, party, reference number, exchange rate " +
                                        "and transaction description."
                        )
                        .type(ReportType.DETAILED)
                        .columns(getDetailsColumns())
                        .build(),

                ReportDefinition.builder()
                        .code("BANK_TRANSACTION_REVERSALS")
                        .name("Bank Transaction Reversal Report")
                        .description(
                                "Bank transaction reversal details including " +
                                        "original transaction references and reversal amounts."
                        )
                        .type(ReportType.DETAILED)
                        .columns(getReversalColumns())
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
                    "Bank transaction report code is required."
            );
        }

        String reportCode = request.getReportCode()
                .trim()
                .toUpperCase(Locale.ROOT);

        List<ReportColumn> columns = getColumns(reportCode);

        Specification<BankTransactionEntity> specification =
                buildSpecification(request.getFilters());

        Pageable databasePageable = mapSortProperties(pageable);

        Page<BankTransactionEntity> transactionPage =
                bankTransactionRepository.findAll(
                        specification,
                        databasePageable
                );

        List<Map<String, Object>> rows =
                transactionPage.getContent()
                        .stream()
                        .map(transaction ->
                                mapTransaction(transaction, reportCode)
                        )
                        .toList();

        ReportSummaryResponse summary =
                generateSummary(specification);

        return ReportData.builder()
                .columns(columns)
                .rows(rows)
                .totalElements(transactionPage.getTotalElements())
                .pageNumber(transactionPage.getNumber())
                .pageSize(transactionPage.getSize())
                .totalPages(transactionPage.getTotalPages())
                .last(transactionPage.isLast())
                .summary(summary)
                .build();
    }

    // =========================================================
    // REPORT COLUMNS
    // =========================================================

    private List<ReportColumn> getColumns(String reportCode) {

        return switch (reportCode) {

            case "BANK_TRANSACTION_REGISTER" ->
                    getRegisterColumns();

            case "BANK_TRANSACTION_DETAILS" ->
                    getDetailsColumns();

            case "BANK_TRANSACTION_REVERSALS" ->
                    getReversalColumns();

            default -> throw new IllegalArgumentException(
                    "Unsupported bank transaction report: " + reportCode
            );
        };
    }

    // =========================================================
    // REGISTER COLUMNS
    // =========================================================

    private List<ReportColumn> getRegisterColumns() {

        return List.of(

                column("id", "Transaction ID", "NUMBER"),
                column("transactionNumber", "Transaction Number", "STRING"),

                column("bankAccountId", "Bank Account ID", "NUMBER"),
                column("bankAccountName", "Bank Account Name", "STRING"),

                column("direction", "Direction", "STRING"),
                column("transactionDate", "Transaction Date", "DATE"),

                column("amount", "Amount", "NUMBER"),
                column("currencyCode", "Currency", "STRING"),

                column("baseAmount", "Base Amount (INR)", "NUMBER"),
                column("exchangeRate", "Exchange Rate", "NUMBER"),

                column("referenceNumber", "Reference Number", "STRING"),

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

                column("id", "Transaction ID", "NUMBER"),
                column("transactionNumber", "Transaction Number", "STRING"),

                column("bankAccountId", "Bank Account ID", "NUMBER"),
                column("bankAccountName", "Bank Account Name", "STRING"),

                column("paymentId", "Payment ID", "NUMBER"),
                column("partyId", "Party ID", "NUMBER"),
                column("partyName", "Party Name", "STRING"),

                column("direction", "Direction", "STRING"),
                column("transactionDate", "Transaction Date", "DATE"),

                column("amount", "Transaction Amount", "NUMBER"),
                column("currencyCode", "Currency", "STRING"),

                column("baseAmount", "Base Amount (INR)", "NUMBER"),
                column("exchangeRate", "Exchange Rate", "NUMBER"),

                column("referenceNumber", "Reference Number", "STRING"),
                column("description", "Description", "STRING"),

                column("active", "Active", "BOOLEAN"),

                column("createdAt", "Created At", "DATETIME"),
                column("updatedAt", "Updated At", "DATETIME")
        );
    }

    // =========================================================
    // REVERSAL COLUMNS
    // =========================================================

    private List<ReportColumn> getReversalColumns() {

        return List.of(

                column("id", "Transaction ID", "NUMBER"),
                column("transactionNumber", "Transaction Number", "STRING"),

                column("reversalOfId", "Original Transaction ID", "NUMBER"),

                column("bankAccountId", "Bank Account ID", "NUMBER"),
                column("bankAccountName", "Bank Account Name", "STRING"),

                column("direction", "Direction", "STRING"),
                column("transactionDate", "Transaction Date", "DATE"),

                column("amount", "Reversal Amount", "NUMBER"),
                column("currencyCode", "Currency", "STRING"),

                column("baseAmount", "Base Amount (INR)", "NUMBER"),

                column("referenceNumber", "Reference Number", "STRING"),
                column("description", "Description", "STRING"),

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
    // BANK TRANSACTION SPECIFICATION
    // =========================================================

    private Specification<BankTransactionEntity> buildSpecification(
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
                                        cb.lower(root.get("transactionNumber")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(root.get("referenceNumber")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(root.get("description")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(root.get("currencyCode")),
                                        keyword
                                )
                        )
                );
            }

            // -------------------------------------------------
            // TRANSACTION NUMBER
            // -------------------------------------------------

            String transactionNumber = getFilterValue(
                    customFilters,
                    "transactionNumber"
            );

            if (hasText(transactionNumber)) {

                predicates.add(
                        cb.like(
                                cb.lower(root.get("transactionNumber")),
                                containsPattern(transactionNumber)
                        )
                );
            }

            // -------------------------------------------------
            // BANK ACCOUNT ID
            // -------------------------------------------------

            Long bankAccountId = getLongFilter(
                    customFilters,
                    "bankAccountId"
            );

            if (bankAccountId != null) {

                predicates.add(
                        cb.equal(
                                root.get("bankAccount").get("id"),
                                bankAccountId
                        )
                );
            }

            // -------------------------------------------------
            // PAYMENT ID
            // -------------------------------------------------

            Long paymentId = getLongFilter(
                    customFilters,
                    "paymentId"
            );

            if (paymentId != null) {

                predicates.add(
                        cb.equal(
                                root.get("payment").get("id"),
                                paymentId
                        )
                );
            }

            // -------------------------------------------------
            // PARTY ID
            // -------------------------------------------------

            Long partyId = getLongFilter(
                    customFilters,
                    "partyId"
            );

            if (partyId != null) {

                predicates.add(
                        cb.equal(
                                root.get("party").get("id"),
                                partyId
                        )
                );
            }

            // -------------------------------------------------
            // DIRECTION
            // -------------------------------------------------

            String direction = getFilterValue(
                    customFilters,
                    "direction"
            );

            if (hasText(direction)
                    && !"ALL".equalsIgnoreCase(direction)) {

                try {

                    BankTransactionDirection transactionDirection =
                            BankTransactionDirection.valueOf(
                                    direction.trim().toUpperCase(Locale.ROOT)
                            );

                    predicates.add(
                            cb.equal(
                                    root.get("direction"),
                                    transactionDirection
                            )
                    );

                } catch (IllegalArgumentException exception) {

                    throw new IllegalArgumentException(
                            "Invalid bank transaction direction: " + direction
                    );
                }
            }

            // -------------------------------------------------
            // CURRENCY CODE
            // -------------------------------------------------

            String currencyCode = getFilterValue(
                    customFilters,
                    "currencyCode"
            );

            if (hasText(currencyCode)) {

                predicates.add(
                        cb.equal(
                                cb.upper(root.get("currencyCode")),
                                currencyCode.toUpperCase(Locale.ROOT)
                        )
                );
            }

            // -------------------------------------------------
            // REFERENCE NUMBER
            // -------------------------------------------------

            String referenceNumber = getFilterValue(
                    customFilters,
                    "referenceNumber"
            );

            if (hasText(referenceNumber)) {

                predicates.add(
                        cb.like(
                                cb.lower(root.get("referenceNumber")),
                                containsPattern(referenceNumber)
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
                                root.get("amount"),
                                minAmount
                        )
                );
            }

            if (maxAmount != null) {

                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("amount"),
                                maxAmount
                        )
                );
            }

            // -------------------------------------------------
            // BASE AMOUNT RANGE
            // -------------------------------------------------

            BigDecimal minBaseAmount = getBigDecimalFilter(
                    customFilters,
                    "minBaseAmount"
            );

            BigDecimal maxBaseAmount = getBigDecimalFilter(
                    customFilters,
                    "maxBaseAmount"
            );

            validateAmountRange(minBaseAmount, maxBaseAmount);

            if (minBaseAmount != null) {

                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("baseAmount"),
                                minBaseAmount
                        )
                );
            }

            if (maxBaseAmount != null) {

                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("baseAmount"),
                                maxBaseAmount
                        )
                );
            }

            // -------------------------------------------------
            // REVERSAL FILTER
            // -------------------------------------------------

            String reversalOnly = getFilterValue(
                    customFilters,
                    "reversalOnly"
            );

            if (hasText(reversalOnly)) {

                validateBoolean(reversalOnly, "reversalOnly");

                if (Boolean.parseBoolean(reversalOnly)) {

                    predicates.add(
                            cb.isNotNull(root.get("reversalOf"))
                    );

                } else {

                    predicates.add(
                            cb.isNull(root.get("reversalOf"))
                    );
                }
            }

            // -------------------------------------------------
            // ORIGINAL TRANSACTION ID
            // -------------------------------------------------

            Long reversalOfId = getLongFilter(
                    customFilters,
                    "reversalOfId"
            );

            if (reversalOfId != null) {

                predicates.add(
                        cb.equal(
                                root.get("reversalOf").get("id"),
                                reversalOfId
                        )
                );
            }

            // -------------------------------------------------
            // ACTIVE FLAG
            // -------------------------------------------------

            String active = getFilterValue(
                    customFilters,
                    "active"
            );

            if (hasText(active)) {

                validateBoolean(active, "active");

                predicates.add(
                        cb.equal(
                                root.get("active"),
                                Boolean.parseBoolean(active)
                        )
                );
            }

            // -------------------------------------------------
            // TRANSACTION DATE RANGE
            // -------------------------------------------------

            LocalDate transactionDateFrom = getDateFilter(
                    customFilters,
                    "transactionDateFrom"
            );

            LocalDate transactionDateTo = getDateFilter(
                    customFilters,
                    "transactionDateTo"
            );

            validateDateRange(
                    transactionDateFrom,
                    transactionDateTo
            );

            if (transactionDateFrom != null) {

                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("transactionDate"),
                                transactionDateFrom
                        )
                );
            }

            if (transactionDateTo != null) {

                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("transactionDate"),
                                transactionDateTo
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
                                root.get("transactionDate"),
                                fromDate
                        )
                );
            }

            if (toDate != null) {

                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("transactionDate"),
                                toDate
                        )
                );
            }

            // -------------------------------------------------
            // COMMON STATUS FILTER
            // -------------------------------------------------

            String status = filters.getStatus();

            if (hasText(status)
                    && !"ALL".equalsIgnoreCase(status)) {

                validateBoolean(status, "status");

                predicates.add(
                        cb.equal(
                                root.get("active"),
                                Boolean.parseBoolean(status)
                        )
                );
            }

            return cb.and(
                    predicates.toArray(new Predicate[0])
            );
        };
    }

    // =========================================================
    // MAP TRANSACTION
    // =========================================================

    private Map<String, Object> mapTransaction(
            BankTransactionEntity transaction,
            String reportCode
    ) {

        Map<String, Object> row = new LinkedHashMap<>();

        switch (reportCode) {

            case "BANK_TRANSACTION_REGISTER" ->
                    mapRegister(transaction, row);

            case "BANK_TRANSACTION_DETAILS" ->
                    mapDetails(transaction, row);

            case "BANK_TRANSACTION_REVERSALS" ->
                    mapReversal(transaction, row);

            default -> throw new IllegalArgumentException(
                    "Unsupported bank transaction report: " + reportCode
            );
        }

        return row;
    }

    // =========================================================
    // MAP REGISTER
    // =========================================================

    private void mapRegister(
            BankTransactionEntity transaction,
            Map<String, Object> row
    ) {

        row.put("id", transaction.getId());

        row.put(
                "transactionNumber",
                transaction.getTransactionNumber()
        );

        row.put(
                "bankAccountId",
                transaction.getBankAccount() == null
                        ? null
                        : transaction.getBankAccount().getId()
        );

        row.put(
                "bankAccountName",
                transaction.getBankAccount() == null
                        ? null
                        : transaction.getBankAccount().getAccountName()
        );

        row.put(
                "direction",
                transaction.getDirection() == null
                        ? null
                        : transaction.getDirection().name()
        );

        row.put("transactionDate", transaction.getTransactionDate());
        row.put("amount", transaction.getAmount());
        row.put("currencyCode", transaction.getCurrencyCode());
        row.put("baseAmount", transaction.getBaseAmount());
        row.put("exchangeRate", transaction.getExchangeRate());
        row.put("referenceNumber", transaction.getReferenceNumber());

        row.put("active", transaction.getActive());

        row.put("createdAt", transaction.getCreatedAt());
        row.put("updatedAt", transaction.getUpdatedAt());
        row.put("createdBy", transaction.getCreatedBy());
        row.put("updatedBy", transaction.getUpdatedBy());
    }

    // =========================================================
    // MAP DETAILS
    // =========================================================

    private void mapDetails(
            BankTransactionEntity transaction,
            Map<String, Object> row
    ) {

        row.put("id", transaction.getId());

        row.put(
                "transactionNumber",
                transaction.getTransactionNumber()
        );

        row.put(
                "bankAccountId",
                transaction.getBankAccount() == null
                        ? null
                        : transaction.getBankAccount().getId()
        );

        row.put(
                "bankAccountName",
                transaction.getBankAccount() == null
                        ? null
                        : transaction.getBankAccount().getAccountName()
        );

        row.put(
                "paymentId",
                transaction.getPayment() == null
                        ? null
                        : transaction.getPayment().getId()
        );

        row.put(
                "partyId",
                transaction.getParty() == null
                        ? null
                        : transaction.getParty().getId()
        );

        row.put(
                "partyName",
                transaction.getParty() == null
                        ? null
                        : transaction.getParty().getCompanyName()
        );

        row.put(
                "direction",
                transaction.getDirection() == null
                        ? null
                        : transaction.getDirection().name()
        );

        row.put("transactionDate", transaction.getTransactionDate());
        row.put("amount", transaction.getAmount());
        row.put("currencyCode", transaction.getCurrencyCode());
        row.put("baseAmount", transaction.getBaseAmount());
        row.put("exchangeRate", transaction.getExchangeRate());
        row.put("referenceNumber", transaction.getReferenceNumber());
        row.put("description", transaction.getDescription());

        row.put("active", transaction.getActive());

        row.put("createdAt", transaction.getCreatedAt());
        row.put("updatedAt", transaction.getUpdatedAt());
    }

    // =========================================================
    // MAP REVERSAL
    // =========================================================

    private void mapReversal(
            BankTransactionEntity transaction,
            Map<String, Object> row
    ) {

        row.put("id", transaction.getId());

        row.put(
                "transactionNumber",
                transaction.getTransactionNumber()
        );

        row.put(
                "reversalOfId",
                transaction.getReversalOf() == null
                        ? null
                        : transaction.getReversalOf().getId()
        );

        row.put(
                "bankAccountId",
                transaction.getBankAccount() == null
                        ? null
                        : transaction.getBankAccount().getId()
        );

        row.put(
                "bankAccountName",
                transaction.getBankAccount() == null
                        ? null
                        : transaction.getBankAccount().getAccountName()
        );

        row.put(
                "direction",
                transaction.getDirection() == null
                        ? null
                        : transaction.getDirection().name()
        );

        row.put("transactionDate", transaction.getTransactionDate());
        row.put("amount", transaction.getAmount());
        row.put("currencyCode", transaction.getCurrencyCode());
        row.put("baseAmount", transaction.getBaseAmount());
        row.put("referenceNumber", transaction.getReferenceNumber());
        row.put("description", transaction.getDescription());

        row.put("active", transaction.getActive());
        row.put("createdAt", transaction.getCreatedAt());
    }

    // =========================================================
    // SUMMARY
    // =========================================================

    private ReportSummaryResponse generateSummary(
            Specification<BankTransactionEntity> specification
    ) {

        long totalTransactions =
                bankTransactionRepository.count(specification);

        long creditTransactions =
                bankTransactionRepository.count(
                        specification.and(
                                (root, query, cb) ->
                                        cb.equal(
                                                root.get("direction"),
                                                BankTransactionDirection.CREDIT
                                        )
                        )
                );

        long debitTransactions =
                bankTransactionRepository.count(
                        specification.and(
                                (root, query, cb) ->
                                        cb.equal(
                                                root.get("direction"),
                                                BankTransactionDirection.DEBIT
                                        )
                        )
                );

        long reversalTransactions =
                bankTransactionRepository.count(
                        specification.and(
                                (root, query, cb) ->
                                        cb.isNotNull(root.get("reversalOf"))
                        )
                );

        long originalTransactions =
                bankTransactionRepository.count(
                        specification.and(
                                (root, query, cb) ->
                                        cb.isNull(root.get("reversalOf"))
                        )
                );

        long activeRecords =
                bankTransactionRepository.count(
                        specification.and(
                                (root, query, cb) ->
                                        cb.isTrue(root.get("active"))
                        )
                );

        long inactiveRecords =
                bankTransactionRepository.count(
                        specification.and(
                                (root, query, cb) ->
                                        cb.isFalse(root.get("active"))
                        )
                );

        Map<String, Object> metrics = new LinkedHashMap<>();

        metrics.put("totalTransactions", totalTransactions);
        metrics.put("creditTransactions", creditTransactions);
        metrics.put("debitTransactions", debitTransactions);
        metrics.put("reversalTransactions", reversalTransactions);
        metrics.put("originalTransactions", originalTransactions);
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

            case "transactionNumber" -> "transactionNumber";
            case "bankAccountId" -> "bankAccount.id";
            case "bankAccountName" -> "bankAccount.accountName";
            case "paymentId" -> "payment.id";
            case "partyId" -> "party.id";
            case "direction" -> "direction";
            case "transactionDate" -> "transactionDate";
            case "amount" -> "amount";
            case "baseAmount" -> "baseAmount";
            case "exchangeRate" -> "exchangeRate";
            case "currencyCode" -> "currencyCode";
            case "referenceNumber" -> "referenceNumber";
            case "createdAt" -> "createdAt";
            case "updatedAt" -> "updatedAt";
            case "id" -> "id";

            default -> "id";
        };
    }

    // =========================================================
    // HELPERS
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

    private void validateBoolean(
            String value,
            String fieldName
    ) {

        if (!"true".equalsIgnoreCase(value)
                && !"false".equalsIgnoreCase(value)) {

            throw new IllegalArgumentException(
                    fieldName + " filter must be true or false."
            );
        }
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