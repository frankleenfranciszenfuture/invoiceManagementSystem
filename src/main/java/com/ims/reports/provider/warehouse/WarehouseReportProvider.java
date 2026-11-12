package com.ims.reports.provider.warehouse;

import com.ims.dtos.reports.*;
import com.ims.entity.WarehouseEntity;
import com.ims.enums.Status;
import com.ims.enums.reports.ReportModule;
import com.ims.enums.reports.ReportType;
import com.ims.repository.WarehouseRepository;

import jakarta.persistence.criteria.Predicate;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WarehouseReportProvider implements ReportDataProvider {

    private static final String REPORT_CODE = "WAREHOUSE_REPORT";

    private final WarehouseRepository warehouseRepository;

    @Override
    public ReportModule getModule() {
        return ReportModule.WAREHOUSE;
    }

    @Override
    public List<ReportDefinition> getReportDefinitions() {

        return List.of(
                ReportDefinition.builder()
                        .code(REPORT_CODE)
                        .name("Warehouse Report")
                        .description(
                                "Consolidated warehouse information including warehouse details, " +
                                        "contact information, location, status and audit information."
                        )
                        .type(ReportType.REGISTER)
                        .columns(getColumns())
                        .build()
        );
    }

    private List<ReportColumn> getColumns() {

        return List.of(
                column("id", "Warehouse ID", "NUMBER"),
                column("warehouseCode", "Warehouse Code", "STRING"),
                column("warehouseName", "Warehouse Name", "STRING"),
                column("contactPerson", "Contact Person", "STRING"),
                column("phone", "Phone", "STRING"),
                column("email", "Email", "STRING"),
                column("address", "Address", "STRING"),
                column("city", "City", "STRING"),
                column("state", "State", "STRING"),
                column("pincode", "Pincode", "STRING"),
                column("status", "Status", "STRING"),
                column("active", "Active", "BOOLEAN"),
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

    @Override
    public ReportData generate(
            ReportRequest request,
            Pageable pageable
    ) {

        if (request == null || !StringUtils.hasText(request.getReportCode())) {
            throw new IllegalArgumentException("Report code is required.");
        }

        if (!REPORT_CODE.equalsIgnoreCase(request.getReportCode().trim())) {
            throw new IllegalArgumentException("Invalid warehouse report code.");
        }

        ReportFilterRequest filters = request.getFilters();

        Specification<WarehouseEntity> specification =
                buildSpecification(filters);

        Pageable mappedPageable = mapSortProperties(pageable);

        Page<WarehouseEntity> page =
                warehouseRepository.findAll(specification, mappedPageable);

        List<Map<String, Object>> rows = page.getContent()
                .stream()
                .map(this::mapWarehouse)
                .toList();

        ReportSummaryResponse summary =
                generateSummary(specification);

        return ReportData.builder()
                .columns(getColumns())
                .rows(rows)
                .totalElements(page.getTotalElements())
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .summary(summary)
                .build();
    }

    private Specification<WarehouseEntity> buildSpecification(
            ReportFilterRequest filters
    ) {

        return (root, query, cb) -> {

            List<Predicate> predicates = new ArrayList<>();

            if (filters == null) {
                return cb.and(predicates.toArray(new Predicate[0]));
            }

            Map<String, Object> customFilters = filters.getFilters();

            // Keyword search
            if (StringUtils.hasText(filters.getKeyword())) {

                String keyword = containsPattern(filters.getKeyword());

                predicates.add(
                        cb.or(
                                cb.like(
                                        cb.lower(root.get("warehouseCode")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(root.get("warehouseName")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(root.get("contactPerson")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(root.get("phone")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(root.get("email")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(root.get("address")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(root.get("city")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(root.get("state")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(root.get("pincode")),
                                        keyword
                                )
                        )
                );
            }

            // Warehouse code
            String warehouseCode = getStringFilter(
                    customFilters,
                    "warehouseCode"
            );

            if (StringUtils.hasText(warehouseCode)) {
                predicates.add(
                        cb.like(
                                cb.lower(root.get("warehouseCode")),
                                containsPattern(warehouseCode)
                        )
                );
            }

            // Warehouse name
            String warehouseName = getStringFilter(
                    customFilters,
                    "warehouseName"
            );

            if (StringUtils.hasText(warehouseName)) {
                predicates.add(
                        cb.like(
                                cb.lower(root.get("warehouseName")),
                                containsPattern(warehouseName)
                        )
                );
            }

            // Contact person
            String contactPerson = getStringFilter(
                    customFilters,
                    "contactPerson"
            );

            if (StringUtils.hasText(contactPerson)) {
                predicates.add(
                        cb.like(
                                cb.lower(root.get("contactPerson")),
                                containsPattern(contactPerson)
                        )
                );
            }

            // Phone
            String phone = getStringFilter(customFilters, "phone");

            if (StringUtils.hasText(phone)) {
                predicates.add(
                        cb.like(
                                root.get("phone"),
                                containsPattern(phone)
                        )
                );
            }

            // Email
            String email = getStringFilter(customFilters, "email");

            if (StringUtils.hasText(email)) {
                predicates.add(
                        cb.like(
                                cb.lower(root.get("email")),
                                containsPattern(email)
                        )
                );
            }

            // City
            String city = getStringFilter(customFilters, "city");

            if (StringUtils.hasText(city)) {
                predicates.add(
                        cb.like(
                                cb.lower(root.get("city")),
                                containsPattern(city)
                        )
                );
            }

            // State
            String state = getStringFilter(customFilters, "state");

            if (StringUtils.hasText(state)) {
                predicates.add(
                        cb.like(
                                cb.lower(root.get("state")),
                                containsPattern(state)
                        )
                );
            }

            // Pincode
            String pincode = getStringFilter(customFilters, "pincode");

            if (StringUtils.hasText(pincode)) {
                predicates.add(
                        cb.like(
                                root.get("pincode"),
                                containsPattern(pincode)
                        )
                );
            }

            // Warehouse status
            String statusValue = getStringFilter(customFilters, "warehouseStatus");

            if (!StringUtils.hasText(statusValue)) {
                statusValue = getStringFilter(customFilters, "status");
            }

            if (StringUtils.hasText(statusValue)) {

                try {
                    Status status = Status.valueOf(
                            statusValue.trim().toUpperCase(Locale.ROOT)
                    );

                    predicates.add(
                            cb.equal(root.get("status"), status)
                    );

                } catch (IllegalArgumentException exception) {
                    throw new IllegalArgumentException(
                            "Invalid warehouse status: " + statusValue
                    );
                }
            }

            // Active filter
            String activeValue = getStringFilter(
                    customFilters,
                    "active"
            );

            if (StringUtils.hasText(activeValue)) {

                Boolean active = parseBoolean(activeValue, "active");

                predicates.add(
                        cb.equal(root.get("active"), active)
                );
            }

            // Shared date filters on createdAt
            LocalDate fromDate = filters.getFromDate();
            LocalDate toDate = filters.getToDate();

            validateDateRange(fromDate, toDate);

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

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private Map<String, Object> mapWarehouse(
            WarehouseEntity warehouse
    ) {

        Map<String, Object> row = new LinkedHashMap<>();

        row.put("id", warehouse.getId());
        row.put("warehouseCode", warehouse.getWarehouseCode());
        row.put("warehouseName", warehouse.getWarehouseName());
        row.put("contactPerson", warehouse.getContactPerson());
        row.put("phone", warehouse.getPhone());
        row.put("email", warehouse.getEmail());
        row.put("address", warehouse.getAddress());
        row.put("city", warehouse.getCity());
        row.put("state", warehouse.getState());
        row.put("pincode", warehouse.getPincode());

        row.put(
                "status",
                warehouse.getStatus() != null
                        ? warehouse.getStatus().name()
                        : null
        );

        row.put("active", warehouse.getActive());
        row.put("createdAt", warehouse.getCreatedAt());
        row.put("updatedAt", warehouse.getUpdatedAt());
        row.put("createdBy", warehouse.getCreatedBy());
        row.put("updatedBy", warehouse.getUpdatedBy());

        return row;
    }

    private ReportSummaryResponse generateSummary(
            Specification<WarehouseEntity> specification
    ) {

        Map<String, Object> metrics = new LinkedHashMap<>();

        long totalWarehouses =
                warehouseRepository.count(specification);

        long activeRecords = warehouseRepository.count(
                specification.and(
                        (root, query, cb) ->
                                cb.isTrue(root.get("active"))
                )
        );

        long inactiveRecords = warehouseRepository.count(
                specification.and(
                        (root, query, cb) ->
                                cb.isFalse(root.get("active"))
                )
        );

        long activeStatus = warehouseRepository.count(
                specification.and(
                        (root, query, cb) ->
                                cb.equal(root.get("status"), Status.ACTIVE)
                )
        );

        long inactiveStatus = warehouseRepository.count(
                specification.and(
                        (root, query, cb) ->
                                cb.equal(root.get("status"), Status.INACTIVE)
                )
        );

        metrics.put("totalWarehouses", totalWarehouses);
        metrics.put("activeRecords", activeRecords);
        metrics.put("inactiveRecords", inactiveRecords);
        metrics.put("activeWarehouses", activeStatus);
        metrics.put("inactiveWarehouses", inactiveStatus);

        return ReportSummaryResponse.builder()
                .metrics(metrics)
                .build();
    }

    private Pageable mapSortProperties(Pageable pageable) {

        if (pageable == null || pageable.isUnpaged()) {
            return Pageable.unpaged();
        }

        List<Sort.Order> orders = new ArrayList<>();

        if (pageable.getSort().isSorted()) {

            pageable.getSort().forEach(order -> {

                String property = mapSortProperty(order.getProperty());

                if (property != null) {
                    orders.add(
                            new Sort.Order(order.getDirection(), property)
                    );
                }
            });
        }

        Sort sort = orders.isEmpty()
                ? Sort.by(Sort.Direction.DESC, "createdAt")
                : Sort.by(orders);

        return PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                sort
        );
    }

    private String mapSortProperty(String property) {

        return switch (property) {
            case "id" -> "id";
            case "warehouseCode" -> "warehouseCode";
            case "warehouseName" -> "warehouseName";
            case "contactPerson" -> "contactPerson";
            case "phone" -> "phone";
            case "email" -> "email";
            case "city" -> "city";
            case "state" -> "state";
            case "pincode" -> "pincode";
            case "status" -> "status";
            case "active" -> "active";
            case "createdAt" -> "createdAt";
            case "updatedAt" -> "updatedAt";
            case "createdBy" -> "createdBy";
            case "updatedBy" -> "updatedBy";
            default -> null;
        };
    }

    private void validateDateRange(
            LocalDate fromDate,
            LocalDate toDate
    ) {

        if (fromDate != null && toDate != null && fromDate.isAfter(toDate)) {
            throw new IllegalArgumentException(
                    "From date cannot be after to date."
            );
        }
    }

    private String getStringFilter(
            Map<String, Object> filters,
            String key
    ) {

        if (filters == null || filters.get(key) == null) {
            return null;
        }

        return String.valueOf(filters.get(key)).trim();
    }

    private Boolean parseBoolean(
            String value,
            String field
    ) {

        if ("true".equalsIgnoreCase(value)) {
            return true;
        }

        if ("false".equalsIgnoreCase(value)) {
            return false;
        }

        throw new IllegalArgumentException(
                "Invalid boolean filter: " + field
        );
    }

    private String containsPattern(String value) {
        return "%" + value.trim().toLowerCase(Locale.ROOT) + "%";
    }
}

