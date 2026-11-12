package com.ims.reports.provider.product;


import com.ims.dtos.reports.*;
import com.ims.entity.ProductEntity;
import com.ims.enums.Status;
import com.ims.enums.reports.ReportModule;
import com.ims.enums.reports.ReportType;
import com.ims.repository.ProductRepository;

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
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductReportProvider implements ReportDataProvider {

    private static final String REPORT_CODE = "PRODUCT_REPORT";

    private final ProductRepository productRepository;

    @Override
    public ReportModule getModule() {
        return ReportModule.PRODUCT;
    }

    @Override
    public List<ReportDefinition> getReportDefinitions() {

        return List.of(
                ReportDefinition.builder()
                        .code(REPORT_CODE)
                        .name("Product Report")
                        .description(
                                "Consolidated product information including category, subcategory, " +
                                        "sizes, units, pricing, supplier, tax, stock limits and audit details."
                        )
                        .type(ReportType.REGISTER)
                        .columns(getColumns())
                        .build()
        );
    }

    private List<ReportColumn> getColumns() {

        return List.of(
                column("id", "Product ID", "NUMBER"),
                column("productCode", "Product Code", "STRING"),
                column("sku", "SKU", "STRING"),
                column("productName", "Product Name", "STRING"),

                column("subCategoryId", "Subcategory ID", "NUMBER"),
                column("subCategoryName", "Subcategory", "STRING"),
                column("categoryId", "Category ID", "NUMBER"),
                column("categoryName", "Category", "STRING"),

                column("sizeIds", "Size IDs", "STRING"),
                column("sizeNames", "Sizes", "STRING"),
                column("sizeShortNames", "Size Short Names", "STRING"),
                column("sizeCodes", "Size Codes", "STRING"),

                column("unitIds", "Unit IDs", "STRING"),
                column("unitNames", "Units", "STRING"),
                column("unitShortNames", "Unit Short Names", "STRING"),
                column("unitCodes", "Unit Codes", "STRING"),

                column("brand", "Brand", "STRING"),
                column("hsnCode", "HSN Code", "STRING"),
                column("imageUrl", "Image URL", "STRING"),

                column("sellingPrice", "Selling Price", "DECIMAL"),
                column("purchasingPrice", "Purchasing Price", "DECIMAL"),

                column("partyId", "Supplier ID", "NUMBER"),
                column("partyName", "Supplier", "STRING"),

                column("taxId", "Tax ID", "NUMBER"),
                column("taxName", "Tax Name", "STRING"),
                column("taxRate", "Tax Rate", "DECIMAL"),

                column("minimumStock", "Minimum Stock", "DECIMAL"),
                column("maximumStock", "Maximum Stock", "DECIMAL"),

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
            throw new IllegalArgumentException("Invalid product report code.");
        }

        ReportFilterRequest filters = request.getFilters();

        Specification<ProductEntity> specification =
                buildSpecification(filters);

        Pageable mappedPageable = mapSortProperties(pageable);

        Page<ProductEntity> page =
                productRepository.findAll(specification, mappedPageable);

        List<Map<String, Object>> rows = page.getContent()
                .stream()
                .map(this::mapProduct)
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

    private Specification<ProductEntity> buildSpecification(
            ReportFilterRequest filters
    ) {

        return (root, query, cb) -> {

            List<Predicate> predicates = new ArrayList<>();

            if (filters == null) {
                return cb.and(predicates.toArray(new Predicate[0]));
            }

            Map<String, Object> customFilters = filters.getFilters();

            // Joins are used for searching related entity fields.
            Join<Object, Object> subCategory =
                    root.join("subCategory", JoinType.LEFT);

            Join<Object, Object> category =
                    subCategory.join("category", JoinType.LEFT);

            Join<Object, Object> party =
                    root.join("party", JoinType.LEFT);

            Join<Object, Object> tax =
                    root.join("tax", JoinType.LEFT);

            // Keyword search
            if (StringUtils.hasText(filters.getKeyword())) {

                String keyword = containsPattern(filters.getKeyword());

                predicates.add(
                        cb.or(
                                cb.like(cb.lower(root.get("productCode")), keyword),
                                cb.like(cb.lower(root.get("sku")), keyword),
                                cb.like(cb.lower(root.get("productName")), keyword),
                                cb.like(cb.lower(root.get("brand")), keyword),
                                cb.like(cb.lower(root.get("hsnCode")), keyword),
                                cb.like(cb.lower(subCategory.get("subCategoryName")), keyword),
                                cb.like(cb.lower(category.get("categoryName")), keyword),
                                cb.like(cb.lower(party.get("companyName")), keyword),
                                cb.like(cb.lower(tax.get("taxName")), keyword)
                        )
                );
            }

            // Product code
            String productCode = getStringFilter(customFilters, "productCode");

            if (StringUtils.hasText(productCode)) {
                predicates.add(
                        cb.like(
                                cb.lower(root.get("productCode")),
                                containsPattern(productCode)
                        )
                );
            }

            // SKU
            String sku = getStringFilter(customFilters, "sku");

            if (StringUtils.hasText(sku)) {
                predicates.add(
                        cb.like(
                                cb.lower(root.get("sku")),
                                containsPattern(sku)
                        )
                );
            }

            // Product name
            String productName = getStringFilter(customFilters, "productName");

            if (StringUtils.hasText(productName)) {
                predicates.add(
                        cb.like(
                                cb.lower(root.get("productName")),
                                containsPattern(productName)
                        )
                );
            }

            // Brand
            String brand = getStringFilter(customFilters, "brand");

            if (StringUtils.hasText(brand)) {
                predicates.add(
                        cb.like(
                                cb.lower(root.get("brand")),
                                containsPattern(brand)
                        )
                );
            }

            // HSN code
            String hsnCode = getStringFilter(customFilters, "hsnCode");

            if (StringUtils.hasText(hsnCode)) {
                predicates.add(
                        cb.like(
                                cb.lower(root.get("hsnCode")),
                                containsPattern(hsnCode)
                        )
                );
            }

            // Subcategory ID
            Long subCategoryId = getLongFilter(customFilters, "subCategoryId");

            if (subCategoryId != null) {
                predicates.add(
                        cb.equal(subCategory.get("id"), subCategoryId)
                );
            }

            // Category ID
            Long categoryId = getLongFilter(customFilters, "categoryId");

            if (categoryId != null) {
                predicates.add(
                        cb.equal(category.get("id"), categoryId)
                );
            }

            // Supplier ID
            Long partyId = getLongFilter(customFilters, "partyId");

            if (partyId != null) {
                predicates.add(
                        cb.equal(party.get("id"), partyId)
                );
            }

            // Tax ID
            Long taxId = getLongFilter(customFilters, "taxId");

            if (taxId != null) {
                predicates.add(
                        cb.equal(tax.get("id"), taxId)
                );
            }

            // Product status
            String statusValue = getStringFilter(customFilters, "productStatus");

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
                            "Invalid product status: " + statusValue
                    );
                }
            }

            // Active filter
            String activeValue = getStringFilter(customFilters, "active");

            if (StringUtils.hasText(activeValue)) {

                Boolean active = parseBoolean(activeValue, "active");

                predicates.add(
                        cb.equal(root.get("active"), active)
                );
            }

            // Selling price range
            BigDecimal minSellingPrice =
                    getBigDecimalFilter(customFilters, "minSellingPrice");

            BigDecimal maxSellingPrice =
                    getBigDecimalFilter(customFilters, "maxSellingPrice");

            validateAmountRange(
                    minSellingPrice,
                    maxSellingPrice,
                    "Selling price"
            );

            if (minSellingPrice != null) {
                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("sellingPrice"),
                                minSellingPrice
                        )
                );
            }

            if (maxSellingPrice != null) {
                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("sellingPrice"),
                                maxSellingPrice
                        )
                );
            }

            // Purchasing price range
            BigDecimal minPurchasingPrice =
                    getBigDecimalFilter(customFilters, "minPurchasingPrice");

            BigDecimal maxPurchasingPrice =
                    getBigDecimalFilter(customFilters, "maxPurchasingPrice");

            validateAmountRange(
                    minPurchasingPrice,
                    maxPurchasingPrice,
                    "Purchasing price"
            );

            if (minPurchasingPrice != null) {
                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("purchasingPrice"),
                                minPurchasingPrice
                        )
                );
            }

            if (maxPurchasingPrice != null) {
                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("purchasingPrice"),
                                maxPurchasingPrice
                        )
                );
            }

            // Minimum stock range
            BigDecimal minStock =
                    getBigDecimalFilter(customFilters, "minMinimumStock");

            BigDecimal maxStock =
                    getBigDecimalFilter(customFilters, "maxMinimumStock");

            validateAmountRange(minStock, maxStock, "Minimum stock");

            if (minStock != null) {
                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("minimumStock"),
                                minStock
                        )
                );
            }

            if (maxStock != null) {
                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("minimumStock"),
                                maxStock
                        )
                );
            }

            // Maximum stock range
            BigDecimal minMaximumStock =
                    getBigDecimalFilter(customFilters, "minMaximumStock");

            BigDecimal maxMaximumStock =
                    getBigDecimalFilter(customFilters, "maxMaximumStock");

            validateAmountRange(
                    minMaximumStock,
                    maxMaximumStock,
                    "Maximum stock"
            );

            if (minMaximumStock != null) {
                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("maximumStock"),
                                minMaximumStock
                        )
                );
            }

            if (maxMaximumStock != null) {
                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("maximumStock"),
                                maxMaximumStock
                        )
                );
            }

            // Date range on BaseEntity.createdAt
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

    private Map<String, Object> mapProduct(ProductEntity product) {

        Map<String, Object> row = new LinkedHashMap<>();

        row.put("id", product.getId());
        row.put("productCode", product.getProductCode());
        row.put("sku", product.getSku());
        row.put("productName", product.getProductName());

        if (product.getSubCategory() != null) {

            row.put("subCategoryId", product.getSubCategory().getId());
            row.put(
                    "subCategoryName",
                    product.getSubCategory().getName()
            );

            if (product.getSubCategory().getCategory() != null) {
                row.put(
                        "categoryId",
                        product.getSubCategory().getCategory().getId()
                );

                row.put(
                        "categoryName",
                        product.getSubCategory().getCategory().getCategoryName()
                );
            } else {
                row.put("categoryId", null);
                row.put("categoryName", null);
            }

        } else {
            row.put("subCategoryId", null);
            row.put("subCategoryName", null);
            row.put("categoryId", null);
            row.put("categoryName", null);
        }

        // Aggregate sizes to keep one row per product.
        row.put(
                "sizeIds",
                product.getSizes() == null ? null :
                        joinValues(product.getSizes().stream()
                                .map(size -> size.getId())
                                .toList())
        );

        row.put(
                "sizeNames",
                product.getSizes() == null ? null :
                        joinValues(product.getSizes().stream()
                                .map(size -> size.getSizeName())
                                .toList())
        );

        row.put(
                "sizeShortNames",
                product.getSizes() == null ? null :
                        joinValues(product.getSizes().stream()
                                .map(size -> size.getSizeShortName())
                                .toList())
        );

        row.put(
                "sizeCodes",
                product.getSizes() == null ? null :
                        joinValues(product.getSizes().stream()
                                .map(size -> size.getSizeCode())
                                .toList())
        );

        // Aggregate units to keep one row per product.
        row.put(
                "unitIds",
                product.getUnits() == null ? null :
                        joinValues(product.getUnits().stream()
                                .map(unit -> unit.getId())
                                .toList())
        );

        row.put(
                "unitNames",
                product.getUnits() == null ? null :
                        joinValues(product.getUnits().stream()
                                .map(unit -> unit.getUnitName())
                                .toList())
        );

        row.put(
                "unitShortNames",
                product.getUnits() == null ? null :
                        joinValues(product.getUnits().stream()
                                .map(unit -> unit.getUnitShortName())
                                .toList())
        );

        row.put(
                "unitCodes",
                product.getUnits() == null ? null :
                        joinValues(product.getUnits().stream()
                                .map(unit -> unit.getUnitCode())
                                .toList())
        );

        row.put("brand", product.getBrand());
        row.put("hsnCode", product.getHsnCode());
        row.put("imageUrl", product.getImageUrl());

        row.put("sellingPrice", product.getSellingPrice());
        row.put("purchasingPrice", product.getPurchasingPrice());

        if (product.getParty() != null) {
            row.put("partyId", product.getParty().getId());
            row.put("partyName", product.getParty().getCompanyName());
        } else {
            row.put("partyId", null);
            row.put("partyName", null);
        }

        if (product.getTax() != null) {
            row.put("taxId", product.getTax().getId());
            row.put("taxName", product.getTax().getTaxName());
            row.put("taxRate", product.getTax().getTaxRate());
        } else {
            row.put("taxId", null);
            row.put("taxName", null);
            row.put("taxRate", null);
        }

        row.put("minimumStock", product.getMinimumStock());
        row.put("maximumStock", product.getMaximumStock());

        row.put(
                "status",
                product.getStatus() != null
                        ? product.getStatus().name()
                        : null
        );

        row.put("active", product.getActive());
        row.put("createdAt", product.getCreatedAt());
        row.put("updatedAt", product.getUpdatedAt());
        row.put("createdBy", product.getCreatedBy());
        row.put("updatedBy", product.getUpdatedBy());

        return row;
    }

    private String joinValues(List<?> values) {

        if (values == null || values.isEmpty()) {
            return null;
        }

        return values.stream()
                .filter(Objects::nonNull)
                .map(String::valueOf)
                .collect(Collectors.joining(", "));
    }

    private ReportSummaryResponse generateSummary(
            Specification<ProductEntity> specification
    ) {

        Map<String, Object> metrics = new LinkedHashMap<>();

        long totalProducts =
                productRepository.count(specification);

        long activeRecords = productRepository.count(
                specification.and(
                        (root, query, cb) ->
                                cb.isTrue(root.get("active"))
                )
        );

        long inactiveRecords = productRepository.count(
                specification.and(
                        (root, query, cb) ->
                                cb.isFalse(root.get("active"))
                )
        );

        long activeProducts = productRepository.count(
                specification.and(
                        (root, query, cb) ->
                                cb.equal(root.get("status"), Status.ACTIVE)
                )
        );

        long inactiveProducts = productRepository.count(
                specification.and(
                        (root, query, cb) ->
                                cb.equal(root.get("status"), Status.INACTIVE)
                )
        );

        metrics.put("totalProducts", totalProducts);
        metrics.put("activeRecords", activeRecords);
        metrics.put("inactiveRecords", inactiveRecords);
        metrics.put("activeProducts", activeProducts);
        metrics.put("inactiveProducts", inactiveProducts);

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
            case "productCode" -> "productCode";
            case "sku" -> "sku";
            case "productName" -> "productName";
            case "brand" -> "brand";
            case "hsnCode" -> "hsnCode";
            case "sellingPrice" -> "sellingPrice";
            case "purchasingPrice" -> "purchasingPrice";
            case "minimumStock" -> "minimumStock";
            case "maximumStock" -> "maximumStock";
            case "status" -> "status";
            case "active" -> "active";
            case "createdAt" -> "createdAt";
            case "updatedAt" -> "updatedAt";
            case "createdBy" -> "createdBy";
            case "updatedBy" -> "updatedBy";
            case "subCategoryName" -> "subCategory.subCategoryName";
            case "categoryName" -> "subCategory.category.categoryName";
            case "partyName" -> "party.companyName";
            case "taxName" -> "tax.taxName";
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

    private void validateAmountRange(
            BigDecimal min,
            BigDecimal max,
            String field
    ) {

        if (min != null && max != null && min.compareTo(max) > 0) {
            throw new IllegalArgumentException(
                    "Minimum " + field + " cannot be greater than maximum " + field + "."
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

    private BigDecimal getBigDecimalFilter(
            Map<String, Object> filters,
            String key
    ) {

        String value = getStringFilter(filters, key);

        if (!StringUtils.hasText(value)) {
            return null;
        }

        try {
            return new BigDecimal(value);
        } catch (NumberFormatException exception) {
            throw new IllegalArgumentException(
                    "Invalid decimal filter: " + key
            );
        }
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
