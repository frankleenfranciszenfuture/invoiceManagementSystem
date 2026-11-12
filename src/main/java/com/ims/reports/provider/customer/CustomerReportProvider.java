
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
import java.util.*;

@Component
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CustomerReportProvider implements ReportDataProvider {

    private final CustomerRepository customerRepository;

    @Override
    public ReportModule getModule() {
        return ReportModule.CUSTOMER;
    }

    // =====================================================
    // SINGLE CUSTOMER REPORT
    // =====================================================

    @Override
    public List<ReportDefinition> getReportDefinitions() {

        return List.of(
                ReportDefinition.builder()
                        .code("CUSTOMER_REPORT")
                        .name("Customer Report")
                        .description(
                                "Complete customer report including personal, " +
                                        "business, contact, address, financial, " +
                                        "portal and audit information."
                        )
                        .type(ReportType.REGISTER)
                        .columns(getColumns())
                        .build()
        );
    }

    // =====================================================
    // GENERATE REPORT
    // =====================================================

    @Override
    public ReportData generate(
            ReportRequest request,
            Pageable pageable
    ) {

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
                        .map(this::mapCustomer)
                        .toList();

        ReportSummaryResponse summary =
                generateSummary(specification);

        return ReportData.builder()
                .columns(getColumns())
                .rows(rows)
                .totalElements(customerPage.getTotalElements())
                .pageNumber(customerPage.getNumber())
                .pageSize(customerPage.getSize())
                .totalPages(customerPage.getTotalPages())
                .last(customerPage.isLast())
                .summary(summary)
                .build();
    }

    // =====================================================
    // ALL CUSTOMER COLUMNS
    // =====================================================

    private List<ReportColumn> getColumns() {

        return List.of(

                // Customer Information
                column("id", "Customer ID", "NUMBER"),
                column("customerType", "Customer Type", "STRING"),
                column("salutation", "Salutation", "STRING"),
                column("displayName", "Customer Name", "STRING"),
                column("companyName", "Company Name", "STRING"),
                column("firstName", "First Name", "STRING"),
                column("lastName", "Last Name", "STRING"),

                // Contact Information
                column("email", "Email", "STRING"),
                column("workPhoneCode", "Work Phone Code", "STRING"),
                column("workPhone", "Work Phone", "STRING"),
                column("mobileCode", "Mobile Code", "STRING"),
                column("mobile", "Mobile", "STRING"),
                column("websiteUrl", "Website", "STRING"),

                // Business Information
                column("department", "Department", "STRING"),
                column("designation", "Designation", "STRING"),
                column("pan", "PAN", "STRING"),

                // Social Information
                column("twitter", "Twitter", "STRING"),
                column("skype", "Skype", "STRING"),
                column("facebook", "Facebook", "STRING"),

                // Financial Information
                column("currency", "Currency", "STRING"),
                column("paymentTerms", "Payment Terms", "STRING"),

                // Other Information
                column("customerLanguage", "Language", "STRING"),
                column("enablePortal", "Portal Enabled", "BOOLEAN"),

                // Billing Address
                column("billingAttention", "Billing Attention", "STRING"),
                column("billingCountry", "Billing Country", "STRING"),
                column("billingAddress", "Billing Address", "STRING"),
                column("billingCity", "Billing City", "STRING"),
                column("billingState", "Billing State", "STRING"),
                column("billingZipCode", "Billing Zip Code", "STRING"),
                column("billingPhone", "Billing Phone", "STRING"),
                column("billingFax", "Billing Fax", "STRING"),

                // Shipping Address
                column("shippingAttention", "Shipping Attention", "STRING"),
                column("shippingCountry", "Shipping Country", "STRING"),
                column("shippingAddress", "Shipping Address", "STRING"),
                column("shippingCity", "Shipping City", "STRING"),
                column("shippingState", "Shipping State", "STRING"),
                column("shippingZipCode", "Shipping Zip Code", "STRING"),
                column("shippingPhone", "Shipping Phone", "STRING"),
                column("shippingFax", "Shipping Fax", "STRING"),

                // Status
                column("status", "Customer Status", "STRING"),
                column("active", "Active", "BOOLEAN"),

                // Audit Information
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
    // CUSTOMER FILTERS
    // =====================================================

    private Specification<CustomerEntity> buildSpecification(
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
                                cb.like(cb.lower(root.get("displayName")), keyword),
                                cb.like(cb.lower(root.get("email")), keyword),
                                cb.like(cb.lower(root.get("customerType")), keyword),
                                cb.like(cb.lower(root.get("customerLanguage")), keyword),
                                cb.like(cb.lower(root.get("mobile")), keyword),
                                cb.like(cb.lower(root.get("companyName")), keyword),
                                cb.like(cb.lower(root.get("firstName")), keyword),
                                cb.like(cb.lower(root.get("lastName")), keyword),
                                cb.like(cb.lower(root.get("pan")), keyword)
                        )
                );
            }

            Map<String, Object> customFilters =
                    filters.getFilters() == null
                            ? Map.of()
                            : filters.getFilters();

            // Customer type

            String customerType =
                    getFilterValue(customFilters, "customerType");

            if (hasText(customerType)) {

                predicates.add(
                        cb.equal(
                                cb.lower(root.get("customerType")),
                                customerType.toLowerCase(Locale.ROOT)
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

            // Status

            String status =
                    getFilterValue(customFilters, "status");

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
                            cb.equal(root.get("status"), customerStatus)
                    );

                } catch (IllegalArgumentException exception) {

                    throw new IllegalArgumentException(
                            "Invalid customer status: " + status
                    );
                }
            }

            // Portal enabled

            String portalEnabled =
                    getFilterValue(customFilters, "enablePortal");

            if (hasText(portalEnabled)) {

                if (!"true".equalsIgnoreCase(portalEnabled)
                        && !"false".equalsIgnoreCase(portalEnabled)) {

                    throw new IllegalArgumentException(
                            "Portal filter must be true or false."
                    );
                }

                predicates.add(
                        cb.equal(
                                root.get("enablePortal"),
                                Boolean.parseBoolean(portalEnabled)
                        )
                );
            }

            // Active

            String active =
                    getFilterValue(customFilters, "active");

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
    // MAP CUSTOMER INFORMATION
    // =====================================================

    private Map<String, Object> mapCustomer(
            CustomerEntity customer
    ) {

        Map<String, Object> row = new LinkedHashMap<>();

        // Customer information

        row.put("id", customer.getId());
        row.put("customerType", customer.getCustomerType());
        row.put("salutation", customer.getSalutation());
        row.put("displayName", customer.getDisplayName());
        row.put("companyName", customer.getCompanyName());
        row.put("firstName", customer.getFirstName());
        row.put("lastName", customer.getLastName());

        // Contact information

        row.put("email", customer.getEmail());
        row.put("workPhoneCode", customer.getWorkPhoneCode());
        row.put("workPhone", customer.getWorkPhone());
        row.put("mobileCode", customer.getMobileCode());
        row.put("mobile", customer.getMobile());
        row.put("websiteUrl", customer.getWebsiteUrl());

        // Business information

        row.put("department", customer.getDepartment());
        row.put("designation", customer.getDesignation());
        row.put("pan", customer.getPan());

        // Social information

        row.put("twitter", customer.getTwitter());
        row.put("skype", customer.getSkype());
        row.put("facebook", customer.getFacebook());

        // Financial information

        row.put("currency", customer.getCurrency());
        row.put("paymentTerms", customer.getPaymentTerms());

        // Other information

        row.put("customerLanguage", customer.getCustomerLanguage());
        row.put("enablePortal", customer.getEnablePortal());

        // Billing address

        mapAddress(
                customer.getBillingAddress(),
                "billing",
                row
        );

        // Shipping address

        mapAddress(
                customer.getShippingAddress(),
                "shipping",
                row
        );

        // Status

        row.put(
                "status",
                customer.getStatus() == null
                        ? null
                        : customer.getStatus().name()
        );

        row.put("active", customer.getActive());

        // Audit information

        row.put("createdAt", customer.getCreatedAt());
        row.put("updatedAt", customer.getUpdatedAt());
        row.put("createdBy", customer.getCreatedBy());
        row.put("updatedBy", customer.getUpdatedBy());

        return row;
    }

    // =====================================================
    // ADDRESS MAPPING
    // =====================================================

    private void mapAddress(
            AddressEntity address,
            String prefix,
            Map<String, Object> row
    ) {

        row.put(
                prefix + "Attention",
                address == null ? null : address.getAttention()
        );

        row.put(
                prefix + "Country",
                address == null ? null : address.getCountry()
        );

        row.put(
                prefix + "Address",
                address == null ? null : address.getAddress()
        );

        row.put(
                prefix + "City",
                address == null ? null : address.getCity()
        );

        row.put(
                prefix + "State",
                address == null ? null : address.getState()
        );

        row.put(
                prefix + "ZipCode",
                address == null ? null : address.getZipCode()
        );

        row.put(
                prefix + "Phone",
                address == null ? null : address.getPhone()
        );

        row.put(
                prefix + "Fax",
                address == null ? null : address.getFax()
        );
    }

    // =====================================================
    // SUMMARY
    // =====================================================

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
            case "displayName",
                 "customerType",
                 "companyName",
                 "email",
                 "mobile",
                 "currency",
                 "status",
                 "createdAt",
                 "updatedAt",
                 "id" -> field;

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
}
