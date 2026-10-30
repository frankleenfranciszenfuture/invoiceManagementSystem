
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    Package,
    Warehouse,
    Boxes,
    Layers,
    TrendingUp,
    AlertTriangle,
    CircleOff,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    RefreshCw,
    Filter,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    Plus,
} from "lucide-react";

import {
    fetchInventoryDashboard,
} from "../../thunks/inventoryDashboardThunk";

import {
    setDashboardFilters,
    setDashboardPage,
    resetDashboardFilters,
} from "../../slices/inventoryDashboardSlice";
import Tooltip from "../../../common/toolTip/Tooltip";

// ============================================================
// HELPERS
// ============================================================

const formatNumber = (value) =>
    Number(value ?? 0).toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    });

const formatCurrency = (value) =>
    Number(value ?? 0).toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    });

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

const getMovementStyle = (type) => {
    switch (type) {
        case "SALE":
        case "STOCK_OUT":
            return "bg-red-50 text-red-600";

        case "OPENING_STOCK":
        case "STOCK_IN":
        case "PURCHASE":
            return "bg-green-50 text-green-600";

        case "STOCK_ADJUSTMENT":
            return "bg-amber-50 text-amber-600";

        default:
            return "bg-blue-50 text-blue-600";
    }
};

// ============================================================
// SUMMARY CARD
// ============================================================

const SummaryCard = ({
    title,
    value,
    icon: Icon,
    description,
    iconColor,
    iconBg,
}) => (
    <div className="
        rounded-xl border border-gray-200
        bg-white p-5 shadow-sm
        transition hover:-translate-y-0.5
        hover:shadow-md
    ">
        <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
                <p className="text-sm font-medium text-gray-500">
                    {title}
                </p>

                <h3 className="mt-2 text-2xl font-bold text-gray-800">
                    {value}
                </h3>

                <p className="mt-2 text-xs text-gray-400">
                    {description}
                </p>
            </div>

            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
                <Icon size={21} className={iconColor} />
            </div>
        </div>
    </div>
);

// ============================================================
// MOVEMENT CARD
// ============================================================

