package com.ims.reports.provider.customer;


import com.ims.dtos.reports.*;
import com.ims.entity.CustomerEntity;
import com.ims.entity.AddressEntity;
import com.ims.enums.CustomerStatus;
import com.ims.enums.reports.ReportModule;
import com.ims.enums.reports.ReportType;
import com.ims.repository.CustomerRepository;

import jakarta.persistence.criteria.Predicate;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import org.springframework.data.jpa.domain.Specification;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CustomerReportProvider implements ReportDataProvider {

    private final CustomerRepository customerRepository;

    // =========================================================
    // MODULE
    // =========================================================

    @Override
    public ReportModule getModule() {
        return ReportModule.CUSTOMER;
    }

    // =========================================================
    // REPORT DEFINITIONS
    // =========================================================

    @Override
    public List<ReportDefinition> getReportDefinitions() {

        return List.of(

                ReportDefinition.builder()
                        .code("CUSTOMER_REGISTER")
                        .name("Customer Register")
                        .description(
                                "Complete customer details including " +
                                        "contact information, customer type, " +
                                        "status and audit information."
                        )
                        .type(ReportType.REGISTER)
                        .columns(getRegisterColumns())
                        .build(),

                ReportDefinition.builder()
                        .code("CUSTOMER_CONTACTS")
                        .name("Customer Contact Report")
                        .description(
                                "Customer contact details including " +
                                        "email, work phone, mobile, website " +
                                        "and social media information."
                        )
                        .type(ReportType.DETAILED)
                        .columns(getContactColumns())
                        .build(),

                ReportDefinition.builder()
                        .code("CUSTOMER_ADDRESSES")
                        .name("Customer Address Report")
                        .description(
                                "Customer billing and shipping address details."
                        )
                        .type(ReportType.DETAILED)
                        .columns(getAddressColumns())
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

        Specification<CustomerEntity> specification =
                buildSpecification(request.getFilters());

        Pageable databasePageable =
                mapSortProperties(pageable);

        Page<CustomerEntity> customerPage =
                customerRepository.findAll(
                        specification,
                        databasePageable
                );

        List<Map<String, Object>> rows =
                customerPage.getContent()
                        .stream()
                        .map(customer ->
                                mapCustomer(customer, reportCode)
                        )
                        .toList();

        ReportSummaryResponse summary =
                generateSummary(specification);

        return ReportData.builder()
                .columns(columns)
                .rows(rows)
                .totalElements(customerPage.getTotalElements())
                .pageNumber(customerPage.getNumber())
                .pageSize(customerPage.getSize())
                .totalPages(customerPage.getTotalPages())
                .last(customerPage.isLast())
                .summary(summary)
                .build();
    }

    // =========================================================
    // REPORT COLUMNS
    // =========================================================

    private List<ReportColumn> getColumns(String reportCode) {

        return switch (reportCode) {

            case "CUSTOMER_REGISTER" ->
                    getRegisterColumns();

            case "CUSTOMER_CONTACTS" ->
                    getContactColumns();

            case "CUSTOMER_ADDRESSES" ->
                    getAddressColumns();

            default -> throw new IllegalArgumentException(
                    "Unsupported customer report: " + reportCode
            );
        };
    }

    private List<ReportColumn> getRegisterColumns() {

        return List.of(

                column("id", "Customer ID", "NUMBER"),
                column("displayName", "Customer Name", "STRING"),
                column("customerType", "Customer Type", "STRING"),
                column("companyName", "Company Name", "STRING"),
                column("firstName", "First Name", "STRING"),
                column("lastName", "Last Name", "STRING"),
                column("email", "Email", "STRING"),
                column("mobile", "Mobile", "STRING"),
                column("currency", "Currency", "STRING"),
                column("pan", "PAN", "STRING"),
                column("paymentTerms", "Payment Terms", "STRING"),
                column("customerLanguage", "Language", "STRING"),
                column("status", "Customer Status", "STRING"),
                column("active", "Active", "BOOLEAN"),
                column("enablePortal", "Portal Enabled", "BOOLEAN"),
                column("createdAt", "Created At", "DATETIME"),
                column("updatedAt", "Updated At", "DATETIME"),
                column("createdBy", "Created By", "NUMBER"),
                column("updatedBy", "Updated By", "NUMBER")
        );
    }

    private List<ReportColumn> getContactColumns() {

        return List.of(

                column("id", "Customer ID", "NUMBER"),
                column("displayName", "Customer Name", "STRING"),
                column("customerType", "Customer Type", "STRING"),
                column("email", "Email", "STRING"),
                column("workPhoneCode", "Work Phone Code", "STRING"),
                column("workPhone", "Work Phone", "STRING"),
                column("mobileCode", "Mobile Code", "STRING"),
                column("mobile", "Mobile", "STRING"),
                column("websiteUrl", "Website", "STRING"),
                column("department", "Department", "STRING"),
                column("designation", "Designation", "STRING"),
                column("twitter", "Twitter", "STRING"),
                column("skype", "Skype", "STRING"),
                column("facebook", "Facebook", "STRING"),
                column("status", "Customer Status", "STRING")
        );
    }

    private List<ReportColumn> getAddressColumns() {

        return List.of(

                column("id", "Customer ID", "NUMBER"),
                column("displayName", "Customer Name", "STRING"),
                column("email", "Email", "STRING"),
                column("mobile", "Mobile", "STRING"),

                column("billingAttention", "Billing Attention", "STRING"),
                column("billingCountry", "Billing Country", "STRING"),
                column("billingAddress", "Billing Address", "STRING"),
                column("billingCity", "Billing City", "STRING"),
                column("billingState", "Billing State", "STRING"),
                column("billingZipCode", "Billing Zip Code", "STRING"),
                column("billingPhone", "Billing Phone", "STRING"),
                column("billingFax", "Billing Fax", "STRING"),

                column("shippingAttention", "Shipping Attention", "STRING"),
                column("shippingCountry", "Shipping Country", "STRING"),
                column("shippingAddress", "Shipping Address", "STRING"),
                column("shippingCity", "Shipping City", "STRING"),
                column("shippingState", "Shipping State", "STRING"),
                column("shippingZipCode", "Shipping Zip Code", "STRING"),
                column("shippingPhone", "Shipping Phone", "STRING"),
                column("shippingFax", "Shipping Fax", "STRING"),

                column("status", "Customer Status", "STRING")
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

    // =========================================================
    // CUSTOMER SPECIFICATION
    // =========================================================

    private Specification<CustomerEntity> buildSpecification(
            ReportFilterRequest filters
    ) {

        return (root, query, cb) -> {

            List<Predicate> predicates = new ArrayList<>();

            if (filters == null) {
                return cb.conjunction();
            }

            // ---------------------------------------------
            // Keyword
            // ---------------------------------------------

            if (hasText(filters.getKeyword())) {

                String keyword = containsPattern(
                        filters.getKeyword()
                );

                predicates.add(
                        cb.or(
                                cb.like(
                                        cb.lower(root.get("displayName")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(root.get("email")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(root.get("customerType")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(root.get("customerLanguage")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(root.get("mobile")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(root.get("companyName")),
                                        keyword
                                )
                        )
                );
            }

            Map<String, Object> customFilters =
                    filters.getFilters() == null
                            ? Map.of()
                            : filters.getFilters();

            // ---------------------------------------------
            // Customer type
            // ---------------------------------------------

            String customerType = getFilterValue(
                    customFilters,
                    "customerType"
            );

            if (hasText(customerType)) {

                predicates.add(
                        cb.equal(
                                cb.lower(root.get("customerType")),
                                customerType.toLowerCase(Locale.ROOT)
                        )
                );
            }

            // ---------------------------------------------
            // Currency
            // ---------------------------------------------

            String currency = getFilterValue(
                    customFilters,
                    "currency"
            );

            if (hasText(currency)) {

                predicates.add(
                        cb.equal(
                                cb.upper(root.get("currency")),
                                currency.toUpperCase(Locale.ROOT)
                        )
                );
            }

            // ---------------------------------------------
            // Customer status
            // ---------------------------------------------

            String status = getFilterValue(
                    customFilters,
                    "status"
            );

            if (!hasText(status)) {
                status = filters.getStatus();
            }

            if (hasText(status)
                    && !"ALL".equalsIgnoreCase(status)) {

                try {

                    CustomerStatus customerStatus =
                            CustomerStatus.valueOf(
                                    status.trim().toUpperCase(Locale.ROOT)
                            );

                    predicates.add(
                            cb.equal(
                                    root.get("status"),
                                    customerStatus
                            )
                    );

                } catch (IllegalArgumentException exception) {

                    throw new IllegalArgumentException(
                            "Invalid customer status: " + status
                    );
                }
            }

            // ---------------------------------------------
            // Portal enabled
            // ---------------------------------------------

            String portalEnabled = getFilterValue(
                    customFilters,
                    "enablePortal"
            );

            if (hasText(portalEnabled)) {

                predicates.add(
                        cb.equal(
                                root.get("enablePortal"),
                                Boolean.parseBoolean(portalEnabled)
                        )
                );
            }

            // ---------------------------------------------
            // Active flag from BaseEntity
            // ---------------------------------------------

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

            // ---------------------------------------------
            // Created date range
            // ---------------------------------------------

            LocalDate fromDate = filters.getFromDate();
            LocalDate toDate = filters.getToDate();

            if (fromDate != null) {

                LocalDateTime from =
                        fromDate.atStartOfDay();

                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("createdAt"),
                                from
                        )
                );
            }

            if (toDate != null) {

                LocalDateTime to =
                        toDate.plusDays(1).atStartOfDay();

                predicates.add(
                        cb.lessThan(
                                root.get("createdAt"),
                                to
                        )
                );
            }

            return cb.and(
                    predicates.toArray(new Predicate[0])
            );
        };
    }

    // =========================================================
    // MAP CUSTOMER
    // =========================================================

    private Map<String, Object> mapCustomer(
            CustomerEntity customer,
            String reportCode
    ) {

        Map<String, Object> row = new LinkedHashMap<>();

        switch (reportCode) {

            case "CUSTOMER_REGISTER" ->
                    mapRegister(customer, row);

            case "CUSTOMER_CONTACTS" ->
                    mapContacts(customer, row);

            case "CUSTOMER_ADDRESSES" ->
                    mapAddresses(customer, row);

            default -> throw new IllegalArgumentException(
                    "Unsupported customer report: " + reportCode
            );
        }

        return row;
    }

    private void mapRegister(
            CustomerEntity customer,
            Map<String, Object> row
    ) {

        row.put("id", customer.getId());
        row.put("displayName", customer.getDisplayName());
        row.put("customerType", customer.getCustomerType());
        row.put("companyName", customer.getCompanyName());
        row.put("firstName", customer.getFirstName());
        row.put("lastName", customer.getLastName());
        row.put("email", customer.getEmail());
        row.put("mobile", customer.getMobile());
        row.put("currency", customer.getCurrency());
        row.put("pan", customer.getPan());
        row.put("paymentTerms", customer.getPaymentTerms());
        row.put("customerLanguage", customer.getCustomerLanguage());

        row.put(
                "status",
                customer.getStatus() == null
                        ? null
                        : customer.getStatus().name()
        );

        row.put("active", customer.getActive());
        row.put("enablePortal", customer.getEnablePortal());

        row.put("createdAt", customer.getCreatedAt());
        row.put("updatedAt", customer.getUpdatedAt());
        row.put("createdBy", customer.getCreatedBy());
        row.put("updatedBy", customer.getUpdatedBy());
    }

    private void mapContacts(
            CustomerEntity customer,
            Map<String, Object> row
    ) {

        row.put("id", customer.getId());
        row.put("displayName", customer.getDisplayName());
        row.put("customerType", customer.getCustomerType());
        row.put("email", customer.getEmail());

        row.put("workPhoneCode", customer.getWorkPhoneCode());
        row.put("workPhone", customer.getWorkPhone());

        row.put("mobileCode", customer.getMobileCode());
        row.put("mobile", customer.getMobile());

        row.put("websiteUrl", customer.getWebsiteUrl());
        row.put("department", customer.getDepartment());
        row.put("designation", customer.getDesignation());

        row.put("twitter", customer.getTwitter());
        row.put("skype", customer.getSkype());
        row.put("facebook", customer.getFacebook());

        row.put(
                "status",
                customer.getStatus() == null
                        ? null
                        : customer.getStatus().name()
        );
    }

    private void mapAddresses(
            CustomerEntity customer,
            Map<String, Object> row
    ) {

        row.put("id", customer.getId());
        row.put("displayName", customer.getDisplayName());
        row.put("email", customer.getEmail());
        row.put("mobile", customer.getMobile());

        mapAddress(
                customer.getBillingAddress(),
                "billing",
                row
        );

        mapAddress(
                customer.getShippingAddress(),
                "shipping",
                row
        );

        row.put(
                "status",
                customer.getStatus() == null
                        ? null
                        : customer.getStatus().name()
        );
    }

    private void mapAddress(
            AddressEntity address,
            String prefix,
            Map<String, Object> row
    ) {

        row.put(prefix + "Attention",
                address == null ? null : address.getAttention());

        row.put(prefix + "Country",
                address == null ? null : address.getCountry());

        row.put(prefix + "Address",
                address == null ? null : address.getAddress());

        row.put(prefix + "City",
                address == null ? null : address.getCity());

        row.put(prefix + "State",
                address == null ? null : address.getState());

        row.put(prefix + "ZipCode",
                address == null ? null : address.getZipCode());

        row.put(prefix + "Phone",
                address == null ? null : address.getPhone());

        row.put(prefix + "Fax",
                address == null ? null : address.getFax());
    }

    // =========================================================
    // SUMMARY
    // =========================================================

    private ReportSummaryResponse generateSummary(
            Specification<CustomerEntity> specification
    ) {

        long total = customerRepository.count(specification);

        long activeStatus = customerRepository.count(
                specification.and(
                        (root, query, cb) ->
                                cb.equal(
                                        root.get("status"),
                                        CustomerStatus.ACTIVE
                                )
                )
        );

        long inactiveStatus = customerRepository.count(
                specification.and(
                        (root, query, cb) ->
                                cb.equal(
                                        root.get("status"),
                                        CustomerStatus.INACTIVE
                                )
                )
        );

        long activeRecords = customerRepository.count(
                specification.and(
                        (root, query, cb) ->
                                cb.isTrue(root.get("active"))
                )
        );

        long portalEnabled = customerRepository.count(
                specification.and(
                        (root, query, cb) ->
                                cb.isTrue(root.get("enablePortal"))
                )
        );

        Map<String, Object> metrics = new LinkedHashMap<>();

        metrics.put("totalCustomers", total);
        metrics.put("activeCustomers", activeStatus);
        metrics.put("inactiveCustomers", inactiveStatus);
        metrics.put("activeRecords", activeRecords);
        metrics.put("portalEnabledCustomers", portalEnabled);

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

            case "displayName" -> "displayName";
            case "customerType" -> "customerType";
            case "companyName" -> "companyName";
            case "email" -> "email";
            case "mobile" -> "mobile";
            case "currency" -> "currency";
            case "status" -> "status";
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

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private String containsPattern(String value) {

        return "%"
                + value.trim().toLowerCase(Locale.ROOT)
                + "%";
    }
}