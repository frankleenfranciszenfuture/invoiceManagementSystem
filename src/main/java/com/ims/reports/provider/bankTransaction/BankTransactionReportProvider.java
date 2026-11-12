
package com.ims.reports.provider.bankTransaction;

import com.ims.dtos.reports.*;
import com.ims.entity.BankTransactionEntity;
import com.ims.enums.BankTransactionDirection;
import com.ims.enums.reports.ReportModule;
import com.ims.enums.reports.ReportType;
import com.ims.repository.BankTransactionRepository;

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
public class BankTransactionReportProvider implements ReportDataProvider {

    private final BankTransactionRepository bankTransactionRepository;

    // =====================================================
    // MODULE
    // =====================================================

    @Override
    public ReportModule getModule() {
        return ReportModule.BANK_TRANSACTION;
    }

    // =====================================================
    // REPORT DEFINITION
    // =====================================================

    @Override
    public List<ReportDefinition> getReportDefinitions() {

        return List.of(
                ReportDefinition.builder()
                        .code("BANK_TRANSACTION_REPORT")
                        .name("Bank Transaction Report")
                        .description(
                                "Complete bank transaction information including " +
                                        "bank account, payment, party, transaction amounts, " +
                                        "references, reversals and audit information."
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

                // Transaction information

                column("id", "Transaction ID", "NUMBER"),
                column("transactionNumber", "Transaction Number", "STRING"),
                column("direction", "Direction", "STRING"),
                column("transactionDate", "Transaction Date", "DATE"),

                // Bank account information

                column("bankAccountId", "Bank Account ID", "NUMBER"),
                column("bankAccountName", "Bank Account Name", "STRING"),

                // Payment information

                column("paymentId", "Payment ID", "NUMBER"),
                column("paymentNumber", "Payment Number", "STRING"),

                // Party information

                column("partyId", "Party ID", "NUMBER"),
                column("partyName", "Party Name", "STRING"),

                // Financial information

                column("amount", "Transaction Amount", "DECIMAL"),
                column("baseAmount", "Base Amount (INR)", "DECIMAL"),
                column("exchangeRate", "Exchange Rate", "DECIMAL"),
                column("currencyCode", "Currency", "STRING"),

                // Reference information

                column("referenceNumber", "Reference Number", "STRING"),
                column("description", "Description", "STRING"),

                // Reversal information

                column("reversalOfId", "Reversal Of Transaction ID", "NUMBER"),

                // Audit information

                column("createdAt", "Created At", "DATETIME"),
                column("updatedAt", "Updated At", "DATETIME"),
                column("createdBy", "Created By", "NUMBER"),
                column("updatedBy", "Updated By", "NUMBER"),
                column("active", "Active", "BOOLEAN")
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

        Specification<BankTransactionEntity> specification =
                buildSpecification(request.getFilters());

        Pageable databasePageable =
                mapSortProperties(pageable);

        Page<BankTransactionEntity> transactionPage =
                bankTransactionRepository.findAll(
                        specification,
                        databasePageable
                );

        List<Map<String, Object>> rows =
                transactionPage.getContent()
                        .stream()
                        .map(this::mapBankTransaction)
                        .toList();

        ReportSummaryResponse summary =
                generateSummary(specification);

        return ReportData.builder()
                .columns(getColumns())
                .rows(rows)
                .totalElements(transactionPage.getTotalElements())
                .pageNumber(transactionPage.getNumber())
                .pageSize(transactionPage.getSize())
                .totalPages(transactionPage.getTotalPages())
                .last(transactionPage.isLast())
                .summary(summary)
                .build();
    }

    // =====================================================
    // FILTER SPECIFICATION
    // =====================================================

    private Specification<BankTransactionEntity> buildSpecification(
            ReportFilterRequest filters
    ) {

        return (root, query, cb) -> {

            List<Predicate> predicates = new ArrayList<>();

            if (filters == null) {
                return cb.conjunction();
            }

            // Bank account filter

            String bankAccountId =
                    getFilterValue(filters.getFilters(), "bankAccountId");

            if (hasText(bankAccountId)) {

                predicates.add(
                        cb.equal(
                                root.get("bankAccount").get("id"),
                                parseLong(bankAccountId, "bankAccountId")
                        )
                );
            }

            // Transaction direction

            String direction =
                    getFilterValue(filters.getFilters(), "direction");

            if (hasText(direction)
                    && !"ALL".equalsIgnoreCase(direction)) {

                try {

                    BankTransactionDirection transactionDirection =
                            BankTransactionDirection.valueOf(
                                    direction.toUpperCase(Locale.ROOT)
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

            // Transaction date range

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

            // Keyword search

            if (hasText(filters.getKeyword())) {

                String keyword =
                        containsPattern(filters.getKeyword());

                predicates.add(
                        cb.or(

                                cb.like(
                                        cb.lower(root.get("transactionNumber")),
                                        keyword
                                ),

                                cb.like(
                                        cb.lower(
                                                root.get("bankAccount")
                                                        .get("accountName")
                                        ),
                                        keyword
                                ),

                                cb.like(
                                        cb.lower(
                                                root.get("payment")
                                                        .get("paymentNumber")
                                        ),
                                        keyword
                                ),

                                cb.like(
                                        cb.lower(
                                                root.get("party")
                                                        .get("displayName")
                                        ),
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

            return cb.and(
                    predicates.toArray(new Predicate[0])
            );
        };
    }

    // =====================================================
    // MAP BANK TRANSACTION
    // =====================================================

    private Map<String, Object> mapBankTransaction(
            BankTransactionEntity transaction
    ) {

        Map<String, Object> row = new LinkedHashMap<>();

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
                "paymentNumber",
                transaction.getPayment() == null
                        ? null
                        : transaction.getPayment().getPaymentNumber()
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

        row.put(
                "transactionDate",
                transaction.getTransactionDate()
        );

        row.put("amount", transaction.getAmount());

        row.put("baseAmount", transaction.getBaseAmount());

        row.put("exchangeRate", transaction.getExchangeRate());

        row.put("currencyCode", transaction.getCurrencyCode());

        row.put(
                "referenceNumber",
                transaction.getReferenceNumber()
        );

        row.put("description", transaction.getDescription());

        row.put(
                "reversalOfId",
                transaction.getReversalOf() == null
                        ? null
                        : transaction.getReversalOf().getId()
        );

        row.put("createdAt", transaction.getCreatedAt());

        row.put("updatedAt", transaction.getUpdatedAt());

        row.put("createdBy", transaction.getCreatedBy());

        row.put("updatedBy", transaction.getUpdatedBy());

        row.put("active", transaction.getActive());

        return row;
    }

    // =====================================================
    // SUMMARY
    // =====================================================

    private ReportSummaryResponse generateSummary(
            Specification<BankTransactionEntity> specification
    ) {

        long totalTransactions =
                bankTransactionRepository.count(specification);

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

        long reversalTransactions =
                bankTransactionRepository.count(
                        specification.and(
                                (root, query, cb) ->
                                        cb.isNotNull(root.get("reversalOf"))
                        )
                );

        BigDecimal totalDebitBaseAmount =
                calculateBaseAmount(
                        specification,
                        BankTransactionDirection.DEBIT
                );

        BigDecimal totalCreditBaseAmount =
                calculateBaseAmount(
                        specification,
                        BankTransactionDirection.CREDIT
                );

        Map<String, Object> metrics = new LinkedHashMap<>();

        metrics.put("totalTransactions", totalTransactions);

        metrics.put("debitTransactions", debitTransactions);

        metrics.put("creditTransactions", creditTransactions);

        metrics.put(
                "totalDebitBaseAmount",
                totalDebitBaseAmount
        );

        metrics.put(
                "totalCreditBaseAmount",
                totalCreditBaseAmount
        );

        metrics.put(
                "reversalTransactions",
                reversalTransactions
        );

        return ReportSummaryResponse.builder()
                .metrics(metrics)
                .build();
    }

    // =====================================================
    // BASE AMOUNT CALCULATION
    // =====================================================

    private BigDecimal calculateBaseAmount(
            Specification<BankTransactionEntity> specification,
            BankTransactionDirection direction
    ) {

        List<BankTransactionEntity> transactions =
                bankTransactionRepository.findAll(
                        specification.and(
                                (root, query, cb) ->
                                        cb.equal(
                                                root.get("direction"),
                                                direction
                                        )
                        )
                );

        return transactions.stream()
                .map(BankTransactionEntity::getBaseAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
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

            case "transactionDate",
                 "transactionNumber",
                 "amount",
                 "createdAt",
                 "updatedAt" -> field;

            default -> "transactionDate";
        };
    }

    // =====================================================
    // HELPERS
    // =====================================================

    private String getFilterValue(
            Map<String, Object> filters,
            String key
    ) {

        if (filters == null) {
            return null;
        }

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

    private Long parseLong(
            String value,
            String field
    ) {

        try {

            return Long.valueOf(value);

        } catch (NumberFormatException exception) {

            throw new IllegalArgumentException(
                    "Invalid value for " + field
            );
        }
    }
}