const MovementCard = ({
    title,
    value,
    icon: Icon,
    color,
    bg,
}) => (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">
                    {title}
                </p>

                <h3 className="mt-2 text-2xl font-bold text-gray-800">
                    {formatNumber(value)}
                </h3>
            </div>

            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${bg}`}>
                <Icon size={21} className={color} />
            </div>
        </div>
    </div>
);

// ============================================================
// STOCK MOVEMENT CHART
// ============================================================

const StockMovementChart = ({ data = [] }) => {
    const chartData = [...data].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
    );

    const maxValue = Math.max(
        1,
        ...chartData.flatMap((item) => [
            Number(item.stockIn ?? 0),
            Number(item.stockOut ?? 0),
        ])
    );

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h3 className="text-base font-semibold text-gray-800">
                        Stock Movement
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                        Daily stock in and stock out
                    </p>
                </div>

                <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-2 text-gray-600">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        Stock In
                    </span>

                    <span className="flex items-center gap-2 text-gray-600">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                        Stock Out
                    </span>
                </div>
            </div>

            {chartData.length === 0 ? (
                <div className="flex h-56 items-center justify-center text-sm text-gray-400">
                    No stock movement data available
                </div>
            ) : (
                <div className="space-y-5">
                    {chartData.map((item) => {
                        const stockIn = Number(item.stockIn ?? 0);
                        const stockOut = Number(item.stockOut ?? 0);

                        return (
                            <div key={item.date}>
                                <p className="mb-2 text-xs font-medium text-gray-500">
                                    {new Date(item.date).toLocaleDateString(
                                        "en-IN",
                                        {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                        }
                                    )}
                                </p>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <span className="w-16 text-xs text-gray-500">
                                            Stock In
                                        </span>

                                        <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-100">
                                            <div
                                                className="h-full rounded-full bg-emerald-500"
                                                style={{
                                                    width: `${(stockIn / maxValue) * 100}%`,
                                                }}
                                            />
                                        </div>

                                        <span className="w-16 text-right text-xs font-semibold text-gray-700">
                                            {formatNumber(stockIn)}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className="w-16 text-xs text-gray-500">
                                            Stock Out
                                        </span>

                                        <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-100">
                                            <div
                                                className="h-full rounded-full bg-red-500"
                                                style={{
                                                    width: `${(stockOut / maxValue) * 100}%`,
                                                }}
                                            />
                                        </div>

                                        <span className="w-16 text-right text-xs font-semibold text-gray-700">
                                            {formatNumber(stockOut)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// ============================================================
// TRANSACTION SUMMARY
// ============================================================

const TransactionSummary = ({ summary = {} }) => {
    const items = [
        {
            label: "Opening Stock",
            value: summary.openingStock,
            color: "text-blue-600",
            bg: "bg-blue-50",
        },
        {
            label: "Stock Adjustment In",
            value: summary.stockAdjustmentIn,
            color: "text-green-600",
            bg: "bg-green-50",
        },
        {
            label: "Stock Adjustment Out",
            value: summary.stockAdjustmentOut,
            color: "text-red-600",
            bg: "bg-red-50",
        },
        {
            label: "Sales",
            value: summary.sales,
            color: "text-purple-600",
            bg: "bg-purple-50",
        },
    ];

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
                <h3 className="text-base font-semibold text-gray-800">
                    Transaction Summary
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                    Stock transaction breakdown
                </p>
            </div>

            <div className="mb-5 rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">
                    Total Transactions
                </p>

                <h3 className="mt-1 text-2xl font-bold text-gray-800">
                    {formatNumber(summary.totalTransactions)}
                </h3>
            </div>

            <div className="space-y-4">
                {items.map((item) => (
                    <div
                        key={item.label}
                        className="flex items-center justify-between gap-3"
                    >
                        <span className="text-sm text-gray-600">
                            {item.label}
                        </span>

                        <span className={`rounded-lg px-3 py-1 text-sm font-semibold ${item.color} ${item.bg}`}>
                            {formatNumber(item.value)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ============================================================
// RECENT TRANSACTIONS TABLE
// ============================================================

const RecentTransactions = ({
    transactions = [],
    pagination,
    filters,
    onPageChange,
    onPageSizeChange,
}) => {
    const totalPages = pagination?.totalPages ?? 0;
    const totalElements = pagination?.totalElements ?? 0;
    const pageNumber = pagination?.number ?? filters.page ?? 0;
    const pageSize = pagination?.size ?? filters.size ?? 10;

    const startRecord =
        totalElements === 0 ? 0 : pageNumber * pageSize + 1;

    const endRecord = Math.min(
        (pageNumber + 1) * pageSize,
        totalElements
    );

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
                <div>
                    <h3 className="text-base font-semibold text-gray-800">
                        Recent Stock Transactions
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                        Latest inventory stock movements
                    </p>
                </div>

                <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">
                    {totalElements} Transactions
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            {[
                                "Transaction",
                                "Product",
                                "Warehouse",
                                "Movement",
                                "Stock In",
                                "Stock Out",
                                "Balance",
                                "Unit Cost",
                                "Date",
                            ].map((heading) => (
                                <th
                                    key={heading}
                                    className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500"
                                >
                                    {heading}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {transactions.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={9}
                                    className="px-5 py-10 text-center text-sm text-gray-400"
                                >
                                    No transactions found
                                </td>
                            </tr>
                        ) : (
                            transactions.map((transaction, index) => (
                                <tr
                                    key={
                                        transaction.transactionNo ||
                                        `${transaction.productId}-${transaction.transactionDate}-${index}`
                                    }
                                    className="transition hover:bg-gray-50"
                                >
                                    <td className="whitespace-nowrap px-5 py-4">
                                        <p className="text-sm font-semibold text-blue-600">
                                            {transaction.transactionNo}
                                        </p>

                                        <p className="mt-1 text-xs text-gray-400">
                                            {transaction.referenceType || "-"}
                                        </p>
                                    </td>

                                    <td className="px-5 py-4">
                                        <p
                                            className="max-w-[220px] truncate text-sm font-medium text-gray-800"
                                            title={transaction.productName}
                                        >
                                            {transaction.productName}
                                        </p>

                                        <p className="mt-1 text-xs text-gray-400">
                                            {transaction.productCode}
                                        </p>
                                    </td>

                                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                                        {transaction.warehouseName || "-"}
                                    </td>

                                    <td className="whitespace-nowrap px-5 py-4">
                                        <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${getMovementStyle(transaction.movementType)}`}>
                                            {transaction.movementType?.replaceAll("_", " ") || "-"}
                                        </span>
                                    </td>

                                    <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-green-600">
                                        {formatNumber(transaction.quantityIn)}
                                    </td>

                                    <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-red-600">
                                        {formatNumber(transaction.quantityOut)}
                                    </td>

                                    <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-gray-800">
                                        {formatNumber(transaction.balanceAfter)}

                                        <span className="ml-1 text-xs font-normal text-gray-400">
                                            {transaction.unitShortName}
                                        </span>
                                    </td>

                                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                                        {formatCurrency(transaction.unitCost)}
                                    </td>

                                    <td className="whitespace-nowrap px-5 py-4 text-xs text-gray-500">
                                        {formatDate(transaction.transactionDate)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* PAGINATION */}

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 px-5 py-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Rows per page</span>

                    <select
                        value={pageSize}
                        onChange={(e) =>
                            onPageSizeChange(Number(e.target.value))
                        }
                        className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-blue-500"
                    >
                        {[10, 20, 50, 100].map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>

                    <span className="ml-2">
                        {startRecord}-{endRecord} of {totalElements}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        disabled={pageNumber <= 0}
                        onClick={() => onPageChange(pageNumber - 1)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <ChevronLeft size={17} />
                    </button>

                    <span className="text-sm text-gray-600">
                        Page {totalPages === 0 ? 0 : pageNumber + 1} of {totalPages}
                    </span>

                    <button
                        type="button"
                        disabled={pageNumber >= totalPages - 1}
                        onClick={() => onPageChange(pageNumber + 1)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <ChevronRight size={17} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// ============================================================
// MAIN DASHBOARD
// ============================================================

const InventoryDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {
        dashboard,
        loading,
        error,
        filters,
    } = useSelector((state) => state.inventoryDashboard);

    // Fetch dashboard when page loads or filters change.
    React.useEffect(() => {
        dispatch(fetchInventoryDashboard(filters));
    }, [dispatch, filters]);

    const summary = dashboard?.summary ?? {};
    const movement = dashboard?.stockMovement ?? {};
    const transactionSummary = dashboard?.transactionSummary ?? {};
    const movementChart = dashboard?.movementChart ?? [];

    const recentTransactions = dashboard?.recentTransactions ?? {};
    const transactions = recentTransactions.content ?? [];

    const handleFilterChange = (field, value) => {
        dispatch(
            setDashboardFilters({
                [field]: value,
            })
        );
    };

    const handleResetFilters = () => {
        dispatch(resetDashboardFilters());
    };

    const handlePageChange = (page) => {
        dispatch(setDashboardPage(page));
    };

    const handlePageSizeChange = (size) => {
        dispatch(
            setDashboardFilters({
                size,
            })
        );
    };

    const summaryCards = [
        {
            title: "Total Products",
            value: formatNumber(summary.totalProducts),
            description: "Registered products",
            icon: Package,
            iconColor: "text-blue-600",
            iconBg: "bg-blue-50",
        },
        {
            title: "Total Warehouses",
            value: formatNumber(summary.totalWarehouses),
            description: "Available warehouses",
            icon: Warehouse,
            iconColor: "text-purple-600",
            iconBg: "bg-purple-50",
        },
        {
            title: "Stock Items",
            value: formatNumber(summary.totalStockItems),
            description: "Product stock records",
            icon: Boxes,
            iconColor: "text-indigo-600",
            iconBg: "bg-indigo-50",
        },
        {
            title: "Total Stock Quantity",
            value: formatNumber(summary.totalStockQuantity),
            description: "Current stock quantity",
            icon: Layers,
            iconColor: "text-cyan-600",
            iconBg: "bg-cyan-50",
        },
        {
            title: "Available Quantity",
            value: formatNumber(summary.totalAvailableQuantity),
            description: "Available for operations",
            icon: TrendingUp,
            iconColor: "text-green-600",
            iconBg: "bg-green-50",
        },
        {
            title: "Reserved Quantity",
            value: formatNumber(summary.totalReservedQuantity),
            description: "Reserved stock quantity",
            icon: Activity,
            iconColor: "text-orange-600",
            iconBg: "bg-orange-50",
        },
        {
            title: "Low Stock Items",
            value: formatNumber(summary.lowStockItems),
            description: "Items below minimum level",
            icon: AlertTriangle,
            iconColor: "text-amber-600",
            iconBg: "bg-amber-50",
        },
        {
            title: "Out of Stock",
            value: formatNumber(summary.outOfStockItems),
            description: "Items with zero stock",
            icon: CircleOff,
            iconColor: "text-red-600",
            iconBg: "bg-red-50",
        },
    ];

    return (
        <div className="space-y-6 bg-gray-50 p-5 mt-2 md:p-3">

            {/* HEADER */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded  p-2">
                <div className="flex flex-wrap items-center justify-between gap-4 ">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Inventory Dashboard
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Monitor your stock, warehouse and inventory movements.
                        </p>
                    </div>
                </div>
                <div className="relative flex flex-wrap items-center justify-between gap-2 ">
                    <button
                        type="button"
                        onClick={() => dispatch(fetchInventoryDashboard(filters))}
                        disabled={loading}
                        className="flex items-center gap-2 rounded-md bg-[#408DFB] px-2 py-1 text-sm font-medium text-white transition hover:bg-[#408DFB]/90 disabled:opacity-50"
                    >
                        <RefreshCw
                            size={16}
                            className={loading ? "animate-spin" : ""}
                        />
                        Refresh
                    </button>

                    <button
                        type="button"
                        onClick={() => { navigate("/inventory/openStock") }}
                        disabled={loading}
                        className="group relative flex items-center gap-2 rounded-md bg-[#408DFB] px-2 py-1 text-sm font-medium text-white transition hover:bg-[#408DFB]/90 disabled:opacity-50"
                    >
                        <Plus
                            size={16}
                            className={loading ? "animate-spin" : ""}

                        />
                        OS
                        <Tooltip text="Opening Stock" position="top" />
                    </button>

                    <button
                        type="button"
                        onClick={() => { navigate("/inventory/adjustmentStock") }}
                        disabled={loading}
                        className="group relative flex items-center gap-2 rounded-md bg-[#408DFB] px-2 py-1 text-sm font-medium text-white transition hover:bg-[#408DFB]/90 disabled:opacity-50"
                    >
                        <Plus
                            size={16}
                            className={loading ? "animate-spin" : ""}

                        />
                        adjust
                        <Tooltip text="Adjust Stock" position="top" />
                    </button>
                </div>
            </div>

            {/* ERROR */}

            {error && (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                    <p className="text-sm text-red-600">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() => dispatch(fetchInventoryDashboard(filters))}
                        className="text-sm font-semibold text-red-700 hover:underline"
                    >
                        Retry
                    </button>

                </div>
            )}

            {/* FILTERS */}

            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-gray-500" />

                        <h2 className="text-base font-semibold text-gray-800">
                            Dashboard Filters
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={handleResetFilters}
                        className="flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-blue-600"
                    >
                        <RotateCcw size={15} />
                        Reset
                    </button>


                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-600">
                            From Date
                        </label>

                        <input
                            type="date"
                            value={filters.fromDate}
                            onChange={(e) =>
                                handleFilterChange("fromDate", e.target.value)
                            }
                            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-600">
                            To Date
                        </label>

                        <input
                            type="date"
                            value={filters.toDate}
                            onChange={(e) =>
                                handleFilterChange("toDate", e.target.value)
                            }
                            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-600">
                            Movement Type
                        </label>

                        <select
                            value={filters.movementType}
                            onChange={(e) =>
                                handleFilterChange("movementType", e.target.value)
                            }
                            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        >
                            <option value="">All Movements</option>
                            <option value="OPENING_STOCK">Opening Stock</option>
                            <option value="PURCHASE">Purchase</option>
                            <option value="SALE">Sale</option>
                            <option value="STOCK_IN">Stock In</option>
                            <option value="STOCK_OUT">Stock Out</option>
                            <option value="STOCK_ADJUSTMENT">Stock Adjustment</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-600">
                            Reference Type
                        </label>

                        <select
                            value={filters.referenceType}
                            onChange={(e) =>
                                handleFilterChange("referenceType", e.target.value)
                            }
                            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        >
                            <option value="">All References</option>
                            <option value="OPENING_STOCK">Opening Stock</option>
                            <option value="SALES_DISPATCH">Sales Dispatch</option>
                            <option value="PURCHASE_RECEIPT">Purchase Receipt</option>
                            <option value="STOCK_ADJUSTMENT">Stock Adjustment</option>
                            <option value="STOCK_TRANSFER">Stock Transfer</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* SUMMARY CARDS */}

            <section>
                <div className="mb-4">
                    <h2 className="text-base font-semibold text-gray-800">
                        Inventory Overview
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {summaryCards.map((card) => (
                        <SummaryCard
                            key={card.title}
                            {...card}
                        />
                    ))}
                </div>
            </section>

            {/* STOCK VALUE */}

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-gray-500">
                    Total Stock Value
                </p>

                <h2 className="mt-2 text-3xl font-bold text-gray-800">
                    {formatCurrency(summary.totalStockValue)}
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                    Based on current inventory valuation
                </p>
            </div>

            {/* STOCK MOVEMENT */}

            <section>
                <div className="mb-4">
                    <h2 className="text-base font-semibold text-gray-800">
                        Stock Movement Summary
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <MovementCard
                        title="Total Stock In"
                        value={movement.totalStockIn}
                        icon={ArrowDownRight}
                        color="text-green-600"
                        bg="bg-green-50"
                    />

                    <MovementCard
                        title="Total Stock Out"
                        value={movement.totalStockOut}
                        icon={ArrowUpRight}
                        color="text-red-600"
                        bg="bg-red-50"
                    />

                    <MovementCard
                        title="Net Movement"
                        value={movement.netMovement}
                        icon={Activity}
                        color="text-blue-600"
                        bg="bg-blue-50"
                    />
                </div>
            </section>

            {/* CHART + TRANSACTION SUMMARY */}

            <section className="grid grid-cols-1 gap-5 xl:grid-cols-4">
                <div className="xl:col-span-2">
                    <StockMovementChart data={movementChart} />
                </div>
                <div className="xl:col-span-2">
                    <StockMovementChart data={movementChart} />
                </div>

            </section>
            <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <div>
                    <TransactionSummary summary={transactionSummary} />
                </div>
                <div>
                    <TransactionSummary summary={transactionSummary} />
                </div>
            </section>
            {/* RECENT TRANSACTIONS */}

            <RecentTransactions
                transactions={transactions}
                pagination={recentTransactions}
                filters={filters}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
            />

        </div>
    );
};

export default InventoryDashboard;
