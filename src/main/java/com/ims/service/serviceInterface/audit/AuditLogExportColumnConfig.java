package com.ims.service.serviceInterface.audit;


import com.ims.entity.AuditLogEntity;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;

public final class AuditLogExportColumnConfig {

    private AuditLogExportColumnConfig() {
    }

    public record ExportColumn(
            String header,
            Function<AuditLogEntity, String> value
    ) {
    }

    public record ModuleConfig(
            String title,
            List<ExportColumn> columns
    ) {
    }

    private static final List<ExportColumn> COMMON_COLUMNS = List.of(
            column("Record ID", e -> e.getEntityId()),
            column("Action", e -> name(e.getAction())),
            column("Description", AuditLogEntity::getDescription),
            column("Performed By", AuditLogEntity::getPerformedByName),
            column("Performed By Type", AuditLogEntity::getPerformedByType),
            column("Date & Time", e -> date(e.getCreatedAt())),
            column("Previous Values", AuditLogEntity::getOldValue),
            column("Updated Values", AuditLogEntity::getNewValue),
            column("IP Address", AuditLogEntity::getIpAddress)
    );

    private static ExportColumn column(
            String header,
            Function<AuditLogEntity, String> function
    ) {
        return new ExportColumn(header, function);
    }

    private static String name(Object value) {
        return value == null ? "" : value.toString();
    }

    private static String date(java.time.LocalDateTime value) {
        return value == null
                ? ""
                : value.format(
                java.time.format.DateTimeFormatter.ofPattern(
                        "dd-MM-yyyy HH:mm:ss"
                )
        );
    }

    private static List<ExportColumn> columns(
            String recordLabel,
            String actorLabel
    ) {
        return List.of(
                column(recordLabel, AuditLogEntity::getEntityId),
                column("Activity", e -> name(e.getAction())),
                column("Description", AuditLogEntity::getDescription),
                column(actorLabel, AuditLogEntity::getPerformedByName),
                column("Actor Type", AuditLogEntity::getPerformedByType),
                column("Date & Time", e -> date(e.getCreatedAt())),
                column("Previous Values", AuditLogEntity::getOldValue),
                column("Updated Values", AuditLogEntity::getNewValue),
                column("IP Address", AuditLogEntity::getIpAddress)
        );
    }

    private static final Map<String, ModuleConfig> CONFIGS = Map.ofEntries(

            Map.entry("ALL",
                    new ModuleConfig(
                            "All System Audit Activities",
                            List.of(
                                    column("Module", AuditLogEntity::getEntityName),
                                    column("Record ID", AuditLogEntity::getEntityId),
                                    column("Action", e -> name(e.getAction())),
                                    column("Description", AuditLogEntity::getDescription),
                                    column("Performed By", AuditLogEntity::getPerformedByName),
                                    column("Actor Type", AuditLogEntity::getPerformedByType),
                                    column("Date & Time", e -> date(e.getCreatedAt())),
                                    column("Previous Values", AuditLogEntity::getOldValue),
                                    column("Updated Values", AuditLogEntity::getNewValue),
                                    column("IP Address", AuditLogEntity::getIpAddress)
                            )
                    )
            ),

            Map.entry("USER",
                    new ModuleConfig(
                            "User Audit History",
                            columns("User / Record ID", "Changed By")
                    )
            ),

            Map.entry("ROLE",
                    new ModuleConfig(
                            "Role & Permission Audit History",
                            columns("Role / Record ID", "Changed By")
                    )
            ),

            Map.entry("COMPANY",
                    new ModuleConfig(
                            "Company Audit History",
                            columns("Company / Record ID", "Changed By")
                    )
            ),

            Map.entry("BANK_ACCOUNT",
                    new ModuleConfig(
                            "Bank Account Audit History",
                            columns("Bank Account ID", "Changed By")
                    )
            ),

            Map.entry("CASH_ACCOUNT",
                    new ModuleConfig(
                            "Cash Account Audit History",
                            columns("Cash Account ID", "Changed By")
                    )
            ),

            Map.entry("CURRENCY",
                    new ModuleConfig(
                            "Currency Audit History",
                            columns("Currency / Record ID", "Changed By")
                    )
            ),

            Map.entry("EMAIL_SIGNATURE",
                    new ModuleConfig(
                            "Email Signature Audit History",
                            columns("Signature ID", "Changed By")
                    )
            ),

            Map.entry("CATEGORY",
                    new ModuleConfig(
                            "Category Audit History",
                            columns("Category ID", "Changed By")
                    )
            ),

            Map.entry("SUBCATEGORY",
                    new ModuleConfig(
                            "Subcategory Audit History",
                            columns("Subcategory ID", "Changed By")
                    )
            ),

            Map.entry("SIZE",
                    new ModuleConfig(
                            "Size Audit History",
                            columns("Size ID", "Changed By")
                    )
            ),

            Map.entry("UNIT",
                    new ModuleConfig(
                            "Unit Audit History",
                            columns("Unit ID", "Changed By")
                    )
            ),

            Map.entry("TAX_MASTER",
                    new ModuleConfig(
                            "Tax Master Audit History",
                            columns("Tax ID", "Changed By")
                    )
            ),

            Map.entry("EXPENSE",
                    new ModuleConfig(
                            "Expense Audit History",
                            columns("Expense ID", "Changed By")
                    )
            ),

            Map.entry("PARTY",
                    new ModuleConfig(
                            "Party Audit History",
                            columns("Party ID", "Changed By")
                    )
            ),

            Map.entry("SALES_PERSON",
                    new ModuleConfig(
                            "Sales Person Audit History",
                            columns("Sales Person ID", "Changed By")
                    )
            ),

            Map.entry("WAREHOUSE",
                    new ModuleConfig(
                            "Warehouse Audit History",
                            columns("Warehouse ID", "Changed By")
                    )
            ),

            Map.entry("PRODUCT",
                    new ModuleConfig(
                            "Product Audit History",
                            columns("Product ID", "Changed By")
                    )
            ),

            Map.entry("SALES_ORDER",
                    new ModuleConfig(
                            "Sales Order Audit History",
                            columns("Sales Order Number / ID", "Changed By")
                    )
            ),

            Map.entry("PURCHASE_ORDER",
                    new ModuleConfig(
                            "Purchase Order Audit History",
                            columns("Purchase Order Number / ID", "Changed By")
                    )
            ),

            Map.entry("PURCHASE_ORDER_GOODS_RECEIPT",
                    new ModuleConfig(
                            "Purchase Order Goods Receipt Audit History",
                            columns("Goods Receipt ID", "Changed By")
                    )
            ),

            Map.entry("PAYMENT",
                    new ModuleConfig(
                            "Payment Audit History",
                            columns("Payment ID", "Changed By")
                    )
            ),

            Map.entry("INVOICE",
                    new ModuleConfig(
                            "Invoice Audit History",
                            columns("Invoice ID", "Changed By")
                    )
            ),

            Map.entry("INVOICE_APPROVAL",
                    new ModuleConfig(
                            "Invoice Approval Audit History",
                            columns("Invoice ID", "Approved / Changed By")
                    )
            )
    );

    public static ModuleConfig getConfig(String entityName) {

        String key = entityName == null || entityName.isBlank()
                ? "ALL"
                : entityName.trim().toUpperCase(Locale.ROOT);

        return CONFIGS.getOrDefault(
                key,
                new ModuleConfig(
                        key.replace("_", " ") + " Audit History",
                        COMMON_COLUMNS
                )
        );
    }
}