
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
    fetchAllInventoryTransactions,
} from "../../thunks/inventoryThunk";

import {
    Eye,
    ArrowLeftRight,
} from "lucide-react";

import toast from "react-hot-toast";
import Pagination from "../../../common/pagination/table/Pagination";
import ToolTipText from "../../../common/toolTip/ToolTipText";

/* =====================================================
   PERMISSION HELPER
===================================================== */

const hasModulePermission = (
    permissions,
    roleName,
    moduleNames,
    actionName
) => {
    const role = String(roleName || "").trim().toUpperCase();

    if (["SUPER_ADMIN", "ADMIN"].includes(role)) {
        return true;
    }

    if (!Array.isArray(permissions)) {
        return false;
    }

    const allowedModules = moduleNames.map((name) =>
        String(name).trim().toLowerCase()
    );

    return permissions.some((permission) => {
        const moduleName = String(
            permission?.moduleName ||
            permission?.module?.moduleName ||
            permission?.module?.name ||
            ""
        ).trim().toLowerCase();

        if (!allowedModules.includes(moduleName)) {
            return false;
        }

        if (
            permission?.active === false ||
            String(permission?.status || "").toUpperCase() === "INACTIVE"
        ) {
            return false;
        }

        const requestedAction = String(actionName).toUpperCase();

        if (Array.isArray(permission?.actions)) {
            return permission.actions.some((action) => {
                const name = String(
                    action?.actionName ||
                    action?.action?.actionName ||
                    action?.action?.name ||
                    ""
                ).trim().toUpperCase();

                const allowed =
                    action?.allowed === true ||
                    action?.allowed === "true";

                return name === requestedAction && allowed;
            });
        }

        const name = String(
            permission?.actionName ||
            permission?.action?.actionName ||
            permission?.action?.name ||
            ""
        ).trim().toUpperCase();

        const allowed =
            permission?.allowed === true ||
            permission?.allowed === "true";

        return name === requestedAction && allowed;
    });
};

/* =====================================================
   FORMAT HELPERS
===================================================== */

const formatNumber = (value) => {
    if (value === null || value === undefined || value === "") {
        return "—";
    }

    return Number(value).toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 4,
    });
};

