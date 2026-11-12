
package com.ims.reports.provider.notification;

import com.ims.dtos.reports.*;
import com.ims.entity.NotificationEntity;
import com.ims.entity.NotificationRecipientEntity;
import com.ims.enums.notification.NotificationAction;
import com.ims.enums.notification.NotificationModule;
import com.ims.enums.notification.NotificationPriority;
import com.ims.enums.notification.NotificationType;
import com.ims.enums.reports.ReportModule;
import com.ims.enums.reports.ReportType;
import com.ims.repository.notification.NotificationRecipientRepository;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;

import lombok.RequiredArgsConstructor;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

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
@Slf4j
public class NotificationReportProvider implements ReportDataProvider {

    private static final String REPORT_CODE = "NOTIFICATION_REPORT";

    private final NotificationRecipientRepository notificationRecipientRepository;

    @Override
    public ReportModule getModule() {
        return ReportModule.NOTIFICATION;
    }

    @Override
    public List<ReportDefinition> getReportDefinitions() {

        return List.of(
                ReportDefinition.builder()
                        .code(REPORT_CODE)
                        .name("Notification Report")
                        .description(
                                "Consolidated notification report showing notification details, " +
                                        "recipient information, read and archive status, module, action, " +
                                        "priority, sender and received timestamp."
                        )
                        .type(ReportType.REGISTER)
                        .columns(getColumns())
                        .build()
        );
    }

