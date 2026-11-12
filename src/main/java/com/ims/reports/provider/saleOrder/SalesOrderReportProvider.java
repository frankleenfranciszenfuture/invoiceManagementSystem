
package com.ims.reports.provider.saleOrder;

import com.ims.dtos.reports.*;
import com.ims.entity.SalesOrderEntity;
import com.ims.enums.SaleOrderPartyType;
import com.ims.enums.SaleOrderStatus;
import com.ims.enums.reports.ReportModule;
import com.ims.enums.reports.ReportType;
import com.ims.repository.SaleOrderRepository;

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
public class SalesOrderReportProvider implements ReportDataProvider {

    private static final String REPORT_CODE = "SALES_ORDER_REPORT";

    private final SaleOrderRepository saleOrderRepository;

    // =========================================================
    // MODULE
    // =========================================================

    @Override
    public ReportModule getModule() {
        return ReportModule.SALES_ORDER;
    }

    // =========================================================
    // REPORT DEFINITIONS
    // =========================================================

    @Override
    public List<ReportDefinition> getReportDefinitions() {

        return List.of(
                ReportDefinition.builder()
                        .code(REPORT_CODE)
                        .name("Sales Order Report")
                        .description(
                                "Complete sales order report including customer, party, " +
                                        "warehouse, delivery schedule, order status, currency, " +
                                        "discounts, GST, financial totals and audit information."
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
            throw new IllegalArgumentException(
                    "Sales order report code is required."
            );
        }

        String reportCode = request.getReportCode()
                .trim()
                .toUpperCase(Locale.ROOT);

        if (!REPORT_CODE.equals(reportCode)) {
            throw new IllegalArgumentException(
                    "Unsupported sales order report: " + reportCode
            );
        }

        Specification<SalesOrderEntity> specification =
                buildSpecification(request.getFilters());

        Pageable databasePageable = mapSortProperties(pageable);

        Page<SalesOrderEntity> salesOrderPage =
                saleOrderRepository.findAll(
                        specification,
                        databasePageable
                );

        List<Map<String, Object>> rows =
                salesOrderPage.getContent()
                        .stream()
                        .map(this::mapSalesOrder)
                        .toList();

        ReportSummaryResponse summary =
                generateSummary(specification);

        return ReportData.builder()
                .columns(getColumns())
                .rows(rows)
                .totalElements(salesOrderPage.getTotalElements())
                .pageNumber(salesOrderPage.getNumber())
                .pageSize(salesOrderPage.getSize())
                .totalPages(salesOrderPage.getTotalPages())
                .last(salesOrderPage.isLast())
                .summary(summary)
                .build();
    }

    // =========================================================
    // REPORT COLUMNS
    // =========================================================

    private List<ReportColumn> getColumns() {

        return List.of(

                // ---------------------------------------------
                // Basic information
                // ---------------------------------------------

                column("id", "Sales Order ID", "NUMBER"),
                column("orderNo", "Order Number", "STRING"),

                // ---------------------------------------------
                // Party information
                // ---------------------------------------------

                column("partyType", "Party Type", "STRING"),

                column("customerId", "Customer ID", "NUMBER"),
                column("customerName", "Customer Name", "STRING"),

                column("partyId", "Party ID", "NUMBER"),
                column("partyName", "Party Name", "STRING"),

                // ---------------------------------------------
                // Warehouse
                // ---------------------------------------------

                column("warehouseId", "Warehouse ID", "NUMBER"),
                column("warehouseName", "Warehouse Name", "STRING"),

                // ---------------------------------------------
                // Dates and status
                // ---------------------------------------------

                column("orderDate", "Order Date", "DATE"),
                column("expectedDeliveryDate", "Expected Delivery Date", "DATE"),
                column("salesOrderStatus", "Sales Order Status", "STRING"),

                // ---------------------------------------------
                // Currency
                // ---------------------------------------------

                column("currencyId", "Currency ID", "NUMBER"),
                column("currencyCode", "Currency Code", "STRING"),
                column("exchangeRate", "Exchange Rate", "NUMBER"),

                // ---------------------------------------------
                // Discount
                // ---------------------------------------------

                column("discountType", "Discount Type", "STRING"),
                column("discountValue", "Discount Value", "NUMBER"),

                // ---------------------------------------------
                // Order amounts
                // ---------------------------------------------

                column("subtotal", "Subtotal", "NUMBER"),
                column("discountAmount", "Discount Amount", "NUMBER"),
                column("taxableAmount", "Taxable Amount", "NUMBER"),

                // ---------------------------------------------
                // GST
                // ---------------------------------------------

                column("cgstAmount", "CGST Amount", "NUMBER"),
                column("sgstAmount", "SGST Amount", "NUMBER"),
                column("igstAmount", "IGST Amount", "NUMBER"),
                column("totalTaxAmount", "Total Tax Amount", "NUMBER"),

                column("grandTotal", "Grand Total", "NUMBER"),

                // ---------------------------------------------
                // Base currency amounts (INR)
                // ---------------------------------------------

                column("baseSubtotal", "Base Subtotal (INR)", "NUMBER"),
                column("baseDiscountAmount", "Base Discount (INR)", "NUMBER"),
                column("baseTaxableAmount", "Base Taxable Amount (INR)", "NUMBER"),
                column("baseTotalTaxAmount", "Base Total Tax (INR)", "NUMBER"),
                column("baseGrandTotal", "Base Grand Total (INR)", "NUMBER"),

                // ---------------------------------------------
                // Additional information
                // ---------------------------------------------

                column("notes", "Notes", "STRING"),

                // ---------------------------------------------
                // Audit
                // ---------------------------------------------

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

    // =========================================================
    // SALES ORDER SPECIFICATION
    // =========================================================

    private Specification<SalesOrderEntity> buildSpecification(
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

            // ---------------------------------------------
            // Order number
            // ---------------------------------------------

            String orderNo = getFilterValue(customFilters, "orderNo");

            if (hasText(orderNo)) {
                predicates.add(
                        cb.like(
                                cb.lower(root.get("orderNo")),
                                containsPattern(orderNo)
                        )
                );
            }

            // ---------------------------------------------
            // Party type
            // ---------------------------------------------

            String partyType = getFilterValue(
                    customFilters,
                    "partyType"
            );

            if (hasText(partyType) && !"ALL".equalsIgnoreCase(partyType)) {

                try {

                    SaleOrderPartyType type =
                            SaleOrderPartyType.valueOf(
                                    partyType.trim().toUpperCase(Locale.ROOT)
                            );

                    predicates.add(
                            cb.equal(root.get("partyType"), type)
                    );

                } catch (IllegalArgumentException exception) {

                    throw new IllegalArgumentException(
                            "Invalid sales order party type: " + partyType
                    );
                }
            }

            // ---------------------------------------------
            // Customer
            // ---------------------------------------------

            Long customerId = getLongFilter(
                    customFilters,
                    "customerId"
            );

            if (customerId != null) {
                predicates.add(
                        cb.equal(
                                root.get("customer").get("id"),
                                customerId
                        )
                );
            }

            // ---------------------------------------------
            // Party
            // ---------------------------------------------

            Long partyId = getLongFilter(
                    customFilters,
                    "partyId"
            );

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

            Long warehouseId = getLongFilter(
                    customFilters,
                    "warehouseId"
            );

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

            Long currencyId = getLongFilter(
                    customFilters,
                    "currencyId"
            );

            if (currencyId != null) {
                predicates.add(
                        cb.equal(
                                root.get("currency").get("id"),
                                currencyId
                        )
                );
            }

            // ---------------------------------------------
            // Currency code
            // ---------------------------------------------

            String currencyCode = getFilterValue(
                    customFilters,
                    "currencyCode"
            );

            if (hasText(currencyCode)) {
                predicates.add(
                        cb.equal(
                                cb.lower(root.get("currency").get("currencyCode")),
                                currencyCode.toLowerCase(Locale.ROOT)
                        )
                );
            }

            // ---------------------------------------------
            // Sales order status
            // ---------------------------------------------

            String status = getFilterValue(
                    customFilters,
                    "salesOrderStatus"
            );

            if (!hasText(status)) {
                status = filters.getStatus();
            }

            if (hasText(status) && !"ALL".equalsIgnoreCase(status)) {

                try {

                    SaleOrderStatus salesOrderStatus =
                            SaleOrderStatus.valueOf(
                                    status.trim().toUpperCase(Locale.ROOT)
                            );

                    predicates.add(
                            cb.equal(
                                    root.get("salesOrderStatus"),
                                    salesOrderStatus
                            )
                    );

                } catch (IllegalArgumentException exception) {

                    throw new IllegalArgumentException(
                            "Invalid sales order status: " + status
                    );
                }
            }

            // ---------------------------------------------
            // Discount type
            // ---------------------------------------------

            String discountType = getFilterValue(
                    customFilters,
                    "discountType"
            );

            if (hasText(discountType) && !"ALL".equalsIgnoreCase(discountType)) {

                try {

                    predicates.add(
                            cb.equal(
                                    root.get("discountType"),
                                    Enum.valueOf(
                                            (Class) root.get("discountType")
                                                    .getJavaType(),
                                            discountType.trim().toUpperCase(Locale.ROOT)
                                    )
                            )
                    );

                } catch (IllegalArgumentException exception) {

                    throw new IllegalArgumentException(
                            "Invalid discount type: " + discountType
                    );
                }
            }

            // ---------------------------------------------
            // Minimum amount
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
            // Maximum amount
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

            validateAmountRange(minAmount, maxAmount);

            // ---------------------------------------------
            // Order date range
            // ---------------------------------------------

            LocalDate orderDateFrom = getDateFilter(
                    customFilters,
                    "orderDateFrom"
            );

            LocalDate orderDateTo = getDateFilter(
                    customFilters,
                    "orderDateTo"
            );

            if (orderDateFrom != null) {
                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("orderDate"),
                                orderDateFrom
                        )
                );
            }

            if (orderDateTo != null) {
                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("orderDate"),
                                orderDateTo
                        )
                );
            }

