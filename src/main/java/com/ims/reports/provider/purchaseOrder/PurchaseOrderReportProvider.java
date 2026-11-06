package com.ims.reports.provider.purchaseOrder;


import com.ims.dtos.reports.*;
import com.ims.entity.PurchaseOrderEntity;
import com.ims.enums.PurchaseOrderStatus;
import com.ims.enums.reports.ReportModule;
import com.ims.enums.reports.ReportType;
import com.ims.repository.PurchaseOrderRepository;

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
public class PurchaseOrderReportProvider implements ReportDataProvider {

    private final PurchaseOrderRepository purchaseOrderRepository;

    // =========================================================
    // MODULE
    // =========================================================

    @Override
    public ReportModule getModule() {
        return ReportModule.PURCHASE_ORDER;
    }

    // =========================================================
    // REPORT DEFINITIONS
    // =========================================================

    @Override
    public List<ReportDefinition> getReportDefinitions() {

        return List.of(

                ReportDefinition.builder()
                        .code("PURCHASE_ORDER_REGISTER")
                        .name("Purchase Order Register")
                        .description(
                                "Complete purchase order information including " +
                                        "supplier, warehouse, dates, status, currency " +
                                        "and order totals."
                        )
                        .type(ReportType.REGISTER)
                        .columns(getRegisterColumns())
                        .build(),

                ReportDefinition.builder()
                        .code("PURCHASE_ORDER_DETAILS")
                        .name("Purchase Order Details")
                        .description(
                                "Detailed purchase order financial information " +
                                        "including discounts, GST, currency conversion " +
                                        "and received amounts."
                        )
                        .type(ReportType.DETAILED)
                        .columns(getDetailsColumns())
                        .build(),

                ReportDefinition.builder()
                        .code("PURCHASE_ORDER_DELIVERY")
                        .name("Purchase Order Delivery Report")
                        .description(
                                "Purchase order delivery schedule including " +
                                        "order date, expected delivery date and status."
                        )
                        .type(ReportType.DETAILED)
                        .columns(getDeliveryColumns())
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

        Specification<PurchaseOrderEntity> specification =
                buildSpecification(request.getFilters());

        Pageable databasePageable = mapSortProperties(pageable);

        Page<PurchaseOrderEntity> purchaseOrderPage =
                purchaseOrderRepository.findAll(
                        specification,
                        databasePageable
                );

        List<Map<String, Object>> rows =
                purchaseOrderPage.getContent()
                        .stream()
                        .map(order -> mapPurchaseOrder(order, reportCode))
                        .toList();

        ReportSummaryResponse summary =
                generateSummary(specification);

        return ReportData.builder()
                .columns(columns)
                .rows(rows)
                .totalElements(purchaseOrderPage.getTotalElements())
                .pageNumber(purchaseOrderPage.getNumber())
                .pageSize(purchaseOrderPage.getSize())
                .totalPages(purchaseOrderPage.getTotalPages())
                .last(purchaseOrderPage.isLast())
                .summary(summary)
                .build();
    }

    // =========================================================
    // REPORT COLUMNS
    // =========================================================

    private List<ReportColumn> getColumns(String reportCode) {

        return switch (reportCode) {

            case "PURCHASE_ORDER_REGISTER" ->
                    getRegisterColumns();

            case "PURCHASE_ORDER_DETAILS" ->
                    getDetailsColumns();

            case "PURCHASE_ORDER_DELIVERY" ->
                    getDeliveryColumns();

            default -> throw new IllegalArgumentException(
                    "Unsupported purchase order report: " + reportCode
            );
        };
    }

    private List<ReportColumn> getRegisterColumns() {

        return List.of(

                column("id", "Purchase Order ID", "NUMBER"),
                column("orderNo", "Order Number", "STRING"),

                column("partyId", "Supplier ID", "NUMBER"),
                column("warehouseId", "Warehouse ID", "NUMBER"),

                column("orderDate", "Order Date", "DATE"),
                column("expectedDeliveryDate", "Expected Delivery Date", "DATE"),

                column("purchaseOrderStatus", "Purchase Order Status", "STRING"),

                column("currencyId", "Currency ID", "NUMBER"),
                column("currencyCode", "Currency Code", "STRING"),
                column("exchangeRate", "Exchange Rate", "NUMBER"),

                column("subtotal", "Subtotal", "NUMBER"),
                column("discountAmount", "Discount Amount", "NUMBER"),
                column("taxableAmount", "Taxable Amount", "NUMBER"),
                column("totalTaxAmount", "Total Tax Amount", "NUMBER"),
                column("grandTotal", "Grand Total", "NUMBER"),

                column("receivedTotalAmount", "Received Amount", "NUMBER"),

                column("active", "Active", "BOOLEAN"),
                column("createdAt", "Created At", "DATETIME"),
                column("updatedAt", "Updated At", "DATETIME"),
                column("createdBy", "Created By", "NUMBER"),
                column("updatedBy", "Updated By", "NUMBER")
        );
    }

    private List<ReportColumn> getDetailsColumns() {

        return List.of(

                column("id", "Purchase Order ID", "NUMBER"),
                column("orderNo", "Order Number", "STRING"),

                column("partyId", "Supplier ID", "NUMBER"),
                column("warehouseId", "Warehouse ID", "NUMBER"),

                column("orderDate", "Order Date", "DATE"),
                column("purchaseOrderStatus", "Status", "STRING"),

                column("currencyCode", "Currency Code", "STRING"),
                column("exchangeRate", "Exchange Rate", "NUMBER"),

                column("discountType", "Discount Type", "STRING"),
                column("discountValue", "Discount Value", "NUMBER"),

                column("subtotal", "Subtotal", "NUMBER"),
                column("discountAmount", "Discount Amount", "NUMBER"),
                column("taxableAmount", "Taxable Amount", "NUMBER"),

                column("cgstAmount", "CGST Amount", "NUMBER"),
                column("sgstAmount", "SGST Amount", "NUMBER"),
                column("igstAmount", "IGST Amount", "NUMBER"),
                column("totalTaxAmount", "Total Tax Amount", "NUMBER"),

                column("grandTotal", "Grand Total", "NUMBER"),

                column("baseSubtotal", "Base Subtotal (INR)", "NUMBER"),
                column("baseDiscountAmount", "Base Discount (INR)", "NUMBER"),
                column("baseTaxableAmount", "Base Taxable Amount (INR)", "NUMBER"),
                column("baseTotalTaxAmount", "Base Tax Amount (INR)", "NUMBER"),
                column("baseGrandTotal", "Base Grand Total (INR)", "NUMBER"),

                column("receivedTotalAmount", "Received Amount", "NUMBER"),
                column("baseReceivedTotalAmount", "Base Received Amount (INR)", "NUMBER")
        );
    }

    private List<ReportColumn> getDeliveryColumns() {

        return List.of(

                column("id", "Purchase Order ID", "NUMBER"),
                column("orderNo", "Order Number", "STRING"),

                column("partyId", "Supplier ID", "NUMBER"),
                column("warehouseId", "Warehouse ID", "NUMBER"),

                column("orderDate", "Order Date", "DATE"),
                column("expectedDeliveryDate", "Expected Delivery Date", "DATE"),

                column("purchaseOrderStatus", "Purchase Order Status", "STRING"),

                column("receivedTotalAmount", "Received Amount", "NUMBER"),
                column("baseReceivedTotalAmount", "Received Amount (INR)", "NUMBER"),

                column("grandTotal", "Order Grand Total", "NUMBER"),
                column("baseGrandTotal", "Order Grand Total (INR)", "NUMBER"),

                column("notes", "Notes", "STRING")
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
    // PURCHASE ORDER SPECIFICATION
    // =========================================================

    private Specification<PurchaseOrderEntity> buildSpecification(
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

                String keyword = containsPattern(filters.getKeyword());

                predicates.add(
                        cb.or(
                                cb.like(
                                        cb.lower(root.get("orderNo")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(root.get("notes")),
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
            // Supplier
            // ---------------------------------------------

            Long partyId = getLongFilter(customFilters, "partyId");

            if (partyId != null) {

                predicates.add(
                        cb.equal(
                                root.get("party").get("id"),
                                partyId
                        )
                );
            }

            // ---------------------------------------------
            // Warehouse
            // ---------------------------------------------

            Long warehouseId = getLongFilter(customFilters, "warehouseId");

            if (warehouseId != null) {

                predicates.add(
                        cb.equal(
                                root.get("warehouse").get("id"),
                                warehouseId
                        )
                );
            }

            // ---------------------------------------------
            // Currency
            // ---------------------------------------------

            Long currencyId = getLongFilter(customFilters, "currencyId");

            if (currencyId != null) {

                predicates.add(
                        cb.equal(
                                root.get("currency").get("id"),
                                currencyId
                        )
                );
            }

            // ---------------------------------------------
            // Purchase order status
            // ---------------------------------------------

            String status = getFilterValue(
                    customFilters,
                    "purchaseOrderStatus"
            );

            if (!hasText(status)) {
                status = filters.getStatus();
            }

            if (hasText(status) && !"ALL".equalsIgnoreCase(status)) {

                try {

                    PurchaseOrderStatus purchaseOrderStatus =
                            PurchaseOrderStatus.valueOf(
                                    status.trim().toUpperCase(Locale.ROOT)
                            );

                    predicates.add(
                            cb.equal(
                                    root.get("purchaseOrderStatus"),
                                    purchaseOrderStatus
                            )
                    );

                } catch (IllegalArgumentException exception) {

                    throw new IllegalArgumentException(
                            "Invalid purchase order status: " + status
                    );
                }
            }

            // ---------------------------------------------
            // Minimum grand total
            // ---------------------------------------------

            BigDecimal minAmount = getBigDecimalFilter(
                    customFilters,
                    "minAmount"
            );

            if (minAmount != null) {

                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("grandTotal"),
                                minAmount
                        )
                );
            }

            // ---------------------------------------------
            // Maximum grand total
            // ---------------------------------------------

            BigDecimal maxAmount = getBigDecimalFilter(
                    customFilters,
                    "maxAmount"
            );

            if (maxAmount != null) {

                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("grandTotal"),
                                maxAmount
                        )
                );
            }

            if (minAmount != null && maxAmount != null
                    && minAmount.compareTo(maxAmount) > 0) {

                throw new IllegalArgumentException(
                        "Minimum amount cannot be greater than maximum amount."
                );
            }

            // ---------------------------------------------
            // Expected delivery date range
            // ---------------------------------------------

            LocalDate expectedDeliveryFrom = getDateFilter(
                    customFilters,
                    "expectedDeliveryFrom"
            );

            LocalDate expectedDeliveryTo = getDateFilter(
                    customFilters,
                    "expectedDeliveryTo"
            );

            if (expectedDeliveryFrom != null) {

                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("expectedDeliveryDate"),
                                expectedDeliveryFrom
                        )
                );
            }

            if (expectedDeliveryTo != null) {

                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("expectedDeliveryDate"),
                                expectedDeliveryTo
                        )
                );
            }

