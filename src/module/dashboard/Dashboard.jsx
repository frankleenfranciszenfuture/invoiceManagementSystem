import React, {
    useMemo,
    useState,
} from "react";

import {
    ArrowDownRight,
    ArrowUpRight,
    Bell,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    CircleDollarSign,
    Clock3,
    CreditCard,
    FileText,
    IndianRupee,
    MoreHorizontal,
    Package,
    RefreshCw,
    ShoppingCart,
    TrendingUp,
    UserPlus,
    Users,
    WalletCards,
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


/*
 * ============================================================
 * MOCK DASHBOARD DATA
 * Replace this later with Redux/API response.
 * ============================================================
 */

const salesPurchaseData = [
    {
        month: "Jan",
        sales: 92000,
        purchases: 64000,
    },
    {
        month: "Feb",
        sales: 108000,
        purchases: 72000,
    },
    {
        month: "Mar",
        sales: 126000,
        purchases: 81000,
    },
    {
        month: "Apr",
        sales: 112000,
        purchases: 76000,
    },
    {
        month: "May",
        sales: 132000,
        purchases: 89000,
    },
    {
        month: "Jun",
        sales: 118000,
        purchases: 85000,
    },
    {
        month: "Jul",
        sales: 139200,
        purchases: 96450,
    },
];


const customerGrowthData = [
    {
        month: "Jan",
        customers: 48,
    },
    {
        month: "Feb",
        customers: 61,
    },
    {
        month: "Mar",
        customers: 76,
    },
    {
        month: "Apr",
        customers: 68,
    },
    {
        month: "May",
        customers: 92,
    },
    {
        month: "Jun",
        customers: 84,
    },
];


const expenseData = [
    {
        category: "Purchase",
        amount: 42000,
    },
    {
        category: "Salary",
        amount: 18500,
    },
    {
        category: "Transport",
        amount: 12000,
    },
    {
        category: "Rent",
        amount: 9800,
    },
    {
        category: "Utilities",
        amount: 6400,
    },
];


const invoiceData = [
    {
        id: "INV-2041",
        client: "Northwind Traders",
        amount: 42000,
        status: "Paid",
        account: "Active",
    },
    {
        id: "INV-2040",
        client: "Meridian Logistics",
        amount: 18750,
        status: "Overdue",
        account: "Active",
    },
    {
        id: "INV-2039",
        client: "Kestrel Studio",
        amount: 9400,
        status: "Unpaid",
        account: "Active",
    },
    {
        id: "INV-2038",
        client: "Blue Harbor Co.",
        amount: 61200,
        status: "Paid",
        account: "Active",
    },
    {
        id: "INV-2037",
        client: "Vantage Retail",
        amount: 7850,
        status: "Draft",
        account: "Inactive",
    },
];


const approvalData = [
    {
        id: 1,
        initials: "AS",
        name: "Ananya S.",
        email: "ananya@vantage.co",
        type: "Invoice approval",
    },
    {
        id: 2,
        initials: "DK",
        name: "Dev Kapoor",
        email: "dev@meridian.io",
        type: "Purchase approval",
    },
    {
        id: 3,
        initials: "LF",
        name: "Lena Fischer",
        email: "lena@blueharbor.com",
        type: "Invoice approval",
    },
];


const receivablePayableData = [
    {
        name: "Receivables",
        value: 28150,
    },
    {
        name: "Payables",
        value: 80850,
    },
];


/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(value);
};


const formatCompactCurrency = (value) => {
    if (value >= 10000000) {
        return `₹${(value / 10000000).toFixed(1)}Cr`;
    }

    if (value >= 100000) {
        return `₹${(value / 100000).toFixed(1)}L`;
    }

    if (value >= 1000) {
        return `₹${(value / 1000).toFixed(1)}K`;
    }

    return `₹${value}`;
};


/*
 * ============================================================
 * TOOLTIP
 * ============================================================
 */

const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) {
        return null;
    }

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


/*
 * ============================================================
 * KPI CARD
 * ============================================================
 */

const KpiCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    trendType = "up",
}) => {
    return (
        <div
            className="
                group
                relative
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-5
                shadow-[0_2px_12px_rgba(15,23,42,0.04)]
                transition-all
                duration-200
                hover:-translate-y-[2px]
                hover:shadow-[0_8px_28px_rgba(15,23,42,0.08)]
            "
        >

            <div className="flex items-start justify-between">

                <div>

                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                        {title}
                    </p>

                    <h2 className="mt-3 text-[27px] font-bold tracking-tight text-slate-900">
                        {value}
                    </h2>

                    <div className="mt-2 flex items-center gap-2">

                        {trend && (
                            <span
                                className={`
                                    inline-flex
                                    items-center
                                    gap-1
                                    text-xs
                                    font-semibold
                                    ${trendType === "up"
                                        ? "text-emerald-500"
                                        : "text-rose-500"
                                    }
                                `}
                            >
                                {trendType === "up" ? (
                                    <ArrowUpRight size={14} />
                                ) : (
                                    <ArrowDownRight size={14} />
                                )}

                                {trend}
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
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-xl
                        bg-slate-100
                        text-slate-700
                        transition
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


/*
 * ============================================================
 * STATUS BADGE
 * ============================================================
 */

const StatusBadge = ({ status }) => {

    const styles = {
        Paid: "bg-emerald-50 text-emerald-600",
        Overdue: "bg-rose-50 text-rose-500",
        Unpaid: "bg-orange-50 text-orange-500",
        Draft: "bg-slate-100 text-slate-500",
    };

    const dots = {
        Paid: "bg-emerald-500",
        Overdue: "bg-rose-400",
        Unpaid: "bg-orange-400",
        Draft: "bg-slate-400",
    };

    return (
        <span
            className={`
                inline-flex
                items-center
                gap-1.5
                rounded-full
                px-2.5
                py-1
                text-[11px]
                font-semibold
                ${styles[status] || "bg-slate-100 text-slate-500"}
            `}
        >
            <span
                className={`
                    h-1.5
                    w-1.5
                    rounded-full
                    ${dots[status] || "bg-slate-400"}
                `}
            />

            {status}
        </span>
    );
};


/*
 * ============================================================
 * DASHBOARD
 * ============================================================
 */

export default function Dashboard() {

    const [dateRange, setDateRange] = useState("Last 30 Days");

    const [invoiceFilter, setInvoiceFilter] = useState("All");

    const [approvals, setApprovals] = useState(approvalData);


    const filteredInvoices = useMemo(() => {

        if (invoiceFilter === "All") {
            return invoiceData;
        }

        return invoiceData.filter(
            (invoice) => invoice.status === invoiceFilter
        );

    }, [invoiceFilter]);


    const handleApprove = (id) => {

        setApprovals((current) =>
            current.filter(
                (approval) => approval.id !== id
            )
        );

    };


    const handleReject = (id) => {

        setApprovals((current) =>
            current.filter(
                (approval) => approval.id !== id
            )
        );

    };


    return (
        <div className="min-h-full bg-[#f4f7fb] p-4 sm:p-5 lg:p-6">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                <div>

                    <h1 className="text-[24px] font-bold tracking-tight text-slate-900">
                        Dashboard
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Overview of your business performance and activity.
                    </p>

                </div>


                <div className="flex flex-wrap items-center gap-2">

                    <button
                        type="button"
                        className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            px-3.5
                            py-2.5
                            text-xs
                            font-medium
                            text-slate-600
                            shadow-sm
                            transition
                            hover:border-slate-300
                        "
                    >
                        <RefreshCw size={15} />

                        Refresh
                    </button>


                    <div className="relative">

                        <CalendarDays
                            size={15}
                            className="
                                pointer-events-none
                                absolute
                                left-3
                                top-1/2
                                -translate-y-1/2
                                text-slate-400
                            "
                        />

                        <select
                            value={dateRange}
                            onChange={(e) =>
                                setDateRange(e.target.value)
                            }
                            className="
                                appearance-none
                                rounded-xl
                                border
                                border-slate-200
                                bg-white
                                py-2.5
                                pl-9
                                pr-9
                                text-xs
                                font-medium
                                text-slate-600
                                outline-none
                                shadow-sm
                                focus:border-slate-400
                            "
                        >
                            <option>Today</option>
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                            <option>Last 3 Months</option>
                            <option>This Financial Year</option>
                        </select>

                        <ChevronDown
                            size={14}
                            className="
                                pointer-events-none
                                absolute
                                right-3
                                top-1/2
                                -translate-y-1/2
                                text-slate-400
                            "
                        />

                    </div>

                </div>

            </div>


            {/* ==================================================
                KPI CARDS
            ================================================== */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <KpiCard
                    title="Sales · Total"
                    value="₹1,39,200"
                    trend="12.4%"
                    subtitle="vs last month"
                    icon={TrendingUp}
                    trendType="up"
                />

                <KpiCard
                    title="Purchases · Total"
                    value="₹96,450"
                    trend="3.1%"
                    subtitle="vs last month"
                    icon={ShoppingCart}
                    trendType="down"
                />

                <KpiCard
                    title="Receivables"
                    value="₹28,150"
                    subtitle="₹18,750 overdue"
                    icon={WalletCards}
                />

                <KpiCard
                    title="Payables"
                    value="₹80,850"
                    subtitle="2 open bills"
                    icon={CreditCard}
                />

            </div>


            {/* ==================================================
                MAIN ANALYTICS
            ================================================== */}

            <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(300px,0.8fr)]">


                {/* SALES VS PURCHASES */}

                <div
                    className="
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        shadow-[0_2px_12px_rgba(15,23,42,0.04)]
                    "
                >

                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

                        <div>

                            <h3 className="text-sm font-bold text-slate-900">
                                Sales vs Purchases
                            </h3>

                            <p className="mt-1 text-xs text-slate-400">
                                Financial performance over time
                            </p>

                        </div>


                        <button
                            type="button"
                            className="
                                rounded-lg
                                p-1.5
                                text-slate-400
                                hover:bg-slate-50
                                hover:text-slate-700
                            "
                        >
                            <MoreHorizontal size={18} />
                        </button>

                    </div>


                    <div className="px-3 pb-4 pt-5 sm:px-5">

                        <div className="mb-4 flex flex-wrap items-center gap-5">

                            <div className="flex items-center gap-2">

                                <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />

                                <span className="text-xs text-slate-500">
                                    Sales
                                </span>

                            </div>


                            <div className="flex items-center gap-2">

                                <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />

                                <span className="text-xs text-slate-500">
                                    Purchases
                                </span>

                            </div>

                        </div>


                        <div className="h-[280px] w-full">

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >
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
                                        dataKey="month"
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


                                    <Tooltip
                                        content={<ChartTooltip />}
                                    />


                                    <Area
                                        type="monotone"
                                        dataKey="sales"
                                        name="Sales"
                                        stroke="#6366f1"
                                        strokeWidth={2}
                                        fill="url(#salesGradient)"
                                    />


                                    <Area
                                        type="monotone"
                                        dataKey="purchases"
                                        name="Purchases"
                                        stroke="#94a3b8"
                                        strokeWidth={2}
                                        fill="url(#purchaseGradient)"
                                    />

                                </AreaChart>
                            </ResponsiveContainer>

                        </div>

                    </div>

                </div>


                {/* RECEIVABLES / PAYABLES */}

                <div
                    className="
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        shadow-[0_2px_12px_rgba(15,23,42,0.04)]
                    "
                >

                    <div className="border-b border-slate-100 px-5 py-4">

                        <h3 className="text-sm font-bold text-slate-900">
                            Receivables & Payables
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                            Current outstanding position
                        </p>

                    </div>


                    <div className="px-5 py-5">

                        <div className="relative mx-auto h-[190px] max-w-[260px]">

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >

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

                                        <Cell fill="#6366f1" />
                                        <Cell fill="#cbd5e1" />

                                    </Pie>

                                    <Tooltip
                                        formatter={(value) =>
                                            formatCurrency(value)
                                        }
                                    />

                                </PieChart>

                            </ResponsiveContainer>


                            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">

                                <CircleDollarSign
                                    size={20}
                                    className="text-slate-400"
                                />

                                <span className="mt-1 text-lg font-bold text-slate-900">
                                    ₹1.09L
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

                                    <span className="text-xs text-slate-500">
                                        Receivables
                                    </span>

                                </div>

                                <span className="text-sm font-semibold text-slate-900">
                                    ₹28,150
                                </span>

                            </div>


                            <div className="flex items-center justify-between">

                                <div className="flex items-center gap-2">

                                    <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />

                                    <span className="text-xs text-slate-500">
                                        Payables
                                    </span>

                                </div>

                                <span className="text-sm font-semibold text-slate-900">
                                    ₹80,850
                                </span>

                            </div>

                        </div>

                    </div>

                </div>

            </div>


            {/* ==================================================
                SECONDARY ANALYTICS
            ================================================== */}

            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">


                {/* CUSTOMER GROWTH */}

                <div
                    className="
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        shadow-[0_2px_12px_rgba(15,23,42,0.04)]
                    "
                >

                    <div className="flex items-center justify-between px-5 py-4">

                        <div>

                            <h3 className="text-sm font-bold text-slate-900">
                                Customer Growth
                            </h3>

                            <p className="mt-1 text-xs text-slate-400">
                                New customers added
                            </p>

                        </div>

                        <Users
                            size={18}
                            className="text-slate-400"
                        />

                    </div>


                    <div className="h-[210px] px-3 pb-4">

                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >

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
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{
                                        fill: "#94a3b8",
                                        fontSize: 10,
                                    }}
                                />

                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{
                                        fill: "#94a3b8",
                                        fontSize: 10,
                                    }}
                                />

                                <Tooltip />

                                <Bar
                                    dataKey="customers"
                                    radius={[5, 5, 0, 0]}
                                    fill="#6366f1"
                                />

                            </BarChart>

                        </ResponsiveContainer>

                    </div>

                </div>


                {/* TOP EXPENSES */}

                <div
                    className="
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        shadow-[0_2px_12px_rgba(15,23,42,0.04)]
                    "
                >

                    <div className="flex items-center justify-between px-5 py-4">

                        <div>

                            <h3 className="text-sm font-bold text-slate-900">
                                Top Expenses
                            </h3>

                            <p className="mt-1 text-xs text-slate-400">
                                Expenses by category
                            </p>

                        </div>

                        <WalletCards
                            size={18}
                            className="text-slate-400"
                        />

                    </div>


                    <div className="h-[210px] px-2 pb-4">

                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >

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
                                    tickFormatter={(value) =>
                                        `₹${value / 1000}K`
                                    }
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
                                    width={65}
                                />

                                <Tooltip
                                    formatter={(value) =>
                                        formatCurrency(value)
                                    }
                                />

                                <Bar
                                    dataKey="amount"
                                    radius={[0, 5, 5, 0]}
                                    fill="#6366f1"
                                    barSize={15}
                                />

                            </BarChart>

                        </ResponsiveContainer>

                    </div>

                </div>


                {/* QUICK SUMMARY */}

                <div
                    className="
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        shadow-[0_2px_12px_rgba(15,23,42,0.04)]
                    "
                >

                    <div className="px-5 py-4">

                        <h3 className="text-sm font-bold text-slate-900">
                            Business Summary
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                            Current operational overview
                        </p>

                    </div>


                    <div className="space-y-1 px-5 pb-4">

                        <SummaryRow
                            icon={Users}
                            label="Customers"
                            value="190"
                        />

                        <SummaryRow
                            icon={FileText}
                            label="Invoices"
                            value="126"
                        />

                        <SummaryRow
                            icon={Package}
                            label="Products"
                            value="348"
                        />

                        <SummaryRow
                            icon={Clock3}
                            label="Pending approvals"
                            value={approvals.length}
                        />

                    </div>

                </div>

            </div>


            {/* ==================================================
                BOTTOM SECTION
            ================================================== */}

            <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(300px,0.85fr)]">


                {/* RECENT INVOICES */}

                <div
                    className="
                        overflow-hidden
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        shadow-[0_2px_12px_rgba(15,23,42,0.04)]
                    "
                >

                    <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                        <div>

                            <h3 className="text-sm font-bold text-slate-900">
                                Recent Invoices
                            </h3>

                            <p className="mt-1 text-xs text-slate-400">
                                Latest sales invoices
                            </p>

                        </div>


                        <div className="flex items-center gap-1 rounded-xl bg-slate-50 p-1">

                            {["All", "Paid", "Overdue"].map((filter) => (

                                <button
                                    key={filter}
                                    type="button"
                                    onClick={() =>
                                        setInvoiceFilter(filter)
                                    }
                                    className={`
                                        rounded-lg
                                        px-3
                                        py-1.5
                                        text-xs
                                        font-medium
                                        transition
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

                                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                        Account
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredInvoices.map((invoice) => (

                                    <tr
                                        key={invoice.id}
                                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                                    >

                                        <td className="px-5 py-4">

                                            <span className="font-mono text-xs font-semibold text-slate-600">
                                                {invoice.id}
                                            </span>

                                        </td>


                                        <td className="px-5 py-4">

                                            <span className="text-sm text-slate-600">
                                                {invoice.client}
                                            </span>

                                        </td>


                                        <td className="px-5 py-4 text-right">

                                            <span className="text-sm font-semibold text-slate-700">
                                                {formatCurrency(invoice.amount)}
                                            </span>

                                        </td>


                                        <td className="px-5 py-4">

                                            <StatusBadge
                                                status={invoice.status}
                                            />

                                        </td>


                                        <td className="px-5 py-4">

                                            <span
                                                className={`
                                                    text-xs
                                                    font-medium
                                                    ${invoice.account === "Active"
                                                        ? "text-slate-500"
                                                        : "text-slate-400"
                                                    }
                                                `}
                                            >
                                                {invoice.account}
                                            </span>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>


                    {/* MOBILE CARDS */}

                    <div className="divide-y divide-slate-100 md:hidden">

                        {filteredInvoices.map((invoice) => (

                            <div
                                key={invoice.id}
                                className="p-4"
                            >

                                <div className="flex items-start justify-between">

                                    <div>

                                        <p className="font-mono text-xs font-semibold text-slate-600">
                                            {invoice.id}
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-slate-800">
                                            {invoice.client}
                                        </p>

                                    </div>

                                    <p className="text-sm font-semibold text-slate-800">
                                        {formatCurrency(invoice.amount)}
                                    </p>

                                </div>


                                <div className="mt-3 flex items-center justify-between">

                                    <StatusBadge
                                        status={invoice.status}
                                    />

                                    <span className="text-xs text-slate-400">
                                        {invoice.account}
                                    </span>

                                </div>

                            </div>

                        ))}

                    </div>

                </div>


                {/* PENDING APPROVALS */}

                <div
                    className="
                        overflow-hidden
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        shadow-[0_2px_12px_rgba(15,23,42,0.04)]
                    "
                >

                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

                        <div>

                            <h3 className="text-sm font-bold text-slate-900">
                                Pending Approvals
                            </h3>

                            <p className="mt-1 text-xs text-slate-400">
                                Items requiring your attention
                            </p>

                        </div>


                        {approvals.length > 0 && (
                            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                                {approvals.length} Pending
                            </span>
                        )}

                    </div>


                    <div className="divide-y divide-slate-100">

                        {approvals.length === 0 ? (

                            <div className="flex flex-col items-center justify-center px-5 py-12 text-center">

                                <CheckCircle2
                                    size={30}
                                    className="text-emerald-500"
                                />

                                <p className="mt-3 text-sm font-semibold text-slate-700">
                                    All caught up
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    No pending approvals.
                                </p>

                            </div>

                        ) : (

                            approvals.map((approval) => (

                                <div
                                    key={approval.id}
                                    className="p-4"
                                >

                                    <div className="flex items-center gap-3">

                                        <div
                                            className="
                                                flex
                                                h-10
                                                w-10
                                                shrink-0
                                                items-center
                                                justify-center
                                                rounded-full
                                                bg-indigo-50
                                                text-xs
                                                font-bold
                                                text-indigo-500
                                            "
                                        >
                                            {approval.initials}
                                        </div>


                                        <div className="min-w-0 flex-1">

                                            <p className="truncate text-sm font-semibold text-slate-800">
                                                {approval.name}
                                            </p>

                                            <p className="truncate text-xs text-slate-400">
                                                {approval.email}
                                            </p>

                                        </div>

                                    </div>


                                    <p className="mt-3 text-[11px] font-medium text-slate-400">
                                        {approval.type}
                                    </p>


                                    <div className="mt-3 grid grid-cols-2 gap-2">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleApprove(approval.id)
                                            }
                                            className="
                                                inline-flex
                                                items-center
                                                justify-center
                                                gap-1.5
                                                rounded-xl
                                                bg-emerald-50
                                                px-3
                                                py-2
                                                text-xs
                                                font-semibold
                                                text-emerald-600
                                                transition
                                                hover:bg-emerald-100
                                            "
                                        >
                                            <CheckCircle2 size={14} />

                                            Approve
                                        </button>


                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleReject(approval.id)
                                            }
                                            className="
                                                inline-flex
                                                items-center
                                                justify-center
                                                gap-1.5
                                                rounded-xl
                                                bg-rose-50
                                                px-3
                                                py-2
                                                text-xs
                                                font-semibold
                                                text-rose-500
                                                transition
                                                hover:bg-rose-100
                                            "
                                        >
                                            <XCircle size={14} />

                                            Reject
                                        </button>

                                    </div>

                                </div>

                            ))

                        )}

                    </div>

                </div>

            </div>

        </div>
    );
};


/*
 * ============================================================
 * SUMMARY ROW
 * ============================================================
 */

const SummaryRow = ({
    icon: Icon,
    label,
    value,
}) => {

    return (
        <div className="flex items-center justify-between rounded-xl px-2 py-2.5 transition hover:bg-slate-50">

            <div className="flex items-center gap-3">

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">

                    <Icon size={15} />

                </div>

                <span className="text-xs font-medium text-slate-500">
                    {label}
                </span>

            </div>


            <span className="text-sm font-bold text-slate-800">
                {value}
            </span>

        </div>
    );
};

