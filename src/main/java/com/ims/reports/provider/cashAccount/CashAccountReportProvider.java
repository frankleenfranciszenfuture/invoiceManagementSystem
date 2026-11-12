
package com.ims.reports.provider.cashAccount;

import com.ims.dtos.reports.*;
import com.ims.entity.CashAccountEntity;
import com.ims.enums.reports.ReportModule;
import com.ims.enums.reports.ReportType;
import com.ims.repository.CashAccountRepository;

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
import java.util.*;

@Component
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CashAccountReportProvider implements ReportDataProvider {

    private final CashAccountRepository cashAccountRepository;

    // =====================================================
    // MODULE
    // =====================================================

    @Override
    public ReportModule getModule() {
        return ReportModule.CASH_ACCOUNT;
    }

    // =====================================================
    // REPORT DEFINITION
    // =====================================================

    @Override
    public List<ReportDefinition> getReportDefinitions() {

        return List.of(
                ReportDefinition.builder()
                        .code("CASH_ACCOUNT_REPORT")
                        .name("Cash Account Report")
                        .description(
                                "Complete cash account information including account details, "
                                        + "currency, balances, status and audit information."
                        )
                        .type(ReportType.REGISTER)
                        .columns(getColumns())
                        .build()
        );
    }

    // =====================================================
    // REPORT COLUMNS
    // =====================================================

    private List<ReportColumn> getColumns() {

        return List.of(

                // Account information

                column("id", "Account ID", "NUMBER"),
                column("accountName", "Account Name", "STRING"),
                column("accountCode", "Account Code", "STRING"),
                column("currency", "Currency", "STRING"),

                // Balance information

                column("openingBalance", "Opening Balance", "DECIMAL"),
                column("currentBalance", "Current Balance", "DECIMAL"),

                // Description

                column("description", "Description", "STRING"),

                // Status

                column("status", "Account Status", "STRING"),
                column("active", "Active", "BOOLEAN"),

                // Audit

                column("createdAt", "Created At", "DATETIME"),
                column("updatedAt", "Updated At", "DATETIME"),
                column("createdBy", "Created By", "NUMBER"),
                column("updatedBy", "Updated By", "NUMBER")
        );
    }

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

    // =====================================================
    // GENERATE REPORT
    // =====================================================

    @Override
    public ReportData generate(
            ReportRequest request,
            Pageable pageable
    ) {

        if (request == null || !hasText(request.getReportCode())) {
            throw new IllegalArgumentException("Report code is required.");
        }

        if (!"CASH_ACCOUNT_REPORT".equalsIgnoreCase(
                request.getReportCode().trim()
        )) {
            throw new IllegalArgumentException(
                    "Invalid cash account report code."
            );
        }

        ReportFilterRequest filters = request.getFilters();

        Specification<CashAccountEntity> specification =
                buildSpecification(filters);

        Pageable databasePageable = mapSortProperties(pageable);

        Page<CashAccountEntity> accountPage =
                cashAccountRepository.findAll(
                        specification,
                        databasePageable
                );

        List<Map<String, Object>> rows =
                accountPage.getContent()
                        .stream()
                        .map(this::mapCashAccount)
                        .toList();

        ReportSummaryResponse summary =
                generateSummary(specification);

        return ReportData.builder()
                .columns(getColumns())
                .rows(rows)
                .totalElements(accountPage.getTotalElements())
                .pageNumber(accountPage.getNumber())
                .pageSize(accountPage.getSize())
                .totalPages(accountPage.getTotalPages())
                .last(accountPage.isLast())
                .summary(summary)
                .build();
    }

    // =====================================================
    // FILTER SPECIFICATION
    // =====================================================

    private Specification<CashAccountEntity> buildSpecification(
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

            // Keyword search

            if (hasText(filters.getKeyword())) {

                String keyword = containsPattern(filters.getKeyword());

                predicates.add(
                        cb.or(
                                cb.like(
                                        cb.lower(root.get("accountName")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(root.get("accountCode")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(root.get("currency")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(root.get("description")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(root.get("status")),
                                        keyword
                                )
                        )
                );
            }

            // Account name

            String accountName =
                    getFilterValue(customFilters, "accountName");

            if (hasText(accountName)) {

                predicates.add(
                        cb.like(
                                cb.lower(root.get("accountName")),
                                containsPattern(accountName)
                        )
                );
            }

            // Account code

            String accountCode =
                    getFilterValue(customFilters, "accountCode");

            if (hasText(accountCode)) {

                predicates.add(
                        cb.like(
                                cb.lower(root.get("accountCode")),
                                containsPattern(accountCode)
                        )
                );
            }

            // Currency

            String currency =
                    getFilterValue(customFilters, "currency");

            if (hasText(currency)) {

                predicates.add(
                        cb.equal(
                                cb.upper(root.get("currency")),
                                currency.toUpperCase(Locale.ROOT)
                        )
                );
            }

            // Account status

            String status =
                    getFilterValue(customFilters, "status");

            if (!hasText(status)) {
                status = filters.getStatus();
            }

            if (hasText(status) && !"ALL".equalsIgnoreCase(status)) {

                predicates.add(
                        cb.equal(
                                cb.upper(root.get("status")),
                                status.toUpperCase(Locale.ROOT)
                        )
                );
            }

            // Active

            String active =
                    getFilterValue(customFilters, "active");

            if (hasText(active)) {

                predicates.add(
                        cb.equal(
                                root.get("active"),
                                parseBoolean(active, "active")
                        )
                );
            }

            // Minimum opening balance

            String minOpeningBalance =
                    getFilterValue(customFilters, "minOpeningBalance");

            if (hasText(minOpeningBalance)) {

                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("openingBalance"),
                                parseAmount(
                                        minOpeningBalance,
                                        "minOpeningBalance"
                                )
                        )
                );
            }

            // Maximum opening balance

            String maxOpeningBalance =
                    getFilterValue(customFilters, "maxOpeningBalance");

            if (hasText(maxOpeningBalance)) {

                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("openingBalance"),
                                parseAmount(
                                        maxOpeningBalance,
                                        "maxOpeningBalance"
                                )
                        )
                );
            }

            // Minimum current balance

            String minCurrentBalance =
                    getFilterValue(customFilters, "minCurrentBalance");

            if (hasText(minCurrentBalance)) {

                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("currentBalance"),
                                parseAmount(
                                        minCurrentBalance,
                                        "minCurrentBalance"
                                )
                        )
                );
            }

            // Maximum current balance

            String maxCurrentBalance =
                    getFilterValue(customFilters, "maxCurrentBalance");

            if (hasText(maxCurrentBalance)) {

                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("currentBalance"),
                                parseAmount(
                                        maxCurrentBalance,
                                        "maxCurrentBalance"
                                )
                        )
                );
            }

            // Validate opening balance range

            if (hasText(minOpeningBalance)
                    && hasText(maxOpeningBalance)
                    && parseAmount(minOpeningBalance, "minOpeningBalance")
                    .compareTo(
                            parseAmount(maxOpeningBalance, "maxOpeningBalance")
                    ) > 0) {

                throw new IllegalArgumentException(
                        "Minimum opening balance cannot exceed maximum opening balance."
                );
            }

            // Validate current balance range

            if (hasText(minCurrentBalance)
                    && hasText(maxCurrentBalance)
                    && parseAmount(minCurrentBalance, "minCurrentBalance")
                    .compareTo(
                            parseAmount(maxCurrentBalance, "maxCurrentBalance")
                    ) > 0) {

                throw new IllegalArgumentException(
                        "Minimum current balance cannot exceed maximum current balance."
                );
            }

            // Created date range

            LocalDate fromDate = filters.getFromDate();
            LocalDate toDate = filters.getToDate();

            if (fromDate != null && toDate != null
                    && fromDate.isAfter(toDate)) {

                throw new IllegalArgumentException(
                        "From date cannot be after to date."
                );
            }

            if (fromDate != null) {

                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("createdAt"),
                                fromDate.atStartOfDay()
                        )
                );
            }

            if (toDate != null) {

                predicates.add(
                        cb.lessThan(
                                root.get("createdAt"),
                                toDate.plusDays(1).atStartOfDay()
                        )
                );
            }

            return cb.and(
                    predicates.toArray(new Predicate[0])
            );
        };
    }

    // =====================================================
    // MAP CASH ACCOUNT
    // =====================================================

    private Map<String, Object> mapCashAccount(
            CashAccountEntity account
    ) {

        Map<String, Object> row = new LinkedHashMap<>();

        row.put("id", account.getId());

        row.put("accountName", account.getAccountName());
        row.put("accountCode", account.getAccountCode());
        row.put("currency", account.getCurrency());

        row.put("openingBalance", account.getOpeningBalance());
        row.put("currentBalance", account.getCurrentBalance());

        row.put("description", account.getDescription());
        row.put("status", account.getStatus());
        row.put("active", account.getActive());

        // Audit information

        row.put("createdAt", account.getCreatedAt());
        row.put("updatedAt", account.getUpdatedAt());
        row.put("createdBy", account.getCreatedBy());
        row.put("updatedBy", account.getUpdatedBy());

        return row;
    }

    // =====================================================
    // SUMMARY
    // =====================================================

    private ReportSummaryResponse generateSummary(
            Specification<CashAccountEntity> specification
    ) {

        long totalAccounts =
                cashAccountRepository.count(specification);

        long activeAccounts =
                cashAccountRepository.count(
                        specification.and(
                                (root, query, cb) ->
                                        cb.equal(
                                                root.get("status"),
                                                "ACTIVE"
                                        )
                        )
                );

        long inactiveAccounts =
                cashAccountRepository.count(
                        specification.and(
                                (root, query, cb) ->
                                        cb.equal(
                                                root.get("status"),
                                                "INACTIVE"
                                        )
                        )
                );

        long activeRecords =
                cashAccountRepository.count(
                        specification.and(
                                (root, query, cb) ->
                                        cb.isTrue(root.get("active"))
                        )
                );

        long inactiveRecords =
                cashAccountRepository.count(
                        specification.and(
                                (root, query, cb) ->
                                        cb.isFalse(root.get("active"))
                        )
                );

        Map<String, Object> metrics = new LinkedHashMap<>();

        metrics.put("totalAccounts", totalAccounts);
        metrics.put("activeAccounts", activeAccounts);
        metrics.put("inactiveAccounts", inactiveAccounts);
        metrics.put("activeRecords", activeRecords);
        metrics.put("inactiveRecords", inactiveRecords);

        return ReportSummaryResponse.builder()
                .metrics(metrics)
                .build();
    }

    // =====================================================
    // SORT MAPPING
    // =====================================================

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

            case "id",
                 "accountName",
                 "accountCode",
                 "currency",
                 "openingBalance",
                 "currentBalance",
                 "status",
                 "active",
                 "createdAt",
                 "updatedAt" -> field;

            default -> "id";
        };
    }

    // =====================================================
    // HELPERS
    // =====================================================

    private String getFilterValue(
            Map<String, Object> filters,
            String key
    ) {

        Object value = filters.get(key);

        return value == null
                ? null
                : String.valueOf(value).trim();
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private String containsPattern(String value) {

        return "%"
                + value.trim().toLowerCase(Locale.ROOT)
                + "%";
    }

    private Boolean parseBoolean(
            String value,
            String field
    ) {

        if (!"true".equalsIgnoreCase(value)
                && !"false".equalsIgnoreCase(value)) {

            throw new IllegalArgumentException(
                    field + " must be true or false."
            );
        }

        return Boolean.parseBoolean(value);
    }

    private BigDecimal parseAmount(
            String value,
            String field
    ) {

        try {

            return new BigDecimal(value);

        } catch (NumberFormatException exception) {

            throw new IllegalArgumentException(
                    "Invalid amount for " + field
            );
        }
    }
}
