
import React from "react";

import {
    Activity,
    Users,
    ShieldCheck,
} from "lucide-react";

const MODULES = [
    {
        key: "ALL",
        label: "All Activities",
        description: "View all system audit activities",
        icon: Activity,
        color: "blue",
    },
    {
        key: "USER",
        label: "Users",
        description: "User creation and modifications",
        icon: Users,
        color: "green",
    },
    {
        key: "ROLE",
        label: "Roles",
        description: "Role and permission changes",
        icon: ShieldCheck,
        color: "purple",
    },
    {
        key: "COMPANY",
        label: "Company",
        description: "Company changes",
        icon: ShieldCheck,
        color: "purple",
    },
    {
        key: "BANK_ACCOUNT",
        label: "Bank Accounts",
        description: "Bank Accounts changes",
        icon: ShieldCheck,
        color: "purple",
    },
    {
        key: "CASH_ACCOUNT",
        label: "Cash Accounts",
        description: "Cash Accounts changes",
        icon: ShieldCheck,
        color: "purple",
    },

    {
        key: "CURRENCY",
        label: "Currencies",
        description: "Currencies changes",
        icon: ShieldCheck,
        color: "purple",
    },

    {
        key: "EMAIL_SIGNATURE",
        label: "EmailSignatures",
        description: "Email signature changes",
        icon: ShieldCheck,
        color: "purple",
    },
    {
        key: "CATEGORY",
        label: "Categories",
        description: "Category changes",
        icon: ShieldCheck,
        color: "purple",
    },
    {
        key: "SUBCATEGORY",
        label: "SubCategories",
        description: "SubCategory changes",
        icon: ShieldCheck,
        color: "purple",
    },
    {
        key: "SIZE",
        label: "Size",
        description: "Size changes",
        icon: ShieldCheck,
        color: "yellow",
    },
    {
        key: "UNIT",
        label: "Unit",
        description: "Unit changes",
        icon: ShieldCheck,
        color: "orange",
    },
    {
        key: "TAX_MASTER",
        label: "Taxes",
        description: "Taxes changes",
        icon: ShieldCheck,
        color: "orange",
    },

    {
        key: "EXPENSE",
        label: "Expenses",
        description: "Expenses changes",
        icon: ShieldCheck,
        color: "orange",
    },
    {
        key: "PARTY",
        label: "PARTY",
        description: "Parties changes",
        icon: ShieldCheck,
        color: "orange",
    },

    {
        key: "SALES_PERSON",
        label: "Sales Person",
        description: "Sales Person changes",
        icon: ShieldCheck,
        color: "orange",
    },

    {
        key: "WAREHOUSE",
        label: "Warehouse",
        description: "Warehouse changes",
        icon: ShieldCheck,
        color: "orange",
    },

    {
        key: "PRODUCT",
        label: "Products",
        description: "Warehouse changes",
        icon: ShieldCheck,
        color: "orange",
    },
    {
        key: "SALES_ORDER",
        label: "Sales order",
        description: "Sales order changes",
        icon: ShieldCheck,
        color: "orange",
    },

    {
        key: "PURCHASE_ORDER",
        label: "Purchase order",
        description: "Purchase order changes",
        icon: ShieldCheck,
        color: "orange",
    },
    {
        key: "PURCHASE_ORDER_GOODS_RECEIPT",
        label: "Purchase Order goods receipt",
        description: "Sales order changes",
        icon: ShieldCheck,
        color: "orange",
    },

    {
        key: "PAYMENT",
        label: "Payments",
        description: "Payment changes",
        icon: ShieldCheck,
        color: "orange",
    },

    {
        key: "INVOICE",
        label: "Invoices",
        description: "Invoices changes",
        icon: ShieldCheck,
        color: "orange",
    },
    {
        key: "INVOICE_APPROVAL",
        label: "Invoices Approval",
        description: "Invoices approval changes",
        icon: ShieldCheck,
        color: "orange",
    },
];

const colorStyles = {
    blue: {
        icon: "bg-blue-50 text-blue-600",
        active: "border-blue-500 bg-blue-50/40",
        inactive: "border-gray-200 hover:border-blue-300",
    },
    green: {
        icon: "bg-green-50 text-green-600",
        active: "border-green-500 bg-green-50/40",
        inactive: "border-gray-200 hover:border-green-300",
    },
    purple: {
        icon: "bg-purple-50 text-purple-600",
        active: "border-purple-500 bg-purple-50/40",
        inactive: "border-gray-200 hover:border-purple-300",
    },
    orange: {
        icon: "bg-orange-50 text-orange-600",
        active: "border-orange-500 bg-orange-50/40",
        inactive: "border-gray-200 hover:border-orange-300",
    },
    yellow: {
        icon: "bg-yellow-50 text-yellow-600",
        active: "border-yellow-500 bg-yellow-50/40",
        inactive: "border-gray-200 hover:border-yellow-300",
    },
};

export default function AuditLogOverview({
    selectedModule = "ALL",
    onModuleChange = () => { },
    totalElements = 0,
    loading = false,
}) {
    const currentModule = String(
        selectedModule || "ALL"
    ).toUpperCase();

    return (
        <div className="mb-5">

            <div className="mb-3">
                <h2 className="text-sm font-semibold text-gray-800">
                    Audit Overview
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                    Select a module to view its audit history.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">

                {MODULES.map((module) => {
                    const Icon = module.icon;
                    const isActive =
                        currentModule === module.key;

                    const styles =
                        colorStyles[module.color];

                    return (
                        <button
                            key={module.key}
                            type="button"
                            onClick={() =>
                                onModuleChange(module.key)
                            }
                            className={`
                                flex items-center gap-4 rounded-xl
                                border bg-white p-4 text-left
                                transition-all duration-200
                                ${isActive
                                    ? styles.active
                                    : styles.inactive
                                }
                            `}
                        >
                            <div
                                className={`
                                    flex h-11 w-11 shrink-0
                                    items-center justify-center
                                    rounded-xl
                                    ${styles.icon}
                                `}
                            >
                                <Icon size={21} />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-gray-800">
                                    {module.label}
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                    {module.description}
                                </p>
                            </div>

                            {isActive && (
                                <span className="
                                    h-2.5 w-2.5 shrink-0
                                    rounded-full bg-blue-500
                                " />
                            )}
                        </button>
                    );
                })}

            </div>

            <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                    {currentModule === "ALL"
                        ? "All modules"
                        : `${currentModule} audit activities`
                    }
                </p>

                <p className="text-xs font-medium text-gray-600">
                    {loading
                        ? "Loading..."
                        : `${Number(totalElements).toLocaleString("en-IN")} records`
                    }
                </p>
            </div>

        </div>
    );
}
