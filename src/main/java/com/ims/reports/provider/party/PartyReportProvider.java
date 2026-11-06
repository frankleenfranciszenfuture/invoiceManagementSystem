package com.ims.reports.provider.party;


import com.ims.dtos.party.PartyResponse;
import com.ims.dtos.reports.*;
import com.ims.dtos.party.reports.PartyContactReportResponse;
import com.ims.dtos.party.reports.PartyCreditReportResponse;

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
    // REPORT DEFINITIONS
    // =========================================================

    @Override
    public List<ReportDefinition> getReportDefinitions() {

        return List.of(

                ReportDefinition.builder()
                        .code("PARTY_REGISTER")
                        .name("Party Register")
                        .description(
                                "Complete party information including party code, " +
                                        "party type, company details, contact information " +
                                        "and status."
                        )
                        .type(ReportType.REGISTER)
                        .columns(getRegisterColumns())
                        .build(),

                ReportDefinition.builder()
                        .code("PARTY_CREDIT_REPORT")
                        .name("Party Credit Report")
                        .description(
                                "Party credit limits, outstanding credit, " +
                                        "receivables, payables and available credit."
                        )
                        .type(ReportType.DETAILED)
                        .columns(getCreditColumns())
                        .build(),

                ReportDefinition.builder()
                        .code("PARTY_CONTACT_REPORT")
                        .name("Party Contact Report")
                        .description(
                                "Party contact information including contact person, " +
                                        "email, mobile, GST, PAN and website."
                        )
                        .type(ReportType.DETAILED)
                        .columns(getContactColumns())
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

        List<ReportColumn> columns = getColumns(reportCode);

        Specification<PartyEntity> specification =
                buildSpecification(request.getFilters());

        Pageable databasePageable = mapSortProperties(pageable);

        Page<PartyEntity> partyPage = partyRepository.findAll(
                specification,
                databasePageable
        );

        List<Map<String, Object>> rows = partyPage.getContent()
                .stream()
                .map(party -> mapParty(reportCode, party))
                .toList();

        ReportSummaryResponse summary =
                generateSummary(specification);

        return ReportData.builder()
                .columns(columns)
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

    private List<ReportColumn> getColumns(String reportCode) {

        return switch (reportCode) {

            case "PARTY_REGISTER" ->
                    getRegisterColumns();

            case "PARTY_CREDIT_REPORT" ->
                    getCreditColumns();

            case "PARTY_CONTACT_REPORT" ->
                    getContactColumns();

            default -> throw new IllegalArgumentException(
                    "Unsupported party report: " + reportCode
            );
        };
    }

    // =========================================================
    // REGISTER COLUMNS
    // =========================================================

    private List<ReportColumn> getRegisterColumns() {

        return List.of(

                column("id", "Party ID", "NUMBER"),
                column("partyCode", "Party Code", "STRING"),
                column("partyType", "Party Type", "STRING"),

                column("companyName", "Company Name", "STRING"),
                column("contactPerson", "Contact Person", "STRING"),

                column("email", "Email", "STRING"),
                column("mobile", "Mobile", "STRING"),
                column("alternateMobile", "Alternate Mobile", "STRING"),

                column("gstNumber", "GST Number", "STRING"),
                column("panNumber", "PAN Number", "STRING"),

                column("website", "Website", "STRING"),

                column("status", "Status", "STRING"),
                column("active", "Active", "BOOLEAN"),

                column("createdAt", "Created At", "DATETIME"),
                column("updatedAt", "Updated At", "DATETIME")
        );
    }

    // =========================================================
    // CREDIT COLUMNS
    // =========================================================

    private List<ReportColumn> getCreditColumns() {

        return List.of(

                column("id", "Party ID", "NUMBER"),
                column("partyCode", "Party Code", "STRING"),
                column("partyType", "Party Type", "STRING"),
                column("companyName", "Company Name", "STRING"),

                column("creditLimit", "Credit Limit", "NUMBER"),

                column(
                        "outstandingCredit",
                        "Outstanding Credit",
                        "NUMBER"
                ),

                column(
                        "outstandingReceivable",
                        "Outstanding Receivable",
                        "NUMBER"
                ),

                column(
                        "outstandingPayable",
                        "Outstanding Payable",
                        "NUMBER"
                ),

                column(
                        "availableCredit",
                        "Available Credit",
                        "NUMBER"
                ),

                column("paymentTerms", "Payment Terms", "STRING"),

                column("status", "Status", "STRING"),
                column("active", "Active", "BOOLEAN")
        );
    }

    // =========================================================
    // CONTACT COLUMNS
    // =========================================================

    private List<ReportColumn> getContactColumns() {

        return List.of(

                column("id", "Party ID", "NUMBER"),
                column("partyCode", "Party Code", "STRING"),
                column("partyType", "Party Type", "STRING"),

                column("companyName", "Company Name", "STRING"),
                column("contactPerson", "Contact Person", "STRING"),

                column("email", "Email", "STRING"),
                column("mobile", "Mobile", "STRING"),
                column("alternateMobile", "Alternate Mobile", "STRING"),

                column("gstNumber", "GST Number", "STRING"),
                column("panNumber", "PAN Number", "STRING"),

                column("website", "Website", "STRING")
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
    // PARTY RESPONSE MAPPING
    // =========================================================

    private Map<String, Object> mapParty(
            String reportCode,
            PartyEntity party
    ) {

        return switch (reportCode) {

            case "PARTY_REGISTER" ->
                    mapRegisterResponse(party);

            case "PARTY_CREDIT_REPORT" ->
                    mapCreditResponse(party);

            case "PARTY_CONTACT_REPORT" ->
                    mapContactResponse(party);

            default -> throw new IllegalArgumentException(
                    "Unsupported party report: " + reportCode
            );
        };
    }

    // =========================================================
    // PARTY REGISTER
    // Uses your existing PartyResponse
    // =========================================================

    private Map<String, Object> mapRegisterResponse(
            PartyEntity party
    ) {

        PartyResponse response = new PartyResponse();

        response.setId(party.getId());
        response.setPartyCode(party.getPartyCode());
        response.setPartyType(party.getPartyType());

        response.setCompanyName(party.getCompanyName());
        response.setContactPerson(party.getContactPerson());

        response.setEmail(party.getEmail());
        response.setMobile(party.getMobile());
        response.setAlternateMobile(party.getAlternateMobile());

        response.setGstNumber(party.getGstNumber());
        response.setPanNumber(party.getPanNumber());
        response.setWebsite(party.getWebsite());

        response.setCreditLimit(party.getCreditLimit());
        response.setOutstandingCredit(party.getOutstandingCredit());
        response.setOutstandingReceivable(party.getOutstandingReceivable());
        response.setOutstandingPayable(party.getOutstandingPayable());
        response.setAvailableCredit(party.getAvailableCredit());

        response.setPaymentTerms(party.getPaymentTerms());
        response.setStatus(party.getStatus());

        /*
         * The report does not currently include address or bank-account
         * columns, so those response properties are not populated here.
         *
         * If your BaseResponse exposes active, createdAt and updatedAt
         * setters, populate them here as well.
         */

        Map<String, Object> row = new LinkedHashMap<>();

        row.put("id", response.getId());
        row.put("partyCode", response.getPartyCode());
        row.put("partyType", enumValue(response.getPartyType()));

        row.put("companyName", response.getCompanyName());
        row.put("contactPerson", response.getContactPerson());

        row.put("email", response.getEmail());
        row.put("mobile", response.getMobile());
        row.put("alternateMobile", response.getAlternateMobile());

        row.put("gstNumber", response.getGstNumber());
        row.put("panNumber", response.getPanNumber());

        row.put("website", response.getWebsite());

        row.put("status", enumValue(response.getStatus()));
        row.put("active", party.getActive());

        row.put("createdAt", party.getCreatedAt());
        row.put("updatedAt", party.getUpdatedAt());

        return row;
    }

    // =========================================================
    // PARTY CREDIT RESPONSE MAPPING
    // =========================================================

    private Map<String, Object> mapCreditResponse(
            PartyEntity party
    ) {

        PartyCreditReportResponse response =
                PartyCreditReportResponse.builder()
                        .id(party.getId())
                        .partyCode(party.getPartyCode())
                        .partyType(enumValue(party.getPartyType()))
                        .companyName(party.getCompanyName())

                        .creditLimit(party.getCreditLimit())
                        .outstandingCredit(party.getOutstandingCredit())
                        .outstandingReceivable(party.getOutstandingReceivable())
                        .outstandingPayable(party.getOutstandingPayable())
                        .availableCredit(party.getAvailableCredit())

                        .paymentTerms(party.getPaymentTerms())
                        .status(enumValue(party.getStatus()))
                        .active(party.getActive())
                        .build();

        Map<String, Object> row = new LinkedHashMap<>();

        row.put("id", response.getId());
        row.put("partyCode", response.getPartyCode());
        row.put("partyType", response.getPartyType());
        row.put("companyName", response.getCompanyName());

        row.put("creditLimit", response.getCreditLimit());
        row.put("outstandingCredit", response.getOutstandingCredit());
        row.put("outstandingReceivable", response.getOutstandingReceivable());
        row.put("outstandingPayable", response.getOutstandingPayable());
        row.put("availableCredit", response.getAvailableCredit());

        row.put("paymentTerms", response.getPaymentTerms());
        row.put("status", response.getStatus());
        row.put("active", response.getActive());

        return row;
    }

    // =========================================================
    // PARTY CONTACT RESPONSE MAPPING
    // =========================================================

    private Map<String, Object> mapContactResponse(
            PartyEntity party
    ) {

        PartyContactReportResponse response =
                PartyContactReportResponse.builder()
                        .id(party.getId())
                        .partyCode(party.getPartyCode())
                        .partyType(enumValue(party.getPartyType()))

                        .companyName(party.getCompanyName())
                        .contactPerson(party.getContactPerson())

                        .email(party.getEmail())
                        .mobile(party.getMobile())
                        .alternateMobile(party.getAlternateMobile())

                        .gstNumber(party.getGstNumber())
                        .panNumber(party.getPanNumber())
                        .website(party.getWebsite())
                        .build();

        Map<String, Object> row = new LinkedHashMap<>();

        row.put("id", response.getId());
        row.put("partyCode", response.getPartyCode());
        row.put("partyType", response.getPartyType());

        row.put("companyName", response.getCompanyName());
        row.put("contactPerson", response.getContactPerson());

        row.put("email", response.getEmail());
        row.put("mobile", response.getMobile());
        row.put("alternateMobile", response.getAlternateMobile());

        row.put("gstNumber", response.getGstNumber());
        row.put("panNumber", response.getPanNumber());
        row.put("website", response.getWebsite());

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

            // ---------------------------------------------
            // KEYWORD SEARCH
            // ---------------------------------------------

            if (hasText(filters.getKeyword())) {

                String keyword = containsPattern(filters.getKeyword());

                predicates.add(
                        cb.or(
                                cb.like(cb.lower(root.get("partyCode")), keyword),
                                cb.like(cb.lower(root.get("companyName")), keyword),
                                cb.like(cb.lower(root.get("contactPerson")), keyword),
                                cb.like(cb.lower(root.get("email")), keyword),
                                cb.like(cb.lower(root.get("mobile")), keyword),
                                cb.like(cb.lower(root.get("gstNumber")), keyword),
                                cb.like(cb.lower(root.get("panNumber")), keyword)
                        )
                );
            }

            // ---------------------------------------------
            // PARTY CODE
            // ---------------------------------------------

            String partyCode = getFilterValue(customFilters, "partyCode");

            if (hasText(partyCode)) {

                predicates.add(
                        cb.like(
                                cb.lower(root.get("partyCode")),
                                containsPattern(partyCode)
                        )
                );
            }

            // ---------------------------------------------
            // COMPANY NAME
            // ---------------------------------------------

            String companyName = getFilterValue(customFilters, "companyName");

            if (hasText(companyName)) {

                predicates.add(
                        cb.like(
                                cb.lower(root.get("companyName")),
                                containsPattern(companyName)
                        )
                );
            }

            // ---------------------------------------------
            // PARTY TYPE
            // ---------------------------------------------

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

            // ---------------------------------------------
            // PARTY STATUS
            // ---------------------------------------------

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

            // ---------------------------------------------
            // EMAIL
            // ---------------------------------------------

            String email = getFilterValue(customFilters, "email");

            if (hasText(email)) {

                predicates.add(
                        cb.like(
                                cb.lower(root.get("email")),
                                containsPattern(email)
                        )
                );
            }

            // ---------------------------------------------
            // MOBILE
            // ---------------------------------------------

            String mobile = getFilterValue(customFilters, "mobile");

            if (hasText(mobile)) {

                predicates.add(
                        cb.like(
                                root.get("mobile"),
                                containsPattern(mobile)
                        )
                );
            }

            // ---------------------------------------------
            // GST NUMBER
            // ---------------------------------------------

            String gstNumber = getFilterValue(customFilters, "gstNumber");

            if (hasText(gstNumber)) {

                predicates.add(
                        cb.like(
                                cb.lower(root.get("gstNumber")),
                                containsPattern(gstNumber)
                        )
                );
            }

            // ---------------------------------------------
            // PAN NUMBER
            // ---------------------------------------------

            String panNumber = getFilterValue(customFilters, "panNumber");

            if (hasText(panNumber)) {

                predicates.add(
                        cb.like(
                                cb.lower(root.get("panNumber")),
                                containsPattern(panNumber)
                        )
                );
            }

            // ---------------------------------------------
            // CREDIT LIMIT
            // ---------------------------------------------

            BigDecimal minCreditLimit =
                    getBigDecimalFilter(customFilters, "minCreditLimit");

            BigDecimal maxCreditLimit =
                    getBigDecimalFilter(customFilters, "maxCreditLimit");

            validateAmountRange(
                    minCreditLimit,
                    maxCreditLimit,
                    "Credit limit"
            );

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

            // ---------------------------------------------
            // OUTSTANDING CREDIT
            // ---------------------------------------------

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

            // ---------------------------------------------
            // OUTSTANDING RECEIVABLE
            // ---------------------------------------------

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

            // ---------------------------------------------
            // OUTSTANDING PAYABLE
            // ---------------------------------------------

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

            // ---------------------------------------------
            // CREATED DATE RANGE
            // ---------------------------------------------

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

            // ---------------------------------------------
            // ACTIVE FLAG
            // ---------------------------------------------

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

        Map<String, Object> metrics = new LinkedHashMap<>();

        metrics.put("totalParties", total);
        metrics.put("activeRecords", activeRecords);
        metrics.put("inactiveRecords", inactiveRecords);
        metrics.put("customerParties", customerParties);

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
            case "status" -> "status";
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