
import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import { useDispatch, useSelector } from "react-redux";

import {
    ArrowDownRight,
    ArrowUpRight,
    Banknote,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    CircleDollarSign,
    Clock3,
    CreditCard,
    FileText,
    Package,
    RefreshCw,
    ShoppingCart,
    TrendingUp,
    Users,
    WalletCards,
    Warehouse,
    XCircle,
} from "lucide-react";

import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import {
    fetchDashboardOverview,
} from "../thunks/dashboardThunks";

import {
    setDashboardPeriod,
    setDashboardDateRange,
    clearDashboardError,
} from "../slices/dashboardSlice";

// ======================================================
// CONSTANTS
// ======================================================

const PERIOD_OPTIONS = [
    { label: "Today", value: "TODAY" },
    { label: "Yesterday", value: "YESTERDAY" },
    { label: "Last 7 Days", value: "LAST_7_DAYS" },
    { label: "Last 30 Days", value: "LAST_30_DAYS" },
    { label: "Last 3 Months", value: "LAST_90_DAYS" },
    { label: "This Month", value: "THIS_MONTH" },
    { label: "Last Month", value: "LAST_MONTH" },
    { label: "This Year", value: "THIS_YEAR" },
    {
        label: "This Financial Year",
        value: "THIS_FINANCIAL_YEAR",
    },
    { label: "Custom Date Range", value: "CUSTOM" },
];

const CHART_COLORS = {
    sales: "#6366f1",
    purchases: "#94a3b8",
    receivables: "#6366f1",
    payables: "#cbd5e1",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
};

// ======================================================
// FORMAT HELPERS
// ======================================================

const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(value) || 0);
};

const formatCompactCurrency = (value) => {
    const amount = Number(value) || 0;

    if (amount >= 10000000) {
        return `₹${(amount / 10000000).toFixed(1)}Cr`;
    }

    if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(1)}L`;
    }

    if (amount >= 1000) {
        return `₹${(amount / 1000).toFixed(1)}K`;
    }

    return `₹${amount.toFixed(0)}`;
};

const formatNumber = (value) => {
    return new Intl.NumberFormat("en-IN", {
        maximumFractionDigits: 2,
    }).format(Number(value) || 0);
};

const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const formatMonth = (month, year) => {
    if (!month) return "";

    const monthName = String(month)
        .toLowerCase()
        .slice(0, 3);

    return year
        ? `${monthName.charAt(0).toUpperCase()}${monthName.slice(1)} ${year}`
        : monthName.charAt(0).toUpperCase() + monthName.slice(1);
};

const getInitials = (name = "") => {
    return String(name)
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join("")
        .toUpperCase() || "—";
};

// ======================================================
// STATUS HELPERS
// ======================================================

const normalizeStatus = (status) => {
    const value = String(status || "")
        .toUpperCase()
        .replaceAll("_", " ");

    if (["PAID", "COMPLETED", "ACTIVE", "APPROVED"].includes(value)) {
        return "Success";
    }

    if (["OVERDUE", "FAILED", "REJECTED", "CANCELLED"].includes(value)) {
        return "Danger";
    }

    if (
        ["PENDING", "PARTIAL", "DRAFT", "REVERSAL"].includes(value)
    ) {
        return "Warning";
    }

    if (["REVERSED"].includes(value)) {
        return "Neutral";
    }

    return "Neutral";
};

const StatusBadge = ({ status }) => {
    const type = normalizeStatus(status);

    const styles = {
        Success: "bg-emerald-50 text-emerald-600",
        Danger: "bg-rose-50 text-rose-500",
        Warning: "bg-orange-50 text-orange-500",
        Neutral: "bg-slate-100 text-slate-500",
    };

    const dots = {
        Success: "bg-emerald-500",
        Danger: "bg-rose-500",
        Warning: "bg-orange-400",
        Neutral: "bg-slate-400",
    };

    return (
        <span
            className={`
                inline-flex items-center gap-1.5
                rounded-full px-2.5 py-1
                text-[11px] font-semibold
                ${styles[type]}
            `}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${dots[type]}`} />
            {String(status || "UNKNOWN").replaceAll("_", " ")}
        </span>
    );
};

// ======================================================
// CHART TOOLTIP
// ======================================================

const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    return (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl">
            <p className="mb-2 text-xs font-medium text-slate-500">
                {label}
            </p>

            {payload.map((item) => (
                <div
                    key={item.dataKey}
                    className="flex items-center justify-between gap-5 text-sm"
                >
                    <span className="text-slate-600">
                        {item.name}
                    </span>

                    <span className="font-semibold text-slate-900">
                        {formatCurrency(item.value)}
                    </span>
                </div>
            ))}
        </div>
    );
};

// ======================================================
// REUSABLE COMPONENTS
// ======================================================

const KpiCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
}) => {
    const trendValue = Number(trend);
    const hasTrend = trend !== undefined && trend !== null;
    const isPositive = trendValue >= 0;

    return (
        <div
            className="
                group relative overflow-hidden
                rounded-2xl border border-slate-200
                bg-white p-5
                shadow-[0_2px_12px_rgba(15,23,42,0.04)]
                transition-all duration-200
                hover:-translate-y-[2px]
                hover:shadow-[0_8px_28px_rgba(15,23,42,0.08)]
            "
        >
            <div className="flex items-start justify-between">
                <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                        {title}
                    </p>

                    <h2 className="mt-3 break-words text-[25px] font-bold tracking-tight text-slate-900">
                        {value}
                    </h2>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        {hasTrend && (
                            <span
                                className={`
                                    inline-flex items-center gap-1
                                    text-xs font-semibold
                                    ${isPositive
                                        ? "text-emerald-500"
                                        : "text-rose-500"
                                    }
                                `}
                            >
                                {isPositive
                                    ? <ArrowUpRight size={14} />
                                    : <ArrowDownRight size={14} />
                                }

                                {Math.abs(trendValue).toFixed(2)}%
                            </span>
                        )}

                        {subtitle && (
                            <span className="text-xs text-slate-400">
                                {subtitle}
                            </span>
                        )}
                    </div>
                </div>

                <div
                    className="
                        flex h-11 w-11 shrink-0 items-center
                        justify-center rounded-xl bg-slate-100
                        text-slate-700 transition
                        group-hover:bg-slate-900
                        group-hover:text-white
                    "
                >
                    <Icon size={20} strokeWidth={1.8} />
                </div>
            </div>
        </div>
    );
};

const Panel = ({ title, subtitle, icon: Icon, children, className = "" }) => (
    <div
        className={`
            rounded-2xl border border-slate-200 bg-white
            shadow-[0_2px_12px_rgba(15,23,42,0.04)]
            ${className}
        `}
    >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
                <h3 className="text-sm font-bold text-slate-900">
                    {title}
                </h3>

                {subtitle && (
                    <p className="mt-1 text-xs text-slate-400">
                        {subtitle}
                    </p>
                )}
            </div>

            {Icon && (
                <Icon size={18} className="text-slate-400" />
            )}
        </div>

        {children}
    </div>
);

const EmptyState = ({
    icon: Icon = FileText,
    title = "No records found",
    description = "There is no data available for this period.",
}) => (
    <div className="flex min-h-[150px] flex-col items-center justify-center px-5 py-8 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Icon size={21} />
        </div>

        <p className="mt-3 text-sm font-semibold text-slate-700">
            {title}
        </p>

        <p className="mt-1 max-w-xs text-xs text-slate-400">
            {description}
        </p>
    </div>
);

const SummaryRow = ({ icon: Icon, label, value, valueClass = "" }) => (
    <div className="flex items-center justify-between rounded-xl px-2 py-2.5 transition hover:bg-slate-50">
        <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                <Icon size={15} />
            </div>

            <span className="truncate text-xs font-medium text-slate-500">
                {label}
            </span>
        </div>

        <span className={`ml-3 text-sm font-bold text-slate-800 ${valueClass}`}>
            {value}
        </span>
    </div>
);

const MetricCard = ({ label, value, description, icon: Icon }) => (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
        <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
                {label}
            </span>

            {Icon && (
                <Icon size={16} className="text-slate-400" />
            )}
        </div>

        <p className="mt-2 text-xl font-bold text-slate-900">
            {value}
        </p>

        {description && (
            <p className="mt-1 text-[11px] text-slate-400">
                {description}
            </p>
        )}
    </div>
);

// ======================================================
// DASHBOARD
// ======================================================

