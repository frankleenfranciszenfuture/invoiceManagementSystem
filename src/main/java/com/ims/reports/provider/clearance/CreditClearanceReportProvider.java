package com.ims.reports.provider.clearance;

import com.ims.dtos.reports.*;
import com.ims.entity.CreditClearanceEntity;
import com.ims.enums.PartyType;
import com.ims.enums.PaymentMethod;
import com.ims.enums.Status;
import com.ims.enums.reports.ReportModule;
import com.ims.enums.reports.ReportType;
import com.ims.repository.CreditClearanceRepository;

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
    // REPORT DEFINITIONS
    // =========================================================

    @Override
    public List<ReportDefinition> getReportDefinitions() {

        return List.of(

                ReportDefinition.builder()
                        .code("CREDIT_CLEARANCE_REGISTER")
                        .name("Credit Clearance Register")
                        .description(
                                "Complete credit clearance records including " +
                                        "clearance number, party, payment method, " +
                                        "clearance date and outstanding credit."
                        )
                        .type(ReportType.REGISTER)
                        .columns(getRegisterColumns())
                        .build(),

                ReportDefinition.builder()
                        .code("CREDIT_CLEARANCE_DETAILS")
                        .name("Credit Clearance Details")
                        .description(
                                "Detailed credit clearance information including " +
                                        "previous outstanding credit, clearance amount, " +
                                        "remaining outstanding credit and payment details."
                        )
                        .type(ReportType.DETAILED)
                        .columns(getDetailsColumns())
                        .build(),

                ReportDefinition.builder()
                        .code("CREDIT_CLEARANCE_PARTY_REPORT")
                        .name("Credit Clearance Party Report")
                        .description(
                                "Credit clearance history grouped by party " +
                                        "identification and party type."
                        )
                        .type(ReportType.DETAILED)
                        .columns(getPartyColumns())
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

        String reportCode = request.getReportCode()
                .trim()
                .toUpperCase(Locale.ROOT);

        List<ReportColumn> columns = getColumns(reportCode);

        Specification<CreditClearanceEntity> specification =
                buildSpecification(request.getFilters());

        Pageable databasePageable = mapSortProperties(pageable);

        Page<CreditClearanceEntity> clearancePage =
                creditClearanceRepository.findAll(
                        specification,
                        databasePageable
                );

        List<Map<String, Object>> rows =
                clearancePage.getContent()
                        .stream()
                        .map(clearance -> mapCreditClearance(
                                clearance,
                                reportCode
                        ))
                        .toList();

        ReportSummaryResponse summary =
                generateSummary(specification);

        return ReportData.builder()
                .columns(columns)
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
    // REPORT COLUMN SELECTION
    // =========================================================

    private List<ReportColumn> getColumns(String reportCode) {

        return switch (reportCode) {

            case "CREDIT_CLEARANCE_REGISTER" ->
                    getRegisterColumns();

            case "CREDIT_CLEARANCE_DETAILS" ->
                    getDetailsColumns();

            case "CREDIT_CLEARANCE_PARTY_REPORT" ->
                    getPartyColumns();

            default -> throw new IllegalArgumentException(
                    "Unsupported credit clearance report: " + reportCode
            );
        };
    }

    // =========================================================
    // REGISTER COLUMNS
    // =========================================================

    private List<ReportColumn> getRegisterColumns() {

        return List.of(

                column("id", "Clearance ID", "NUMBER"),
                column("clearanceNo", "Clearance Number", "STRING"),

                column("partyId", "Party ID", "NUMBER"),
                column("partyCode", "Party Code", "STRING"),
                column("partyName", "Party Name", "STRING"),
                column("partyType", "Party Type", "STRING"),

                column("creditLimit", "Credit Limit", "NUMBER"),
                column("clearanceAmount", "Clearance Amount", "NUMBER"),

                column(
                        "previousOutstandingCredit",
                        "Previous Outstanding Credit",
                        "NUMBER"
                ),

                column(
                        "remainingOutstandingCredit",
                        "Remaining Outstanding Credit",
                        "NUMBER"
                ),

                column("paymentMethod", "Payment Method", "STRING"),
                column(
                        "paymentReferenceNumber",
                        "Payment Reference Number",
                        "STRING"
                ),

                column("clearanceDate", "Clearance Date", "DATE"),
                column("status", "Status", "STRING"),

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

                column("id", "Clearance ID", "NUMBER"),
                column("clearanceNo", "Clearance Number", "STRING"),

                column("partyId", "Party ID", "NUMBER"),
                column("partyCode", "Party Code", "STRING"),
                column("partyName", "Party Name", "STRING"),
                column("partyType", "Party Type", "STRING"),

                column("creditLimit", "Credit Limit", "NUMBER"),

                column(
                        "previousOutstandingCredit",
                        "Previous Outstanding Credit",
                        "NUMBER"
                ),

                column("clearanceAmount", "Clearance Amount", "NUMBER"),

                column(
                        "remainingOutstandingCredit",
                        "Remaining Outstanding Credit",
                        "NUMBER"
                ),

                column("paymentMethod", "Payment Method", "STRING"),
                column(
                        "paymentReferenceNumber",
                        "Payment Reference Number",
                        "STRING"
                ),

                column("clearanceDate", "Clearance Date", "DATE"),
                column("remarks", "Remarks", "STRING"),
                column("status", "Status", "STRING")
        );
    }

    // =========================================================
    // PARTY REPORT COLUMNS
    // =========================================================

    private List<ReportColumn> getPartyColumns() {

        return List.of(

                column("partyId", "Party ID", "NUMBER"),
                column("partyCode", "Party Code", "STRING"),
                column("partyName", "Party Name", "STRING"),
                column("partyType", "Party Type", "STRING"),

                column("clearanceNo", "Clearance Number", "STRING"),
                column("clearanceDate", "Clearance Date", "DATE"),

                column("creditLimit", "Credit Limit", "NUMBER"),

                column(
                        "previousOutstandingCredit",
                        "Previous Outstanding Credit",
                        "NUMBER"
                ),

                column("clearanceAmount", "Clearance Amount", "NUMBER"),

                column(
                        "remainingOutstandingCredit",
                        "Remaining Outstanding Credit",
                        "NUMBER"
                ),

                column("paymentMethod", "Payment Method", "STRING"),
                column("status", "Status", "STRING")
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
    // CREDIT CLEARANCE SPECIFICATION
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

            // -------------------------------------------------
            // PARTY JOIN
            // -------------------------------------------------

            var partyJoin = root.join("party", JoinType.LEFT);

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

            // -------------------------------------------------
            // CLEARANCE NUMBER
            // -------------------------------------------------

            String clearanceNo = getFilterValue(
                    customFilters,
                    "clearanceNo"
            );

            if (hasText(clearanceNo)) {

                predicates.add(
                        cb.like(
                                cb.lower(root.get("clearanceNo")),
                                containsPattern(clearanceNo)
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
                                partyJoin.get("id"),
                                partyId
                        )
                );
            }

            // -------------------------------------------------
            // PARTY TYPE
            // -------------------------------------------------

            String partyTypeValue = getFilterValue(
                    customFilters,
                    "partyType"
            );

            if (hasText(partyTypeValue)
                    && !"ALL".equalsIgnoreCase(partyTypeValue)) {

                try {

                    PartyType partyType = PartyType.valueOf(
                            partyTypeValue.trim().toUpperCase(Locale.ROOT)
                    );

                    predicates.add(
                            cb.equal(
                                    root.get("partyType"),
                                    partyType
                            )
                    );

                } catch (IllegalArgumentException exception) {

                    throw new IllegalArgumentException(
                            "Invalid party type: " + partyTypeValue
                    );
                }
            }

            // -------------------------------------------------
            // PAYMENT METHOD
            // -------------------------------------------------

            String paymentMethodValue = getFilterValue(
                    customFilters,
                    "paymentMethod"
            );

            if (hasText(paymentMethodValue)
                    && !"ALL".equalsIgnoreCase(paymentMethodValue)) {

                try {

                    PaymentMethod paymentMethod = PaymentMethod.valueOf(
                            paymentMethodValue.trim().toUpperCase(Locale.ROOT)
                    );

                    predicates.add(
                            cb.equal(
                                    root.get("paymentMethod"),
                                    paymentMethod
                            )
                    );

                } catch (IllegalArgumentException exception) {

                    throw new IllegalArgumentException(
                            "Invalid payment method: " + paymentMethodValue
                    );
                }
            }

            // -------------------------------------------------
            // CLEARANCE STATUS
            // -------------------------------------------------

            String statusValue = getFilterValue(
                    customFilters,
                    "status"
            );

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
                            cb.equal(
                                    root.get("status"),
                                    status
                            )
                    );

                } catch (IllegalArgumentException exception) {

                    throw new IllegalArgumentException(
                            "Invalid credit clearance status: " + statusValue
                    );
                }
            }

            // -------------------------------------------------
            // MINIMUM CLEARANCE AMOUNT
            // -------------------------------------------------

            BigDecimal minAmount = getBigDecimalFilter(
                    customFilters,
                    "minAmount"
            );

            if (minAmount != null) {

                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("clearanceAmount"),
                                minAmount
                        )
                );
            }

            // -------------------------------------------------
            // MAXIMUM CLEARANCE AMOUNT
            // -------------------------------------------------

            BigDecimal maxAmount = getBigDecimalFilter(
                    customFilters,
                    "maxAmount"
            );

            if (maxAmount != null) {

                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("clearanceAmount"),
                                maxAmount
                        )
                );
            }

            if (minAmount != null && maxAmount != null
                    && minAmount.compareTo(maxAmount) > 0) {

                throw new IllegalArgumentException(
                        "Minimum clearance amount cannot be greater than maximum amount."
                );
            }

            // -------------------------------------------------
            // CLEARANCE DATE RANGE
            // -------------------------------------------------

            LocalDate clearanceDateFrom = getDateFilter(
                    customFilters,
                    "clearanceDateFrom"
            );

            LocalDate clearanceDateTo = getDateFilter(
                    customFilters,
                    "clearanceDateTo"
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

            validateDateRange(
                    clearanceDateFrom,
                    clearanceDateTo,
                    "Clearance date"
            );

            // -------------------------------------------------
            // COMMON DATE FILTERS
            // -------------------------------------------------

            LocalDate fromDate = filters.getFromDate();
            LocalDate toDate = filters.getToDate();

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

            validateDateRange(fromDate, toDate, "Date");

            // -------------------------------------------------
            // ACTIVE FLAG FROM BASE ENTITY
            // -------------------------------------------------

            String active = getFilterValue(
                    customFilters,
                    "active"
            );

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

            return cb.and(
                    predicates.toArray(new Predicate[0])
            );
        };
    }

    // =========================================================
    // MAP CREDIT CLEARANCE
    // =========================================================

    private Map<String, Object> mapCreditClearance(
            CreditClearanceEntity clearance,
            String reportCode
    ) {

        Map<String, Object> row = new LinkedHashMap<>();

        switch (reportCode) {

            case "CREDIT_CLEARANCE_REGISTER" ->
                    mapRegister(clearance, row);

            case "CREDIT_CLEARANCE_DETAILS" ->
                    mapDetails(clearance, row);

            case "CREDIT_CLEARANCE_PARTY_REPORT" ->
                    mapPartyReport(clearance, row);

            default -> throw new IllegalArgumentException(
                    "Unsupported credit clearance report: " + reportCode
            );
        }

        return row;
    }

    // =========================================================
    // REGISTER MAPPING
    // =========================================================

    private void mapRegister(
            CreditClearanceEntity clearance,
            Map<String, Object> row
    ) {

        mapCommonFields(clearance, row);

        row.put("creditLimit", clearance.getCreditLimit());
        row.put("clearanceAmount", clearance.getClearanceAmount());

        row.put(
                "previousOutstandingCredit",
                clearance.getPreviousOutstandingCredit()
        );

        row.put(
                "remainingOutstandingCredit",
                clearance.getRemainingOutstandingCredit()
        );

        row.put(
                "paymentMethod",
                clearance.getPaymentMethod() == null
                        ? null
                        : clearance.getPaymentMethod().name()
        );

        row.put(
                "paymentReferenceNumber",
                clearance.getPaymentReferenceNumber()
        );

        row.put("clearanceDate", clearance.getClearanceDate());

        row.put(
                "status",
                clearance.getStatus() == null
                        ? null
                        : clearance.getStatus().name()
        );

        row.put("active", clearance.getActive());
        row.put("createdAt", clearance.getCreatedAt());
        row.put("updatedAt", clearance.getUpdatedAt());
        row.put("createdBy", clearance.getCreatedBy());
        row.put("updatedBy", clearance.getUpdatedBy());
    }

    // =========================================================
    // DETAILS MAPPING
    // =========================================================

    private void mapDetails(
            CreditClearanceEntity clearance,
            Map<String, Object> row
    ) {

        mapCommonFields(clearance, row);

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

        row.put(
                "paymentMethod",
                clearance.getPaymentMethod() == null
                        ? null
                        : clearance.getPaymentMethod().name()
        );

        row.put(
                "paymentReferenceNumber",
                clearance.getPaymentReferenceNumber()
        );

        row.put("clearanceDate", clearance.getClearanceDate());
        row.put("remarks", clearance.getRemarks());

        row.put(
                "status",
                clearance.getStatus() == null
                        ? null
                        : clearance.getStatus().name()
        );
    }

    // =========================================================
    // PARTY REPORT MAPPING
    // =========================================================

    private void mapPartyReport(
            CreditClearanceEntity clearance,
            Map<String, Object> row
    ) {

        mapPartyFields(clearance, row);

        row.put("clearanceNo", clearance.getClearanceNo());
        row.put("clearanceDate", clearance.getClearanceDate());
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

        row.put(
                "paymentMethod",
                clearance.getPaymentMethod() == null
                        ? null
                        : clearance.getPaymentMethod().name()
        );

        row.put(
                "status",
                clearance.getStatus() == null
                        ? null
                        : clearance.getStatus().name()
        );
    }

    // =========================================================
    // COMMON MAPPING
    // =========================================================

    private void mapCommonFields(
            CreditClearanceEntity clearance,
            Map<String, Object> row
    ) {

        row.put("id", clearance.getId());
        row.put("clearanceNo", clearance.getClearanceNo());

        mapPartyFields(clearance, row);

        row.put("clearanceDate", clearance.getClearanceDate());
    }

    private void mapPartyFields(
            CreditClearanceEntity clearance,
            Map<String, Object> row
    ) {

        if (clearance.getParty() == null) {

            row.put("partyId", null);
            row.put("partyCode", null);
            row.put("partyName", null);

        } else {

            row.put("partyId", clearance.getParty().getId());
            row.put("partyCode", clearance.getParty().getPartyCode());
            row.put("partyName", clearance.getParty().getCompanyName());
        }

        row.put(
                "partyType",
                clearance.getPartyType() == null
                        ? null
                        : clearance.getPartyType().name()
        );
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

        Map<String, Object> metrics = new LinkedHashMap<>();

        metrics.put("totalCreditClearances", total);
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

                String entityField = mapSortField(
                        order.getProperty()
                );

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

            case "clearanceNo" -> "clearanceNo";
            case "partyId" -> "party.id";
            case "partyCode" -> "party.partyCode";
            case "partyName" -> "party.companyName";
            case "partyType" -> "partyType";
            case "creditLimit" -> "creditLimit";
            case "clearanceAmount" -> "clearanceAmount";
            case "previousOutstandingCredit" ->
                    "previousOutstandingCredit";
            case "remainingOutstandingCredit" ->
                    "remainingOutstandingCredit";
            case "paymentMethod" -> "paymentMethod";
            case "clearanceDate" -> "clearanceDate";
            case "status" -> "status";
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

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private String containsPattern(String value) {

        return "%"
                + value.trim().toLowerCase(Locale.ROOT)
                + "%";
    }
}
