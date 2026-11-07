package com.ims.enums.reports;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.Locale;

@Getter
@RequiredArgsConstructor
public enum ReportModule {

    CUSTOMER("Customers"),
    PARTY("Parties"),
    CREDIT_CLEARANCE("Credit Clearance"),
    CATEGORY("Categories"),
    SUBCATEGORY("Subcategories"),
    SIZE("Sizes"),
    UNIT("Units"),
    ITEM("Items"),
    TAX_MASTER("Tax Master"),

    BANK_ACCOUNT("Bank Accounts"),
    BANK_TRANSACTION("Bank Transactions"),
    CASH_ACCOUNT("Cash Accounts"),
    CASH_TRANSACTION("Cash Transactions"),

    INVOICE("Invoices"),
    SALES_ORDER("Sales Orders"),
    SALES_PERSON("Sales Persons"),
    PURCHASE_ORDER("Purchase Orders"),
    PURCHASE_ORDER_GOODS_RECEIPT("Purchase Order Goods Receipt"),
    PARTY_CLEARANCE("Party Clearances"),
    WAREHOUSE("Warehouses"),
    EXPENSE("Expenses"),
    INVENTORY("Inventory");

    private final String displayName;

    public static ReportModule fromValue(String value) {

        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(
                    "Report module is required."
            );
        }

        return ReportModule.valueOf(
                value.trim().toUpperCase(Locale.ROOT)
                        .replace("-", "_")
                        .replace(" ", "_")
        );
    }
}