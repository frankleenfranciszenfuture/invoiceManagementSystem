package com.ims.reports.provider.bankAccount;


import com.ims.dtos.reports.*;
import com.ims.entity.BankAccount;
import com.ims.enums.BankAccountStatus;
import com.ims.enums.BankAccountType;
import com.ims.enums.reports.ReportModule;
import com.ims.enums.reports.ReportType;
import com.ims.repository.BankAccountRepository;

import com.ims.repository.BankAccountRepositoryCustom;
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
public class BankAccountReportProvider implements ReportDataProvider {

    private final BankAccountRepository bankAccountRepository;
    private final BankAccountRepositoryCustom bankAccountRepositoryCustom;
    // =====================================================
    // MODULE
    // =====================================================

    @Override
    public ReportModule getModule() {
        return ReportModule.BANK_ACCOUNT;
    }

    // =====================================================
    // REPORT DEFINITION
    // =====================================================

    @Override
    public List<ReportDefinition> getReportDefinitions() {

        return List.of(
                ReportDefinition.builder()
                        .code("BANK_ACCOUNT_REPORT")
                        .name("Bank Account Report")
                        .description(
                                "Complete bank account information including " +
                                        "account details, bank information, assigned " +
                                        "users, balances, status and audit information."
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
                column("accountType", "Account Type", "STRING"),
                column("accountName", "Account Name", "STRING"),
                column("accountCode", "Account Code", "STRING"),
                column("currency", "Currency", "STRING"),

                // Bank information

                column("accountNumber", "Account Number", "STRING"),
                column("bankName", "Bank Name", "STRING"),
                column("branchName", "Branch Name", "STRING"),
                column("ifsc", "IFSC Code", "STRING"),
                column("swiftCode", "SWIFT Code", "STRING"),

                // Assigned users

                column("userIds", "Assigned User IDs", "STRING"),
                column("assignedUserCount", "Assigned User Count", "NUMBER"),

                // Description

                column("description", "Description", "STRING"),

                // Balance information

                column("openingBalance", "Opening Balance", "DECIMAL"),
                column("currentBalance", "Current Balance", "DECIMAL"),

                // Account settings

                column("primaryAccount", "Primary Account", "BOOLEAN"),

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

        Specification<BankAccount> specification =
                buildSpecification(request.getFilters());

        Pageable databasePageable =
                mapSortProperties(pageable);

        Page<BankAccount> accountPage =
                bankAccountRepository.findAll(
                        specification,
                        databasePageable
                );

        List<Map<String, Object>> rows =
                accountPage.getContent()
                        .stream()
                        .map(this::mapBankAccount)
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

    private Specification<BankAccount> buildSpecification(
            ReportFilterRequest filters
    ) {

        return (root, query, cb) -> {

            List<Predicate> predicates = new ArrayList<>();

            if (filters == null) {
                return cb.conjunction();
            }

            // Keyword search

            if (hasText(filters.getKeyword())) {

                String keyword =
                        containsPattern(filters.getKeyword());

                predicates.add(
                        cb.or(
                                cb.like(cb.lower(root.get("accountName")), keyword),
                                cb.like(cb.lower(root.get("accountCode")), keyword),
                                cb.like(cb.lower(root.get("accountNumber")), keyword),
                                cb.like(cb.lower(root.get("bankName")), keyword),
                                cb.like(cb.lower(root.get("branchName")), keyword),
                                cb.like(cb.lower(root.get("ifsc")), keyword),
                                cb.like(cb.lower(root.get("swiftCode")), keyword),
                                cb.like(cb.lower(root.get("currency")), keyword)
                        )
                );
            }

            Map<String, Object> customFilters =
                    filters.getFilters() == null
                            ? Map.of()
                            : filters.getFilters();

            // Account type

            String accountType =
                    getFilterValue(customFilters, "accountType");

            if (hasText(accountType)) {

                try {

                    BankAccountType type =
                            BankAccountType.valueOf(
                                    accountType.toUpperCase(Locale.ROOT)
                            );

                    predicates.add(
                            cb.equal(root.get("accountType"), type)
                    );

                } catch (IllegalArgumentException exception) {

                    throw new IllegalArgumentException(
                            "Invalid bank account type: " + accountType
                    );
                }
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

            // Bank name

            String bankName =
                    getFilterValue(customFilters, "bankName");

            if (hasText(bankName)) {

                predicates.add(
                        cb.like(
                                cb.lower(root.get("bankName")),
                                containsPattern(bankName)
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

                try {

                    BankAccountStatus accountStatus =
                            BankAccountStatus.valueOf(
                                    status.toUpperCase(Locale.ROOT)
                            );

                    predicates.add(
                            cb.equal(root.get("status"), accountStatus)
                    );

                } catch (IllegalArgumentException exception) {

                    throw new IllegalArgumentException(
                            "Invalid bank account status: " + status
                    );
                }
            }

            // Primary account

            String primaryAccount =
                    getFilterValue(customFilters, "primaryAccount");

            if (hasText(primaryAccount)) {

                predicates.add(
                        cb.equal(
                                root.get("primaryAccount"),
                                parseBoolean(primaryAccount, "primaryAccount")
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

            // Minimum current balance

            String minBalance =
                    getFilterValue(customFilters, "minBalance");

            if (hasText(minBalance)) {

                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("currentBalance"),
                                parseAmount(minBalance, "minBalance")
                        )
                );
            }

            // Maximum current balance

            String maxBalance =
                    getFilterValue(customFilters, "maxBalance");

            if (hasText(maxBalance)) {

                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("currentBalance"),
                                parseAmount(maxBalance, "maxBalance")
                        )
                );
            }

            if (hasText(minBalance) && hasText(maxBalance)
                    && parseAmount(minBalance, "minBalance")
                    .compareTo(parseAmount(maxBalance, "maxBalance")) > 0) {

                throw new IllegalArgumentException(
                        "Minimum balance cannot exceed maximum balance."
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
    // MAP BANK ACCOUNT
    // =====================================================

    private Map<String, Object> mapBankAccount(
            BankAccount account
    ) {

        Map<String, Object> row = new LinkedHashMap<>();

        row.put("id", account.getId());

        row.put("accountType",
                account.getAccountType() == null
                        ? null
                        : account.getAccountType().name());

        row.put("accountName", account.getAccountName());
        row.put("accountCode", account.getAccountCode());
        row.put("currency", account.getCurrency());

        row.put("accountNumber", account.getAccountNumber());
        row.put("bankName", account.getBankName());
        row.put("branchName", account.getBranchName());
        row.put("ifsc", account.getIfsc());
        row.put("swiftCode", account.getSwiftCode());

        List<Long> userIds = account.getUserIds() == null
                ? List.of()
                : account.getUserIds();

        row.put("userIds", String.join(
                ", ",
                userIds.stream()
                        .map(String::valueOf)
                        .toList()
        ));

        row.put("assignedUserCount", userIds.size());

        row.put("description", account.getDescription());

        row.put("openingBalance", account.getOpeningBalance());
        row.put("currentBalance", account.getCurrentBalance());

        row.put("primaryAccount", account.getPrimaryAccount());

        row.put("status",
                account.getStatus() == null
                        ? null
                        : account.getStatus().name());

        row.put("active", account.getActive());

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
            Specification<BankAccount> specification
    ) {

        long totalAccounts =
                bankAccountRepository.count(specification);

        long activeAccounts =
                bankAccountRepository.count(
                        specification.and(
                                (root, query, cb) ->
                                        cb.equal(
                                                root.get("status"),
                                                BankAccountStatus.ACTIVE
                                        )
                        )
                );

        long inactiveAccounts =
                bankAccountRepository.count(
                        specification.and(
                                (root, query, cb) ->
                                        cb.equal(
                                                root.get("status"),
                                                BankAccountStatus.INACTIVE
                                        )
                        )
                );

        long primaryAccounts =
                bankAccountRepository.count(
                        specification.and(
                                (root, query, cb) ->
                                        cb.isTrue(root.get("primaryAccount"))
                        )
                );

        long activeRecords =
                bankAccountRepository.count(
                        specification.and(
                                (root, query, cb) ->
                                        cb.isTrue(root.get("active"))
                        )
                );

        BigDecimal totalOpeningBalance =
                calculateBalance(specification, true);

        BigDecimal totalCurrentBalance =
                calculateBalance(specification, false);

        Map<String, Object> metrics = new LinkedHashMap<>();

        metrics.put("totalAccounts", totalAccounts);
        metrics.put("activeAccounts", activeAccounts);
        metrics.put("inactiveAccounts", inactiveAccounts);
        metrics.put("primaryAccounts", primaryAccounts);
        metrics.put("activeRecords", activeRecords);
        metrics.put("totalOpeningBalance", totalOpeningBalance);
        metrics.put("totalCurrentBalance", totalCurrentBalance);

        return ReportSummaryResponse.builder()
                .metrics(metrics)
                .build();
    }

    private BigDecimal calculateBalance(
            Specification<BankAccount> specification,
            boolean opening
    ) {

        // Aggregate in the database instead of loading every account.

        return bankAccountRepositoryCustom.sumBalance(
                specification,
                opening
        );
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
                 "accountType",
                 "accountName",
                 "accountCode",
                 "currency",
                 "accountNumber",
                 "bankName",
                 "branchName",
                 "openingBalance",
                 "currentBalance",
                 "primaryAccount",
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

        return "%" +
                value.trim().toLowerCase(Locale.ROOT) +
                "%";
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