const formatDate = (value) => {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

/* =====================================================
   MOVEMENT TYPE COLORS
===================================================== */

const movementColors = {
    OPENING_STOCK: "bg-blue-100 text-blue-700",
    STOCK_IN: "bg-green-100 text-green-700",
    STOCK_OUT: "bg-orange-100 text-orange-700",
    ADJUSTMENT_IN: "bg-green-100 text-green-700",
    ADJUSTMENT_OUT: "bg-red-100 text-red-700",
    SALES: "bg-purple-100 text-purple-700",
    PURCHASE: "bg-cyan-100 text-cyan-700",
    TRANSFER_IN: "bg-green-100 text-green-700",
    TRANSFER_OUT: "bg-orange-100 text-orange-700",
};

export default function InventoryTransactionTable({
    transactions = [],
}) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    /* =====================================================
       REDUX STATE
    ===================================================== */

    const {
        transactionLoading,
        transactionError,
        transactionPagination = {},
    } = useSelector((state) => state.inventory || {});

    const {
        pageNumber = 0,
        pageSize = 10,
        totalPages = 0,
        totalElements = 0,
    } = transactionPagination;

    const currentTransactions = transactions || [];

    /* =====================================================
       AUTH STATE
    ===================================================== */

    const user = useSelector((state) => state.auth?.user);

    const permissions = useSelector(
        (state) => state.menuPermission?.userPermissions || []
    );

    const roleName =
        user?.roleName ||
        user?.role?.roleName ||
        user?.role?.name ||
        user?.role ||
        user?.authority ||
        "";

    /* =====================================================
       VIEW PERMISSION
    ===================================================== */

    const canViewTransaction = hasModulePermission(
        permissions,
        roleName,
        [
            "Inventory",
            "Inventory Transaction",
            "Inventory Transactions",
        ],
        "VIEW"
    );

    /* =====================================================
       VIEW TRANSACTION
    ===================================================== */

    const handleView = (transaction) => {
        if (!canViewTransaction) {
            toast.error(
                "You do not have permission to view inventory transactions."
            );
            return;
        }

        if (!transaction?.id) {
            toast.error("Invalid inventory transaction.");
            return;
        }

        navigate(`/inventory/transactions/view/${transaction.id}`);
    };

    /* =====================================================
       LOADING
    ===================================================== */

    if (transactionLoading && !currentTransactions.length) {
        return (
            <div className="flex items-center justify-center py-10">
                <p className="text-gray-500">
                    Loading inventory transactions...
                </p>
            </div>
        );
    }

    /* =====================================================
       ERROR
    ===================================================== */

    if (transactionError && !currentTransactions.length) {
        return (
            <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
                <p className="text-red-500">
                    {transactionError}
                </p>
            </div>
        );
    }

    /* =====================================================
       EMPTY STATE
    ===================================================== */

    if (!currentTransactions.length) {
        return (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                <ArrowLeftRight className="mx-auto mb-3 h-10 w-10 text-gray-300" />

                <p className="text-gray-500">
                    No inventory transactions found.
                </p>
            </div>
        );
    }

    /* =====================================================
       TABLE
    ===================================================== */

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto overflow-y-visible">
            <div className="overflow-x-auto overflow-y-visible">
                <table className="w-full">
                    <thead className="bg-[#FAF9F7]/20 border-b border-gray-300">
                        <tr>
                            {[
                                "Transaction",
                                "Product",
                                "Warehouse",
                                "Movement",
                                "In",
                                "Out",
                                "Bal",
                                ...(canViewTransaction ? ["Actions"] : []),
                            ].map((header) => (
                                <th
                                    key={header}
                                    className={`
                                        px-5 py-3
                                        font-medium
                                        text-md
                                        text-gray-400
                                        uppercase
                                        whitespace-nowrap
                                        ${header === "Actions"
                                            ? "text-right"
                                            : "text-left"
                                        }
                                    `}
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {[...currentTransactions]
                            .sort((a, b) => (a.id || 0) - (b.id || 0))
                            .map((transaction, index) => (
                                <tr
                                    key={transaction.id || index}
                                    className="
                                        border-b
                                        border-gray-100
                                        hover:bg-gray-50
                                        text-xs
                                        transition-colors
                                    "
                                >
                                    {/* TRANSACTION */}
                                    <td className="px-2 py-3 overflow-hidden">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="
                                                w-9 h-9 min-w-[36px]
                                                rounded-full
                                                flex items-center justify-center
                                                bg-purple-50 text-purple-600
                                            ">
                                                <ArrowLeftRight size={17} />
                                            </div>

                                            <div className="min-w-0">
                                                <p
                                                    className="font-medium text-gray-800 truncate"
                                                    title={transaction.transactionNo || ""}
                                                >
                                                    {transaction.transactionNo || "—"}
                                                </p>

                                                <p className="text-xs text-gray-500">
                                                    ID: #{transaction.id}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* PRODUCT */}
                                    <td className="px-2 py-3 overflow-hidden">
                                        <div className="min-w-0">
                                            <p
                                                className="truncate font-medium text-gray-700"
                                                title={transaction.productName || ""}
                                            >
                                                {transaction.productName || "—"}
                                            </p>

                                            <p className="text-xs text-gray-500">
                                                {transaction.productCode || "—"}
                                            </p>
                                        </div>
                                    </td>

                                    {/* WAREHOUSE */}
                                    <td className="px-2 py-3 overflow-hidden">
                                        <p
                                            className="truncate font-medium text-gray-700"
                                            title={transaction.warehouseName || ""}
                                        >
                                            {transaction.warehouseName || "—"}
                                        </p>
                                    </td>

                                    {/* MOVEMENT TYPE */}
                                    <td className="px-2 py-3">
                                        <span className={`
                                            inline-block px-2 py-1 rounded-full
                                            text-xs font-medium whitespace-nowrap
                                            ${movementColors[
                                            String(transaction.movementType || "").toUpperCase()
                                            ] || "bg-gray-100 text-gray-700"}
                                        `}>
                                            {String(
                                                transaction.movementType || "—"
                                            ).replaceAll("_", " ")}
                                        </span>
                                        <p className="mt-1 font-medium text-gray-500">
                                            {formatDate(transaction.transactionDate)}
                                        </p>
                                    </td>



                                    {/* QUANTITY IN */}
                                    <td className="px-2 py-3">
                                        <span className="font-medium text-green-600">
                                            {formatNumber(transaction.quantityIn)}
                                        </span>
                                    </td>

                                    {/* QUANTITY OUT */}
                                    <td className="px-2 py-3">
                                        <span className="font-medium text-red-600">
                                            {formatNumber(transaction.quantityOut)}
                                        </span>
                                    </td>

                                    {/* BALANCE */}
                                    <td className="px-2 py-3">
                                        <span className="
                                            inline-block px-2 py-1 rounded-full
                                            bg-blue-50 text-blue-700
                                            text-xs font-medium
                                        ">
                                            {formatNumber(transaction.balanceAfter)}
                                        </span>
                                    </td>

                                    {/* ACTIONS */}
                                    {canViewTransaction && (
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleView(transaction)}
                                                    className="
                                                        group relative
                                                        flex h-8 w-8 items-center justify-center
                                                        rounded-lg
                                                        bg-blue-50
                                                        text-blue-600
                                                        transition
                                                        hover:bg-blue-100
                                                        hover:text-blue-700
                                                    "
                                                >
                                                    <Eye size={16} />
                                                    <ToolTipText
                                                        text="View"
                                                        position="bottom"
                                                    />
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                    </tbody>
                </table>

                {/* PAGINATION */}
                <Pagination
                    page={Number(pageNumber) || 0}
                    size={Number(pageSize) || 10}
                    totalElements={Number(totalElements) || 0}
                    totalPages={Number(totalPages) || 0}
                    loading={transactionLoading}
                    label="inventory transactions"
                    onPageChange={(nextPage) => {
                        dispatch(
                            fetchAllInventoryTransactions({
                                page: nextPage,
                                size: Number(pageSize) || 10,
                            })
                        );
                    }}
                    onPageSizeChange={(nextSize) => {
                        dispatch(
                            fetchAllInventoryTransactions({
                                page: 0,
                                size: nextSize,
                            })
                        );
                    }}
                />
            </div>
        </div>
    );
}
