
import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    Eye,
    RefreshCw,
    ArrowDownToLine,
    ArrowUpFromLine,
    Package,
} from "lucide-react";

import { fetchAllInventoryTransactions } from "../../thunks/inventoryThunk";

const ADJUSTMENT_TYPES = [
    "STOCK_ADJUSTMENT_IN",
    "STOCK_ADJUSTMENT_OUT",
];

const formatDate = (value) => {
    if (!value) return "-";

    return new Date(value).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const formatNumber = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
        maximumFractionDigits: 4,
    });

const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
    }).format(Number(value || 0));

const getMovementLabel = (type) => {
    if (type === "STOCK_ADJUSTMENT_IN") return "Stock Increase";
    if (type === "STOCK_ADJUSTMENT_OUT") return "Stock Decrease";
    return type || "-";
};

const InventoryStockAdjustmentTable = ({ transactions: transactionsProp }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {
        transactions = [],
        transactionLoading = false,
        transactionError = null,
        transactionPagination = {},
    } = useSelector((state) => state.inventory || {});

    const pageNumber = transactionPagination.pageNumber ?? 0;
    const pageSize = transactionPagination.pageSize ?? 10;
    const totalPages = transactionPagination.totalPages ?? 0;
    const totalElements = transactionPagination.totalElements ?? 0;

    const sourceTransactions = transactionsProp ?? transactions;

    const adjustmentTransactions = useMemo(
        () =>
            sourceTransactions.filter((transaction) =>
                ADJUSTMENT_TYPES.includes(transaction.movementType)
            ),
        [sourceTransactions]
    );

    useEffect(() => {
        if (!transactionsProp) {
            dispatch(
                fetchAllInventoryTransactions({
                    page: pageNumber,
                    size: pageSize,
                })
            );
        }
    }, [dispatch, pageNumber, pageSize, transactionsProp]);

    const changePage = (nextPage) => {
        if (nextPage < 0 || nextPage >= totalPages) return;

        dispatch(
            fetchAllInventoryTransactions({
                page: nextPage,
                size: pageSize,
            })
        );
    };

    const refreshTransactions = () => {
        dispatch(
            fetchAllInventoryTransactions({
                page: pageNumber,
                size: pageSize,
            })
        );
    };

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center">
                <div>
                    <h2 className="text-base font-semibold text-gray-800">
                        Stock Adjustment History
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        View stock increase and decrease transactions.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={refreshTransactions}
                    disabled={transactionLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                    <RefreshCw
                        size={15}
                        className={transactionLoading ? "animate-spin" : ""}
                    />
                    Refresh
                </button>
            </div>

            {transactionLoading ? (
                <div className="flex min-h-48 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />
                </div>
            ) : transactionError ? (
                <div className="p-8 text-center">
                    <p className="text-sm text-red-500">
                        {transactionError}
                    </p>
                    <button
                        type="button"
                        onClick={refreshTransactions}
                        className="mt-3 text-sm font-semibold text-blue-600 hover:underline"
                    >
                        Try again
                    </button>
                </div>
            ) : adjustmentTransactions.length === 0 ? (
                <div className="flex min-h-56 flex-col items-center justify-center px-5 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <Package size={22} />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-800">
                        No stock adjustments found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Stock increase and decrease transactions will appear here.
                    </p>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1100px] text-left">
                            <thead className="bg-gray-50">
                                <tr className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    <th className="px-5 py-3">Transaction No.</th>
                                    <th className="px-5 py-3">Product</th>
                                    <th className="px-5 py-3">Warehouse</th>
                                    <th className="px-5 py-3">Adjustment Type</th>
                                    <th className="px-5 py-3">Date</th>
                                    <th className="px-5 py-3 text-right">Quantity</th>
                                    <th className="px-5 py-3 text-right">Unit Cost</th>
                                    <th className="px-5 py-3 text-right">Balance After</th>
                                    <th className="px-5 py-3 text-center">Action</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {adjustmentTransactions.map((transaction) => {
                                    const isIncrease =
                                        transaction.movementType === "STOCK_ADJUSTMENT_IN";

                                    const quantity = isIncrease
                                        ? transaction.quantityIn
                                        : transaction.quantityOut;

                                    return (
                                        <tr
                                            key={transaction.id}
                                            className="text-sm transition hover:bg-gray-50"
                                        >
                                            <td className="px-5 py-4">
                                                <span className="font-semibold text-gray-800">
                                                    {transaction.transactionNo || "-"}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <p className="font-medium text-gray-800">
                                                    {transaction.productName || "-"}
                                                </p>
                                                <p className="mt-0.5 text-xs text-gray-400">
                                                    {transaction.productCode || ""}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4">
                                                <p className="text-gray-700">
                                                    {transaction.warehouseName || "-"}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${isIncrease
                                                        ? "bg-green-50 text-green-700"
                                                        : "bg-orange-50 text-orange-700"
                                                        }`}
                                                >
                                                    {isIncrease ? (
                                                        <ArrowDownToLine size={13} />
                                                    ) : (
                                                        <ArrowUpFromLine size={13} />
                                                    )}
                                                    {getMovementLabel(transaction.movementType)}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-gray-600">
                                                {formatDate(transaction.transactionDate)}
                                            </td>

                                            <td className="px-5 py-4 text-right font-semibold text-gray-800">
                                                {formatNumber(quantity)}{" "}
                                                <span className="text-xs font-normal text-gray-400">
                                                    {transaction.unitShortName || ""}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-right text-gray-700">
                                                {formatCurrency(transaction.unitCost)}
                                            </td>

                                            <td className="px-5 py-4 text-right font-semibold text-gray-800">
                                                {formatNumber(transaction.balanceAfter)}
                                            </td>

                                            <td className="px-5 py-4 text-center">
                                                <button
                                                    type="button"
                                                    title="View adjustment"
                                                    onClick={() =>
                                                        navigate(
                                                            `/inventory/adjustmentStock/view/${transaction.id}`
                                                        )
                                                    }
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-blue-600 transition hover:bg-blue-50"
                                                >
                                                    <Eye size={17} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col justify-between gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center">
                        <p className="text-sm text-gray-500">
                            Showing adjustment records from the current transaction page.
                            <span className="ml-1 font-medium text-gray-700">
                                {totalElements} total inventory transactions
                            </span>
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => changePage(pageNumber - 1)}
                                disabled={pageNumber <= 0 || transactionLoading}
                                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Previous
                            </button>

                            <span className="px-2 text-sm text-gray-600">
                                Page {totalPages ? pageNumber + 1 : 0} of {totalPages}
                            </span>

                            <button
                                type="button"
                                onClick={() => changePage(pageNumber + 1)}
                                disabled={pageNumber + 1 >= totalPages || transactionLoading}
                                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default InventoryStockAdjustmentTable;
