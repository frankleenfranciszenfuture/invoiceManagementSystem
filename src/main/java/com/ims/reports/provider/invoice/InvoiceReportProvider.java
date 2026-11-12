
package com.ims.reports.provider.invoice;

import com.ims.dtos.reports.*;
import com.ims.entity.InvoiceEntity;
import com.ims.entity.InvoiceItemEntity;
import com.ims.enums.InvoiceStatus;
import com.ims.enums.InvoiceType;
import com.ims.enums.reports.ReportModule;
import com.ims.enums.reports.ReportType;
import com.ims.repository.InvoiceRepository;

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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InvoiceReportProvider implements ReportDataProvider {

    private final InvoiceRepository invoiceRepository;

    private static final String INVOICE_REPORT = "INVOICE_REPORT";

    // =========================================================
    // MODULE
    // =========================================================

    @Override
    public ReportModule getModule() {
        return ReportModule.INVOICE;
    }

    // =========================================================
    // REPORT DEFINITION
    // =========================================================

    @Override
    public List<ReportDefinition> getReportDefinitions() {

        return List.of(

                ReportDefinition.builder()
                        .code(INVOICE_REPORT)
                        .name("Invoice Report")
                        .description(
                                "Complete invoice report including invoice details, " +
                                        "customer information, invoice items, GST breakdown, " +
                                        "currency, company, bank account, signature, payment " +
                                        "amounts, status and audit information."
                        )
                        .type(ReportType.REGISTER)
                        .columns(getColumns())
                        .build()
        );
    }

    // =========================================================
    // REPORT COLUMNS
    // =========================================================

    private List<ReportColumn> getColumns() {

        return List.of(

                // Invoice

                column("id", "Invoice ID", "NUMBER"),
                column("invoiceNumber", "Invoice Number", "STRING"),
                column("invoiceType", "Invoice Type", "STRING"),

                // Customer

                column("customerId", "Customer ID", "NUMBER"),
                column("customerName", "Customer Name", "STRING"),
                column("customerEmail", "Customer Email", "STRING"),
                column("customerMobile", "Customer Mobile", "STRING"),

                // Invoice dates

                column("invoiceDate", "Invoice Date", "DATE"),
                column("dueDate", "Due Date", "DATE"),

                // Invoice totals

                column("subtotal", "Subtotal", "CURRENCY"),
                column("discountAmount", "Discount Amount", "CURRENCY"),
                column("taxAmount", "Tax Amount", "CURRENCY"),
                column("shippingAmount", "Shipping Amount", "CURRENCY"),
                column("grandTotal", "Grand Total", "CURRENCY"),

                // Currency

                column("currencyId", "Currency ID", "NUMBER"),
                column("currencyCode", "Currency Code", "STRING"),
                column("currencyName", "Currency Name", "STRING"),
                column("exchangeRate", "Exchange Rate", "DECIMAL"),

                // Sales person

                column("salesPersonId", "Sales Person ID", "NUMBER"),
                column("salesPersonName", "Sales Person", "STRING"),

                // Invoice items

                column("itemCount", "Total Items", "NUMBER"),
                column("productNames", "Products", "STRING"),
                column("totalQuantity", "Total Quantity", "DECIMAL"),

                column("itemGrossAmount", "Item Gross Amount", "CURRENCY"),
                column("itemDiscountAmount", "Item Discount Amount", "CURRENCY"),
                column("itemTaxableAmount", "Item Taxable Amount", "CURRENCY"),

                column("itemCgstAmount", "Item CGST Amount", "CURRENCY"),
                column("itemSgstAmount", "Item SGST Amount", "CURRENCY"),
                column("itemIgstAmount", "Item IGST Amount", "CURRENCY"),

                column("itemTaxAmount", "Item Total Tax", "CURRENCY"),
                column("itemTotalAmount", "Item Total Amount", "CURRENCY"),

                // Company

                column("companyId", "Company ID", "NUMBER"),
                column("companyName", "Company Name", "STRING"),

                // Bank account

                column("bankAccountId", "Bank Account ID", "NUMBER"),
                column("accountNumber", "Account Number", "STRING"),
                column("bankName", "Bank Name", "STRING"),
                column("branchName", "Bank Branch", "STRING"),
                column("ifsc", "IFSC", "STRING"),
                column("swiftCode", "SWIFT Code", "STRING"),

                // Email signature

                column("emailSignatureId", "Email Signature ID", "NUMBER"),
                column("signatureName", "Signature Name", "STRING"),

                // Invoice status

                column("status", "Invoice Status", "STRING"),

                // Additional information

                column("notes", "Notes", "STRING"),
                column("termsAndConditions", "Terms And Conditions", "STRING"),

                // Audit

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

        if (!INVOICE_REPORT.equals(reportCode)) {
            throw new IllegalArgumentException(
                    "Unsupported invoice report: " + reportCode
            );
        }

        ReportFilterRequest filters = request.getFilters();

        Specification<InvoiceEntity> specification =
                buildSpecification(filters);

        Pageable databasePageable = mapSortProperties(pageable);

        Page<InvoiceEntity> page =
                invoiceRepository.findAll(
                        specification,
                        databasePageable
                );

        List<Map<String, Object>> rows = page.getContent()
                .stream()
                .map(this::mapInvoice)
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

    // =========================================================
    // INVOICE SPECIFICATION
    // =========================================================

    private Specification<InvoiceEntity> buildSpecification(
            ReportFilterRequest filters
    ) {

        ReportFilterRequest requestFilters =
                filters != null ? filters : new ReportFilterRequest();

        return (root, query, cb) -> {

            List<Predicate> predicates = new ArrayList<>();

            Map<String, Object> customFilters =
                    requestFilters.getFilters() == null
                            ? Map.of()
                            : requestFilters.getFilters();

            // KEYWORD

            if (hasText(requestFilters.getKeyword())) {

                String keyword = containsPattern(
                        requestFilters.getKeyword()
                );

                Join<InvoiceEntity, ?> customer =
                        root.join("customer", JoinType.LEFT);

                predicates.add(
                        cb.or(
                                cb.like(
                                        cb.lower(root.get("invoiceNumber")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(customer.get("displayName")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(customer.get("email")),
                                        keyword
                                )
                        )
                );
            }

            // INVOICE TYPE

            String invoiceType = getFilterValue(
                    customFilters,
                    "invoiceType"
            );

            if (hasText(invoiceType)) {

                try {

                    InvoiceType type = InvoiceType.valueOf(
                            invoiceType.trim().toUpperCase(Locale.ROOT)
                    );

                    predicates.add(
                            cb.equal(root.get("invoiceType"), type)
                    );

                } catch (IllegalArgumentException exception) {

                    throw new IllegalArgumentException(
                            "Invalid invoice type: " + invoiceType
                    );
                }
            }

            // INVOICE STATUS

            String invoiceStatus = getFilterValue(
                    customFilters,
                    "invoiceStatus"
            );

            if (!hasText(invoiceStatus)) {
                invoiceStatus = requestFilters.getStatus();
            }

            if (hasText(invoiceStatus)
                    && !"ALL".equalsIgnoreCase(invoiceStatus)) {

                try {

                    InvoiceStatus status = InvoiceStatus.valueOf(
                            invoiceStatus.trim().toUpperCase(Locale.ROOT)
                    );

                    predicates.add(
                            cb.equal(root.get("status"), status)
                    );

                } catch (IllegalArgumentException exception) {

                    throw new IllegalArgumentException(
                            "Invalid invoice status: " + invoiceStatus
                    );
                }
            }

            // CUSTOMER ID

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

            // CURRENCY ID

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

            // SALES PERSON ID

            String salesPersonId = getFilterValue(
                    customFilters,
                    "salesPersonId"
            );

            if (hasText(salesPersonId)) {

                predicates.add(
                        cb.equal(
                                root.get("salesPerson").get("id"),
                                parseLong(salesPersonId, "Sales Person ID")
                        )
                );
            }

            // MINIMUM AMOUNT

            String minAmount = getFilterValue(
                    customFilters,
                    "minAmount"
            );

            if (hasText(minAmount)) {

                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.<BigDecimal>get("grandTotal"),
                                parseAmount(minAmount, "Minimum amount")
                        )
                );
            }

            // MAXIMUM AMOUNT

            String maxAmount = getFilterValue(
                    customFilters,
                    "maxAmount"
            );

            if (hasText(maxAmount)) {

                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.<BigDecimal>get("grandTotal"),
                                parseAmount(maxAmount, "Maximum amount")
                        )
                );
            }

            validateAmountRange(minAmount, maxAmount);

            // INVOICE DATE RANGE

            LocalDate fromDate = requestFilters.getFromDate();
            LocalDate toDate = requestFilters.getToDate();

            validateDateRange(fromDate, toDate);

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

            // ACTIVE

            String activeValue = getFilterValue(
                    customFilters,
                    "active"
            );

            if (!hasText(activeValue)) {
                activeValue = requestFilters.getStatus() != null
                        && ("ACTIVE".equalsIgnoreCase(requestFilters.getStatus())
                        || "INACTIVE".equalsIgnoreCase(requestFilters.getStatus()))
                        ? requestFilters.getStatus()
                        : null;
            }

            if (hasText(activeValue)) {

                Boolean active = parseBoolean(activeValue);

                if (active == null) {
                    throw new IllegalArgumentException(
                            "Invalid active filter: " + activeValue
                    );
                }

                predicates.add(
                        cb.equal(root.get("active"), active)
                );
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    // =========================================================
    // INVOICE ROW MAPPING
    // =========================================================

    private Map<String, Object> mapInvoice(
            InvoiceEntity invoice
    ) {

        Map<String, Object> row = new LinkedHashMap<>();

        // INVOICE

        row.put("id", invoice.getId());
        row.put("invoiceNumber", invoice.getInvoiceNumber());

        row.put(
                "invoiceType",
                invoice.getInvoiceType() == null
                        ? null
                        : invoice.getInvoiceType().name()
        );

        // CUSTOMER

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

        // DATES

        row.put("invoiceDate", invoice.getInvoiceDate());
        row.put("dueDate", invoice.getDueDate());

        // TOTALS

        row.put("subtotal", invoice.getSubtotal());
        row.put("discountAmount", invoice.getDiscountAmount());
        row.put("taxAmount", invoice.getTaxAmount());
        row.put("shippingAmount", invoice.getShippingAmount());
        row.put("grandTotal", invoice.getGrandTotal());

        // CURRENCY

        mapCurrency(invoice, row);

        // SALES PERSON

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

        // INVOICE ITEMS

        mapInvoiceItems(invoice, row);

        // COMPANY

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

        // BANK ACCOUNT

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

        // EMAIL SIGNATURE

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

        // STATUS AND ADDITIONAL INFORMATION

        row.put(
                "status",
                invoice.getStatus() == null
                        ? null
                        : invoice.getStatus().name()
        );

        row.put("notes", invoice.getNotes());
        row.put("termsAndConditions", invoice.getTermsAndConditions());

        // AUDIT

        row.put("active", invoice.getActive());
        row.put("createdAt", invoice.getCreatedAt());
        row.put("updatedAt", invoice.getUpdatedAt());
        row.put("createdBy", invoice.getCreatedBy());
        row.put("updatedBy", invoice.getUpdatedBy());

        return row;
    }

    // =========================================================
    // INVOICE ITEM MAPPING
    // =========================================================

    private void mapInvoiceItems(
            InvoiceEntity invoice,
            Map<String, Object> row
    ) {

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
    // ITEM SUM HELPER
    // =========================================================

    private BigDecimal sumItems(
            List<InvoiceItemEntity> items,
            Function<InvoiceItemEntity, BigDecimal> mapper
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

        long draft = countByStatus(specification, InvoiceStatus.DRAFT);
        long sent = countByStatus(specification, InvoiceStatus.SENT);
        long paid = countByStatus(specification, InvoiceStatus.PAID);
        long partial = countByStatus(specification, InvoiceStatus.PARTIAL);
        long overdue = countByStatus(specification, InvoiceStatus.OVERDUE);
        long cancelled = countByStatus(specification, InvoiceStatus.CANCELLED);

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

        if (!pageable.getSort().isSorted()) {
            return PageRequest.of(
                    pageable.getPageNumber(),
                    pageable.getPageSize(),
                    Sort.by(Sort.Direction.DESC, "invoiceDate")
            );
        }

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

        return PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by(orders)
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
            return Long.parseLong(value.trim());
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

            BigDecimal amount = new BigDecimal(value.trim());

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

    private void validateAmountRange(
            String minAmount,
            String maxAmount
    ) {

        if (hasText(minAmount) && hasText(maxAmount)) {

            BigDecimal minimum = parseAmount(minAmount, "Minimum amount");
            BigDecimal maximum = parseAmount(maxAmount, "Maximum amount");

            if (minimum.compareTo(maximum) > 0) {
                throw new IllegalArgumentException(
                        "Minimum amount cannot be greater than maximum amount."
                );
            }
        }
    }

    private void validateDateRange(
            LocalDate fromDate,
            LocalDate toDate
    ) {

        if (fromDate != null && toDate != null
                && fromDate.isAfter(toDate)) {

            throw new IllegalArgumentException(
                    "From date cannot be after to date."
            );
        }
    }

    private Boolean parseBoolean(String value) {

        return switch (value.trim().toUpperCase(Locale.ROOT)) {
            case "TRUE", "YES", "1", "ACTIVE" -> true;
            case "FALSE", "NO", "0", "INACTIVE" -> false;
            default -> null;
        };
    }
}