            validateDateRange(
                    orderDateFrom,
                    orderDateTo,
                    "Order date"
            );

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

            validateDateRange(
                    expectedDeliveryFrom,
                    expectedDeliveryTo,
                    "Expected delivery date"
            );

            // ---------------------------------------------
            // Common date filters
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

            validateDateRange(
                    fromDate,
                    toDate,
                    "From date"
            );

            // ---------------------------------------------
            // Active flag
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

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    // =========================================================
    // MAP SALES ORDER
    // =========================================================

    private Map<String, Object> mapSalesOrder(
            SalesOrderEntity order
    ) {

        Map<String, Object> row = new LinkedHashMap<>();

        // ---------------------------------------------
        // Basic information
        // ---------------------------------------------

        row.put("id", order.getId());
        row.put("orderNo", order.getOrderNo());

        row.put(
                "partyType",
                order.getPartyType() == null
                        ? null
                        : order.getPartyType().name()
        );

        // ---------------------------------------------
        // Customer
        // ---------------------------------------------

        row.put(
                "customerId",
                order.getCustomer() == null
                        ? null
                        : order.getCustomer().getId()
        );

        row.put(
                "customerName",
                order.getCustomer() == null
                        ? null
                        : order.getCustomer().getCompanyName()
        );

        // ---------------------------------------------
        // Party
        // ---------------------------------------------

        row.put(
                "partyId",
                order.getParty() == null
                        ? null
                        : order.getParty().getId()
        );

        row.put(
                "partyName",
                order.getParty() == null
                        ? null
                        : order.getParty().getCompanyName()
        );

        // ---------------------------------------------
        // Warehouse
        // ---------------------------------------------

        row.put(
                "warehouseId",
                order.getWarehouse() == null
                        ? null
                        : order.getWarehouse().getId()
        );

        row.put(
                "warehouseName",
                order.getWarehouse() == null
                        ? null
                        : order.getWarehouse().getWarehouseName()
        );

        // ---------------------------------------------
        // Dates and status
        // ---------------------------------------------

        row.put("orderDate", order.getOrderDate());
        row.put("expectedDeliveryDate", order.getExpectedDeliveryDate());

        row.put(
                "salesOrderStatus",
                order.getSalesOrderStatus() == null
                        ? null
                        : order.getSalesOrderStatus().name()
        );

        // ---------------------------------------------
        // Currency
        // ---------------------------------------------

        row.put(
                "currencyId",
                order.getCurrency() == null
                        ? null
                        : order.getCurrency().getId()
        );

        row.put(
                "currencyCode",
                order.getCurrency() == null
                        ? null
                        : order.getCurrency().getCurrencyCode()
        );

        row.put("exchangeRate", order.getExchangeRate());

        // ---------------------------------------------
        // Discount
        // ---------------------------------------------

        row.put(
                "discountType",
                order.getDiscountType() == null
                        ? null
                        : order.getDiscountType().name()
        );

        row.put("discountValue", order.getDiscountValue());

        // ---------------------------------------------
        // Amounts
        // ---------------------------------------------

        row.put("subtotal", order.getSubtotal());
        row.put("discountAmount", order.getDiscountAmount());
        row.put("taxableAmount", order.getTaxableAmount());

        // ---------------------------------------------
        // GST
        // ---------------------------------------------

        row.put("cgstAmount", order.getCgstAmount());
        row.put("sgstAmount", order.getSgstAmount());
        row.put("igstAmount", order.getIgstAmount());
        row.put("totalTaxAmount", order.getTotalTaxAmount());

        row.put("grandTotal", order.getGrandTotal());

        // ---------------------------------------------
        // Base currency amounts
        // ---------------------------------------------

        row.put("baseSubtotal", order.getBaseSubtotal());
        row.put("baseDiscountAmount", order.getBaseDiscountAmount());
        row.put("baseTaxableAmount", order.getBaseTaxableAmount());
        row.put("baseTotalTaxAmount", order.getBaseTotalTaxAmount());
        row.put("baseGrandTotal", order.getBaseGrandTotal());

        // ---------------------------------------------
        // Additional information
        // ---------------------------------------------

        row.put("notes", order.getNotes());

        // ---------------------------------------------
        // Audit
        // ---------------------------------------------

        row.put("active", order.getActive());
        row.put("createdAt", order.getCreatedAt());
        row.put("updatedAt", order.getUpdatedAt());
        row.put("createdBy", order.getCreatedBy());
        row.put("updatedBy", order.getUpdatedBy());

        return row;
    }

