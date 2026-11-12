
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { fetchAllStocks } from "../../thunks/inventoryThunk";

import {
    Eye,
    Package,
    Star,
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

export default function InventoryStockTable({
    stocks = [],
}) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    /* =====================================================
       REDUX STATE
    ===================================================== */

    const {
        stockLoading,
        stockError,
        stockPagination = {},
    } = useSelector((state) => state.inventory || {});

    const {
        pageNumber = 0,
        pageSize = 10,
        totalPages = 0,
        totalElements = 0,
    } = stockPagination;

    const currentStocks = stocks || [];

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

    const canViewStock = hasModulePermission(
        permissions,
        roleName,
        [
            "Inventory",
            "Inventory Stock",
            "Inventory Stocks",
        ],
        "VIEW"
    );

    /* =====================================================
       VIEW STOCK
    ===================================================== */

    const handleView = (stock) => {
        if (!canViewStock) {
            toast.error(
                "You do not have permission to view inventory stock."
            );
            return;
        }

        if (!stock?.id) {
            toast.error("Invalid inventory stock.");
            return;
        }

        navigate(`/inventory/openStock/view/${stock.id}`);
    };

    /* =====================================================
       LOADING
    ===================================================== */

    if (stockLoading && !currentStocks.length) {
        return (
            <div className="flex items-center justify-center py-10">
                <p className="text-gray-500">
                    Loading inventory stocks...
                </p>
            </div>
        );
    }

    /* =====================================================
       ERROR
    ===================================================== */

    if (stockError && !currentStocks.length) {
        return (
            <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
                <p className="text-red-500">
                    {stockError}
                </p>
            </div>
        );
    }

    /* =====================================================
       EMPTY STATE
    ===================================================== */

    if (!currentStocks.length) {
        return (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                <Package className="mx-auto mb-3 h-10 w-10 text-gray-300" />

                <p className="text-gray-500">
                    No inventory stock found.
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
                                "Product",
                                "Warehouse",
                                "Unit / Size",
                                "Quantity",
                                "Reserved",
                                "Available",
                                "Average Cost",
                                ...(canViewStock ? ["Actions"] : []),
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
                        {[...currentStocks]
                            .sort((a, b) => (a.id || 0) - (b.id || 0))
                            .map((stock, index) => (
                                <tr
                                    key={stock.id || index}
                                    className="
                                        border-b
                                        border-gray-100
                                        hover:bg-gray-50
                                        text-xs
                                        transition-colors
                                    "
                                >
                                    {/* PRODUCT */}
                                    <td className="px-2 py-3 overflow-hidden">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="
                                                w-9 h-9 min-w-[36px]
                                                rounded-full
                                                flex items-center justify-center
                                                bg-blue-50 text-blue-600
                                            ">
                                                <Package size={17} />
                                            </div>

                                            <div className="min-w-0">
                                                <p
                                                    className="font-medium text-gray-800 truncate"
                                                    title={stock.productName || ""}
                                                >
                                                    {stock.productName || "—"}
                                                </p>

                                                <p className="text-xs text-gray-500">
                                                    {stock.productCode || "—"}
                                                </p>

                                                <p className="text-xs text-gray-400">
                                                    ID: #{stock.id}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* WAREHOUSE */}
                                    <td className="px-2 py-3 overflow-hidden">
                                        <div className="min-w-0">
                                            <p
                                                className="truncate font-medium text-gray-700"
                                                title={stock.warehouseName || ""}
                                            >
                                                {stock.warehouseName || "—"}
                                            </p>

                                            <p className="text-xs text-gray-500">
                                                {stock.warehouseCode || "—"}
                                            </p>
                                        </div>
                                    </td>

                                    {/* UNIT / SIZE */}
                                    <td className="px-2 py-3">
                                        <p className="font-medium text-gray-700">
                                            {stock.unitShortName ||
                                                stock.unitName ||
                                                "—"}
                                        </p>

                                        <p className="text-xs text-gray-500">
                                            {stock.sizeName || "No size"}
                                        </p>
                                    </td>

                                    {/* QUANTITY */}
                                    <td className="px-2 py-3">
                                        <span className="font-medium text-gray-700">
                                            {formatNumber(stock.quantity)}
                                        </span>
                                    </td>

                                    {/* RESERVED */}
                                    <td className="px-2 py-3">
                                        <span className="font-medium text-orange-600">
                                            {formatNumber(stock.reservedQuantity)}
                                        </span>
                                    </td>

                                    {/* AVAILABLE */}
                                    <td className="px-2 py-3">
                                        <span className={`
                                            inline-block px-2 py-1 rounded-full
                                            text-xs font-medium
                                            ${Number(stock.availableQuantity || 0) > 0
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                            }
                                        `}>
                                            {formatNumber(stock.availableQuantity)}
                                        </span>
                                    </td>

                                    {/* AVERAGE COST */}
                                    <td className="px-2 py-3">
                                        <span className="font-medium text-gray-700">
                                            {formatNumber(stock.averageCost)}
                                        </span>
                                    </td>

                                    {/* ACTIONS */}
                                    {canViewStock && (
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleView(stock)}
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
                    loading={stockLoading}
                    label="inventory stocks"
                    onPageChange={(nextPage) => {
                        dispatch(
                            fetchAllStocks({
                                page: nextPage,
                                size: Number(pageSize) || 10,
                            })
                        );
                    }}
                    onPageSizeChange={(nextSize) => {
                        dispatch(
                            fetchAllStocks({
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
