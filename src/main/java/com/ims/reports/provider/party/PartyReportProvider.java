
package com.ims.reports.provider.party;

import com.ims.dtos.reports.*;
import com.ims.entity.PartyEntity;
import com.ims.enums.PartyType;
import com.ims.enums.Status;
import com.ims.enums.reports.ReportModule;
import com.ims.enums.reports.ReportType;
import com.ims.repository.PartyRepository;

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
public class PartyReportProvider implements ReportDataProvider {

    private final PartyRepository partyRepository;

    // =========================================================
    // MODULE
    // =========================================================

    @Override
    public ReportModule getModule() {
        return ReportModule.PARTY;
    }

    // =========================================================
    // SINGLE REPORT DEFINITION
    // =========================================================

    @Override
    public List<ReportDefinition> getReportDefinitions() {

        return List.of(
                ReportDefinition.builder()
                        .code("PARTY_REPORT")
                        .name("Party Report")
                        .description(
                                "Complete party report containing party details, " +
                                        "contact information, credit limits, outstanding " +
                                        "credit, receivables, payables, payment terms, " +
                                        "status and audit information."
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

        if (!"PARTY_REPORT".equals(reportCode)) {
            throw new IllegalArgumentException(
                    "Unsupported party report: " + reportCode
            );
        }

        Specification<PartyEntity> specification =
                buildSpecification(request.getFilters());

        Pageable databasePageable = mapSortProperties(pageable);

        Page<PartyEntity> partyPage = partyRepository.findAll(
                specification,
                databasePageable
        );

        List<Map<String, Object>> rows = partyPage.getContent()
                .stream()
                .map(this::mapParty)
                .toList();

        ReportSummaryResponse summary =
                generateSummary(specification);

        return ReportData.builder()
                .columns(getColumns())
                .rows(rows)
                .totalElements(partyPage.getTotalElements())
                .pageNumber(partyPage.getNumber())
                .pageSize(partyPage.getSize())
                .totalPages(partyPage.getTotalPages())
                .last(partyPage.isLast())
                .summary(summary)
                .build();
    }

    // =========================================================
    // REPORT COLUMNS
    // =========================================================

    private List<ReportColumn> getColumns() {

        return List.of(

                // Party identification
                column("id", "Party ID", "NUMBER"),
                column("partyCode", "Party Code", "STRING"),
                column("partyType", "Party Type", "STRING"),

                // Party details
                column("companyName", "Company Name", "STRING"),
                column("contactPerson", "Contact Person", "STRING"),

                // Contact details
                column("email", "Email", "STRING"),
                column("mobile", "Mobile", "STRING"),
                column("alternateMobile", "Alternate Mobile", "STRING"),
                column("website", "Website", "STRING"),

                // Tax details
                column("gstNumber", "GST Number", "STRING"),
                column("panNumber", "PAN Number", "STRING"),

                // Credit details
                column("creditLimit", "Credit Limit", "DECIMAL"),
                column("outstandingCredit", "Outstanding Credit", "DECIMAL"),
                column("outstandingReceivable", "Outstanding Receivable", "DECIMAL"),
                column("outstandingPayable", "Outstanding Payable", "DECIMAL"),
                column("availableCredit", "Available Credit", "DECIMAL"),

                // Payment details
                column("paymentTerms", "Payment Terms", "STRING"),

                // Status
                column("status", "Status", "STRING"),
                column("active", "Active", "BOOLEAN"),

                // Audit
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
    // PARTY MAPPING
    // =========================================================

    private Map<String, Object> mapParty(PartyEntity party) {

        Map<String, Object> row = new LinkedHashMap<>();

        // Party identification
        row.put("id", party.getId());
        row.put("partyCode", party.getPartyCode());
        row.put("partyType", enumValue(party.getPartyType()));

        // Party details
        row.put("companyName", party.getCompanyName());
        row.put("contactPerson", party.getContactPerson());

        // Contact details
        row.put("email", party.getEmail());
        row.put("mobile", party.getMobile());
        row.put("alternateMobile", party.getAlternateMobile());
        row.put("website", party.getWebsite());

        // Tax details
        row.put("gstNumber", party.getGstNumber());
        row.put("panNumber", party.getPanNumber());

        // Credit details
        row.put("creditLimit", party.getCreditLimit());
        row.put("outstandingCredit", party.getOutstandingCredit());
        row.put("outstandingReceivable", party.getOutstandingReceivable());
        row.put("outstandingPayable", party.getOutstandingPayable());
        row.put("availableCredit", party.getAvailableCredit());

        // Payment details
        row.put("paymentTerms", party.getPaymentTerms());

        // Status
        row.put("status", enumValue(party.getStatus()));
        row.put("active", party.getActive());

        // Audit
        row.put("createdAt", party.getCreatedAt());
        row.put("updatedAt", party.getUpdatedAt());
        row.put("createdBy", party.getCreatedBy());
        row.put("updatedBy", party.getUpdatedBy());

        return row;
    }

    // =========================================================
    // ENUM HELPER
    // =========================================================

    private String enumValue(Enum<?> value) {
        return value == null ? null : value.name();
    }

    // =========================================================
    // PARTY SPECIFICATION
    // =========================================================

    private Specification<PartyEntity> buildSpecification(
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
            // KEYWORD SEARCH
            // -------------------------------------------------

            if (hasText(filters.getKeyword())) {

                String keyword = containsPattern(filters.getKeyword());

                predicates.add(
                        cb.or(
                                cb.like(cb.lower(root.get("partyCode")), keyword),
                                cb.like(cb.lower(root.get("companyName")), keyword),
                                cb.like(cb.lower(root.get("contactPerson")), keyword),
                                cb.like(cb.lower(root.get("email")), keyword),
                                cb.like(cb.lower(root.get("mobile")), keyword),
                                cb.like(cb.lower(root.get("alternateMobile")), keyword),
                                cb.like(cb.lower(root.get("gstNumber")), keyword),
                                cb.like(cb.lower(root.get("panNumber")), keyword),
                                cb.like(cb.lower(root.get("website")), keyword)
                        )
                );
            }

            // -------------------------------------------------
            // PARTY CODE
            // -------------------------------------------------

            String partyCode = getFilterValue(customFilters, "partyCode");

            if (hasText(partyCode)) {
                predicates.add(
                        cb.like(
                                cb.lower(root.get("partyCode")),
                                containsPattern(partyCode)
                        )
                );
            }

            // -------------------------------------------------
            // COMPANY NAME
            // -------------------------------------------------

            String companyName = getFilterValue(customFilters, "companyName");

            if (hasText(companyName)) {
                predicates.add(
                        cb.like(
                                cb.lower(root.get("companyName")),
                                containsPattern(companyName)
                        )
                );
            }

            // -------------------------------------------------
            // PARTY TYPE
            // -------------------------------------------------

            String partyType = getFilterValue(customFilters, "partyType");

            if (hasText(partyType) && !"ALL".equalsIgnoreCase(partyType)) {

                try {
                    PartyType type = PartyType.valueOf(
                            partyType.trim().toUpperCase(Locale.ROOT)
                    );

                    predicates.add(
                            cb.equal(root.get("partyType"), type)
                    );

                } catch (IllegalArgumentException exception) {
                    throw new IllegalArgumentException(
                            "Invalid party type: " + partyType
                    );
                }
            }

            // -------------------------------------------------
            // STATUS
            // -------------------------------------------------

            String status = getFilterValue(customFilters, "status");

            if (!hasText(status)) {
                status = filters.getStatus();
            }

            if (hasText(status) && !"ALL".equalsIgnoreCase(status)) {

                try {
                    Status partyStatus = Status.valueOf(
                            status.trim().toUpperCase(Locale.ROOT)
                    );

                    predicates.add(
                            cb.equal(root.get("status"), partyStatus)
                    );

                } catch (IllegalArgumentException exception) {
                    throw new IllegalArgumentException(
                            "Invalid party status: " + status
                    );
                }
            }

            // -------------------------------------------------
            // EMAIL
            // -------------------------------------------------

            String email = getFilterValue(customFilters, "email");

            if (hasText(email)) {
                predicates.add(
                        cb.like(
                                cb.lower(root.get("email")),
                                containsPattern(email)
                        )
                );
            }

            // -------------------------------------------------
            // MOBILE
            // -------------------------------------------------

            String mobile = getFilterValue(customFilters, "mobile");

            if (hasText(mobile)) {
                predicates.add(
                        cb.like(
                                root.get("mobile"),
                                containsPattern(mobile)
                        )
                );
            }

            // -------------------------------------------------
            // GST NUMBER
            // -------------------------------------------------

            String gstNumber = getFilterValue(customFilters, "gstNumber");

            if (hasText(gstNumber)) {
                predicates.add(
                        cb.like(
                                cb.lower(root.get("gstNumber")),
                                containsPattern(gstNumber)
                        )
                );
            }

            // -------------------------------------------------
            // PAN NUMBER
            // -------------------------------------------------

            String panNumber = getFilterValue(customFilters, "panNumber");

            if (hasText(panNumber)) {
                predicates.add(
                        cb.like(
                                cb.lower(root.get("panNumber")),
                                containsPattern(panNumber)
                        )
                );
            }

            // -------------------------------------------------
            // CREDIT LIMIT RANGE
            // -------------------------------------------------

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

            // -------------------------------------------------
            // OUTSTANDING CREDIT RANGE
            // -------------------------------------------------

            BigDecimal minOutstandingCredit =
                    getBigDecimalFilter(customFilters, "minOutstandingCredit");

            BigDecimal maxOutstandingCredit =
                    getBigDecimalFilter(customFilters, "maxOutstandingCredit");

            validateAmountRange(
                    minOutstandingCredit,
                    maxOutstandingCredit,
                    "Outstanding credit"
            );

            if (minOutstandingCredit != null) {
                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("outstandingCredit"),
                                minOutstandingCredit
                        )
                );
            }

            if (maxOutstandingCredit != null) {
                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("outstandingCredit"),
                                maxOutstandingCredit
                        )
                );
            }

            // -------------------------------------------------
            // OUTSTANDING RECEIVABLE RANGE
            // -------------------------------------------------

            BigDecimal minReceivable =
                    getBigDecimalFilter(customFilters, "minOutstandingReceivable");

            BigDecimal maxReceivable =
                    getBigDecimalFilter(customFilters, "maxOutstandingReceivable");

            validateAmountRange(
                    minReceivable,
                    maxReceivable,
                    "Outstanding receivable"
            );

            if (minReceivable != null) {
                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("outstandingReceivable"),
                                minReceivable
                        )
                );
            }

            if (maxReceivable != null) {
                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("outstandingReceivable"),
                                maxReceivable
                        )
                );
            }

            // -------------------------------------------------
            // OUTSTANDING PAYABLE RANGE
            // -------------------------------------------------

            BigDecimal minPayable =
                    getBigDecimalFilter(customFilters, "minOutstandingPayable");

            BigDecimal maxPayable =
                    getBigDecimalFilter(customFilters, "maxOutstandingPayable");

            validateAmountRange(
                    minPayable,
                    maxPayable,
                    "Outstanding payable"
            );

            if (minPayable != null) {
                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("outstandingPayable"),
                                minPayable
                        )
                );
            }

            if (maxPayable != null) {
                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("outstandingPayable"),
                                maxPayable
                        )
                );
            }

            // -------------------------------------------------
            // AVAILABLE CREDIT RANGE
            // -------------------------------------------------

            BigDecimal minAvailableCredit =
                    getBigDecimalFilter(customFilters, "minAvailableCredit");

            BigDecimal maxAvailableCredit =
                    getBigDecimalFilter(customFilters, "maxAvailableCredit");

            validateAmountRange(
                    minAvailableCredit,
                    maxAvailableCredit,
                    "Available credit"
            );

            if (minAvailableCredit != null) {
                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("availableCredit"),
                                minAvailableCredit
                        )
                );
            }

            if (maxAvailableCredit != null) {
                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("availableCredit"),
                                maxAvailableCredit
                        )
                );
            }

            // -------------------------------------------------
            // CREATED DATE RANGE
            // -------------------------------------------------

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

            // -------------------------------------------------
            // ACTIVE
            // -------------------------------------------------

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
            Specification<PartyEntity> specification
    ) {

        long total = partyRepository.count(specification);

        long activeRecords = partyRepository.count(
                specification.and(
                        (root, query, cb) ->
                                cb.isTrue(root.get("active"))
                )
        );

        long inactiveRecords = partyRepository.count(
                specification.and(
                        (root, query, cb) ->
                                cb.isFalse(root.get("active"))
                )
        );

        long customerParties = partyRepository.count(
                specification.and(
                        (root, query, cb) ->
                                cb.equal(
                                        root.get("partyType"),
                                        PartyType.CUSTOMER
                                )
                )
        );

        long supplierParties = partyRepository.count(
                specification.and(
                        (root, query, cb) ->
                                cb.equal(
                                        root.get("partyType"),
                                        PartyType.SUPPLIER
                                )
                )
        );

        Map<String, Object> metrics = new LinkedHashMap<>();

        metrics.put("totalParties", total);
        metrics.put("activeRecords", activeRecords);
        metrics.put("inactiveRecords", inactiveRecords);
        metrics.put("customerParties", customerParties);
        metrics.put("supplierParties", supplierParties);

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
            case "partyCode" -> "partyCode";
            case "partyType" -> "partyType";
            case "companyName" -> "companyName";
            case "contactPerson" -> "contactPerson";
            case "email" -> "email";
            case "mobile" -> "mobile";
            case "creditLimit" -> "creditLimit";
            case "outstandingCredit" -> "outstandingCredit";
            case "outstandingReceivable" -> "outstandingReceivable";
            case "outstandingPayable" -> "outstandingPayable";
            case "availableCredit" -> "availableCredit";
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

    private BigDecimal getBigDecimalFilter(
            Map<String, Object> filters,
            String key
    ) {

        String value = getFilterValue(filters, key);

        if (!hasText(value)) {
            return null;
        }

        try {

            BigDecimal amount = new BigDecimal(value);

            if (amount.compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException(
                        "Amount filter cannot be negative: " + key
                );
            }

            return amount;

        } catch (NumberFormatException exception) {
            throw new IllegalArgumentException(
                    "Invalid amount filter: " + key
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