export default function Dashboard() {
    const dispatch = useDispatch();

    // ==============================================
    // REDUX STATE
    // ==============================================

    const {
        dashboard,
        loading,
        error,
        period,
        fromDate,
        toDate,
    } = useSelector((state) => state.dashboard);

    // ==============================================
    // LOCAL STATE
    // ==============================================

    const [invoiceFilter, setInvoiceFilter] = useState("All");

    // ==============================================
    // FETCH DASHBOARD
    // ==============================================

    useEffect(() => {
        if (period === "CUSTOM") {
            if (!fromDate || !toDate) return;
        }

        dispatch(
            fetchDashboardOverview({
                period,
                fromDate: period === "CUSTOM" ? fromDate : undefined,
                toDate: period === "CUSTOM" ? toDate : undefined,
            })
        );
    }, [dispatch, period, fromDate, toDate]);

    // ==============================================
    // API DATA
    // ==============================================

    const kpis = dashboard?.kpis || {};
    const receivablePayable = dashboard?.receivablePayable || {};
    const businessSummary = dashboard?.businessSummary || {};
    const orderSummary = dashboard?.orderSummary || {};
    const paymentSummary = dashboard?.paymentSummary || {};
    const bankCashSummary = dashboard?.bankCashSummary || {};
    const inventorySummary = dashboard?.inventorySummary || {};

    const salesPurchaseData = useMemo(() => {
        return (dashboard?.salesPurchaseTrend || []).map((item) => ({
            ...item,
            monthLabel: formatMonth(item.month, item.year),
            sales: Number(item.sales) || 0,
            purchases: Number(item.purchases) || 0,
        }));
    }, [dashboard?.salesPurchaseTrend]);

    const receivablePayableData = useMemo(() => [
        {
            name: "Receivables",
            value: Number(receivablePayable.receivables) || 0,
        },
        {
            name: "Payables",
            value: Number(receivablePayable.payables) || 0,
        },
    ], [receivablePayable]);

    const customerGrowthData = useMemo(() => {
        return (dashboard?.customerGrowth || []).map((item) => ({
            ...item,
            monthLabel: item.month
                ? formatMonth(item.month, item.year)
                : item.label || item.date || "",
            customers: Number(
                item.customers ?? item.customerCount ?? item.count ?? 0
            ),
        }));
    }, [dashboard?.customerGrowth]);

    const expenseData = useMemo(() => {
        return (dashboard?.topExpenses || []).map((item) => ({
            ...item,
            category:
                item.category ||
                item.categoryName ||
                item.expenseCategory ||
                "Other",
            amount: Number(
                item.amount ?? item.totalAmount ?? item.total ?? 0
            ),
        }));
    }, [dashboard?.topExpenses]);

    const recentInvoices = dashboard?.recentInvoices || [];
    const pendingApprovals = dashboard?.pendingApprovals || [];
    const recentTransactions = dashboard?.recentTransactions || [];

    // ==============================================
    // INVOICE FILTER
    // ==============================================

    const filteredInvoices = useMemo(() => {
        if (invoiceFilter === "All") {
            return recentInvoices;
        }

        return recentInvoices.filter((invoice) => {
            const status = String(invoice.status || "").toUpperCase();

            if (invoiceFilter === "Paid") {
                return status === "PAID" || status === "COMPLETED";
            }

            if (invoiceFilter === "Overdue") {
                return status === "OVERDUE";
            }

            return true;
        });
    }, [recentInvoices, invoiceFilter]);

    // ==============================================
    // REFRESH
    // ==============================================

    const handleRefresh = () => {
        dispatch(clearDashboardError());

        dispatch(
            fetchDashboardOverview({
                period,
                fromDate: period === "CUSTOM" ? fromDate : undefined,
                toDate: period === "CUSTOM" ? toDate : undefined,
            })
        );
    };

    // ==============================================
    // PERIOD CHANGE
    // ==============================================

    const handlePeriodChange = (value) => {
        dispatch(setDashboardPeriod(value));
    };

    // ==============================================
    // CUSTOM DATE CHANGE
    // ==============================================

    const handleFromDateChange = (value) => {
        dispatch(
            setDashboardDateRange({
                fromDate: value,
                toDate,
            })
        );
    };

    const handleToDateChange = (value) => {
        dispatch(
            setDashboardDateRange({
                fromDate,
                toDate: value,
            })
        );
    };

    // ==============================================
    // TOTAL OUTSTANDING
    // ==============================================

    const totalOutstanding =
        (Number(receivablePayable.receivables) || 0) +
        (Number(receivablePayable.payables) || 0);

    // ==============================================
    // LOADING INITIAL STATE
    // ==============================================

    if (loading && !dashboard) {
        return (
            <div className="flex min-h-[65vh] items-center justify-center bg-[#f4f7fb]">
                <div className="flex flex-col items-center">
                    <RefreshCw
                        size={30}
                        className="animate-spin text-indigo-500"
                    />

                    <p className="mt-4 text-sm font-semibold text-slate-700">
                        Loading dashboard...
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                        Fetching your business overview
                    </p>
                </div>
            </div>
        );
    }

    // ==============================================
    // DASHBOARD UI
    // ==============================================

    return (
        <div className="min-h-full bg-[#f4f7fb] p-4 sm:p-5 lg:p-6">

            {/* ==========================================
                HEADER
            ========================================== */}

            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-[24px] font-bold tracking-tight text-slate-900">
                        Dashboard
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Overview of your business performance and activity.
                    </p>

                    {dashboard?.generatedAt && (
                        <p className="mt-1 text-[10px] text-slate-400">
                            Last updated: {formatDate(dashboard.generatedAt)}
                        </p>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={loading}
                        className="
                            inline-flex items-center gap-2
                            rounded-xl border border-slate-200
                            bg-white px-3.5 py-2.5
                            text-xs font-medium text-slate-600
                            shadow-sm transition
                            hover:border-slate-300
                            disabled:cursor-not-allowed disabled:opacity-60
                        "
                    >
                        <RefreshCw
                            size={15}
                            className={loading ? "animate-spin" : ""}
                        />

                        {loading ? "Refreshing..." : "Refresh"}
                    </button>

                    <div className="relative">
                        <CalendarDays
                            size={15}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <select
                            value={period}
                            onChange={(e) => handlePeriodChange(e.target.value)}
                            className="
                                appearance-none rounded-xl
                                border border-slate-200 bg-white
                                py-2.5 pl-9 pr-9 text-xs
                                font-medium text-slate-600
                                outline-none shadow-sm
                                focus:border-slate-400
                            "
                        >
                            {PERIOD_OPTIONS.map((option) => (
                                <option
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </option>
                            ))}
                        </select>

                        <ChevronDown
                            size={14}
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                    </div>
                </div>
            </div>

            {/* ==========================================
                CUSTOM DATE RANGE
            ========================================== */}

            {period === "CUSTOM" && (
                <div className="mb-5 flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-500">
                            From Date
                        </label>

                        <input
                            type="date"
                            value={fromDate}
                            max={toDate || undefined}
                            onChange={(e) => handleFromDateChange(e.target.value)}
                            className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 outline-none focus:border-indigo-400"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-500">
                            To Date
                        </label>

                        <input
                            type="date"
                            value={toDate}
                            min={fromDate || undefined}
                            onChange={(e) => handleToDateChange(e.target.value)}
                            className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 outline-none focus:border-indigo-400"
                        />
                    </div>

                    {(!fromDate || !toDate) && (
                        <p className="pb-2 text-xs text-orange-500">
                            Select both dates to load the dashboard.
                        </p>
                    )}
                </div>
            )}

            {/* ==========================================
                ERROR MESSAGE
            ========================================== */}

            {error && (
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
                    <div className="flex items-center gap-2">
                        <XCircle size={17} className="text-rose-500" />

                        <p className="text-sm font-medium text-rose-600">
                            {error}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleRefresh}
                        className="text-xs font-semibold text-rose-600 hover:underline"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* ==========================================
                KPI CARDS
            ========================================== */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <KpiCard
                    title="Sales · Total"
                    value={formatCurrency(kpis.totalSales)}
                    trend={kpis.salesGrowthPercentage}
                    subtitle="vs previous period"
                    icon={TrendingUp}
                />

                <KpiCard
                    title="Purchases · Total"
                    value={formatCurrency(kpis.totalPurchases)}
                    trend={kpis.purchaseGrowthPercentage}
                    subtitle="vs previous period"
                    icon={ShoppingCart}
                />

                <KpiCard
                    title="Receivables"
                    value={formatCurrency(kpis.totalReceivables)}
                    subtitle={`${formatCurrency(kpis.overdueReceivables)} overdue`}
                    icon={WalletCards}
                />

                <KpiCard
                    title="Payables"
                    value={formatCurrency(kpis.totalPayables)}
                    subtitle={`${formatCurrency(kpis.overduePayables)} overdue`}
                    icon={CreditCard}
                />
            </div>

            {/* ==========================================
                MAIN ANALYTICS
            ========================================== */}

            <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(300px,0.8fr)]">

                {/* SALES VS PURCHASES */}

                <Panel
                    title="Sales vs Purchases"
                    subtitle="Financial performance over time"
                >
                    <div className="px-3 pb-4 pt-5 sm:px-5">
                        <div className="mb-4 flex flex-wrap items-center gap-5">
                            <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                                <span className="text-xs text-slate-500">Sales</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                                <span className="text-xs text-slate-500">Purchases</span>
                            </div>
                        </div>

                        {salesPurchaseData.length === 0 ? (
                            <EmptyState
                                title="No sales or purchase trend"
                                description="No financial trend data is available for this period."
                            />
                        ) : (
                            <div className="h-[280px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={salesPurchaseData}
                                        margin={{
                                            top: 10,
                                            right: 10,
                                            left: -20,
                                            bottom: 0,
                                        }}
                                    >
                                        <defs>
                                            <linearGradient
                                                id="salesGradient"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="0%"
                                                    stopColor="#6366f1"
                                                    stopOpacity={0.22}
                                                />
                                                <stop
                                                    offset="100%"
                                                    stopColor="#6366f1"
                                                    stopOpacity={0}
                                                />
                                            </linearGradient>

                                            <linearGradient
                                                id="purchaseGradient"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="0%"
                                                    stopColor="#94a3b8"
                                                    stopOpacity={0.18}
                                                />
                                                <stop
                                                    offset="100%"
                                                    stopColor="#94a3b8"
                                                    stopOpacity={0}
                                                />
                                            </linearGradient>
                                        </defs>

                                        <CartesianGrid
                                            vertical={false}
                                            stroke="#eef2f7"
                                        />

                                        <XAxis
                                            dataKey="monthLabel"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{
                                                fill: "#94a3b8",
                                                fontSize: 11,
                                            }}
                                        />

                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{
                                                fill: "#94a3b8",
                                                fontSize: 11,
                                            }}
                                            tickFormatter={formatCompactCurrency}
                                        />

                                        <Tooltip content={<ChartTooltip />} />

                                        <Area
                                            type="monotone"
                                            dataKey="sales"
                                            name="Sales"
                                            stroke={CHART_COLORS.sales}
                                            strokeWidth={2}
                                            fill="url(#salesGradient)"
                                        />

                                        <Area
                                            type="monotone"
                                            dataKey="purchases"
                                            name="Purchases"
                                            stroke={CHART_COLORS.purchases}
                                            strokeWidth={2}
                                            fill="url(#purchaseGradient)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </Panel>

                {/* RECEIVABLES / PAYABLES */}

                <Panel
                    title="Receivables & Payables"
                    subtitle="Current outstanding position"
                >
                    <div className="px-5 py-5">
                        <div className="relative mx-auto h-[190px] max-w-[260px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={receivablePayableData}
                                        dataKey="value"
                                        nameKey="name"
                                        innerRadius={58}
                                        outerRadius={82}
                                        paddingAngle={4}
                                        stroke="none"
                                    >
                                        <Cell fill={CHART_COLORS.receivables} />
                                        <Cell fill={CHART_COLORS.payables} />
                                    </Pie>

                                    <Tooltip
                                        formatter={(value) => formatCurrency(value)}
                                    />
                                </PieChart>
                            </ResponsiveContainer>

                            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                                <CircleDollarSign
                                    size={20}
                                    className="text-slate-400"
                                />

                                <span className="mt-1 text-lg font-bold text-slate-900">
                                    {formatCompactCurrency(totalOutstanding)}
                                </span>

                                <span className="text-[10px] text-slate-400">
                                    Outstanding
                                </span>
                            </div>
                        </div>

                        <div className="mt-3 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                                    <span className="text-xs text-slate-500">Receivables</span>
                                </div>

                                <span className="text-sm font-semibold text-slate-900">
                                    {formatCurrency(receivablePayable.receivables)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                                    <span className="text-xs text-slate-500">Payables</span>
                                </div>

                                <span className="text-sm font-semibold text-slate-900">
                                    {formatCurrency(receivablePayable.payables)}
                                </span>
                            </div>

                            <div className="border-t border-slate-100 pt-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-500">
                                        Overdue Receivables
                                    </span>

                                    <span className="text-xs font-semibold text-rose-500">
                                        {formatCurrency(receivablePayable.overdueReceivables)}
                                    </span>
                                </div>

                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-xs text-slate-500">
                                        Overdue Payables
                                    </span>

                                    <span className="text-xs font-semibold text-rose-500">
                                        {formatCurrency(receivablePayable.overduePayables)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Panel>
            </div>

            {/* ==========================================
                SECONDARY ANALYTICS
            ========================================== */}

            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">

                {/* CUSTOMER GROWTH */}

                <Panel
                    title="Customer Growth"
                    subtitle="New customers added"
                    icon={Users}
                >
                    <div className="h-[230px] px-3 pb-4 pt-3">
                        {customerGrowthData.length === 0 ? (
                            <EmptyState
                                icon={Users}
                                title="No customer growth data"
                                description="Customer growth records are not available for this period."
                            />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={customerGrowthData}
                                    margin={{
                                        top: 10,
                                        right: 10,
                                        left: -25,
                                        bottom: 0,
                                    }}
                                >
                                    <CartesianGrid
                                        vertical={false}
                                        stroke="#f1f5f9"
                                    />

                                    <XAxis
                                        dataKey="monthLabel"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "#94a3b8", fontSize: 10 }}
                                    />

                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "#94a3b8", fontSize: 10 }}
                                    />

                                    <Tooltip />

                                    <Bar
                                        dataKey="customers"
                                        name="Customers"
                                        radius={[5, 5, 0, 0]}
                                        fill="#6366f1"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </Panel>

                {/* TOP EXPENSES */}

                <Panel
                    title="Top Expenses"
                    subtitle="Expenses by category"
                    icon={WalletCards}
                >
                    <div className="h-[230px] px-2 pb-4 pt-3">
                        {expenseData.length === 0 ? (
                            <EmptyState
                                icon={WalletCards}
                                title="No expense records"
                                description="No expense categories are available for this period."
                            />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={expenseData}
                                    layout="vertical"
                                    margin={{
                                        top: 0,
                                        right: 15,
                                        left: 20,
                                        bottom: 0,
                                    }}
                                >
                                    <XAxis
                                        type="number"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                            fill: "#94a3b8",
                                            fontSize: 10,
                                        }}
                                        tickFormatter={formatCompactCurrency}
                                    />

                                    <YAxis
                                        type="category"
                                        dataKey="category"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                            fill: "#64748b",
                                            fontSize: 10,
                                        }}
                                        width={75}
                                    />

                                    <Tooltip
                                        formatter={(value) => formatCurrency(value)}
                                    />

                                    <Bar
                                        dataKey="amount"
                                        name="Expense"
                                        radius={[0, 5, 5, 0]}
                                        fill="#6366f1"
                                        barSize={15}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </Panel>

                {/* BUSINESS SUMMARY */}

                <Panel
                    title="Business Summary"
                    subtitle="Current operational overview"
                >
                    <div className="space-y-1 px-5 py-3">
                        <SummaryRow
                            icon={Users}
                            label="Customers"
                            value={formatNumber(businessSummary.totalCustomers)}
                        />

                        <SummaryRow
                            icon={Users}
                            label="Parties"
                            value={formatNumber(businessSummary.totalParties)}
                        />

                        <SummaryRow
                            icon={FileText}
                            label="Invoices"
                            value={formatNumber(businessSummary.totalInvoices)}
                        />

                        <SummaryRow
                            icon={Package}
                            label="Products"
                            value={formatNumber(businessSummary.totalProducts)}
                        />

                        <SummaryRow
                            icon={Warehouse}
                            label="Warehouses"
                            value={formatNumber(businessSummary.totalWarehouses)}
                        />

                        <SummaryRow
                            icon={Clock3}
                            label="Pending approvals"
                            value={formatNumber(businessSummary.totalPendingApprovals)}
                        />
                    </div>
                </Panel>
            </div>

            {/* ==========================================
                ORDER SUMMARY
            ========================================== */}

            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">

                <Panel
                    title="Sales Order Summary"
                    subtitle="Sales order status and value"
                    icon={ShoppingCart}
                >
                    <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3">
                        <MetricCard
                            label="Total Orders"
                            value={formatNumber(orderSummary.totalSalesOrders)}
                            icon={FileText}
                        />

                        <MetricCard
                            label="Draft"
                            value={formatNumber(orderSummary.draftSalesOrders)}
                        />

                        <MetricCard
                            label="Confirmed"
                            value={formatNumber(orderSummary.confirmedSalesOrders)}
                        />

                        <MetricCard
                            label="Completed"
                            value={formatNumber(orderSummary.completedSalesOrders)}
                        />

                        <MetricCard
                            label="Cancelled"
                            value={formatNumber(orderSummary.cancelledSalesOrders)}
                        />

                        <MetricCard
                            label="Order Amount"
                            value={formatCompactCurrency(orderSummary.salesOrderAmount)}
                            description={formatCurrency(orderSummary.salesOrderAmount)}
                            icon={Banknote}
                        />
                    </div>
                </Panel>

                <Panel
                    title="Purchase Order Summary"
                    subtitle="Purchase order status and value"
                    icon={Package}
                >
                    <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3">
                        <MetricCard
                            label="Total Orders"
                            value={formatNumber(orderSummary.totalPurchaseOrders)}
                            icon={FileText}
                        />

                        <MetricCard
                            label="Draft"
                            value={formatNumber(orderSummary.draftPurchaseOrders)}
                        />

                        <MetricCard
                            label="Confirmed"
                            value={formatNumber(orderSummary.confirmedPurchaseOrders)}
                        />

                        <MetricCard
                            label="Received"
                            value={formatNumber(orderSummary.receivedPurchaseOrders)}
                        />

                        <MetricCard
                            label="Cancelled"
                            value={formatNumber(orderSummary.cancelledPurchaseOrders)}
                        />

                        <MetricCard
                            label="Order Amount"
                            value={formatCompactCurrency(orderSummary.purchaseOrderAmount)}
                            description={formatCurrency(orderSummary.purchaseOrderAmount)}
                            icon={Banknote}
                        />
                    </div>

                    <div className="border-t border-slate-100 px-5 py-4">
                        <p className="mb-3 text-xs font-semibold text-slate-600">
                            Goods Receipts
                        </p>

                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <p className="text-[10px] text-slate-400">
                                    Total
                                </p>
                                <p className="mt-1 text-sm font-bold text-slate-800">
                                    {formatNumber(orderSummary.totalGoodsReceipts)}
                                </p>
                            </div>

                            <div>
                                <p className="text-[10px] text-slate-400">
                                    Pending
                                </p>
                                <p className="mt-1 text-sm font-bold text-orange-500">
                                    {formatNumber(orderSummary.pendingGoodsReceipts)}
                                </p>
                            </div>

                            <div>
                                <p className="text-[10px] text-slate-400">
                                    Completed
                                </p>
                                <p className="mt-1 text-sm font-bold text-emerald-600">
                                    {formatNumber(orderSummary.completedGoodsReceipts)}
                                </p>
                            </div>
                        </div>
                    </div>
                </Panel>
            </div>

            {/* ==========================================
                PAYMENT AND BANK SUMMARY
            ========================================== */}

            <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">

                {/* PAYMENT SUMMARY */}

                <Panel
                    title="Payment Summary"
                    subtitle="Collections and payment activity"
                    icon={WalletCards}
                >
                    <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3">
                        <MetricCard
                            label="Total Payments"
                            value={formatNumber(paymentSummary.totalPayments)}
                            icon={CreditCard}
                        />

                        <MetricCard
                            label="Completed"
                            value={formatNumber(paymentSummary.completedPayments)}
                        />

                        <MetricCard
                            label="Pending"
                            value={formatNumber(paymentSummary.pendingPayments)}
                        />

                        <MetricCard
                            label="Cancelled"
                            value={formatNumber(paymentSummary.cancelledPayments)}
                        />

                        <MetricCard
                            label="Failed"
                            value={formatNumber(paymentSummary.failedPayments)}
                        />

                        <MetricCard
                            label="Reversed"
                            value={formatNumber(paymentSummary.reversedPayments)}
                        />
                    </div>

                    <div className="space-y-3 border-t border-slate-100 px-5 py-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">
                                Total Collections
                            </span>

                            <span className="text-sm font-bold text-emerald-600">
                                {formatCurrency(paymentSummary.totalCollections)}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">
                                Total Payments Made
                            </span>

                            <span className="text-sm font-bold text-slate-800">
                                {formatCurrency(paymentSummary.totalPaymentsMade)}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">
                                Cash Collections
                            </span>

                            <span className="text-sm font-semibold text-slate-800">
                                {formatCurrency(paymentSummary.totalCashCollections)}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">
                                Bank Collections
                            </span>

                            <span className="text-sm font-semibold text-slate-800">
                                {formatCurrency(paymentSummary.totalBankCollections)}
                            </span>
                        </div>
                    </div>
                </Panel>

                {/* BANK AND CASH */}

                <Panel
                    title="Bank & Cash Summary"
                    subtitle="Available financial balances"
                    icon={Banknote}
                >
                    <div className="p-5">
                        <div className="rounded-2xl bg-slate-900 p-5 text-white">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-slate-300">
                                    Total Available Balance
                                </span>

                                <WalletCards
                                    size={20}
                                    className="text-slate-300"
                                />
                            </div>

                            <h2 className="mt-3 text-2xl font-bold tracking-tight">
                                {formatCurrency(bankCashSummary.totalAvailableBalance)}
                            </h2>

                            <p className="mt-1 text-[11px] text-slate-400">
                                Combined bank and cash balance
                            </p>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <MetricCard
                                label="Bank Balance"
                                value={formatCompactCurrency(bankCashSummary.totalBankBalance)}
                                description={formatCurrency(bankCashSummary.totalBankBalance)}
                                icon={Banknote}
                            />

                            <MetricCard
                                label="Cash Balance"
                                value={formatCompactCurrency(bankCashSummary.totalCashBalance)}
                                description={formatCurrency(bankCashSummary.totalCashBalance)}
                                icon={CircleDollarSign}
                            />
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <div className="rounded-xl border border-slate-100 px-4 py-3">
                                <p className="text-xs text-slate-400">
                                    Bank Accounts
                                </p>

                                <p className="mt-1 text-lg font-bold text-slate-800">
                                    {formatNumber(bankCashSummary.totalBankAccounts)}
                                </p>
                            </div>

                            <div className="rounded-xl border border-slate-100 px-4 py-3">
                                <p className="text-xs text-slate-400">
                                    Cash Accounts
                                </p>

                                <p className="mt-1 text-lg font-bold text-slate-800">
                                    {formatNumber(bankCashSummary.totalCashAccounts)}
                                </p>
                            </div>
                        </div>
                    </div>
                </Panel>
            </div>

            {/* ==========================================
                INVENTORY SUMMARY
            ========================================== */}

            <div className="mt-5">
                <Panel
                    title="Inventory Summary"
                    subtitle="Current stock and inventory valuation"
                    icon={Package}
                >
                    <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4">
                        <MetricCard
                            label="Total Products"
                            value={formatNumber(inventorySummary.totalProducts)}
                            icon={Package}
                        />

                        <MetricCard
                            label="Warehouses"
                            value={formatNumber(inventorySummary.totalWarehouses)}
                            icon={Warehouse}
                        />

                        <MetricCard
                            label="Stock Items"
                            value={formatNumber(inventorySummary.totalStockItems)}
                        />

                        <MetricCard
                            label="Total Stock Quantity"
                            value={formatNumber(inventorySummary.totalStockQuantity)}
                        />

                        <MetricCard
                            label="Available Quantity"
                            value={formatNumber(inventorySummary.totalAvailableQuantity)}
                        />

                        <MetricCard
                            label="Reserved Quantity"
                            value={formatNumber(inventorySummary.totalReservedQuantity)}
                        />

                        <MetricCard
                            label="Low Stock Products"
                            value={formatNumber(inventorySummary.lowStockProducts)}
                        />

                        <MetricCard
                            label="Out of Stock"
                            value={formatNumber(inventorySummary.outOfStockProducts)}
                        />
                    </div>

                    <div className="border-t border-slate-100 px-5 py-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <p className="text-xs font-medium text-slate-500">
                                    Total Inventory Value
                                </p>

                                <p className="mt-1 text-xl font-bold text-slate-900">
                                    {formatCurrency(inventorySummary.totalInventoryValue)}
                                </p>
                            </div>

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
                                <Package size={20} />
                            </div>
                        </div>
                    </div>
                </Panel>
            </div>

            {/* ==========================================
                BOTTOM SECTION
            ========================================== */}

            <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(300px,0.85fr)]">

                {/* RECENT INVOICES */}

                <Panel
                    title="Recent Invoices"
                    subtitle="Latest sales invoices"
                    className="overflow-hidden"
                >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3">
                        <span className="text-xs text-slate-400">
                            {filteredInvoices.length} invoice(s)
                        </span>

                        <div className="flex items-center gap-1 rounded-xl bg-slate-50 p-1">
                            {["All", "Paid", "Overdue"].map((filter) => (
                                <button
                                    key={filter}
                                    type="button"
                                    onClick={() => setInvoiceFilter(filter)}
                                    className={`
                                        rounded-lg px-3 py-1.5
                                        text-xs font-medium transition
                                        ${invoiceFilter === filter
                                            ? "bg-white text-slate-900 shadow-sm"
                                            : "text-slate-400 hover:text-slate-700"
                                        }
                                    `}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>

                    {filteredInvoices.length === 0 ? (
                        <EmptyState
                            title="No recent invoices"
                            description="There are no invoices matching this filter for the selected period."
                        />
                    ) : (
                        <>
                            {/* DESKTOP TABLE */}

                            <div className="hidden overflow-x-auto md:block">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-100">
                                            <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                                Invoice
                                            </th>

                                            <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                                Client
                                            </th>

                                            <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                                Amount
                                            </th>

                                            <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredInvoices.map((invoice, index) => (
                                            <tr
                                                key={invoice.id || invoice.invoiceNumber || index}
                                                className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                                            >
                                                <td className="px-5 py-4">
                                                    <span className="font-mono text-xs font-semibold text-slate-600">
                                                        {invoice.invoiceNumber || invoice.invoiceNo || invoice.id || "—"}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className="text-sm text-slate-600">
                                                        {invoice.customerName || invoice.clientName || invoice.partyName || "—"}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4 text-right">
                                                    <span className="text-sm font-semibold text-slate-700">
                                                        {formatCurrency(invoice.totalAmount ?? invoice.amount ?? 0)}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <StatusBadge status={invoice.status} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* MOBILE CARDS */}

                            <div className="divide-y divide-slate-100 md:hidden">
                                {filteredInvoices.map((invoice, index) => (
                                    <div
                                        key={invoice.id || invoice.invoiceNumber || index}
                                        className="p-4"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="font-mono text-xs font-semibold text-slate-600">
                                                    {invoice.invoiceNumber || invoice.invoiceNo || invoice.id || "—"}
                                                </p>

                                                <p className="mt-1 text-sm font-medium text-slate-800">
                                                    {invoice.customerName || invoice.clientName || invoice.partyName || "—"}
                                                </p>
                                            </div>

                                            <p className="text-sm font-semibold text-slate-800">
                                                {formatCurrency(invoice.totalAmount ?? invoice.amount ?? 0)}
                                            </p>
                                        </div>

                                        <div className="mt-3 flex items-center justify-between">
                                            <StatusBadge status={invoice.status} />

                                            <span className="text-xs text-slate-400">
                                                {formatDate(invoice.invoiceDate || invoice.date)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </Panel>

                {/* PENDING APPROVALS */}

                <Panel
                    title="Pending Approvals"
                    subtitle="Items requiring your attention"
                    className="overflow-hidden"
                >
                    {pendingApprovals.length === 0 ? (
                        <EmptyState
                            icon={CheckCircle2}
                            title="All caught up"
                            description="No pending approvals."
                        />
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {pendingApprovals.map((approval, index) => {
                                const name =
                                    approval.name ||
                                    approval.requestedBy ||
                                    approval.userName ||
                                    approval.partyName ||
                                    "Approval Request";

                                return (
                                    <div
                                        key={approval.id || index}
                                        className="p-4"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-500">
                                                {getInitials(name)}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold text-slate-800">
                                                    {name}
                                                </p>

                                                <p className="truncate text-xs text-slate-400">
                                                    {approval.email ||
                                                        approval.description ||
                                                        approval.referenceNumber ||
                                                        "Approval required"}
                                                </p>
                                            </div>
                                        </div>

                                        <p className="mt-3 text-[11px] font-medium text-slate-400">
                                            {approval.type ||
                                                approval.approvalType ||
                                                approval.referenceType ||
                                                "Approval"}
                                        </p>

                                        <div className="mt-3 flex items-center justify-between">
                                            <StatusBadge
                                                status={approval.status || "PENDING"}
                                            />

                                            <span className="text-[11px] text-slate-400">
                                                {formatDate(
                                                    approval.createdAt ||
                                                    approval.requestDate
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Panel>
            </div>

            {/* ==========================================
                RECENT TRANSACTIONS
            ========================================== */}

            <div className="mt-5">
                <Panel
                    title="Recent Transactions"
                    subtitle="Latest bank and cash transactions"
                    icon={CreditCard}
                    className="overflow-hidden"
                >
                    {recentTransactions.length === 0 ? (
                        <EmptyState
                            icon={CreditCard}
                            title="No recent transactions"
                            description="Transactions will appear here when available."
                        />
                    ) : (
                        <>
                            {/* DESKTOP TABLE */}

                            <div className="hidden overflow-x-auto md:block">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/70">
                                            <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                                Transaction
                                            </th>

                                            <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                                Party
                                            </th>

                                            <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                                Type
                                            </th>

                                            <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                                Date
                                            </th>

                                            <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                                Method
                                            </th>

                                            <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                                Amount
                                            </th>

                                            <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {recentTransactions.map((transaction) => (
                                            <tr
                                                key={transaction.transactionNumber}
                                                className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                                            >
                                                <td className="px-5 py-4">
                                                    <span className="font-mono text-xs font-semibold text-slate-600">
                                                        {transaction.transactionNumber}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className="text-sm text-slate-600">
                                                        {transaction.partyName || "—"}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className="text-xs font-medium text-slate-500">
                                                        {String(transaction.transactionType || "")
                                                            .replaceAll("_", " ")}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className="text-xs text-slate-500">
                                                        {formatDate(transaction.transactionDate)}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className="text-xs text-slate-500">
                                                        {String(transaction.paymentMethod || "")
                                                            .replaceAll("_", " ")}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4 text-right">
                                                    <span
                                                        className={`
                                                            text-sm font-semibold
                                                            ${String(transaction.transactionType || "").includes("CREDIT")
                                                                ? "text-emerald-600"
                                                                : "text-slate-700"
                                                            }
                                                        `}
                                                    >
                                                        {String(transaction.transactionType || "").includes("CREDIT")
                                                            ? "+"
                                                            : "-"
                                                        }
                                                        {formatCurrency(transaction.amount)}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <StatusBadge status={transaction.status} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* MOBILE CARDS */}

                            <div className="divide-y divide-slate-100 md:hidden">
                                {recentTransactions.map((transaction) => (
                                    <div
                                        key={transaction.transactionNumber}
                                        className="p-4"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="truncate font-mono text-xs font-semibold text-slate-600">
                                                    {transaction.transactionNumber}
                                                </p>

                                                <p className="mt-1 text-sm font-semibold text-slate-800">
                                                    {transaction.partyName || "—"}
                                                </p>

                                                <p className="mt-1 text-[11px] text-slate-400">
                                                    {String(transaction.transactionType || "")
                                                        .replaceAll("_", " ")}
                                                    {" · "}
                                                    {transaction.paymentMethod}
                                                </p>
                                            </div>

                                            <p
                                                className={`
                                                    shrink-0 text-sm font-bold
                                                    ${String(transaction.transactionType || "").includes("CREDIT")
                                                        ? "text-emerald-600"
                                                        : "text-slate-800"
                                                    }
                                                `}
                                            >
                                                {String(transaction.transactionType || "").includes("CREDIT")
                                                    ? "+"
                                                    : "-"
                                                }
                                                {formatCurrency(transaction.amount)}
                                            </p>
                                        </div>

                                        <div className="mt-3 flex items-center justify-between">
                                            <StatusBadge status={transaction.status} />

                                            <span className="text-xs text-slate-400">
                                                {formatDate(transaction.transactionDate)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </Panel>
            </div>

        </div>
    );
}
