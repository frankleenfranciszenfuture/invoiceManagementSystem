
package com.ims.reports.provider.inventory;

import com.ims.dtos.reports.*;
import com.ims.entity.InventoryStockEntity;
import com.ims.entity.InventoryTransactionEntity;
import com.ims.entity.ProductEntity;
import com.ims.entity.WarehouseEntity;
import com.ims.entity.UnitEntity;
import com.ims.entity.SizeEntity;
import com.ims.enums.reports.ReportModule;
import com.ims.enums.reports.ReportType;
import com.ims.repository.InventoryStockRepository;
import com.ims.repository.InventoryTransactionRepository;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.CriteriaBuilder;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Component
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InventoryReportProvider implements ReportDataProvider {

    private final InventoryStockRepository inventoryStockRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;

    private static final String STOCK_REPORT = "INVENTORY_STOCK_REPORT";
    private static final String TRANSACTION_REPORT = "INVENTORY_TRANSACTION_REPORT";

    private static final BigDecimal ZERO = BigDecimal.ZERO;

    // =========================================================
    // MODULE
    // =========================================================

    @Override
    public ReportModule getModule() {
        return ReportModule.INVENTORY;
    }

    // =========================================================
    // REPORT DEFINITIONS
    // =========================================================

    @Override
    public List<ReportDefinition> getReportDefinitions() {

        return List.of(

                ReportDefinition.builder()
                        .code(STOCK_REPORT)
                        .name("Inventory Stock Report")
                        .description(
                                "Complete inventory stock report including product, " +
                                        "warehouse, unit, size, stock quantities, reserved " +
                                        "quantities, available stock, minimum and maximum " +
                                        "stock levels, average cost and stock value. " +
                                        "Supports low-stock filtering."
                        )
                        .type(ReportType.REGISTER)
                        .columns(getStockColumns())
                        .build(),

                ReportDefinition.builder()
                        .code(TRANSACTION_REPORT)
                        .name("Inventory Transaction Report")
                        .description(
                                "Complete inventory transaction report including " +
                                        "stock movements, product, warehouse, unit, size, " +
                                        "references, quantities, balances and transaction costs."
                        )
                        .type(ReportType.TRANSACTION)
                        .columns(getTransactionColumns())
                        .build()
        );
    }

    // =========================================================
    // STOCK REPORT COLUMNS
    // =========================================================

    private List<ReportColumn> getStockColumns() {

        return List.of(
                column("id", "ID", "NUMBER"),

                column("productId", "Product ID", "NUMBER"),
                column("productCode", "Product Code", "STRING"),
                column("productName", "Product Name", "STRING"),
                column("sku", "SKU", "STRING"),

                column("warehouseId", "Warehouse ID", "NUMBER"),
                column("warehouseName", "Warehouse", "STRING"),
                column("warehouseCode", "Warehouse Code", "STRING"),

                column("unitId", "Unit ID", "NUMBER"),
                column("unitName", "Unit", "STRING"),
                column("unitShortName", "Unit Short Name", "STRING"),

                column("sizeId", "Size ID", "NUMBER"),
                column("sizeName", "Size", "STRING"),

                column("quantity", "Total Quantity", "DECIMAL"),
                column("reservedQuantity", "Reserved Quantity", "DECIMAL"),
                column("availableQuantity", "Available Quantity", "DECIMAL"),

                column("minimumStock", "Minimum Stock", "DECIMAL"),
                column("maximumStock", "Maximum Stock", "DECIMAL"),

                column("averageCost", "Average Cost", "DECIMAL"),
                column("stockValue", "Stock Value", "DECIMAL")
        );
    }

    // =========================================================
    // TRANSACTION REPORT COLUMNS
    // =========================================================

    private List<ReportColumn> getTransactionColumns() {

        return List.of(
                column("id", "ID", "NUMBER"),

                column("transactionNo", "Transaction No", "STRING"),
                column("transactionDate", "Transaction Date", "DATETIME"),

                column("productId", "Product ID", "NUMBER"),
                column("productCode", "Product Code", "STRING"),
                column("productName", "Product Name", "STRING"),

                column("warehouseId", "Warehouse ID", "NUMBER"),
                column("warehouseName", "Warehouse", "STRING"),
                column("warehouseCode", "Warehouse Code", "STRING"),

                column("unitId", "Unit ID", "NUMBER"),
                column("unitName", "Unit", "STRING"),
                column("unitShortName", "Unit Short Name", "STRING"),

                column("sizeId", "Size ID", "NUMBER"),
                column("sizeName", "Size", "STRING"),

                column("movementType", "Movement Type", "STRING"),
                column("referenceType", "Reference Type", "STRING"),
                column("referenceId", "Reference ID", "NUMBER"),

                column("quantityIn", "Quantity In", "DECIMAL"),
                column("quantityOut", "Quantity Out", "DECIMAL"),
                column("balanceAfter", "Balance After", "DECIMAL"),

                column("unitCost", "Unit Cost", "DECIMAL"),

                column("notes", "Notes", "STRING")
        );
    }

    // =========================================================
    // COMMON COLUMN BUILDER
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

        ReportFilterRequest filters = request.getFilters();

        return switch (reportCode) {

            case STOCK_REPORT ->
                    generateStockReport(filters, pageable);

            case TRANSACTION_REPORT ->
                    generateTransactionReport(filters, pageable);

            default ->
                    throw new IllegalArgumentException(
                            "Unsupported inventory report: " + reportCode
                    );
        };
    }

    // =========================================================
    // STOCK REPORT
    // =========================================================

    private ReportData generateStockReport(
            ReportFilterRequest filters,
            Pageable pageable
    ) {

        Specification<InventoryStockEntity> specification =
                buildStockSpecification(filters);

        Pageable sortedPageable = buildPageable(
                pageable,
                Map.ofEntries(
                        Map.entry("id", "id"),
                        Map.entry("productId", "product.id"),
                        Map.entry("productCode", "product.productCode"),
                        Map.entry("productName", "product.productName"),
                        Map.entry("sku", "product.sku"),
                        Map.entry("warehouseId", "warehouse.id"),
                        Map.entry("warehouseName", "warehouse.warehouseName"),
                        Map.entry("unitId", "unit.id"),
                        Map.entry("unitName", "unit.unitName"),
                        Map.entry("sizeId", "size.id"),
                        Map.entry("sizeName", "size.sizeName"),
                        Map.entry("quantity", "quantity"),
                        Map.entry("reservedQuantity", "reservedQuantity"),
                        Map.entry("availableQuantity", "availableQuantity"),
                        Map.entry("minimumStock", "product.minimumStock"),
                        Map.entry("maximumStock", "product.maximumStock"),
                        Map.entry("averageCost", "averageCost")
                ),
                "product.productName",
                Sort.Direction.ASC
        );

        Page<InventoryStockEntity> page =
                inventoryStockRepository.findAll(
                        specification,
                        sortedPageable
                );

        List<Map<String, Object>> rows = page.getContent()
                .stream()
                .map(this::mapStockRow)
                .toList();

        ReportSummaryResponse summary =
                buildStockSummary(specification);

        return ReportData.builder()
                .columns(getStockColumns())
                .rows(rows)
                .totalElements(page.getTotalElements())
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .summary(summary)
                .build();
    }

    // =========================================================
    // STOCK SPECIFICATION
    // =========================================================

    private Specification<InventoryStockEntity> buildStockSpecification(
            ReportFilterRequest filters
    ) {

        ReportFilterRequest requestFilters =
                filters != null ? filters : new ReportFilterRequest();

        return (root, query, cb) -> {

            Join<InventoryStockEntity, ProductEntity> product =
                    root.join("product", JoinType.LEFT);

            Join<InventoryStockEntity, WarehouseEntity> warehouse =
                    root.join("warehouse", JoinType.LEFT);

            Join<InventoryStockEntity, UnitEntity> unit =
                    root.join("unit", JoinType.LEFT);

            Join<InventoryStockEntity, SizeEntity> size =
                    root.join("size", JoinType.LEFT);

            List<Predicate> predicates = new ArrayList<>();

            Map<String, Object> values = getFilterValues(requestFilters);

            // KEYWORD

            if (hasText(requestFilters.getKeyword())) {

                String keyword = containsPattern(requestFilters.getKeyword());

                predicates.add(
                        cb.or(
                                cb.like(cb.lower(product.get("productName")), keyword),
                                cb.like(cb.lower(product.get("productCode")), keyword),
                                cb.like(cb.lower(product.get("sku")), keyword),
                                cb.like(cb.lower(warehouse.get("warehouseName")), keyword),
                                cb.like(cb.lower(warehouse.get("warehouseCode")), keyword),
                                cb.like(cb.lower(unit.get("unitName")), keyword),
                                cb.like(cb.lower(unit.get("unitShortName")), keyword),
                                cb.like(cb.lower(size.get("sizeName")), keyword)
                        )
                );
            }

            // PRODUCT STATUS

            if (hasText(requestFilters.getStatus())
                    && !"ALL".equalsIgnoreCase(requestFilters.getStatus())) {

                predicates.add(
                        cb.equal(
                                product.get("status").as(String.class),
                                requestFilters.getStatus()
                                        .trim()
                                        .toUpperCase(Locale.ROOT)
                        )
                );
            }

            // ENTITY FILTERS

            addIdPredicate(predicates, cb, product.get("id"), values.get("productId"));
            addIdPredicate(predicates, cb, warehouse.get("id"), values.get("warehouseId"));
            addIdPredicate(predicates, cb, unit.get("id"), values.get("unitId"));
            addIdPredicate(predicates, cb, size.get("id"), values.get("sizeId"));

            // QUANTITY FILTERS

            addDecimalPredicate(
                    predicates, cb, root.<BigDecimal>get("quantity"),
                    values.get("minQuantity"), true
            );

            addDecimalPredicate(
                    predicates, cb, root.<BigDecimal>get("quantity"),
                    values.get("maxQuantity"), false
            );

            addDecimalPredicate(
                    predicates, cb, root.<BigDecimal>get("reservedQuantity"),
                    values.get("minReservedQuantity"), true
            );

            addDecimalPredicate(
                    predicates, cb, root.<BigDecimal>get("reservedQuantity"),
                    values.get("maxReservedQuantity"), false
            );

            addDecimalPredicate(
                    predicates, cb, root.<BigDecimal>get("availableQuantity"),
                    values.get("minAvailableQuantity"), true
            );

            addDecimalPredicate(
                    predicates, cb, root.<BigDecimal>get("availableQuantity"),
                    values.get("maxAvailableQuantity"), false
            );

            addDecimalPredicate(
                    predicates, cb, root.<BigDecimal>get("averageCost"),
                    values.get("minAverageCost"), true
            );

            addDecimalPredicate(
                    predicates, cb, root.<BigDecimal>get("averageCost"),
                    values.get("maxAverageCost"), false
            );

            // LOW STOCK FILTER
            // true: only stock at or below minimum stock
            // false: exclude low stock

            Object lowStockValue = values.get("lowStockOnly");

            if (lowStockValue != null && hasText(lowStockValue)) {

                Boolean lowStockOnly = parseBoolean(lowStockValue);

                if (lowStockOnly != null && lowStockOnly) {

                    predicates.add(cb.isNotNull(product.get("minimumStock")));

                    predicates.add(
                            cb.lessThanOrEqualTo(
                                    root.<BigDecimal>get("availableQuantity"),
                                    product.<BigDecimal>get("minimumStock")
                            )
                    );

                } else if (Boolean.FALSE.equals(lowStockOnly)) {

                    predicates.add(
                            cb.or(
                                    cb.isNull(product.get("minimumStock")),
                                    cb.greaterThan(
                                            root.<BigDecimal>get("availableQuantity"),
                                            product.<BigDecimal>get("minimumStock")
                                    )
                            )
                    );
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    // =========================================================
    // STOCK ROW MAPPING
    // =========================================================

    private Map<String, Object> mapStockRow(
            InventoryStockEntity stock
    ) {

        ProductEntity product = stock.getProduct();
        WarehouseEntity warehouse = stock.getWarehouse();
        UnitEntity unit = stock.getUnit();
        SizeEntity size = stock.getSize();

        BigDecimal quantity = valueOrZero(stock.getQuantity());
        BigDecimal averageCost = valueOrZero(stock.getAverageCost());

        Map<String, Object> row = new LinkedHashMap<>();

        row.put("id", stock.getId());

        row.put("productId", product != null ? product.getId() : null);
        row.put("productCode", product != null ? product.getProductCode() : null);
        row.put("productName", product != null ? product.getProductName() : null);
        row.put("sku", product != null ? product.getSku() : null);

        row.put("warehouseId", warehouse != null ? warehouse.getId() : null);
        row.put("warehouseName",
                warehouse != null ? warehouse.getWarehouseName() : null);
        row.put("warehouseCode",
                warehouse != null ? warehouse.getWarehouseCode() : null);

        row.put("unitId", unit != null ? unit.getId() : null);
        row.put("unitName", unit != null ? unit.getUnitName() : null);
        row.put("unitShortName",
                unit != null ? unit.getUnitShortName() : null);

        row.put("sizeId", size != null ? size.getId() : null);
        row.put("sizeName", size != null ? size.getSizeName() : null);

        row.put("quantity", quantity);
        row.put("reservedQuantity", valueOrZero(stock.getReservedQuantity()));
        row.put("availableQuantity", valueOrZero(stock.getAvailableQuantity()));

        row.put("minimumStock",
                product != null ? product.getMinimumStock() : null);

        row.put("maximumStock",
                product != null ? product.getMaximumStock() : null);

        row.put("averageCost", averageCost);
        row.put("stockValue", quantity.multiply(averageCost));

        return row;
    }

    // =========================================================
    // STOCK SUMMARY
    // =========================================================

    private ReportSummaryResponse buildStockSummary(
            Specification<InventoryStockEntity> specification
    ) {

        List<InventoryStockEntity> stocks =
                inventoryStockRepository.findAll(specification);

        BigDecimal totalQuantity = ZERO;
        BigDecimal totalReserved = ZERO;
        BigDecimal totalAvailable = ZERO;
        BigDecimal totalStockValue = ZERO;

        long lowStockItems = 0;

        for (InventoryStockEntity stock : stocks) {

            BigDecimal quantity = valueOrZero(stock.getQuantity());
            BigDecimal reserved = valueOrZero(stock.getReservedQuantity());
            BigDecimal available = valueOrZero(stock.getAvailableQuantity());
            BigDecimal averageCost = valueOrZero(stock.getAverageCost());

            totalQuantity = totalQuantity.add(quantity);
            totalReserved = totalReserved.add(reserved);
            totalAvailable = totalAvailable.add(available);

            totalStockValue = totalStockValue.add(
                    quantity.multiply(averageCost)
            );

            ProductEntity product = stock.getProduct();

            if (product != null
                    && product.getMinimumStock() != null
                    && available.compareTo(product.getMinimumStock()) <= 0) {

                lowStockItems++;
            }
        }

        Map<String, Object> metrics = new LinkedHashMap<>();

        metrics.put("totalStockItems", stocks.size());
        metrics.put("totalQuantity", totalQuantity);
        metrics.put("totalReservedQuantity", totalReserved);
        metrics.put("totalAvailableQuantity", totalAvailable);
        metrics.put("totalStockValue", totalStockValue);
        metrics.put("lowStockItems", lowStockItems);

        return ReportSummaryResponse.builder()
                .metrics(metrics)
                .build();
    }

    // =========================================================
    // TRANSACTION REPORT
    // =========================================================

    private ReportData generateTransactionReport(
            ReportFilterRequest filters,
            Pageable pageable
    ) {

        Specification<InventoryTransactionEntity> specification =
                buildTransactionSpecification(filters);

        Map<String, String> sortFields = Map.ofEntries(
                Map.entry("id", "id"),
                Map.entry("transactionNo", "transactionNo"),
                Map.entry("transactionDate", "transactionDate"),
                Map.entry("productId", "product.id"),
                Map.entry("productName", "product.productName"),
                Map.entry("productCode", "product.productCode"),
                Map.entry("warehouseId", "warehouse.id"),
                Map.entry("warehouseName", "warehouse.warehouseName"),
                Map.entry("unitId", "unit.id"),
                Map.entry("unitName", "unit.unitName"),
                Map.entry("sizeId", "size.id"),
                Map.entry("sizeName", "size.sizeName"),
                Map.entry("movementType", "movementType"),
                Map.entry("referenceType", "referenceType"),
                Map.entry("referenceId", "referenceId"),
                Map.entry("quantityIn", "quantityIn"),
                Map.entry("quantityOut", "quantityOut"),
                Map.entry("balanceAfter", "balanceAfter"),
                Map.entry("unitCost", "unitCost"),
                Map.entry("notes", "notes")
        );

        Pageable sortedPageable = buildPageable(
                pageable,
                sortFields,
                "transactionDate",
                Sort.Direction.DESC
        );

        Page<InventoryTransactionEntity> page =
                inventoryTransactionRepository.findAll(
                        specification,
                        sortedPageable
                );

        List<Map<String, Object>> rows = page.getContent()
                .stream()
                .map(this::mapTransactionRow)
                .toList();

        ReportSummaryResponse summary =
                buildTransactionSummary(specification);

        return ReportData.builder()
                .columns(getTransactionColumns())
                .rows(rows)
                .totalElements(page.getTotalElements())
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .summary(summary)
                .build();
    }

    // =========================================================
    // TRANSACTION SPECIFICATION
    // =========================================================

    private Specification<InventoryTransactionEntity>
    buildTransactionSpecification(ReportFilterRequest filters) {

        ReportFilterRequest requestFilters =
                filters != null ? filters : new ReportFilterRequest();

        return (root, query, cb) -> {

            Join<InventoryTransactionEntity, ProductEntity> product =
                    root.join("product", JoinType.LEFT);

            Join<InventoryTransactionEntity, WarehouseEntity> warehouse =
                    root.join("warehouse", JoinType.LEFT);

            Join<InventoryTransactionEntity, UnitEntity> unit =
                    root.join("unit", JoinType.LEFT);

            Join<InventoryTransactionEntity, SizeEntity> size =
                    root.join("size", JoinType.LEFT);

            List<Predicate> predicates = new ArrayList<>();

            Map<String, Object> values = getFilterValues(requestFilters);

            // KEYWORD

            if (hasText(requestFilters.getKeyword())) {

                String keyword = containsPattern(requestFilters.getKeyword());

                predicates.add(
                        cb.or(
                                cb.like(cb.lower(root.get("transactionNo")), keyword),
                                cb.like(cb.lower(product.get("productName")), keyword),
                                cb.like(cb.lower(product.get("productCode")), keyword),
                                cb.like(cb.lower(warehouse.get("warehouseName")), keyword),
                                cb.like(cb.lower(warehouse.get("warehouseCode")), keyword),
                                cb.like(cb.lower(unit.get("unitName")), keyword),
                                cb.like(cb.lower(size.get("sizeName")), keyword),
                                cb.like(cb.lower(root.get("notes")), keyword)
                        )
                );
            }

            // DATE RANGE

            if (requestFilters.getFromDate() != null) {

                LocalDateTime fromDate =
                        requestFilters.getFromDate().atStartOfDay();

                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.<LocalDateTime>get("transactionDate"),
                                fromDate
                        )
                );
            }

            if (requestFilters.getToDate() != null) {

                LocalDateTime toDate =
                        requestFilters.getToDate()
                                .plusDays(1)
                                .atStartOfDay();

                predicates.add(
                        cb.lessThan(
                                root.<LocalDateTime>get("transactionDate"),
                                toDate
                        )
                );
            }

            // ENTITY FILTERS

            addIdPredicate(predicates, cb, product.get("id"), values.get("productId"));
            addIdPredicate(predicates, cb, warehouse.get("id"), values.get("warehouseId"));
            addIdPredicate(predicates, cb, unit.get("id"), values.get("unitId"));
            addIdPredicate(predicates, cb, size.get("id"), values.get("sizeId"));

            addIdPredicate(
                    predicates,
                    cb,
                    root.get("referenceId"),
                    values.get("referenceId")
            );

            // MOVEMENT TYPE

            if (hasText(values.get("movementType"))) {

                predicates.add(
                        cb.equal(
                                root.get("movementType").as(String.class),
                                values.get("movementType").toString()
                                        .trim().toUpperCase(Locale.ROOT)
                        )
                );
            }

            // REFERENCE TYPE

            if (hasText(values.get("referenceType"))) {

                predicates.add(
                        cb.equal(
                                root.get("referenceType").as(String.class),
                                values.get("referenceType").toString()
                                        .trim().toUpperCase(Locale.ROOT)
                        )
                );
            }

            // UNIT COST

            addDecimalPredicate(
                    predicates,
                    cb,
                    root.<BigDecimal>get("unitCost"),
                    values.get("minUnitCost"),
                    true
            );

            addDecimalPredicate(
                    predicates,
                    cb,
                    root.<BigDecimal>get("unitCost"),
                    values.get("maxUnitCost"),
                    false
            );

            // QUANTITY IN

            addDecimalPredicate(
                    predicates,
                    cb,
                    root.<BigDecimal>get("quantityIn"),
                    values.get("minQuantityIn"),
                    true
            );

            addDecimalPredicate(
                    predicates,
                    cb,
                    root.<BigDecimal>get("quantityIn"),
                    values.get("maxQuantityIn"),
                    false
            );

            // QUANTITY OUT

            addDecimalPredicate(
                    predicates,
                    cb,
                    root.<BigDecimal>get("quantityOut"),
                    values.get("minQuantityOut"),
                    true
            );

            addDecimalPredicate(
                    predicates,
                    cb,
                    root.<BigDecimal>get("quantityOut"),
                    values.get("maxQuantityOut"),
                    false
            );

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    // =========================================================
    // TRANSACTION ROW MAPPING
    // =========================================================

    private Map<String, Object> mapTransactionRow(
            InventoryTransactionEntity transaction
    ) {

        ProductEntity product = transaction.getProduct();
        WarehouseEntity warehouse = transaction.getWarehouse();
        UnitEntity unit = transaction.getUnit();
        SizeEntity size = transaction.getSize();

        Map<String, Object> row = new LinkedHashMap<>();

        row.put("id", transaction.getId());
        row.put("transactionNo", transaction.getTransactionNo());
        row.put("transactionDate", transaction.getTransactionDate());

        row.put("productId", product != null ? product.getId() : null);
        row.put("productCode", product != null ? product.getProductCode() : null);
        row.put("productName", product != null ? product.getProductName() : null);

        row.put("warehouseId", warehouse != null ? warehouse.getId() : null);
        row.put("warehouseName",
                warehouse != null ? warehouse.getWarehouseName() : null);
        row.put("warehouseCode",
                warehouse != null ? warehouse.getWarehouseCode() : null);

        row.put("unitId", unit != null ? unit.getId() : null);
        row.put("unitName", unit != null ? unit.getUnitName() : null);
        row.put("unitShortName",
                unit != null ? unit.getUnitShortName() : null);

        row.put("sizeId", size != null ? size.getId() : null);
        row.put("sizeName", size != null ? size.getSizeName() : null);

        row.put("movementType", transaction.getMovementType());
        row.put("referenceType", transaction.getReferenceType());
        row.put("referenceId", transaction.getReferenceId());

        row.put("quantityIn", valueOrZero(transaction.getQuantityIn()));
        row.put("quantityOut", valueOrZero(transaction.getQuantityOut()));
        row.put("balanceAfter", valueOrZero(transaction.getBalanceAfter()));

        row.put("unitCost", valueOrZero(transaction.getUnitCost()));
        row.put("notes", transaction.getNotes());

        return row;
    }

    // =========================================================
    // TRANSACTION SUMMARY
    // =========================================================

    private ReportSummaryResponse buildTransactionSummary(
            Specification<InventoryTransactionEntity> specification
    ) {

        List<InventoryTransactionEntity> transactions =
                inventoryTransactionRepository.findAll(specification);

        BigDecimal totalQuantityIn = ZERO;
        BigDecimal totalQuantityOut = ZERO;
        BigDecimal totalInValue = ZERO;
        BigDecimal totalOutValue = ZERO;

        long stockInCount = 0;
        long stockOutCount = 0;

        for (InventoryTransactionEntity transaction : transactions) {

            BigDecimal quantityIn =
                    valueOrZero(transaction.getQuantityIn());

            BigDecimal quantityOut =
                    valueOrZero(transaction.getQuantityOut());

            BigDecimal unitCost =
                    valueOrZero(transaction.getUnitCost());

            totalQuantityIn = totalQuantityIn.add(quantityIn);
            totalQuantityOut = totalQuantityOut.add(quantityOut);

            totalInValue = totalInValue.add(
                    quantityIn.multiply(unitCost)
            );

            totalOutValue = totalOutValue.add(
                    quantityOut.multiply(unitCost)
            );

            if (quantityIn.compareTo(ZERO) > 0) {
                stockInCount++;
            }

            if (quantityOut.compareTo(ZERO) > 0) {
                stockOutCount++;
            }
        }

        Map<String, Object> metrics = new LinkedHashMap<>();

        metrics.put("totalTransactions", transactions.size());
        metrics.put("stockInTransactions", stockInCount);
        metrics.put("stockOutTransactions", stockOutCount);
        metrics.put("totalQuantityIn", totalQuantityIn);
        metrics.put("totalQuantityOut", totalQuantityOut);
        metrics.put("totalInValue", totalInValue);
        metrics.put("totalOutValue", totalOutValue);

        return ReportSummaryResponse.builder()
                .metrics(metrics)
                .build();
    }

    // =========================================================
    // PAGINATION AND SORTING
    // =========================================================

    private Pageable buildPageable(
            Pageable pageable,
            Map<String, String> allowedSortFields,
            String defaultSortField,
            Sort.Direction defaultDirection
    ) {

        if (pageable != null && pageable.isUnpaged()) {
            return Pageable.unpaged();
        }

        int page = pageable != null ? pageable.getPageNumber() : 0;
        int size = pageable != null ? pageable.getPageSize() : 20;

        if (pageable != null && pageable.getSort().isSorted()) {

            List<Sort.Order> orders = new ArrayList<>();

            for (Sort.Order order : pageable.getSort()) {

                String entityField =
                        allowedSortFields.get(order.getProperty());

                if (entityField != null) {
                    orders.add(
                            new Sort.Order(order.getDirection(), entityField)
                    );
                }
            }

            if (!orders.isEmpty()) {
                return PageRequest.of(page, size, Sort.by(orders));
            }
        }

        return PageRequest.of(
                page,
                size,
                Sort.by(defaultDirection, defaultSortField)
        );
    }

    // =========================================================
    // FILTER HELPERS
    // =========================================================

    private Map<String, Object> getFilterValues(
            ReportFilterRequest filters
    ) {

        if (filters == null || filters.getFilters() == null) {
            return Collections.emptyMap();
        }

        return filters.getFilters();
    }

    private void addIdPredicate(
            List<Predicate> predicates,
            CriteriaBuilder cb,
            Path<?> path,
            Object value
    ) {

        if (value == null || !hasText(value)) {
            return;
        }

        try {
            predicates.add(
                    cb.equal(path, Long.valueOf(value.toString().trim()))
            );
        } catch (NumberFormatException ignored) {
            // Invalid ID filter is ignored.
        }
    }

    private void addDecimalPredicate(
            List<Predicate> predicates,
            CriteriaBuilder cb,
            Path<BigDecimal> path,
            Object value,
            boolean minimum
    ) {

        if (value == null || !hasText(value)) {
            return;
        }

        try {

            BigDecimal amount = new BigDecimal(value.toString().trim());

            if (minimum) {
                predicates.add(cb.greaterThanOrEqualTo(path, amount));
            } else {
                predicates.add(cb.lessThanOrEqualTo(path, amount));
            }

        } catch (NumberFormatException ignored) {
            // Invalid numeric filter is ignored.
        }
    }

    private Boolean parseBoolean(Object value) {

        if (!hasText(value)) {
            return null;
        }

        String normalized = value.toString()
                .trim()
                .toUpperCase(Locale.ROOT);

        return switch (normalized) {
            case "TRUE", "YES", "1", "ACTIVE" -> true;
            case "FALSE", "NO", "0", "INACTIVE" -> false;
            default -> null;
        };
    }

    private boolean hasText(Object value) {

        return value != null
                && !value.toString().trim().isEmpty();
    }

    private String containsPattern(String value) {

        return "%" + value.trim().toLowerCase(Locale.ROOT) + "%";
    }

    private BigDecimal valueOrZero(BigDecimal value) {

        return value != null ? value : ZERO;
    }
}