    private List<ReportColumn> getColumns() {

        return List.of(
                column("notificationId", "Notification ID", "NUMBER"),
                column("recipientId", "Recipient ID", "NUMBER"),
                column("userId", "Recipient User ID", "NUMBER"),

                column("title", "Title", "STRING"),
                column("message", "Message", "STRING"),

                column("module", "Legacy Module", "STRING"),
                column("moduleName", "Module", "STRING"),
                column("action", "Action", "STRING"),
                column("notificationType", "Notification Type", "STRING"),
                column("priority", "Priority", "STRING"),

                column("actionUrl", "Action URL", "STRING"),

                column("referenceId", "Reference ID", "NUMBER"),
                column("referenceNumber", "Reference Number", "STRING"),

                column("entityName", "Entity Name", "STRING"),
                column("entityId", "Entity ID", "STRING"),

                column("senderId", "Sender ID", "NUMBER"),
                column("createdByName", "Created By Name", "STRING"),

                column("read", "Read", "BOOLEAN"),
                column("readAt", "Read At", "DATETIME"),

                column("archived", "Archived", "BOOLEAN"),
                column("archivedAt", "Archived At", "DATETIME"),

                column("receivedAt", "Received At", "DATETIME"),

                column("active", "Active", "BOOLEAN"),
                column("notificationCreatedAt", "Notification Created At", "DATETIME"),
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
            throw new IllegalArgumentException(
                    "Invalid notification report code."
            );
        }

        ReportFilterRequest filters = request.getFilters();

        Specification<NotificationRecipientEntity> specification =
                buildSpecification(filters);

        Pageable mappedPageable = mapSortProperties(pageable);

        Page<NotificationRecipientEntity> page =
                notificationRecipientRepository.findAll(
                        specification,
                        mappedPageable
                );

        List<Map<String, Object>> rows = page.getContent()
                .stream()
                .map(this::mapNotification)
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

    private Specification<NotificationRecipientEntity> buildSpecification(
            ReportFilterRequest filters
    ) {

        return (root, query, cb) -> {

            Join<NotificationRecipientEntity, NotificationEntity> notification =
                    root.join("notification", JoinType.INNER);

            List<Predicate> predicates = new ArrayList<>();

            if (filters == null) {
                return cb.and(predicates.toArray(new Predicate[0]));
            }

            Map<String, Object> customFilters = filters.getFilters();

            // Keyword search.
            if (StringUtils.hasText(filters.getKeyword())) {

                String keyword = containsPattern(filters.getKeyword());

                predicates.add(
                        cb.or(
                                cb.like(
                                        cb.lower(notification.get("title")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(notification.get("message")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(notification.get("module")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(notification.get("entityName")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(notification.get("entityId")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(notification.get("referenceNumber")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(notification.get("createdByName")),
                                        keyword
                                )
                        )
                );
            }

            // Recipient user ID.
            Long userId = getLongFilter(customFilters, "userId");

            if (userId == null) {
                userId = getLongFilter(customFilters, "recipientUserId");
            }

            if (userId != null) {
                predicates.add(
                        cb.equal(root.get("userId"), userId)
                );
            }

            // Recipient ID.
            Long recipientId = getLongFilter(
                    customFilters,
                    "recipientId"
            );

            if (recipientId != null) {
                predicates.add(
                        cb.equal(root.get("id"), recipientId)
                );
            }

            // Notification ID.
            Long notificationId = getLongFilter(
                    customFilters,
                    "notificationId"
            );

            if (notificationId != null) {
                predicates.add(
                        cb.equal(notification.get("id"), notificationId)
                );
            }

            // Sender ID.
            Long senderId = getLongFilter(
                    customFilters,
                    "senderId"
            );

            if (senderId != null) {
                predicates.add(
                        cb.equal(notification.get("senderId"), senderId)
                );
            }

            // Reference ID.
            Long referenceId = getLongFilter(
                    customFilters,
                    "referenceId"
            );

            if (referenceId != null) {
                predicates.add(
                        cb.equal(notification.get("referenceId"), referenceId)
                );
            }

            // Title.
            String title = getStringFilter(customFilters, "title");

            if (StringUtils.hasText(title)) {
                predicates.add(
                        cb.like(
                                cb.lower(notification.get("title")),
                                containsPattern(title)
                        )
                );
            }

            // Message.
            String message = getStringFilter(customFilters, "message");

            if (StringUtils.hasText(message)) {
                predicates.add(
                        cb.like(
                                cb.lower(notification.get("message")),
                                containsPattern(message)
                        )
                );
            }

            // Legacy module.
            String module = getStringFilter(customFilters, "module");

            if (StringUtils.hasText(module)) {
                predicates.add(
                        cb.equal(
                                cb.upper(notification.get("module")),
                                module.trim().toUpperCase(Locale.ROOT)
                        )
                );
            }

            // Structured module.
            String moduleName = getStringFilter(
                    customFilters,
                    "moduleName"
            );

            if (StringUtils.hasText(moduleName)) {

                try {

                    NotificationModule moduleEnum =
                            NotificationModule.valueOf(
                                    moduleName.trim().toUpperCase(Locale.ROOT)
                            );

                    predicates.add(
                            cb.equal(
                                    notification.get("moduleName"),
                                    moduleEnum
                            )
                    );

                } catch (IllegalArgumentException exception) {

                    throw new IllegalArgumentException(
                            "Invalid notification module: " + moduleName
                    );
                }
            }

            // Notification action.
            String actionValue = getStringFilter(
                    customFilters,
                    "action"
            );

            if (StringUtils.hasText(actionValue)) {

                try {

                    NotificationAction action =
                            NotificationAction.valueOf(
                                    actionValue.trim().toUpperCase(Locale.ROOT)
                            );

                    predicates.add(
                            cb.equal(notification.get("action"), action)
                    );

                } catch (IllegalArgumentException exception) {

                    throw new IllegalArgumentException(
                            "Invalid notification action: " + actionValue
                    );
                }
            }

            // Notification type.
            String typeValue = getStringFilter(
                    customFilters,
                    "notificationType"
            );

            if (StringUtils.hasText(typeValue)) {

                try {

                    NotificationType type =
                            NotificationType.valueOf(
                                    typeValue.trim().toUpperCase(Locale.ROOT)
                            );

                    predicates.add(
                            cb.equal(notification.get("notificationType"), type)
                    );

                } catch (IllegalArgumentException exception) {

                    throw new IllegalArgumentException(
                            "Invalid notification type: " + typeValue
                    );
                }
            }

            // Priority.
            String priorityValue = getStringFilter(
                    customFilters,
                    "priority"
            );

            if (StringUtils.hasText(priorityValue)) {

                try {

                    NotificationPriority priority =
                            NotificationPriority.valueOf(
                                    priorityValue.trim().toUpperCase(Locale.ROOT)
                            );

                    predicates.add(
                            cb.equal(notification.get("priority"), priority)
                    );

                } catch (IllegalArgumentException exception) {

                    throw new IllegalArgumentException(
                            "Invalid notification priority: " + priorityValue
                    );
                }
            }

            // Entity name.
            String entityName = getStringFilter(
                    customFilters,
                    "entityName"
            );

            if (StringUtils.hasText(entityName)) {
                predicates.add(
                        cb.equal(
                                cb.upper(notification.get("entityName")),
                                entityName.trim().toUpperCase(Locale.ROOT)
                        )
                );
            }

            // Entity ID.
            String entityId = getStringFilter(
                    customFilters,
                    "entityId"
            );

            if (StringUtils.hasText(entityId)) {
                predicates.add(
                        cb.equal(
                                notification.get("entityId"),
                                entityId.trim()
                        )
                );
            }

            // Reference number.
            String referenceNumber = getStringFilter(
                    customFilters,
                    "referenceNumber"
            );

            if (StringUtils.hasText(referenceNumber)) {
                predicates.add(
                        cb.like(
                                cb.lower(notification.get("referenceNumber")),
                                containsPattern(referenceNumber)
                        )
                );
            }

            // Created by name.
            String createdByName = getStringFilter(
                    customFilters,
                    "createdByName"
            );

            if (StringUtils.hasText(createdByName)) {
                predicates.add(
                        cb.like(
                                cb.lower(notification.get("createdByName")),
                                containsPattern(createdByName)
                        )
                );
            }

            // Read status.
            Boolean read = getBooleanFilter(customFilters, "read");

            if (read != null) {
                predicates.add(
                        cb.equal(root.get("read"), read)
                );
            }

            // Archived status.
            Boolean archived = getBooleanFilter(
                    customFilters,
                    "archived"
            );

            if (archived != null) {
                predicates.add(
                        cb.equal(root.get("archived"), archived)
                );
            }

            // Notification active status.
            Boolean active = getBooleanFilter(
                    customFilters,
                    "active"
            );

            if (active != null) {
                predicates.add(
                        cb.equal(notification.get("active"), active)
                );
            }

            // Received date filters.
            LocalDate receivedFrom = getDateFilter(
                    customFilters,
                    "receivedFrom"
            );

            LocalDate receivedTo = getDateFilter(
                    customFilters,
                    "receivedTo"
            );

            LocalDate fromDate = receivedFrom != null
                    ? receivedFrom
                    : filters.getFromDate();

            LocalDate toDate = receivedTo != null
                    ? receivedTo
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

            // Original notification creation date.
            LocalDate notificationCreatedFrom = getDateFilter(
                    customFilters,
                    "notificationCreatedFrom"
            );

            LocalDate notificationCreatedTo = getDateFilter(
                    customFilters,
                    "notificationCreatedTo"
            );

            validateDateRange(
                    notificationCreatedFrom,
                    notificationCreatedTo
            );

            if (notificationCreatedFrom != null) {
                predicates.add(
                        cb.greaterThanOrEqualTo(
                                notification.get("createdAt"),
                                notificationCreatedFrom.atStartOfDay()
                        )
                );
            }

            if (notificationCreatedTo != null) {
                predicates.add(
                        cb.lessThan(
                                notification.get("createdAt"),
                                notificationCreatedTo.plusDays(1).atStartOfDay()
                        )
                );
            }

            // Read date filters.
            LocalDate readFrom = getDateFilter(
                    customFilters,
                    "readFrom"
            );

            LocalDate readTo = getDateFilter(
                    customFilters,
                    "readTo"
            );

            validateDateRange(readFrom, readTo);

            if (readFrom != null) {
                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("readAt"),
                                readFrom.atStartOfDay()
                        )
                );
            }

            if (readTo != null) {
                predicates.add(
                        cb.lessThan(
                                root.get("readAt"),
                                readTo.plusDays(1).atStartOfDay()
                        )
                );
            }

            // Archived date filters.
            LocalDate archivedFrom = getDateFilter(
                    customFilters,
                    "archivedFrom"
            );

            LocalDate archivedTo = getDateFilter(
                    customFilters,
                    "archivedTo"
            );

            validateDateRange(archivedFrom, archivedTo);

            if (archivedFrom != null) {
                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("archivedAt"),
                                archivedFrom.atStartOfDay()
                        )
                );
            }

            if (archivedTo != null) {
                predicates.add(
                        cb.lessThan(
                                root.get("archivedAt"),
                                archivedTo.plusDays(1).atStartOfDay()
                        )
                );
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private Map<String, Object> mapNotification(
            NotificationRecipientEntity recipient
    ) {

        NotificationEntity notification = recipient.getNotification();

        Map<String, Object> row = new LinkedHashMap<>();

        row.put("notificationId", notification.getId());
        row.put("recipientId", recipient.getId());
        row.put("userId", recipient.getUserId());

        row.put("title", notification.getTitle());
        row.put("message", notification.getMessage());

        row.put("module", notification.getModule());

        row.put(
                "moduleName",
                notification.getModuleName() != null
                        ? notification.getModuleName().name()
                        : null
        );

        row.put(
                "action",
                notification.getAction() != null
                        ? notification.getAction().name()
                        : null
        );

        row.put(
                "notificationType",
                notification.getNotificationType() != null
                        ? notification.getNotificationType().name()
                        : null
        );

        row.put(
                "priority",
                notification.getPriority() != null
                        ? notification.getPriority().name()
                        : null
        );

        row.put("actionUrl", notification.getActionUrl());

        row.put("referenceId", notification.getReferenceId());
        row.put("referenceNumber", notification.getReferenceNumber());

        row.put("entityName", notification.getEntityName());
        row.put("entityId", notification.getEntityId());

        row.put("senderId", notification.getSenderId());
        row.put("createdByName", notification.getCreatedByName());

        // Recipient-specific read state.
        row.put("read", recipient.getRead());
        row.put("readAt", recipient.getReadAt());

        // Recipient-specific archive state.
        row.put("archived", recipient.getArchived());
        row.put("archivedAt", recipient.getArchivedAt());

        // Recipient received timestamp.
        row.put("receivedAt", recipient.getCreatedAt());

        // Notification-level audit fields.
        row.put("active", notification.getActive());
        row.put("notificationCreatedAt", notification.getCreatedAt());
        row.put("updatedAt", notification.getUpdatedAt());
        row.put("createdBy", notification.getCreatedBy());
        row.put("updatedBy", notification.getUpdatedBy());

        return row;
    }

    private ReportSummaryResponse generateSummary(
            Specification<NotificationRecipientEntity> specification
    ) {

        Map<String, Object> metrics = new LinkedHashMap<>();

        long totalNotifications =
                notificationRecipientRepository.count(specification);

        long unreadNotifications =
                notificationRecipientRepository.count(
                        specification.and(
                                (root, query, cb) -> cb.isFalse(root.get("read"))
                        )
                );

        long readNotifications =
                notificationRecipientRepository.count(
                        specification.and(
                                (root, query, cb) -> cb.isTrue(root.get("read"))
                        )
                );

        long archivedNotifications =
                notificationRecipientRepository.count(
                        specification.and(
                                (root, query, cb) -> cb.isTrue(root.get("archived"))
                        )
                );

        long activeNotifications =
                notificationRecipientRepository.count(
                        specification.and(
                                (root, query, cb) -> {
                                    Join<NotificationRecipientEntity, NotificationEntity> notification =
                                            root.join("notification", JoinType.INNER);

                                    return cb.isTrue(notification.get("active"));
                                }
                        )
                );

        metrics.put("totalNotifications", totalNotifications);
        metrics.put("unreadNotifications", unreadNotifications);
        metrics.put("readNotifications", readNotifications);
        metrics.put("archivedNotifications", archivedNotifications);
        metrics.put("activeNotifications", activeNotifications);

        // Count by notification action.
        for (NotificationAction action : NotificationAction.values()) {

            Specification<NotificationRecipientEntity> actionSpecification =
                    specification.and(
                            (root, query, cb) -> {
                                Join<NotificationRecipientEntity, NotificationEntity> notification =
                                        root.join("notification", JoinType.INNER);

                                return cb.equal(
                                        notification.get("action"),
                                        action
                                );
                            }
                    );

            metrics.put(
                    action.name().toLowerCase(Locale.ROOT) + "Count",
                    notificationRecipientRepository.count(actionSpecification)
            );
        }

        return ReportSummaryResponse.builder()
                .metrics(metrics)
                .build();
    }

    private Pageable mapSortProperties(Pageable pageable) {

        if (pageable == null || pageable.isUnpaged()) {
            return Pageable.unpaged();
        }

        List<Sort.Order> orders = new ArrayList<>();

        pageable.getSort().forEach(order -> {

            log.info(
                    "NOTIFICATION REPORT SORT | Incoming property: {} | Direction: {}",
                    order.getProperty(),
                    order.getDirection()
            );

            String property = mapSortProperty(order.getProperty());

            orders.add(
                    new Sort.Order(order.getDirection(), property)
            );
        });

        Sort sort = orders.isEmpty()
                ? Sort.by(Sort.Direction.DESC, "createdAt")
                : Sort.by(orders);

        return PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                sort
        );
    }

    private String mapSortProperty(String sortBy) {

        if (sortBy == null || sortBy.isBlank()) {
            return "createdAt";
        }

        return switch (sortBy.trim()) {

            // Recipient fields
            case "id", "recipientId" -> "id";
            case "userId" -> "userId";
            case "read" -> "read";
            case "readAt" -> "readAt";
            case "archived" -> "archived";
            case "archivedAt" -> "archivedAt";
            case "receivedAt", "createdAt" -> "createdAt";

            // Notification fields
            case "notificationId" -> "notification.id";
            case "title" -> "notification.title";
            case "message" -> "notification.message";
            case "module" -> "notification.module";
            case "moduleName" -> "notification.moduleName";
            case "action" -> "notification.action";
            case "notificationType" -> "notification.notificationType";
            case "priority" -> "notification.priority";
            case "actionUrl" -> "notification.actionUrl";
            case "referenceId" -> "notification.referenceId";
            case "referenceNumber" -> "notification.referenceNumber";
            case "entityName" -> "notification.entityName";
            case "entityId" -> "notification.entityId";
            case "senderId" -> "notification.senderId";
            case "createdByName" -> "notification.createdByName";
            case "active" -> "notification.active";
            case "notificationCreatedAt" -> "notification.createdAt";
            case "updatedAt" -> "notification.updatedAt";
            case "createdBy" -> "notification.createdBy";
            case "updatedBy" -> "notification.updatedBy";

            default -> throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid notification report sort column: " + sortBy
            );
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

    private Boolean getBooleanFilter(
            Map<String, Object> filters,
            String key
    ) {

        String value = getStringFilter(filters, key);

        if (!StringUtils.hasText(value)) {
            return null;
        }

        if (!value.equalsIgnoreCase("true")
                && !value.equalsIgnoreCase("false")) {

            throw new IllegalArgumentException(
                    "Invalid boolean filter: " + key
            );
        }

        return Boolean.parseBoolean(value);
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
