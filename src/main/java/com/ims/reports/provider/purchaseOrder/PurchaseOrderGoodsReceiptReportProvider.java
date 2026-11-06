package com.ims.reports.provider.purchaseOrder;


import com.ims.dtos.reports.*;

import com.ims.entity.PurchaseOrderGoodsReceiptEntity;

import com.ims.enums.reports.ReportModule;
import com.ims.enums.reports.ReportType;

import com.ims.repository.PurchaseOrderGoodsReceiptRepository;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
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
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PurchaseOrderGoodsReceiptReportProvider
        implements ReportDataProvider {

    private final PurchaseOrderGoodsReceiptRepository goodsReceiptRepository;

    // =========================================================
    // MODULE
    // =========================================================

    @Override
    public ReportModule getModule() {
        return ReportModule.PURCHASE_ORDER_GOODS_RECEIPT;
    }

    // =========================================================
    // REPORT DEFINITIONS
    // =========================================================

    @Override
    public List<ReportDefinition> getReportDefinitions() {

        return List.of(

                ReportDefinition.builder()
                        .code("GOODS_RECEIPT_REGISTER")
                        .name("Goods Receipt Register")
                        .description(
                                "Complete goods receipt register including " +
                                        "receipt number, purchase order, warehouse " +
                                        "and receipt date."
                        )
                        .type(ReportType.REGISTER)
                        .columns(getRegisterColumns())
                        .build(),

                ReportDefinition.builder()
                        .code("GOODS_RECEIPT_DETAILS")
                        .name("Goods Receipt Details")
                        .description(
                                "Detailed goods receipt information including " +
                                        "purchase order reference, warehouse, notes " +
                                        "and record audit information."
                        )
                        .type(ReportType.DETAILED)
                        .columns(getDetailsColumns())
                        .build(),

                ReportDefinition.builder()
                        .code("GOODS_RECEIPT_DATE_REPORT")
                        .name("Goods Receipt Date Report")
                        .description(
                                "Goods receipts grouped by receipt date " +
                                        "with their purchase order and warehouse references."
                        )
                        .type(ReportType.DETAILED)
                        .columns(getDateReportColumns())
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
                    "Report code is required."
            );
        }

        String reportCode = request.getReportCode()
                .trim()
                .toUpperCase(Locale.ROOT);

        List<ReportColumn> columns = getColumns(reportCode);

        Specification<PurchaseOrderGoodsReceiptEntity> specification =
                buildSpecification(request.getFilters());

        Pageable databasePageable = mapSortProperties(pageable);

        Page<PurchaseOrderGoodsReceiptEntity> receiptPage =
                goodsReceiptRepository.findAll(
                        specification,
                        databasePageable
                );

        List<Map<String, Object>> rows =
                receiptPage.getContent()
                        .stream()
                        .map(receipt -> mapGoodsReceipt(receipt, reportCode))
                        .toList();

        ReportSummaryResponse summary =
                generateSummary(specification);

        return ReportData.builder()
                .columns(columns)
                .rows(rows)
                .totalElements(receiptPage.getTotalElements())
                .pageNumber(receiptPage.getNumber())
                .pageSize(receiptPage.getSize())
                .totalPages(receiptPage.getTotalPages())
                .last(receiptPage.isLast())
                .summary(summary)
                .build();
    }

    // =========================================================
    // REPORT COLUMNS
    // =========================================================

    private List<ReportColumn> getColumns(String reportCode) {

        return switch (reportCode) {

            case "GOODS_RECEIPT_REGISTER" ->
                    getRegisterColumns();

            case "GOODS_RECEIPT_DETAILS" ->
                    getDetailsColumns();

            case "GOODS_RECEIPT_DATE_REPORT" ->
                    getDateReportColumns();

            default -> throw new IllegalArgumentException(
                    "Unsupported goods receipt report: " + reportCode
            );
        };
    }

    // =========================================================
    // REGISTER COLUMNS
    // =========================================================

    private List<ReportColumn> getRegisterColumns() {

        return List.of(

                column("id", "Receipt ID", "NUMBER"),

                column("receiptNo", "Receipt Number", "STRING"),

                column("purchaseOrderId", "Purchase Order ID", "NUMBER"),

                column("orderNo", "Purchase Order Number", "STRING"),

                column("warehouseId", "Warehouse ID", "NUMBER"),

                column("receiptDate", "Receipt Date", "DATE"),

                column("active", "Active", "BOOLEAN"),

                column("createdAt", "Created At", "DATETIME"),

                column("updatedAt", "Updated At", "DATETIME")
        );
    }

    // =========================================================
    // DETAILS COLUMNS
    // =========================================================

    private List<ReportColumn> getDetailsColumns() {

        return List.of(

                column("id", "Receipt ID", "NUMBER"),

                column("receiptNo", "Receipt Number", "STRING"),

                column("purchaseOrderId", "Purchase Order ID", "NUMBER"),

                column("orderNo", "Purchase Order Number", "STRING"),

                column("warehouseId", "Warehouse ID", "NUMBER"),

                column("receiptDate", "Receipt Date", "DATE"),

                column("notes", "Notes", "STRING"),

                column("active", "Active", "BOOLEAN"),

                column("createdAt", "Created At", "DATETIME"),

                column("updatedAt", "Updated At", "DATETIME"),

                column("createdBy", "Created By", "NUMBER"),

                column("updatedBy", "Updated By", "NUMBER")
        );
    }

    // =========================================================
    // DATE REPORT COLUMNS
    // =========================================================

    private List<ReportColumn> getDateReportColumns() {

        return List.of(

                column("receiptNo", "Receipt Number", "STRING"),

                column("orderNo", "Purchase Order Number", "STRING"),

                column("purchaseOrderId", "Purchase Order ID", "NUMBER"),

                column("warehouseId", "Warehouse ID", "NUMBER"),

                column("receiptDate", "Receipt Date", "DATE"),

                column("notes", "Notes", "STRING")
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
    // GOODS RECEIPT SPECIFICATION
    // =========================================================

    private Specification<PurchaseOrderGoodsReceiptEntity> buildSpecification(
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

                String keyword = containsPattern(
                        filters.getKeyword()
                );

                Join<Object, Object> purchaseOrderJoin =
                        root.join("purchaseOrder", JoinType.LEFT);

                predicates.add(
                        cb.or(
                                cb.like(
                                        cb.lower(root.get("receiptNo")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(root.get("notes")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(purchaseOrderJoin.get("orderNo")),
                                        keyword
                                )
                        )
                );
            }

            // ---------------------------------------------
            // RECEIPT NUMBER
            // ---------------------------------------------

            String receiptNo = getFilterValue(
                    customFilters,
                    "receiptNo"
            );

            if (hasText(receiptNo)) {

                predicates.add(
                        cb.like(
                                cb.lower(root.get("receiptNo")),
                                containsPattern(receiptNo)
                        )
                );
            }

            // ---------------------------------------------
            // PURCHASE ORDER ID
            // ---------------------------------------------

            Long purchaseOrderId = getLongFilter(
                    customFilters,
                    "purchaseOrderId"
            );

            if (purchaseOrderId != null) {

                predicates.add(
                        cb.equal(
                                root.get("purchaseOrder").get("id"),
                                purchaseOrderId
                        )
                );
            }

            // ---------------------------------------------
            // WAREHOUSE ID
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
            // RECEIPT DATE FROM
            // ---------------------------------------------

            LocalDate receiptDateFrom = getDateFilter(
                    customFilters,
                    "receiptDateFrom"
            );

            if (receiptDateFrom != null) {

                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("receiptDate"),
                                receiptDateFrom
                        )
                );
            }

            // ---------------------------------------------
            // RECEIPT DATE TO
            // ---------------------------------------------

            LocalDate receiptDateTo = getDateFilter(
                    customFilters,
                    "receiptDateTo"
            );

            if (receiptDateTo != null) {

                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("receiptDate"),
                                receiptDateTo
                        )
                );
            }

            validateDateRange(
                    receiptDateFrom,
                    receiptDateTo,
                    "Receipt date"
            );

            // ---------------------------------------------
            // COMMON DATE FILTER
            // Uses receiptDate
            // ---------------------------------------------

            LocalDate fromDate = filters.getFromDate();
            LocalDate toDate = filters.getToDate();

            validateDateRange(
                    fromDate,
                    toDate,
                    "From date"
            );

            if (fromDate != null) {

                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("receiptDate"),
                                fromDate
                        )
                );
            }

            if (toDate != null) {

                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("receiptDate"),
                                toDate
                        )
                );
            }

            // ---------------------------------------------
            // ACTIVE FLAG
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

            return cb.and(
                    predicates.toArray(new Predicate[0])
            );
        };
    }

    // =========================================================
    // MAP GOODS RECEIPT
    // =========================================================

    private Map<String, Object> mapGoodsReceipt(
            PurchaseOrderGoodsReceiptEntity receipt,
            String reportCode
    ) {

        Map<String, Object> row = new LinkedHashMap<>();

        switch (reportCode) {

            case "GOODS_RECEIPT_REGISTER" ->
                    mapRegister(receipt, row);

            case "GOODS_RECEIPT_DETAILS" ->
                    mapDetails(receipt, row);

            case "GOODS_RECEIPT_DATE_REPORT" ->
                    mapDateReport(receipt, row);

            default -> throw new IllegalArgumentException(
                    "Unsupported goods receipt report: " + reportCode
            );
        }

        return row;
    }

    // =========================================================
    // REGISTER MAPPING
    // =========================================================

    private void mapRegister(
            PurchaseOrderGoodsReceiptEntity receipt,
            Map<String, Object> row
    ) {

        row.put("id", receipt.getId());

        row.put("receiptNo", receipt.getReceiptNo());

        row.put(
                "purchaseOrderId",
                receipt.getPurchaseOrder() == null
                        ? null
                        : receipt.getPurchaseOrder().getId()
        );

        row.put(
                "orderNo",
                receipt.getPurchaseOrder() == null
                        ? null
                        : receipt.getPurchaseOrder().getOrderNo()
        );

        row.put(
                "warehouseId",
                receipt.getWarehouse() == null
                        ? null
                        : receipt.getWarehouse().getId()
        );

        row.put("receiptDate", receipt.getReceiptDate());

        row.put("active", receipt.getActive());

        row.put("createdAt", receipt.getCreatedAt());

        row.put("updatedAt", receipt.getUpdatedAt());
    }

    // =========================================================
    // DETAILS MAPPING
    // =========================================================

    private void mapDetails(
            PurchaseOrderGoodsReceiptEntity receipt,
            Map<String, Object> row
    ) {

        mapRegister(receipt, row);

        row.put("notes", receipt.getNotes());

        row.put("createdBy", receipt.getCreatedBy());

        row.put("updatedBy", receipt.getUpdatedBy());
    }

    // =========================================================
    // DATE REPORT MAPPING
    // =========================================================

    private void mapDateReport(
            PurchaseOrderGoodsReceiptEntity receipt,
            Map<String, Object> row
    ) {

        row.put("receiptNo", receipt.getReceiptNo());

        row.put(
                "orderNo",
                receipt.getPurchaseOrder() == null
                        ? null
                        : receipt.getPurchaseOrder().getOrderNo()
        );

        row.put(
                "purchaseOrderId",
                receipt.getPurchaseOrder() == null
                        ? null
                        : receipt.getPurchaseOrder().getId()
        );

        row.put(
                "warehouseId",
                receipt.getWarehouse() == null
                        ? null
                        : receipt.getWarehouse().getId()
        );

        row.put("receiptDate", receipt.getReceiptDate());

        row.put("notes", receipt.getNotes());
    }

    // =========================================================
    // SUMMARY
    // =========================================================

    private ReportSummaryResponse generateSummary(
            Specification<PurchaseOrderGoodsReceiptEntity> specification
    ) {

        long total = goodsReceiptRepository.count(specification);

        long activeRecords = goodsReceiptRepository.count(
                specification.and(
                        (root, query, cb) ->
                                cb.isTrue(root.get("active"))
                )
        );

        long inactiveRecords = goodsReceiptRepository.count(
                specification.and(
                        (root, query, cb) ->
                                cb.isFalse(root.get("active"))
                )
        );

        Map<String, Object> metrics = new LinkedHashMap<>();

        metrics.put("totalGoodsReceipts", total);

        metrics.put("activeRecords", activeRecords);

        metrics.put("inactiveRecords", inactiveRecords);

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

            case "receiptNo" -> "receiptNo";

            case "receiptDate" -> "receiptDate";

            case "purchaseOrderId" -> "purchaseOrder.id";

            case "orderNo" -> "purchaseOrder.orderNo";

            case "warehouseId" -> "warehouse.id";

            case "createdAt" -> "createdAt";

            case "updatedAt" -> "updatedAt";

            default -> "id";
        };
    }

    // =========================================================
    // VALIDATION HELPERS
    // =========================================================

    private void validateDateRange(
            LocalDate fromDate,
            LocalDate toDate,
            String fieldName
    ) {

        if (fromDate != null
                && toDate != null
                && fromDate.isAfter(toDate)) {

            throw new IllegalArgumentException(
                    fieldName + " start date cannot be after end date."
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

    private Long getLongFilter(
            Map<String, Object> filters,
            String key
    ) {

        String value = getFilterValue(filters, key);

        if (!hasText(value)) {
            return null;
        }

        try {

            Long number = Long.valueOf(value);

            if (number <= 0) {
                throw new IllegalArgumentException(
                        key + " must be greater than zero."
                );
            }

            return number;

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
