package com.ims.reports.provider.auditLog;


import com.ims.dtos.reports.*;
import com.ims.entity.AuditLogEntity;
import com.ims.enums.audit.AuditAction;
import com.ims.enums.reports.ReportModule;
import com.ims.enums.reports.ReportType;

import com.ims.repository.audit.AuditLogRepository;
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
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuditLogReportProvider implements ReportDataProvider {

    private static final String REPORT_CODE = "AUDIT_LOG_REPORT";

    private final AuditLogRepository auditLogRepository;

    @Override
    public ReportModule getModule() {
        return ReportModule.AUDIT_LOG;
    }

    @Override
    public List<ReportDefinition> getReportDefinitions() {

        return List.of(
                ReportDefinition.builder()
                        .code(REPORT_CODE)
                        .name("Audit Log Report")
                        .description(
                                "Consolidated audit history showing module, entity, action, " +
                                        "performed user, old and new values, IP address and timestamp."
                        )
                        .type(ReportType.REGISTER)
                        .columns(getColumns())
                        .build()
        );
    }

    private List<ReportColumn> getColumns() {

        return List.of(
                column("id", "Audit ID", "NUMBER"),
                column("entityName", "Entity Name", "STRING"),
                column("entityId", "Entity ID", "STRING"),
                column("moduleName", "Module", "STRING"),
                column("action", "Action", "STRING"),
                column("description", "Description", "STRING"),
                column("oldValue", "Old Value", "JSON"),
                column("newValue", "New Value", "JSON"),
                column("performedBy", "Performed By ID", "NUMBER"),
                column("performedByName", "Performed By", "STRING"),
                column("performedByType", "User Type", "STRING"),
                column("ipAddress", "IP Address", "STRING"),
                column("createdAt", "Created At", "DATETIME")
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
            throw new IllegalArgumentException("Invalid audit log report code.");
        }

        ReportFilterRequest filters = request.getFilters();

        Specification<AuditLogEntity> specification =
                buildSpecification(filters);

        Pageable mappedPageable = mapSortProperties(pageable);

        Page<AuditLogEntity> page =
                auditLogRepository.findAll(specification, mappedPageable);

        List<Map<String, Object>> rows = page.getContent()
                .stream()
                .map(this::mapAuditLog)
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

    private Specification<AuditLogEntity> buildSpecification(
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
                                        cb.lower(root.get("entityName")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(root.get("entityId")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(root.get("moduleName")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(root.get("description")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(root.get("performedByName")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(root.get("performedByType")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(root.get("ipAddress")),
                                        keyword
                                )
                        )
                );
            }

            // Module filter
            String moduleName = getStringFilter(
                    customFilters,
                    "moduleName"
            );

            if (!StringUtils.hasText(moduleName)) {
                moduleName = getStringFilter(customFilters, "module");
            }

            if (StringUtils.hasText(moduleName)) {
                predicates.add(
                        cb.equal(
                                cb.upper(root.get("moduleName")),
                                moduleName.trim().toUpperCase(Locale.ROOT)
                        )
                );
            }

            // Entity filter
            String entityName = getStringFilter(
                    customFilters,
                    "entityName"
            );

            if (StringUtils.hasText(entityName)) {
                predicates.add(
                        cb.equal(
                                cb.upper(root.get("entityName")),
                                entityName.trim().toUpperCase(Locale.ROOT)
                        )
                );
            }

            // Action filter
            String actionValue = getStringFilter(
                    customFilters,
                    "action"
            );

            if (StringUtils.hasText(actionValue)) {

                try {
                    AuditAction action = AuditAction.valueOf(
                            actionValue.trim().toUpperCase(Locale.ROOT)
                    );

                    predicates.add(
                            cb.equal(root.get("action"), action)
                    );

                } catch (IllegalArgumentException exception) {
                    throw new IllegalArgumentException(
                            "Invalid audit action: " + actionValue
                    );
                }
            }

            // Performed by user ID
            Long performedBy = getLongFilter(
                    customFilters,
                    "performedBy"
            );

            if (performedBy == null) {
                performedBy = getLongFilter(
                        customFilters,
                        "userId"
                );
            }

            if (performedBy != null) {
                predicates.add(
                        cb.equal(root.get("performedBy"), performedBy)
                );
            }

            // Performed by user name
            String performedByName = getStringFilter(
                    customFilters,
                    "performedByName"
            );

            if (StringUtils.hasText(performedByName)) {
                predicates.add(
                        cb.like(
                                cb.lower(root.get("performedByName")),
                                containsPattern(performedByName)
                        )
                );
            }

            // User type
            String performedByType = getStringFilter(
                    customFilters,
                    "performedByType"
            );

            if (StringUtils.hasText(performedByType)) {
                predicates.add(
                        cb.equal(
                                cb.upper(root.get("performedByType")),
                                performedByType.trim().toUpperCase(Locale.ROOT)
                        )
                );
            }

            // Date range: custom createdAtFrom / createdAtTo
            LocalDate createdAtFrom = getDateFilter(
                    customFilters,
                    "createdAtFrom"
            );

            LocalDate createdAtTo = getDateFilter(
                    customFilters,
                    "createdAtTo"
            );

            // Also accept the common report date filters.
            LocalDate fromDate = createdAtFrom != null
                    ? createdAtFrom
                    : filters.getFromDate();

            LocalDate toDate = createdAtTo != null
                    ? createdAtTo
                    : filters.getToDate();

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

            // IP address filter
            String ipAddress = getStringFilter(
                    customFilters,
                    "ipAddress"
            );

            if (StringUtils.hasText(ipAddress)) {
                predicates.add(
                        cb.like(
                                cb.lower(root.get("ipAddress")),
                                containsPattern(ipAddress)
                        )
                );
            }

            // Entity ID filter
            String entityId = getStringFilter(
                    customFilters,
                    "entityId"
            );

            if (StringUtils.hasText(entityId)) {
                predicates.add(
                        cb.equal(root.get("entityId"), entityId.trim())
                );
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private Map<String, Object> mapAuditLog(
            AuditLogEntity audit
    ) {

        Map<String, Object> row = new LinkedHashMap<>();

        row.put("id", audit.getId());
        row.put("entityName", audit.getEntityName());
        row.put("entityId", audit.getEntityId());
        row.put("moduleName", audit.getModuleName());

        row.put(
                "action",
                audit.getAction() != null
                        ? audit.getAction().name()
                        : null
        );

        row.put("description", audit.getDescription());
        row.put("oldValue", audit.getOldValue());
        row.put("newValue", audit.getNewValue());

        row.put("performedBy", audit.getPerformedBy());
        row.put("performedByName", audit.getPerformedByName());
        row.put("performedByType", audit.getPerformedByType());
        row.put("ipAddress", audit.getIpAddress());
        row.put("createdAt", audit.getCreatedAt());

        return row;
    }

    private ReportSummaryResponse generateSummary(
            Specification<AuditLogEntity> specification
    ) {

        Map<String, Object> metrics = new LinkedHashMap<>();

        long totalAuditLogs =
                auditLogRepository.count(specification);

        metrics.put("totalAuditLogs", totalAuditLogs);

        // Count by action
        for (AuditAction action : AuditAction.values()) {

            Specification<AuditLogEntity> actionSpecification =
                    specification.and(
                            (root, query, cb) ->
                                    cb.equal(root.get("action"), action)
                    );

            metrics.put(
                    action.name().toLowerCase(Locale.ROOT) + "Count",
                    auditLogRepository.count(actionSpecification)
            );
        }

        // Count by module is intentionally not hardcoded.
        // Module names are dynamic values stored in AuditLogEntity.

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
            case "entityName" -> "entityName";
            case "entityId" -> "entityId";
            case "moduleName" -> "moduleName";
            case "action" -> "action";
            case "performedBy" -> "performedBy";
            case "performedByName" -> "performedByName";
            case "performedByType" -> "performedByType";
            case "ipAddress" -> "ipAddress";
            case "createdAt" -> "createdAt";
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

    private Long getLongFilter(
            Map<String, Object> filters,
            String key
    ) {

        String value = getStringFilter(filters, key);

        if (!StringUtils.hasText(value)) {
            return null;
        }

        try {
            return Long.parseLong(value);
        } catch (NumberFormatException exception) {
            throw new IllegalArgumentException(
                    "Invalid numeric filter: " + key
            );
        }
    }

    private LocalDate getDateFilter(
            Map<String, Object> filters,
            String key
    ) {

        String value = getStringFilter(filters, key);

        if (!StringUtils.hasText(value)) {
            return null;
        }

        try {
            return LocalDate.parse(value);
        } catch (Exception exception) {
            throw new IllegalArgumentException(
                    "Invalid date filter: " + key +
                            ". Expected format: yyyy-MM-dd."
            );
        }
    }

    private String containsPattern(String value) {
        return "%" + value.trim().toLowerCase(Locale.ROOT) + "%";
    }
}

