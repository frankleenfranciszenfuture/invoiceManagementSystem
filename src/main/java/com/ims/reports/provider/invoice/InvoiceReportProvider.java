package com.ims.reports.provider.invoice;


import com.ims.dtos.reports.*;
import com.ims.entity.InvoiceEntity;
import com.ims.entity.InvoiceItemEntity;
import com.ims.enums.InvoiceStatus;
import com.ims.enums.InvoiceType;
import com.ims.enums.reports.ReportModule;
import com.ims.enums.reports.ReportType;
import com.ims.repository.InvoiceRepository;

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
import java.util.Objects;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InvoiceReportProvider implements ReportDataProvider {

    private final InvoiceRepository invoiceRepository;

    // =========================================================
    // MODULE
    // =========================================================

    @Override
    public ReportModule getModule() {
        return ReportModule.INVOICE;
    }

    // =========================================================
    // REPORT DEFINITIONS
    // =========================================================

    @Override
    public List<ReportDefinition> getReportDefinitions() {

        return List.of(

                ReportDefinition.builder()
                        .code("INVOICE_REGISTER")
                        .name("Invoice Register")
                        .description(
                                "Complete invoice listing including invoice number, " +
                                        "customer, invoice dates, amounts, currency and status."
                        )
                        .type(ReportType.REGISTER)
                        .columns(getRegisterColumns())
                        .build(),

                ReportDefinition.builder()
                        .code("INVOICE_ITEMS")
                        .name("Invoice Item Report")
                        .description(
                                "Invoice item summary including products, quantities, " +
                                        "unit prices, discounts and GST details."
                        )
                        .type(ReportType.DETAILED)
                        .columns(getItemColumns())
                        .build(),

                ReportDefinition.builder()
                        .code("INVOICE_DETAILS")
                        .name("Invoice Details Report")
                        .description(
                                "Detailed invoice information including customer, " +
                                        "company, bank account, currency and signature details."
                        )
                        .type(ReportType.DETAILED)
                        .columns(getDetailColumns())
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

        Specification<InvoiceEntity> specification =
                buildSpecification(request.getFilters());

        Pageable databasePageable = mapSortProperties(pageable);

        Page<InvoiceEntity> invoicePage =
                invoiceRepository.findAll(
                        specification,
                        databasePageable
                );

        List<Map<String, Object>> rows =
                invoicePage.getContent()
                        .stream()
                        .map(invoice ->
                                mapInvoice(invoice, reportCode)
                        )
                        .toList();

        ReportSummaryResponse summary =
                generateSummary(specification);

        return ReportData.builder()
                .columns(columns)
                .rows(rows)
                .totalElements(invoicePage.getTotalElements())
                .pageNumber(invoicePage.getNumber())
                .pageSize(invoicePage.getSize())
                .totalPages(invoicePage.getTotalPages())
                .last(invoicePage.isLast())
                .summary(summary)
                .build();
    }

    // =========================================================
    // REPORT COLUMNS
    // =========================================================

    private List<ReportColumn> getColumns(String reportCode) {

        return switch (reportCode) {

            case "INVOICE_REGISTER" ->
                    getRegisterColumns();

            case "INVOICE_ITEMS" ->
                    getItemColumns();

            case "INVOICE_DETAILS" ->
                    getDetailColumns();

            default -> throw new IllegalArgumentException(
                    "Unsupported invoice report: " + reportCode
            );
        };
    }

    // =========================================================
    // REGISTER COLUMNS
    // =========================================================

    private List<ReportColumn> getRegisterColumns() {

        return List.of(

                column("id", "Invoice ID", "NUMBER"),
                column("invoiceNumber", "Invoice Number", "STRING"),
                column("invoiceType", "Invoice Type", "STRING"),

                column("customerId", "Customer ID", "NUMBER"),
                column("customerName", "Customer Name", "STRING"),

                column("invoiceDate", "Invoice Date", "DATE"),
                column("dueDate", "Due Date", "DATE"),

                column("subtotal", "Subtotal", "CURRENCY"),
                column("discountAmount", "Discount Amount", "CURRENCY"),
                column("taxAmount", "Tax Amount", "CURRENCY"),
                column("shippingAmount", "Shipping Amount", "CURRENCY"),
                column("grandTotal", "Grand Total", "CURRENCY"),

                column("currencyId", "Currency ID", "NUMBER"),
                column("currencyCode", "Currency Code", "STRING"),
                column("currencyName", "Currency Name", "STRING"),
                column("exchangeRate", "Exchange Rate", "DECIMAL"),

                column("salesPersonId", "Sales Person ID", "NUMBER"),
                column("salesPersonName", "Sales Person", "STRING"),

                column("status", "Invoice Status", "STRING"),

                column("active", "Active", "BOOLEAN"),

                column("createdAt", "Created At", "DATETIME"),
                column("updatedAt", "Updated At", "DATETIME"),
                column("createdBy", "Created By", "NUMBER"),
                column("updatedBy", "Updated By", "NUMBER")
        );
    }

    // =========================================================
    // ITEM COLUMNS
    // =========================================================

    private List<ReportColumn> getItemColumns() {

        return List.of(

                column("id", "Invoice ID", "NUMBER"),
                column("invoiceNumber", "Invoice Number", "STRING"),

                column("customerName", "Customer Name", "STRING"),
                column("invoiceDate", "Invoice Date", "DATE"),

                column("itemCount", "Total Items", "NUMBER"),
                column("productNames", "Products", "STRING"),
                column("totalQuantity", "Total Quantity", "DECIMAL"),

                column("itemGrossAmount", "Gross Amount", "CURRENCY"),
                column("itemDiscountAmount", "Discount Amount", "CURRENCY"),
                column("itemTaxableAmount", "Taxable Amount", "CURRENCY"),

                column("itemCgstAmount", "CGST Amount", "CURRENCY"),
                column("itemSgstAmount", "SGST Amount", "CURRENCY"),
                column("itemIgstAmount", "IGST Amount", "CURRENCY"),

                column("itemTaxAmount", "Total Tax", "CURRENCY"),
                column("itemTotalAmount", "Item Total", "CURRENCY"),

                column("currencyCode", "Currency", "STRING"),
                column("status", "Invoice Status", "STRING")
        );
    }

    // =========================================================
    // DETAIL COLUMNS
    // =========================================================

    private List<ReportColumn> getDetailColumns() {

        return List.of(

                column("id", "Invoice ID", "NUMBER"),
                column("invoiceNumber", "Invoice Number", "STRING"),
                column("invoiceType", "Invoice Type", "STRING"),

                column("customerId", "Customer ID", "NUMBER"),
                column("customerName", "Customer Name", "STRING"),
                column("customerEmail", "Customer Email", "STRING"),
                column("customerMobile", "Customer Mobile", "STRING"),

                column("invoiceDate", "Invoice Date", "DATE"),
                column("dueDate", "Due Date", "DATE"),

                column("subtotal", "Subtotal", "CURRENCY"),
                column("discountAmount", "Discount Amount", "CURRENCY"),
                column("taxAmount", "Tax Amount", "CURRENCY"),
                column("shippingAmount", "Shipping Amount", "CURRENCY"),
                column("grandTotal", "Grand Total", "CURRENCY"),

                column("currencyCode", "Currency Code", "STRING"),
                column("currencyName", "Currency Name", "STRING"),
                column("exchangeRate", "Exchange Rate", "DECIMAL"),

                column("salesPersonId", "Sales Person ID", "NUMBER"),
                column("companyId", "Company ID", "NUMBER"),
                column("companyName", "Company Name", "STRING"),

                column("bankAccountId", "Bank Account ID", "NUMBER"),
                column("accountNumber", "Account Number", "STRING"),
                column("bankName", "Bank Name", "STRING"),
                column("branchName", "Bank Branch", "STRING"),
                column("ifsc", "IFSC", "STRING"),
                column("swiftCode", "SWIFT Code", "STRING"),

                column("emailSignatureId", "Email Signature ID", "NUMBER"),
                column("signatureName", "Signature Name", "STRING"),

                column("status", "Invoice Status", "STRING"),
                column("notes", "Notes", "STRING"),
                column("termsAndConditions", "Terms And Conditions", "STRING"),

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
    // INVOICE SPECIFICATION
    // =========================================================

    private Specification<InvoiceEntity> buildSpecification(
            ReportFilterRequest filters
    ) {

        return (root, query, cb) -> {

            List<Predicate> predicates = new ArrayList<>();

            if (filters == null) {
                return cb.conjunction();
            }

            // -------------------------------------------------
            // KEYWORD
            // -------------------------------------------------

            if (hasText(filters.getKeyword())) {

                String keyword = containsPattern(
                        filters.getKeyword()
                );

                predicates.add(
                        cb.or(

                                cb.like(
                                        cb.lower(root.get("invoiceNumber")),
                                        keyword
                                ),

                                cb.like(
                                        cb.lower(root.get("customer").get("displayName")),
                                        keyword
                                ),

                                cb.like(
                                        cb.lower(root.get("customer").get("email")),
                                        keyword
                                )
                        )
                );
            }

            Map<String, Object> customFilters =
                    filters.getFilters() == null
                            ? Map.of()
                            : filters.getFilters();

            // -------------------------------------------------
            // INVOICE TYPE
            // -------------------------------------------------

            String invoiceType = getFilterValue(
                    customFilters,
                    "invoiceType"
            );

            if (hasText(invoiceType)) {

                try {

                    InvoiceType type = InvoiceType.valueOf(
                            invoiceType.toUpperCase(Locale.ROOT)
                    );

                    predicates.add(
                            cb.equal(
                                    root.get("invoiceType"),
                                    type
                            )
                    );

                } catch (IllegalArgumentException exception) {

                    throw new IllegalArgumentException(
                            "Invalid invoice type: " + invoiceType
                    );
                }
            }

            // -------------------------------------------------
            // INVOICE STATUS
            // -------------------------------------------------

            String invoiceStatus = getFilterValue(
                    customFilters,
                    "invoiceStatus"
            );

            if (!hasText(invoiceStatus)) {
                invoiceStatus = filters.getStatus();
            }

            if (hasText(invoiceStatus)
                    && !"ALL".equalsIgnoreCase(invoiceStatus)) {

                try {

                    InvoiceStatus status = InvoiceStatus.valueOf(
                            invoiceStatus.trim().toUpperCase(Locale.ROOT)
                    );

                    predicates.add(
                            cb.equal(
                                    root.get("status"),
                                    status
                            )
                    );

                } catch (IllegalArgumentException exception) {

                    throw new IllegalArgumentException(
                            "Invalid invoice status: " + invoiceStatus
                    );
                }
            }

            // -------------------------------------------------
            // CUSTOMER ID
            // -------------------------------------------------

            String customerId = getFilterValue(
                    customFilters,
                    "customerId"
            );

            if (hasText(customerId)) {

                predicates.add(
                        cb.equal(
                                root.get("customer").get("id"),
                                parseLong(customerId, "Customer ID")
                        )
                );
            }

            // -------------------------------------------------
            // CURRENCY ID
            // -------------------------------------------------

            String currencyId = getFilterValue(
                    customFilters,
                    "currencyId"
            );

            if (hasText(currencyId)) {

                predicates.add(
                        cb.equal(
                                root.get("currency").get("id"),
                                parseLong(currencyId, "Currency ID")
                        )
                );
            }

            // -------------------------------------------------
            // MINIMUM AMOUNT
            // -------------------------------------------------

            String minAmount = getFilterValue(
                    customFilters,
                    "minAmount"
            );

            if (hasText(minAmount)) {

                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("grandTotal"),
                                parseAmount(minAmount, "Minimum amount")
                        )
                );
            }

            // -------------------------------------------------
            // MAXIMUM AMOUNT
            // -------------------------------------------------

            String maxAmount = getFilterValue(
                    customFilters,
                    "maxAmount"
            );

            if (hasText(maxAmount)) {

                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("grandTotal"),
                                parseAmount(maxAmount, "Maximum amount")
                        )
                );
            }

            // -------------------------------------------------
            // INVOICE DATE RANGE
            // -------------------------------------------------

            LocalDate fromDate = filters.getFromDate();
            LocalDate toDate = filters.getToDate();

            if (fromDate != null) {

                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("invoiceDate"),
                                fromDate
                        )
                );
            }

            if (toDate != null) {

                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("invoiceDate"),
                                toDate
                        )
                );
            }

            // -------------------------------------------------
            // ACTIVE
            // -------------------------------------------------

            predicates.add(
                    cb.isTrue(root.get("active"))
            );

            return cb.and(
                    predicates.toArray(new Predicate[0])
            );
        };
    }

    // =========================================================
    // MAP INVOICE
    // =========================================================

    private Map<String, Object> mapInvoice(
            InvoiceEntity invoice,
            String reportCode
    ) {

        Map<String, Object> row = new LinkedHashMap<>();

        switch (reportCode) {

            case "INVOICE_REGISTER" ->
                    mapRegister(invoice, row);

            case "INVOICE_ITEMS" ->
                    mapItems(invoice, row);

            case "INVOICE_DETAILS" ->
                    mapDetails(invoice, row);

            default -> throw new IllegalArgumentException(
                    "Unsupported invoice report: " + reportCode
            );
        }

        return row;
    }

    // =========================================================
    // REGISTER MAPPING
    // =========================================================

    private void mapRegister(
            InvoiceEntity invoice,
            Map<String, Object> row
    ) {

        row.put("id", invoice.getId());
        row.put("invoiceNumber", invoice.getInvoiceNumber());

        row.put(
                "invoiceType",
                invoice.getInvoiceType() == null
                        ? null
                        : invoice.getInvoiceType().name()
        );

        row.put(
                "customerId",
                invoice.getCustomer() == null
                        ? null
                        : invoice.getCustomer().getId()
        );

        row.put(
                "customerName",
                invoice.getCustomer() == null
                        ? null
                        : invoice.getCustomer().getDisplayName()
        );

        row.put("invoiceDate", invoice.getInvoiceDate());
        row.put("dueDate", invoice.getDueDate());

        row.put("subtotal", invoice.getSubtotal());
        row.put("discountAmount", invoice.getDiscountAmount());
        row.put("taxAmount", invoice.getTaxAmount());
        row.put("shippingAmount", invoice.getShippingAmount());
        row.put("grandTotal", invoice.getGrandTotal());

        mapCurrency(invoice, row);

        row.put(
                "salesPersonId",
                invoice.getSalesPerson() == null
                        ? null
                        : invoice.getSalesPerson().getId()
        );

        row.put(
                "salesPersonName",
                invoice.getSalesPerson() == null
                        ? null
                        : invoice.getSalesPerson().getSalesPersonName()
        );

        row.put(
                "status",
                invoice.getStatus() == null
                        ? null
                        : invoice.getStatus().name()
        );

        mapAudit(invoice, row);
    }

    // =========================================================
    // ITEM SUMMARY MAPPING
    // =========================================================

    private void mapItems(
            InvoiceEntity invoice,
            Map<String, Object> row
    ) {

        row.put("id", invoice.getId());
        row.put("invoiceNumber", invoice.getInvoiceNumber());

        row.put(
                "customerName",
                invoice.getCustomer() == null
                        ? null
                        : invoice.getCustomer().getDisplayName()
        );

        row.put("invoiceDate", invoice.getInvoiceDate());

        List<InvoiceItemEntity> items =
                invoice.getInvoiceItems() == null
                        ? List.of()
                        : invoice.getInvoiceItems();

        row.put("itemCount", items.size());

        row.put(
                "productNames",
                items.stream()
                        .map(item -> item.getProduct() == null
                                ? null
                                : item.getProduct().getProductName())
                        .filter(Objects::nonNull)
                        .distinct()
                        .collect(Collectors.joining(", "))
        );

        row.put(
                "totalQuantity",
                sumItems(items, InvoiceItemEntity::getQuantity)
        );

        row.put(
                "itemGrossAmount",
                sumItems(items, InvoiceItemEntity::getGrossAmount)
        );

        row.put(
                "itemDiscountAmount",
                sumItems(items, InvoiceItemEntity::getDiscountAmount)
        );

        row.put(
                "itemTaxableAmount",
                sumItems(items, InvoiceItemEntity::getTaxableAmount)
        );

        row.put(
                "itemCgstAmount",
                sumItems(items, InvoiceItemEntity::getCgstAmount)
        );

        row.put(
                "itemSgstAmount",
                sumItems(items, InvoiceItemEntity::getSgstAmount)
        );

        row.put(
                "itemIgstAmount",
                sumItems(items, InvoiceItemEntity::getIgstAmount)
        );

        row.put(
                "itemTaxAmount",
                sumItems(items, InvoiceItemEntity::getTaxAmount)
        );

        row.put(
                "itemTotalAmount",
                sumItems(items, InvoiceItemEntity::getTotalAmount)
        );

        mapCurrency(invoice, row);

        row.put(
                "status",
                invoice.getStatus() == null
                        ? null
                        : invoice.getStatus().name()
        );
    }

    // =========================================================
    // DETAIL MAPPING
    // =========================================================

    private void mapDetails(
            InvoiceEntity invoice,
            Map<String, Object> row
    ) {

        mapRegister(invoice, row);

        row.put(
                "customerEmail",
                invoice.getCustomer() == null
                        ? null
                        : invoice.getCustomer().getEmail()
        );

        row.put(
                "customerMobile",
                invoice.getCustomer() == null
                        ? null
                        : invoice.getCustomer().getMobile()
        );

        // Company

        row.put(
                "companyId",
                invoice.getCompanyDetails() == null
                        ? null
                        : invoice.getCompanyDetails().getId()
        );

        row.put(
                "companyName",
                invoice.getCompanyDetails() == null
                        ? null
                        : invoice.getCompanyDetails().getCompanyName()
        );

        // Bank account

        row.put(
                "bankAccountId",
                invoice.getBankAccount() == null
                        ? null
                        : invoice.getBankAccount().getId()
        );

        row.put(
                "accountNumber",
                invoice.getBankAccount() == null
                        ? null
                        : invoice.getBankAccount().getAccountNumber()
        );

        row.put(
                "bankName",
                invoice.getBankAccount() == null
                        ? null
                        : invoice.getBankAccount().getBankName()
        );

        row.put(
                "branchName",
                invoice.getBankAccount() == null
                        ? null
                        : invoice.getBankAccount().getBranchName()
        );

        row.put(
                "ifsc",
                invoice.getBankAccount() == null
                        ? null
                        : invoice.getBankAccount().getIfsc()
        );

        row.put(
                "swiftCode",
                invoice.getBankAccount() == null
                        ? null
                        : invoice.getBankAccount().getSwiftCode()
        );

        // Email signature

        row.put(
                "emailSignatureId",
                invoice.getEmailSignature() == null
                        ? null
                        : invoice.getEmailSignature().getId()
        );

        row.put(
                "signatureName",
                invoice.getEmailSignature() == null
                        ? null
                        : invoice.getEmailSignature().getSignatureName()
        );

        row.put("notes", invoice.getNotes());
        row.put("termsAndConditions", invoice.getTermsAndConditions());
    }

    // =========================================================
    // CURRENCY MAPPING
    // =========================================================

    private void mapCurrency(
            InvoiceEntity invoice,
            Map<String, Object> row
    ) {

        row.put(
                "currencyId",
                invoice.getCurrency() == null
                        ? null
                        : invoice.getCurrency().getId()
        );

        row.put(
                "currencyCode",
                invoice.getCurrency() == null
                        ? null
                        : invoice.getCurrency().getCurrencyCode()
        );

        row.put(
                "currencyName",
                invoice.getCurrency() == null
                        ? null
                        : invoice.getCurrency().getCurrencyName()
        );

        row.put("exchangeRate", invoice.getExchangeRate());
    }

    // =========================================================
    // AUDIT MAPPING
    // =========================================================

    private void mapAudit(
            InvoiceEntity invoice,
            Map<String, Object> row
    ) {

        row.put("active", invoice.getActive());
        row.put("createdAt", invoice.getCreatedAt());
        row.put("updatedAt", invoice.getUpdatedAt());
        row.put("createdBy", invoice.getCreatedBy());
        row.put("updatedBy", invoice.getUpdatedBy());
    }

    // =========================================================
    // ITEM SUM HELPER
    // =========================================================

    private BigDecimal sumItems(
            List<InvoiceItemEntity> items,
            java.util.function.Function<InvoiceItemEntity, BigDecimal> mapper
    ) {

        return items.stream()
                .map(mapper)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // =========================================================
    // SUMMARY
    // =========================================================

    private ReportSummaryResponse generateSummary(
            Specification<InvoiceEntity> specification
    ) {

        long total = invoiceRepository.count(specification);

        long draft = countByStatus(
                specification,
                InvoiceStatus.DRAFT
        );

        long sent = countByStatus(
                specification,
                InvoiceStatus.SENT
        );

        long paid = countByStatus(
                specification,
                InvoiceStatus.PAID
        );

        long partial = countByStatus(
                specification,
                InvoiceStatus.PARTIAL
        );

        long overdue = countByStatus(
                specification,
                InvoiceStatus.OVERDUE
        );

        long cancelled = countByStatus(
                specification,
                InvoiceStatus.CANCELLED
        );

        Map<String, Object> metrics = new LinkedHashMap<>();

        metrics.put("totalInvoices", total);
        metrics.put("draftInvoices", draft);
        metrics.put("sentInvoices", sent);
        metrics.put("paidInvoices", paid);
        metrics.put("partialInvoices", partial);
        metrics.put("overdueInvoices", overdue);
        metrics.put("cancelledInvoices", cancelled);

        return ReportSummaryResponse.builder()
                .metrics(metrics)
                .build();
    }

    private long countByStatus(
            Specification<InvoiceEntity> specification,
            InvoiceStatus status
    ) {

        return invoiceRepository.count(
                specification.and(
                        (root, query, cb) ->
                                cb.equal(root.get("status"), status)
                )
        );
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

                String entityField =
                        mapSortField(order.getProperty());

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

            case "invoiceNumber" -> "invoiceNumber";
            case "invoiceType" -> "invoiceType";
            case "customerName" -> "customer.displayName";
            case "invoiceDate" -> "invoiceDate";
            case "dueDate" -> "dueDate";
            case "subtotal" -> "subtotal";
            case "discountAmount" -> "discountAmount";
            case "taxAmount" -> "taxAmount";
            case "shippingAmount" -> "shippingAmount";
            case "grandTotal" -> "grandTotal";
            case "status" -> "status";
            case "createdAt" -> "createdAt";
            case "updatedAt" -> "updatedAt";
            case "id" -> "id";

            default -> "invoiceDate";
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

    private boolean hasText(String value) {

        return value != null && !value.isBlank();
    }

    private String containsPattern(String value) {

        return "%"
                + value.trim().toLowerCase(Locale.ROOT)
                + "%";
    }

    private Long parseLong(
            String value,
            String fieldName
    ) {

        try {
            return Long.parseLong(value);
        } catch (NumberFormatException exception) {
            throw new IllegalArgumentException(
                    "Invalid " + fieldName + ": " + value
            );
        }
    }

    private BigDecimal parseAmount(
            String value,
            String fieldName
    ) {

        try {

            BigDecimal amount = new BigDecimal(value);

            if (amount.compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException(
                        fieldName + " cannot be negative."
                );
            }

            return amount;

        } catch (NumberFormatException exception) {

            throw new IllegalArgumentException(
                    "Invalid " + fieldName + ": " + value
            );
        }
    }
}

