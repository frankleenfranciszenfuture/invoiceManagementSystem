import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";

import {
    FileBarChart,
    Search,
    RefreshCw,
    Loader2,
    CalendarDays,
    Filter,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    AlertCircle,
} from "lucide-react";

import toast from "react-hot-toast";

import {
    previewReport,
} from "../thunks/reportThunks";

import {
    getReportBuilderConfig,
    getReportDefaultSort,
} from "../config/reportModuleConfig";

import ReportTable from "../pages/ReportTable";
import CustomISelect from "../../../common/custom/CustomISelect";

// ============================================================
// HELPERS
// ============================================================

const formatLabel = (value = "") => {
    return String(value)
        .replace(/([A-Z])/g, " $1")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
        .trim();
};

const getResponseData = (response) => {
    const root = response?.data ?? response;
    return root?.data ?? root;
};

const getColumns = (data) => {
    return (
        data?.columns ||
        data?.headers ||
        []
    );
};

const getRows = (data) => {
    const rows = data?.rows;

    if (Array.isArray(rows)) {
        return rows.map((row) => ({
            ...(row?.values || row || {}),
        }));
    }

    if (Array.isArray(rows?.content)) {
        return rows.content.map((row) => ({
            ...(row?.values || row || {}),
        }));
    }

    if (Array.isArray(data?.content)) {
        return data.content.map((row) => ({
            ...(row?.values || row || {}),
        }));
    }

    return [];
};

const getColumnKey = (column) => {
    if (typeof column === "string") {
        return column;
    }

    return (
        column?.key ||
        column?.field ||
        column?.fieldName ||
        column?.name ||
        column?.accessor ||
        ""
    );
};

const getColumnLabel = (column) => {
    if (typeof column === "string") {
        return formatLabel(column);
    }

    return (
        column?.label ||
        column?.header ||
        column?.title ||
        formatLabel(getColumnKey(column))
    );
};

const getPageInfo = (data) => {
    return data?.rows || data || {};
};

const getInitialCustomFilters = (definitions = []) => {
    return definitions.reduce((result, filter) => {
        result[filter.key] = "";
        return result;
    }, {});
};

// ============================================================
// COMPONENT
// ============================================================

