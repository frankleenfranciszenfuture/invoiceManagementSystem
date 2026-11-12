
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

    private static final String REPORT_CODE = "PURCHASE_ORDER_REPORT";

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
                        .code(REPORT_CODE)
                        .name("Purchase Order Report")
                        .description(
                                "Complete purchase order report including supplier, " +
                                        "warehouse, order and delivery dates, status, currency, " +
                                        "discounts, GST, received amounts, financial totals " +
                                        "and audit information."
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
                    "Purchase order report code is required."
            );
        }

        String reportCode = request.getReportCode()
                .trim()
                .toUpperCase(Locale.ROOT);

        if (!REPORT_CODE.equals(reportCode)) {
            throw new IllegalArgumentException(
                    "Unsupported purchase order report: " + reportCode
            );
        }

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
                        .map(this::mapPurchaseOrder)
                        .toList();

        ReportSummaryResponse summary =
                generateSummary(specification);

        return ReportData.builder()
                .columns(getColumns())
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

    private List<ReportColumn> getColumns() {

        return List.of(

                // ---------------------------------------------
                // Basic information
                // ---------------------------------------------

                column("id", "Purchase Order ID", "NUMBER"),
                column("orderNo", "Order Number", "STRING"),

                // ---------------------------------------------
                // Supplier
                // ---------------------------------------------

                column("partyId", "Supplier ID", "NUMBER"),
                column("partyName", "Supplier Name", "STRING"),
                column("partyCode", "Supplier Code", "STRING"),

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
                column("purchaseOrderStatus", "Purchase Order Status", "STRING"),

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
                // Received amounts
                // ---------------------------------------------

                column("receivedTotalAmount", "Received Amount", "NUMBER"),
                column("baseReceivedTotalAmount", "Base Received Amount (INR)", "NUMBER"),

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
                                ),
                                cb.like(
                                        cb.lower(root.get("party").get("companyName")),
                                        keyword
                                )
                        )
                );
            }

            // ---------------------------------------------
            // Order number
            // ---------------------------------------------

            String orderNo = getFilterValue(
                    customFilters,
                    "orderNo"
            );

            if (hasText(orderNo)) {

                predicates.add(
                        cb.like(
                                cb.lower(root.get("orderNo")),
                                containsPattern(orderNo)
                        )
                );
            }

            // ---------------------------------------------
            // Supplier
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

            String partyName = getFilterValue(
                    customFilters,
                    "partyName"
            );

            if (hasText(partyName)) {

                predicates.add(
                        cb.like(
                                cb.lower(root.get("party").get("companyName")),
                                containsPattern(partyName)
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
            // Discount type
            // ---------------------------------------------

            String discountType = getFilterValue(
                    customFilters,
                    "discountType"
            );

            if (hasText(discountType) && !"ALL".equalsIgnoreCase(discountType)) {

                try {

                    Class<?> discountTypeClass =
                            root.get("discountType").getJavaType();

                    if (discountTypeClass.isEnum()) {

                        @SuppressWarnings({"rawtypes", "unchecked"})
                        Enum<?> enumValue = Enum.valueOf(
                                (Class<? extends Enum>) discountTypeClass,
                                discountType.trim().toUpperCase(Locale.ROOT)
                        );

                        predicates.add(
                                cb.equal(root.get("discountType"), enumValue)
                        );

                    } else {

                        predicates.add(
                                cb.equal(
                                        cb.lower(root.get("discountType").as(String.class)),
                                        discountType.toLowerCase(Locale.ROOT)
                                )
                        );
                    }

                } catch (IllegalArgumentException exception) {

                    throw new IllegalArgumentException(
                            "Invalid discount type: " + discountType
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

            validateAmountRange(minAmount, maxAmount);

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
    // MAP PURCHASE ORDER
    // =========================================================

    private Map<String, Object> mapPurchaseOrder(
            PurchaseOrderEntity order
    ) {

        Map<String, Object> row = new LinkedHashMap<>();

        // ---------------------------------------------
        // Basic information
        // ---------------------------------------------

        row.put("id", order.getId());
        row.put("orderNo", order.getOrderNo());

        // ---------------------------------------------
        // Supplier
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

        row.put(
                "partyCode",
                order.getParty() == null
                        ? null
                        : order.getParty().getPartyCode()
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
                "purchaseOrderStatus",
                order.getPurchaseOrderStatus() == null
                        ? null
                        : order.getPurchaseOrderStatus().name()
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
        // Order amounts
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
        // Received amounts
        // ---------------------------------------------

        row.put("receivedTotalAmount", order.getReceivedTotalAmount());
        row.put("baseReceivedTotalAmount", order.getBaseReceivedTotalAmount());

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

        Sort mappedSort;

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
            case "orderDate" -> "orderDate";
            case "expectedDeliveryDate" -> "expectedDeliveryDate";
            case "purchaseOrderStatus" -> "purchaseOrderStatus";

            case "partyId", "partyName", "partyCode" -> "party.companyName";
            case "warehouseId", "warehouseName" -> "warehouse.warehouseName";
            case "currencyId", "currencyCode" -> "currency.currencyCode";

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

            case "receivedTotalAmount" -> "receivedTotalAmount";
            case "baseReceivedTotalAmount" -> "baseReceivedTotalAmount";

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
