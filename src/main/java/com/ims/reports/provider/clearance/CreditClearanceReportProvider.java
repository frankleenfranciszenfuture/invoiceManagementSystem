
package com.ims.reports.provider.clearance;

import com.ims.dtos.reports.*;
import com.ims.entity.CreditClearanceEntity;
import com.ims.enums.PartyType;
import com.ims.enums.PaymentMethod;
import com.ims.enums.Status;
import com.ims.enums.reports.ReportModule;
import com.ims.enums.reports.ReportType;
import com.ims.repository.CreditClearanceRepository;

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
public class CreditClearanceReportProvider implements ReportDataProvider {

    private final CreditClearanceRepository creditClearanceRepository;

    // =========================================================
    // MODULE
    // =========================================================

    @Override
    public ReportModule getModule() {
        return ReportModule.CREDIT_CLEARANCE;
    }

    // =========================================================
    // SINGLE REPORT DEFINITION
    // =========================================================

    @Override
    public List<ReportDefinition> getReportDefinitions() {

        return List.of(
                ReportDefinition.builder()
                        .code("CREDIT_CLEARANCE_REPORT")
                        .name("Credit Clearance Report")
                        .description(
                                "Complete credit clearance report containing clearance details, " +
                                        "party information, credit limits, outstanding credit, " +
                                        "payment information, remarks, status and audit information."
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
            throw new IllegalArgumentException("Report code is required.");
        }

        String reportCode = request.getReportCode()
                .trim()
                .toUpperCase(Locale.ROOT);

        if (!"CREDIT_CLEARANCE_REPORT".equals(reportCode)) {
            throw new IllegalArgumentException(
                    "Unsupported credit clearance report: " + reportCode
            );
        }

        Specification<CreditClearanceEntity> specification =
                buildSpecification(request.getFilters());

        Pageable databasePageable = mapSortProperties(pageable);

        Page<CreditClearanceEntity> clearancePage =
                creditClearanceRepository.findAll(
                        specification,
                        databasePageable
                );

        List<Map<String, Object>> rows = clearancePage.getContent()
                .stream()
                .map(this::mapCreditClearance)
                .toList();

        ReportSummaryResponse summary =
                generateSummary(specification);

        return ReportData.builder()
                .columns(getColumns())
                .rows(rows)
                .totalElements(clearancePage.getTotalElements())
                .pageNumber(clearancePage.getNumber())
                .pageSize(clearancePage.getSize())
                .totalPages(clearancePage.getTotalPages())
                .last(clearancePage.isLast())
                .summary(summary)
                .build();
    }

    // =========================================================
    // REPORT COLUMNS
    // =========================================================

    private List<ReportColumn> getColumns() {

        return List.of(
                column("id", "Clearance ID", "NUMBER"),
                column("clearanceNo", "Clearance Number", "STRING"),

                // Party information
                column("partyId", "Party ID", "NUMBER"),
                column("partyCode", "Party Code", "STRING"),
                column("partyName", "Party Name", "STRING"),
                column("partyType", "Party Type", "STRING"),

                // Credit information
                column("creditLimit", "Credit Limit", "DECIMAL"),
                column(
                        "previousOutstandingCredit",
                        "Previous Outstanding Credit",
                        "DECIMAL"
                ),
                column("clearanceAmount", "Clearance Amount", "DECIMAL"),
                column(
                        "remainingOutstandingCredit",
                        "Remaining Outstanding Credit",
                        "DECIMAL"
                ),

                // Payment information
                column("paymentMethod", "Payment Method", "STRING"),
                column(
                        "paymentReferenceNumber",
                        "Payment Reference Number",
                        "STRING"
                ),

                // Clearance information
                column("clearanceDate", "Clearance Date", "DATE"),
                column("remarks", "Remarks", "STRING"),

                // Status
                column("status", "Status", "STRING"),
                column("active", "Active", "BOOLEAN"),

                // Audit information
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
    // MAP CREDIT CLEARANCE
    // =========================================================

    private Map<String, Object> mapCreditClearance(
            CreditClearanceEntity clearance
    ) {

        Map<String, Object> row = new LinkedHashMap<>();

        // Clearance identification
        row.put("id", clearance.getId());
        row.put("clearanceNo", clearance.getClearanceNo());

        // Party information
        if (clearance.getParty() != null) {

            row.put("partyId", clearance.getParty().getId());
            row.put("partyCode", clearance.getParty().getPartyCode());
            row.put("partyName", clearance.getParty().getCompanyName());

        } else {

            row.put("partyId", null);
            row.put("partyCode", null);
            row.put("partyName", null);
        }

        row.put("partyType", enumValue(clearance.getPartyType()));

        // Credit information
        row.put("creditLimit", clearance.getCreditLimit());

        row.put(
                "previousOutstandingCredit",
                clearance.getPreviousOutstandingCredit()
        );

        row.put("clearanceAmount", clearance.getClearanceAmount());

        row.put(
                "remainingOutstandingCredit",
                clearance.getRemainingOutstandingCredit()
        );

        // Payment information
        row.put(
                "paymentMethod",
                enumValue(clearance.getPaymentMethod())
        );

        row.put(
                "paymentReferenceNumber",
                clearance.getPaymentReferenceNumber()
        );

        // Clearance information
        row.put("clearanceDate", clearance.getClearanceDate());
        row.put("remarks", clearance.getRemarks());

        // Status
        row.put("status", enumValue(clearance.getStatus()));
        row.put("active", clearance.getActive());

        // Audit information
        row.put("createdAt", clearance.getCreatedAt());
        row.put("updatedAt", clearance.getUpdatedAt());
        row.put("createdBy", clearance.getCreatedBy());
        row.put("updatedBy", clearance.getUpdatedBy());

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

    private Specification<CreditClearanceEntity> buildSpecification(
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

            var partyJoin = root.join("party", JoinType.LEFT);

            // Keyword search
            if (hasText(filters.getKeyword())) {

                String keyword = containsPattern(filters.getKeyword());

                predicates.add(
                        cb.or(
                                cb.like(
                                        cb.lower(root.get("clearanceNo")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(root.get("paymentReferenceNumber")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(root.get("remarks")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(partyJoin.get("partyCode")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(partyJoin.get("companyName")),
                                        keyword
                                )
                        )
                );
            }

            // Clearance number
            String clearanceNo =
                    getFilterValue(customFilters, "clearanceNo");

            if (hasText(clearanceNo)) {

                predicates.add(
                        cb.like(
                                cb.lower(root.get("clearanceNo")),
                                containsPattern(clearanceNo)
                        )
                );
            }

            // Party ID
            Long partyId = getLongFilter(customFilters, "partyId");

            if (partyId != null) {
                predicates.add(
                        cb.equal(partyJoin.get("id"), partyId)
                );
            }

            // Party type
            String partyTypeValue =
                    getFilterValue(customFilters, "partyType");

            if (hasText(partyTypeValue)
                    && !"ALL".equalsIgnoreCase(partyTypeValue)) {

                try {

                    PartyType partyType = PartyType.valueOf(
                            partyTypeValue.trim().toUpperCase(Locale.ROOT)
                    );

                    predicates.add(
                            cb.equal(root.get("partyType"), partyType)
                    );

                } catch (IllegalArgumentException exception) {

                    throw new IllegalArgumentException(
                            "Invalid party type: " + partyTypeValue
                    );
                }
            }

            // Payment method
            String paymentMethodValue =
                    getFilterValue(customFilters, "paymentMethod");

            if (hasText(paymentMethodValue)
                    && !"ALL".equalsIgnoreCase(paymentMethodValue)) {

                try {

                    PaymentMethod paymentMethod = PaymentMethod.valueOf(
                            paymentMethodValue.trim().toUpperCase(Locale.ROOT)
                    );

                    predicates.add(
                            cb.equal(root.get("paymentMethod"), paymentMethod)
                    );

                } catch (IllegalArgumentException exception) {

                    throw new IllegalArgumentException(
                            "Invalid payment method: " + paymentMethodValue
                    );
                }
            }

            // Status
            String statusValue =
                    getFilterValue(customFilters, "status");

            if (!hasText(statusValue)) {
                statusValue = filters.getStatus();
            }

            if (hasText(statusValue)
                    && !"ALL".equalsIgnoreCase(statusValue)) {

                try {

                    Status status = Status.valueOf(
                            statusValue.trim().toUpperCase(Locale.ROOT)
                    );

                    predicates.add(
                            cb.equal(root.get("status"), status)
                    );

                } catch (IllegalArgumentException exception) {

                    throw new IllegalArgumentException(
                            "Invalid credit clearance status: " + statusValue
                    );
                }
            }

            // Clearance amount range
            BigDecimal minAmount =
                    getBigDecimalFilter(customFilters, "minAmount");

            BigDecimal maxAmount =
                    getBigDecimalFilter(customFilters, "maxAmount");

            validateAmountRange(minAmount, maxAmount, "Clearance amount");

            if (minAmount != null) {
                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("clearanceAmount"),
                                minAmount
                        )
                );
            }

            if (maxAmount != null) {
                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("clearanceAmount"),
                                maxAmount
                        )
                );
            }

            // Credit limit range
            BigDecimal minCreditLimit =
                    getBigDecimalFilter(customFilters, "minCreditLimit");

            BigDecimal maxCreditLimit =
                    getBigDecimalFilter(customFilters, "maxCreditLimit");

            validateAmountRange(minCreditLimit, maxCreditLimit, "Credit limit");

            if (minCreditLimit != null) {
                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("creditLimit"),
                                minCreditLimit
                        )
                );
            }

            if (maxCreditLimit != null) {
                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("creditLimit"),
                                maxCreditLimit
                        )
                );
            }

            // Remaining outstanding credit range
            BigDecimal minRemaining =
                    getBigDecimalFilter(
                            customFilters,
                            "minRemainingOutstandingCredit"
                    );

            BigDecimal maxRemaining =
                    getBigDecimalFilter(
                            customFilters,
                            "maxRemainingOutstandingCredit"
                    );

            validateAmountRange(
                    minRemaining,
                    maxRemaining,
                    "Remaining outstanding credit"
            );

            if (minRemaining != null) {
                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("remainingOutstandingCredit"),
                                minRemaining
                        )
                );
            }

            if (maxRemaining != null) {
                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("remainingOutstandingCredit"),
                                maxRemaining
                        )
                );
            }

            // Specific clearance date range
            LocalDate clearanceDateFrom =
                    getDateFilter(customFilters, "clearanceDateFrom");

            LocalDate clearanceDateTo =
                    getDateFilter(customFilters, "clearanceDateTo");

            validateDateRange(
                    clearanceDateFrom,
                    clearanceDateTo,
                    "Clearance date"
            );

            if (clearanceDateFrom != null) {
                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("clearanceDate"),
                                clearanceDateFrom
                        )
                );
            }

            if (clearanceDateTo != null) {
                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("clearanceDate"),
                                clearanceDateTo
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
                                root.get("clearanceDate"),
                                fromDate
                        )
                );
            }

            if (toDate != null) {
                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("clearanceDate"),
                                toDate
                        )
                );
            }

            // Active filter
            String active = getFilterValue(customFilters, "active");

            if (hasText(active)) {

                if (!"true".equalsIgnoreCase(active)
                        && !"false".equalsIgnoreCase(active)) {

                    throw new IllegalArgumentException(
                            "Active filter must be true or false."
                    );
                }

                predicates.add(
                        cb.equal(
                                root.get("active"),
                                Boolean.parseBoolean(active)
                        )
                );
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    // =========================================================
    // SUMMARY
    // =========================================================

    private ReportSummaryResponse generateSummary(
            Specification<CreditClearanceEntity> specification
    ) {

        long total = creditClearanceRepository.count(specification);

        long activeRecords = creditClearanceRepository.count(
                specification.and(
                        (root, query, cb) ->
                                cb.isTrue(root.get("active"))
                )
        );

        long inactiveRecords = creditClearanceRepository.count(
                specification.and(
                        (root, query, cb) ->
                                cb.isFalse(root.get("active"))
                )
        );

        long customerClearances = creditClearanceRepository.count(
                specification.and(
                        (root, query, cb) ->
                                cb.equal(
                                        root.get("partyType"),
                                        PartyType.CUSTOMER
                                )
                )
        );

        long supplierClearances = creditClearanceRepository.count(
                specification.and(
                        (root, query, cb) ->
                                cb.equal(
                                        root.get("partyType"),
                                        PartyType.SUPPLIER
                                )
                )
        );

        Map<String, Object> metrics = new LinkedHashMap<>();

        metrics.put("totalCreditClearances", total);
        metrics.put("activeRecords", activeRecords);
        metrics.put("inactiveRecords", inactiveRecords);
        metrics.put("customerClearances", customerClearances);
        metrics.put("supplierClearances", supplierClearances);

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

            pageable.getSort().forEach(order ->
                    orders.add(
                            new Sort.Order(
                                    order.getDirection(),
                                    mapSortField(order.getProperty())
                            )
                    )
            );

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
            case "clearanceNo" -> "clearanceNo";
            case "partyId" -> "party.id";
            case "partyCode" -> "party.partyCode";
            case "partyName" -> "party.companyName";
            case "partyType" -> "partyType";
            case "creditLimit" -> "creditLimit";
            case "previousOutstandingCredit" -> "previousOutstandingCredit";
            case "clearanceAmount" -> "clearanceAmount";
            case "remainingOutstandingCredit" -> "remainingOutstandingCredit";
            case "paymentMethod" -> "paymentMethod";
            case "paymentReferenceNumber" -> "paymentReferenceNumber";
            case "clearanceDate" -> "clearanceDate";
            case "status" -> "status";
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

        if (minimum != null && maximum != null
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

        if (fromDate != null && toDate != null
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

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private String containsPattern(String value) {
        return "%" + value.trim().toLowerCase(Locale.ROOT) + "%";
    }
}