export default function ReportCreate({
    module: moduleProp,
    reportCode: reportCodeProp,
}) {

    const dispatch = useDispatch();

    const params = useParams();

    // --------------------------------------------------------
    // SELECTED MODULE AND REPORT
    // --------------------------------------------------------

    const activeModule = String(
        moduleProp || params.module || ""
    ).toUpperCase();

    const activeReportCode = String(
        reportCodeProp || params.reportCode || ""
    ).toUpperCase();

    // --------------------------------------------------------
    // REPORT CONFIGURATION
    // --------------------------------------------------------

    const reportConfig = useMemo(() => {
        return getReportBuilderConfig(
            activeModule,
            activeReportCode
        );
    }, [activeModule, activeReportCode]);

    const filterDefinitions = reportConfig?.filters || [];

    const defaultSortBy = getReportDefaultSort(
        activeModule,
        activeReportCode
    );

    // --------------------------------------------------------
    // LOCAL STATES
    // --------------------------------------------------------

    const [keyword, setKeyword] = useState("");

    const [fromDate, setFromDate] = useState("");

    const [toDate, setToDate] = useState("");

    const [status, setStatus] = useState("ALL");

    const [customFilters, setCustomFilters] = useState({});

    const [page, setPage] = useState(0);

    const [size, setSize] = useState(20);

    const [sortBy, setSortBy] = useState(defaultSortBy);

    const [sortDirection, setSortDirection] = useState("ASC");

    const [loading, setLoading] = useState(false);

    const [reportData, setReportData] = useState(null);

    const [error, setError] = useState("");

    // --------------------------------------------------------
    // RESET WHEN REPORT CHANGES
    // --------------------------------------------------------

    useEffect(() => {
        setKeyword("");
        setFromDate("");
        setToDate("");
        setStatus("ALL");

        setCustomFilters(
            getInitialCustomFilters(filterDefinitions)
        );

        setPage(0);
        setSortBy(defaultSortBy);
        setSortDirection("ASC");

        setReportData(null);
        setError("");

    }, [
        activeModule,
        activeReportCode,
        defaultSortBy,
    ]);

    // --------------------------------------------------------
    // REPORT TITLE
    // --------------------------------------------------------

    const reportTitle = useMemo(() => {
        return formatLabel(activeReportCode);
    }, [activeReportCode]);

    // --------------------------------------------------------
    // BUILD DYNAMIC REQUEST
    // --------------------------------------------------------

    const buildRequest = useCallback((overrides = {}) => {

        const currentPage =
            overrides.page ?? page;

        const currentSize =
            overrides.size ?? size;

        const currentSortBy =
            overrides.sortBy ?? sortBy;

        const currentSortDirection =
            overrides.sortDirection ?? sortDirection;

        return {

            module: activeModule,

            reportCode: activeReportCode,

            filters: {

                keyword,

                fromDate: fromDate || null,

                toDate: toDate || null,

                status,

                filters: {
                    ...customFilters,
                },
            },

            page: currentPage,

            size: currentSize,

            sortBy: currentSortBy,

            sortDirection: currentSortDirection,

            columns: [],

        };

    }, [
        activeModule,
        activeReportCode,
        keyword,
        fromDate,
        toDate,
        status,
        customFilters,
        page,
        size,
        sortBy,
        sortDirection,
    ]);

    // --------------------------------------------------------
    // GENERATE REPORT
    // --------------------------------------------------------

    const generateReport = useCallback(async (overrides = {}) => {

        if (!activeModule || !activeReportCode) {
            toast.error("Please select a report");
            return;
        }

        if (!reportConfig) {
            toast.error("Report configuration not found");
            return;
        }

        try {

            setLoading(true);
            setError("");

            const requestBody = buildRequest(overrides);

            const response = await dispatch(
                previewReport(requestBody)
            ).unwrap();

            const result = getResponseData(response);

            setReportData(result);

            toast.success("Report generated successfully");

        } catch (err) {

            console.error("Report preview error:", err);

            const message =
                typeof err === "string"
                    ? err
                    : err?.message ||
                    err?.error ||
                    "Failed to generate report";

            setError(message);

            setReportData(null);

            toast.error(message);

        } finally {

            setLoading(false);

        }

    }, [
        activeModule,
        activeReportCode,
        reportConfig,
        buildRequest,
        dispatch,
    ]);

    // --------------------------------------------------------
    // CUSTOM FILTER CHANGE
    // --------------------------------------------------------

    const handleCustomFilterChange = (key, value) => {

        setCustomFilters((previous) => ({
            ...previous,
            [key]: value,
        }));

    };

    // --------------------------------------------------------
    // APPLY FILTERS
    // --------------------------------------------------------

    const handleApplyFilters = () => {

        setPage(0);

        generateReport({
            page: 0,
        });

    };

    // --------------------------------------------------------
    // RESET FILTERS
    // --------------------------------------------------------

    const handleResetFilters = () => {

        setKeyword("");
        setFromDate("");
        setToDate("");
        setStatus("ALL");

        setCustomFilters(
            getInitialCustomFilters(filterDefinitions)
        );

        setPage(0);

        setReportData(null);
        setError("");

    };

    // --------------------------------------------------------
    // SORTING
    // --------------------------------------------------------

    const handleSort = (column) => {

        const key = getColumnKey(column);

        if (!key) return;

        const nextDirection =
            sortBy === key && sortDirection === "ASC"
                ? "DESC"
                : "ASC";

        setSortBy(key);
        setSortDirection(nextDirection);

        setPage(0);

        generateReport({
            sortBy: key,
            sortDirection: nextDirection,
            page: 0,
        });

    };

    // --------------------------------------------------------
    // PAGINATION
    // --------------------------------------------------------

    const pageInfo = getPageInfo(reportData);

    const totalElements =
        pageInfo?.totalElements ?? 0;

    const totalPages =
        pageInfo?.totalPages ?? 0;

    const currentPage =
        pageInfo?.pageNumber ?? page;

    const handlePreviousPage = () => {

        if (currentPage <= 0) return;

        const nextPage = currentPage - 1;

        setPage(nextPage);

        generateReport({
            page: nextPage,
        });

    };

    const handleNextPage = () => {

        if (currentPage >= totalPages - 1) return;

        const nextPage = currentPage + 1;

        setPage(nextPage);

        generateReport({
            page: nextPage,
        });

    };

    const handlePageSizeChange = (value) => {

        const nextSize = Number(value);

        setSize(nextSize);
        setPage(0);

        generateReport({
            size: nextSize,
            page: 0,
        });

    };

    // --------------------------------------------------------
    // REPORT TABLE DATA
    // --------------------------------------------------------

    const columns = useMemo(() => {
        return getColumns(reportData);
    }, [reportData]);

    const rows = useMemo(() => {
        return getRows(reportData);
    }, [reportData]);

    // --------------------------------------------------------
    // SUMMARY METRICS
    // --------------------------------------------------------

    const summaryMetrics = useMemo(() => {

        const metrics = reportData?.summary?.metrics;

        if (Array.isArray(metrics)) {
            return metrics;
        }

        if (metrics && typeof metrics === "object") {
            return Object.entries(metrics).map(([key, value]) => ({
                label: formatLabel(key),
                value,
            }));
        }

        return [];

    }, [reportData]);

    // --------------------------------------------------------
    // INVALID REPORT CONFIG
    // --------------------------------------------------------

    if (!activeModule || !activeReportCode || !reportConfig) {

        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-8 text-center">

                <AlertCircle className="mb-3 h-10 w-10 text-amber-500" />

                <h2 className="text-lg font-semibold text-gray-800">
                    Report configuration not found
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                    Please provide a valid module and report code.
                </p>

            </div>
        );

    }

    // ========================================================
    // UI
    // ========================================================

    return (

        <div className="min-h-screen space-y-6 bg-gray-50 p-5">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="flex flex-wrap items-center justify-between gap-4">

                <div>

                    <div className="flex items-center gap-2">

                        <FileBarChart className="h-6 w-6 text-blue-600" />

                        <h1 className="text-2xl font-bold text-gray-800">
                            {reportTitle}
                        </h1>

                    </div>

                    <p className="mt-1 text-sm text-gray-500">
                        {activeModule.replace(/_/g, " ")} Report
                    </p>

                </div>

                <button
                    type="button"
                    onClick={() => generateReport({ page: 0 })}
                    disabled={loading}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >

                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <RefreshCw className="h-4 w-4" />
                    )}

                    Refresh Report

                </button>

            </div>

            {/* =================================================
                FILTER SECTION
            ================================================= */}

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

                <div className="mb-5 flex items-center gap-2">

                    <Filter className="h-5 w-5 text-blue-600" />

                    <h2 className="font-semibold text-gray-800">
                        Report Filters
                    </h2>

                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    {/* KEYWORD */}

                    <div>

                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Search
                        </label>

                        <div className="relative">

                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                            <input
                                type="text"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                placeholder="Search..."
                                className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                        </div>

                    </div>

                    {/* FROM DATE */}

                    <div>

                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            From Date
                        </label>

                        <div className="relative">

                            <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                        </div>

                    </div>

                    {/* TO DATE */}

                    <div>

                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            To Date
                        </label>

                        <div className="relative">

                            <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                            <input
                                type="date"
                                value={toDate}
                                min={fromDate || undefined}
                                onChange={(e) => setToDate(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                        </div>

                    </div>

                    {/* COMMON STATUS */}

                    <div>

                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Status
                        </label>

                        <CustomISelect
                            name="status"
                            value={status}
                            onChange={(selected) =>
                                setStatus(selected?.value ?? selected ?? "ALL")
                            }
                            options={[
                                { value: "ALL", label: "All" },
                                { value: "ACTIVE", label: "Active" },
                                { value: "INACTIVE", label: "Inactive" },
                            ]}
                            placeholder="Select Status"
                            width="w-full"
                            size="md"
                        />

                    </div>

                    {/* DYNAMIC CUSTOM FILTERS */}

                    {filterDefinitions.map((filter) => (

                        <div key={filter.key}>

                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                {filter.label}
                            </label>

                            {filter.type === "SELECT" ? (

                                <CustomISelect
                                    name={filter.key}
                                    value={customFilters[filter.key] ?? ""}
                                    onChange={(selected) =>
                                        handleCustomFilterChange(
                                            filter.key,
                                            selected?.value ?? selected ?? ""
                                        )
                                    }
                                    options={(filter.options || []).map((option) => ({
                                        value: option.value,
                                        label: option.label,
                                    }))}
                                    placeholder={filter.placeholder || "All"}
                                    width="w-full"
                                    size="md"
                                />

                            ) : (
                                <input
                                    type={filter.type === "NUMBER" ? "number" : "text"}
                                    value={customFilters[filter.key] ?? ""}
                                    min={filter.min}
                                    step={filter.step}
                                    placeholder={filter.placeholder || ""}
                                    onChange={(e) => {
                                        const value = e.target.value;

                                        handleCustomFilterChange(
                                            filter.key,
                                            filter.type === "NUMBER" && value !== ""
                                                ? Number(value)
                                                : value
                                        );
                                    }}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            )}

                        </div>

                    ))}

                </div>

                {/* FILTER ACTIONS */}

                <div className="mt-5 flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-4">

                    <button
                        type="button"
                        onClick={handleResetFilters}
                        disabled={loading}
                        className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                        Reset
                    </button>

                    <button
                        type="button"
                        onClick={handleApplyFilters}
                        disabled={loading}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >

                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Search className="h-4 w-4" />
                        )}

                        Generate Report

                    </button>

                </div>

            </div>

            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            {summaryMetrics.length > 0 && (

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    {summaryMetrics.map((metric, index) => (

                        <div
                            key={metric.key || metric.label || index}
                            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                        >

                            <p className="text-sm font-medium text-gray-500">
                                {metric.label || metric.name || `Metric ${index + 1}`}
                            </p>

                            <p className="mt-2 text-2xl font-bold text-gray-800">
                                {metric.value ?? metric.total ?? "-"}
                            </p>

                        </div>

                    ))}

                </div>

            )}

            {/* =================================================
                REPORT TABLE
            ================================================= */}

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 p-5">

                    <div>

                        <h2 className="font-semibold text-gray-800">
                            Report Data
                        </h2>

                        <p className="mt-1 text-xs text-gray-500">
                            {totalElements} records found
                        </p>

                    </div>

                    <div className="flex items-center gap-2">

                        <label className="text-sm text-gray-500">
                            Rows:
                        </label>

                        <CustomISelect
                            name="pageSize"
                            value={String(size)}
                            onChange={(selected) =>
                                handlePageSizeChange(selected?.value ?? selected)
                            }
                            options={[
                                { value: "10", label: "10" },
                                { value: "20", label: "20" },
                                { value: "50", label: "50" },
                                { value: "100", label: "100" },
                            ]}
                            placeholder="Rows"
                            width="w-24"
                            size="md"
                        />

                    </div>

                </div>

                {/* ERROR */}

                {error ? (

                    <div className="flex min-h-[220px] flex-col items-center justify-center p-6 text-center">

                        <AlertCircle className="mb-3 h-9 w-9 text-red-500" />

                        <p className="font-medium text-gray-700">
                            Unable to generate report
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={() => generateReport()}
                            disabled={loading}
                            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            Try Again
                        </button>

                    </div>

                ) : (

                    <ReportTable
                        columns={columns}
                        rows={rows}
                        loading={loading}
                        sortBy={sortBy}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                    />

                )}

                {/* =================================================
                    PAGINATION
                ================================================= */}

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-5 py-4">

                    <p className="text-sm text-gray-500">
                        Showing{" "}
                        {rows.length > 0 ? currentPage * size + 1 : 0}
                        {" "}to{" "}
                        {currentPage * size + rows.length}
                        {" "}of{" "}
                        {totalElements}
                        {" "}records
                    </p>

                    <div className="flex items-center gap-3">

                        <span className="text-sm text-gray-500">
                            Page {totalPages > 0 ? currentPage + 1 : 0} of {totalPages}
                        </span>

                        <button
                            type="button"
                            onClick={handlePreviousPage}
                            disabled={loading || currentPage <= 0}
                            className="rounded-lg border border-gray-300 p-2 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>

                        <button
                            type="button"
                            onClick={handleNextPage}
                            disabled={
                                loading ||
                                totalPages === 0 ||
                                currentPage >= totalPages - 1
                            }
                            className="rounded-lg border border-gray-300 p-2 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
}