    // =========================================================
    // SUMMARY
    // =========================================================

    private ReportSummaryResponse generateSummary(
            Specification<SalesOrderEntity> specification
    ) {

        long total = saleOrderRepository.count(specification);

        long activeRecords = saleOrderRepository.count(
                specification.and(
                        (root, query, cb) ->
                                cb.isTrue(root.get("active"))
                )
        );

        long inactiveRecords = saleOrderRepository.count(
                specification.and(
                        (root, query, cb) ->
                                cb.isFalse(root.get("active"))
                )
        );

        long draftOrders = saleOrderRepository.count(
                specification.and(
                        (root, query, cb) ->
                                cb.equal(
                                        root.get("salesOrderStatus"),
                                        SaleOrderStatus.DRAFT
                                )
                )
        );

        Map<String, Object> metrics = new LinkedHashMap<>();

        metrics.put("totalSalesOrders", total);
        metrics.put("activeRecords", activeRecords);
        metrics.put("inactiveRecords", inactiveRecords);
        metrics.put("draftSalesOrders", draftOrders);

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

        } else {

            mappedSort = Sort.by(
                    Sort.Direction.DESC,
                    "orderDate"
            );
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
            case "partyType" -> "partyType";
            case "orderDate" -> "orderDate";
            case "expectedDeliveryDate" -> "expectedDeliveryDate";
            case "salesOrderStatus" -> "salesOrderStatus";

            case "customerId", "customerName" -> "customer.id";
            case "partyId", "partyName" -> "party.id";
            case "warehouseId", "warehouseName" -> "warehouse.id";
            case "currencyId", "currencyCode" -> "currency.id";

            case "discountType" -> "discountType";
            case "discountValue" -> "discountValue";

            case "subtotal" -> "subtotal";
            case "discountAmount" -> "discountAmount";
            case "taxableAmount" -> "taxableAmount";
            case "cgstAmount" -> "cgstAmount";
            case "sgstAmount" -> "sgstAmount";
            case "igstAmount" -> "igstAmount";
            case "totalTaxAmount" -> "totalTaxAmount";
            case "grandTotal" -> "grandTotal";

            case "baseSubtotal" -> "baseSubtotal";
            case "baseDiscountAmount" -> "baseDiscountAmount";
            case "baseTaxableAmount" -> "baseTaxableAmount";
            case "baseTotalTaxAmount" -> "baseTotalTaxAmount";
            case "baseGrandTotal" -> "baseGrandTotal";

            case "active" -> "active";
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

    private void validateAmountRange(
            BigDecimal minAmount,
            BigDecimal maxAmount
    ) {

        if (minAmount != null && maxAmount != null
                && minAmount.compareTo(maxAmount) > 0) {

            throw new IllegalArgumentException(
                    "Minimum amount cannot be greater than maximum amount."
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