            // ---------------------------------------------
            // Order date range
            // ---------------------------------------------

            LocalDate fromDate = filters.getFromDate();
            LocalDate toDate = filters.getToDate();

            if (fromDate != null) {

                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("orderDate"),
                                fromDate
                        )
                );
            }

            if (toDate != null) {

                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("orderDate"),
                                toDate
                        )
                );
            }

            if (fromDate != null && toDate != null
                    && fromDate.isAfter(toDate)) {

                throw new IllegalArgumentException(
                        "From date cannot be after to date."
                );
            }

            // ---------------------------------------------
            // Active flag from BaseEntity
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
    // MAP PURCHASE ORDER
    // =========================================================

    private Map<String, Object> mapPurchaseOrder(
            PurchaseOrderEntity order,
            String reportCode
    ) {

        Map<String, Object> row = new LinkedHashMap<>();

        switch (reportCode) {

            case "PURCHASE_ORDER_REGISTER" ->
                    mapRegister(order, row);

            case "PURCHASE_ORDER_DETAILS" ->
                    mapDetails(order, row);

            case "PURCHASE_ORDER_DELIVERY" ->
                    mapDelivery(order, row);

            default -> throw new IllegalArgumentException(
                    "Unsupported purchase order report: " + reportCode
            );
        }

        return row;
    }

    private void mapRegister(
            PurchaseOrderEntity order,
            Map<String, Object> row
    ) {

        row.put("id", order.getId());
        row.put("orderNo", order.getOrderNo());

        row.put(
                "partyId",
                order.getParty() == null ? null : order.getParty().getId()
        );

        row.put(
                "warehouseId",
                order.getWarehouse() == null ? null : order.getWarehouse().getId()
        );

        row.put("orderDate", order.getOrderDate());
        row.put("expectedDeliveryDate", order.getExpectedDeliveryDate());

        row.put(
                "purchaseOrderStatus",
                order.getPurchaseOrderStatus() == null
                        ? null
                        : order.getPurchaseOrderStatus().name()
        );

        row.put(
                "currencyId",
                order.getCurrency() == null ? null : order.getCurrency().getId()
        );

        row.put("exchangeRate", order.getExchangeRate());

        row.put("subtotal", order.getSubtotal());
        row.put("discountAmount", order.getDiscountAmount());
        row.put("taxableAmount", order.getTaxableAmount());
        row.put("totalTaxAmount", order.getTotalTaxAmount());
        row.put("grandTotal", order.getGrandTotal());

        row.put("receivedTotalAmount", order.getReceivedTotalAmount());

        row.put("active", order.getActive());
        row.put("createdAt", order.getCreatedAt());
        row.put("updatedAt", order.getUpdatedAt());
        row.put("createdBy", order.getCreatedBy());
        row.put("updatedBy", order.getUpdatedBy());
    }

    private void mapDetails(
            PurchaseOrderEntity order,
            Map<String, Object> row
    ) {

        row.put("id", order.getId());
        row.put("orderNo", order.getOrderNo());

        row.put(
                "partyId",
                order.getParty() == null ? null : order.getParty().getId()
        );

        row.put(
                "warehouseId",
                order.getWarehouse() == null ? null : order.getWarehouse().getId()
        );

        row.put("orderDate", order.getOrderDate());

        row.put(
                "purchaseOrderStatus",
                order.getPurchaseOrderStatus() == null
                        ? null
                        : order.getPurchaseOrderStatus().name()
        );

        row.put("exchangeRate", order.getExchangeRate());

        row.put(
                "discountType",
                order.getDiscountType() == null
                        ? null
                        : order.getDiscountType().name()
        );

        row.put("discountValue", order.getDiscountValue());

        row.put("subtotal", order.getSubtotal());
        row.put("discountAmount", order.getDiscountAmount());
        row.put("taxableAmount", order.getTaxableAmount());

        row.put("cgstAmount", order.getCgstAmount());
        row.put("sgstAmount", order.getSgstAmount());
        row.put("igstAmount", order.getIgstAmount());
        row.put("totalTaxAmount", order.getTotalTaxAmount());

        row.put("grandTotal", order.getGrandTotal());

        row.put("baseSubtotal", order.getBaseSubtotal());
        row.put("baseDiscountAmount", order.getBaseDiscountAmount());
        row.put("baseTaxableAmount", order.getBaseTaxableAmount());
        row.put("baseTotalTaxAmount", order.getBaseTotalTaxAmount());
        row.put("baseGrandTotal", order.getBaseGrandTotal());

        row.put("receivedTotalAmount", order.getReceivedTotalAmount());
        row.put("baseReceivedTotalAmount", order.getBaseReceivedTotalAmount());
    }

    private void mapDelivery(
            PurchaseOrderEntity order,
            Map<String, Object> row
    ) {

        row.put("id", order.getId());
        row.put("orderNo", order.getOrderNo());

        row.put(
                "partyId",
                order.getParty() == null ? null : order.getParty().getId()
        );

        row.put(
                "warehouseId",
                order.getWarehouse() == null ? null : order.getWarehouse().getId()
        );

        row.put("orderDate", order.getOrderDate());
        row.put("expectedDeliveryDate", order.getExpectedDeliveryDate());

        row.put(
                "purchaseOrderStatus",
                order.getPurchaseOrderStatus() == null
                        ? null
                        : order.getPurchaseOrderStatus().name()
        );

        row.put("receivedTotalAmount", order.getReceivedTotalAmount());
        row.put("baseReceivedTotalAmount", order.getBaseReceivedTotalAmount());

        row.put("grandTotal", order.getGrandTotal());
        row.put("baseGrandTotal", order.getBaseGrandTotal());

        row.put("notes", order.getNotes());
    }

    // =========================================================
    // SUMMARY
    // =========================================================

    private ReportSummaryResponse generateSummary(
            Specification<PurchaseOrderEntity> specification
    ) {

        long total = purchaseOrderRepository.count(specification);

        long activeRecords = purchaseOrderRepository.count(
                specification.and(
                        (root, query, cb) ->
                                cb.isTrue(root.get("active"))
                )
        );

        long inactiveRecords = purchaseOrderRepository.count(
                specification.and(
                        (root, query, cb) ->
                                cb.isFalse(root.get("active"))
                )
        );

        long draftOrders = purchaseOrderRepository.count(
                specification.and(
                        (root, query, cb) ->
                                cb.equal(
                                        root.get("purchaseOrderStatus"),
                                        PurchaseOrderStatus.DRAFT
                                )
                )
        );

        Map<String, Object> metrics = new LinkedHashMap<>();

        metrics.put("totalPurchaseOrders", total);
        metrics.put("activeRecords", activeRecords);
        metrics.put("inactiveRecords", inactiveRecords);
        metrics.put("draftPurchaseOrders", draftOrders);

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

                String entityField = mapSortField(order.getProperty());

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

            case "orderNo" -> "orderNo";
            case "orderDate" -> "orderDate";
            case "expectedDeliveryDate" -> "expectedDeliveryDate";
            case "purchaseOrderStatus" -> "purchaseOrderStatus";
            case "subtotal" -> "subtotal";
            case "discountAmount" -> "discountAmount";
            case "grandTotal" -> "grandTotal";
            case "receivedTotalAmount" -> "receivedTotalAmount";
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

        return "%"
                + value.trim().toLowerCase(Locale.ROOT)
                + "%";
    }
}
