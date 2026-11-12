
import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    useDispatch,
    useSelector,
} from "react-redux";

import { useNavigate } from "react-router-dom";

import {
    ArrowLeft,
    RefreshCw,
    FileText,
    FileSpreadsheet,
    FileDown,
    Printer,
    ChevronDown,
    ChevronUp,
    Loader2,
    Eye,
    Columns3,
    AlertCircle,
} from "lucide-react";

import toast from "react-hot-toast";

import {
    previewReport,
    exportReportPdf,
    exportReportExcel,
    exportReportCsv,
    exportReportPrint,
} from "../thunks/reportThunks";

import {
    setReportPage,
    setReportPageSize,
    setReportSorting,
    setReportColumns,
    clearReportError,
} from "../slices/reportSlice";

import {
    getReportBuilderConfig,
    getReportDefaultSort,
} from "../config/reportModuleConfig";

import ReportFilters from "../components/ReportFilters";
import ReportTable from "../pages/ReportTable";

/* =========================================================
   HELPERS
========================================================= */

const formatLabel = (value = "") =>
    String(value)
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/_/g, " ")
        .replace(/-/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());

/* =========================================================
   REPORT COLUMNS
========================================================= */

const getReportColumns = (preview, catalog) => {
    const data = preview?.data ?? preview;

    const columns =
        data?.columns ??
        data?.headers ??
        catalog?.columns ??
        [];

    return Array.isArray(columns) ? columns : [];
};

/* =========================================================
   REPORT ROWS

   Backend:
   rows.content[].values

   Frontend:
   [{ id: 1, displayName: "..." }]
========================================================= */

const getReportRows = (preview) => {
    const data = preview?.data ?? preview;

    const rows =
        data?.rows?.content ??
        data?.rows?.rows ??
        data?.rows ??
        data?.content ??
        [];

    if (Array.isArray(rows)) {
        return rows.map((row) => ({
            ...(row?.values ?? row ?? {}),
        }));
    }

    return [];
};

/* =========================================================
   COLUMN KEY
========================================================= */

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

/* =========================================================
   COLUMN LABEL
========================================================= */

const getColumnLabel = (column) => {
    if (typeof column === "string") {
        return formatLabel(column);
    }

    return (
        column?.label ||
        column?.title ||
        column?.displayName ||
        formatLabel(getColumnKey(column))
    );
};

/* =========================================================
   FILE DOWNLOAD HELPERS
========================================================= */

const getBlobFromResponse = (response) => {
    if (response instanceof Blob) {
        return response;
    }

    if (response?.data instanceof Blob) {
        return response.data;
    }

    if (response?.data !== undefined) {
        return new Blob([response.data]);
    }

    return new Blob([response]);
};

const downloadBlob = (
    response,
    filename,
    contentType
) => {
    const blob = getBlobFromResponse(response);

    const finalBlob =
        blob.type &&
            blob.type !== "application/octet-stream"
            ? blob
            : new Blob([blob], {
                type: contentType,
            });

    const url = window.URL.createObjectURL(finalBlob);

    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);

    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
};

/* =========================================================
   FILE NAME
========================================================= */

const getFilename = (reportCode, extension) => {
    const safeName = String(reportCode || "report")
        .replace(/[^a-zA-Z0-9-_]/g, "_");

    return `${safeName}.${extension}`;
};

/* =========================================================
   REQUEST OVERRIDE HELPER

   IMPORTANT:
   Preserves:
   - null dates
   - empty strings
   - empty arrays
   - zero values
========================================================= */

const hasOwn = (object, key) =>
    Object.prototype.hasOwnProperty.call(object, key);

const getRequestValue = (
    overrides,
    key,
    fallback
) => {
    return hasOwn(overrides, key)
        ? overrides[key]
        : fallback;
};

/* =========================================================
   REPORT VIEWER
========================================================= */

export default function ReportViewer() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    /* =====================================================
       REDUX STATE
    ===================================================== */

    const {
        selectedModule,
        selectedReportCode,
        catalog,
        preview,
        request,
        previewLoading,
        error,
        exportLoading,
        printHtml,
    } = useSelector((state) => state.reports);

    /* =====================================================
       LOCAL STATE
    ===================================================== */

    const [showColumnMenu, setShowColumnMenu] = useState(false);

    /* =====================================================
       RESOLVE MODULE AND REPORT
    ===================================================== */

    const activeModule =
        selectedModule || request?.module;

    const activeReportCode =
        selectedReportCode || request?.reportCode;

    /* =====================================================
       REPORT CONFIGURATION
    ===================================================== */

    const reportBuilderConfig = useMemo(() => {
        return getReportBuilderConfig(
            activeModule,
            activeReportCode
        );
    }, [
        activeModule,
        activeReportCode,
    ]);

    const reportFilters = useMemo(() => {
        return reportBuilderConfig?.filters || [];
    }, [reportBuilderConfig]);

    const reportDefinition = useMemo(() => {
        const reports = catalog?.reports || [];

        return (
            reports.find(
                (item) => item.code === activeReportCode
            ) || null
        );
    }, [
        catalog,
        activeReportCode,
    ]);

    const reportTitle =
        reportDefinition?.name ||
        formatLabel(activeReportCode || "Report");

    const defaultSortBy = useMemo(() => {
        const configuredSort =
            getReportDefaultSort(activeModule, activeReportCode);

        const availableColumns = reportDefinition?.columns || [];

        if (
            configuredSort &&
            availableColumns.some((column) => column.key === configuredSort)
        ) {
            return configuredSort;
        }

        return availableColumns[0]?.key || "";
    }, [activeModule, activeReportCode, reportDefinition]);

    /* =====================================================
       REPORT DEFINITION
    ===================================================== */



    /* =====================================================
       COMMON REPORT REQUEST BUILDER

       Used for:
       1. Initial preview
       2. Apply filters
       3. Refresh
       4. Sorting
       5. Pagination
       6. Page size
       7. PDF export
       8. Excel export
       9. CSV export
       10. Print export

       An explicitly supplied filters object replaces
       existing custom filters. This ensures Reset works.

       When no filters override is supplied, existing
       custom filters are preserved.
    ===================================================== */

    const buildReportRequest = (overrides = {}) => {
        const currentFilters =
            request?.filters || {};

        const hasFilterOverrides =
            hasOwn(overrides, "filters");

        const overrideFilters =
            hasFilterOverrides
                ? overrides.filters || {}
                : {};

        const currentCustomFilters =
            currentFilters.filters || {};

        const overrideCustomFilters =
            overrideFilters.filters || {};

        const customFilters =
            hasFilterOverrides
                ? { ...overrideCustomFilters }
                : { ...currentCustomFilters };

        return {
            module: activeModule,

            reportCode: activeReportCode,

            filters: {
                keyword: getRequestValue(
                    overrideFilters,
                    "keyword",
                    currentFilters.keyword ?? ""
                ),

                fromDate: getRequestValue(
                    overrideFilters,
                    "fromDate",
                    currentFilters.fromDate ?? null
                ),

                toDate: getRequestValue(
                    overrideFilters,
                    "toDate",
                    currentFilters.toDate ?? null
                ),

                status: getRequestValue(
                    overrideFilters,
                    "status",
                    currentFilters.status ?? "ALL"
                ),

                filters: customFilters,
            },

            page: getRequestValue(
                overrides,
                "page",
                request?.page ?? 0
            ),

            size: getRequestValue(
                overrides,
                "size",
                request?.size ?? 20
            ),

            sortBy: getRequestValue(
                overrides,
                "sortBy",
                request?.sortBy || defaultSortBy
            ),

            sortDirection: getRequestValue(
                overrides,
                "sortDirection",
                request?.sortDirection || "ASC"
            ),

            columns: getRequestValue(
                overrides,
                "columns",
                request?.columns || []
            ),
        };
    };

    /* =====================================================
       REPORT COLUMNS AND ROWS
    ===================================================== */

    const columns = useMemo(
        () => getReportColumns(preview, catalog),
        [preview, catalog]
    );

    const rows = useMemo(
        () => getReportRows(preview),
        [preview]
    );

    /* =====================================================
       VISIBLE COLUMNS

       Empty request.columns means all columns visible.
    ===================================================== */

    const visibleColumns = useMemo(() => {
        if (!request?.columns?.length) {
            return columns;
        }

        return columns.filter((column) =>
            request.columns.includes(
                getColumnKey(column)
            )
        );
    }, [
        columns,
        request?.columns,
    ]);

    /* =====================================================
       SUMMARY CARDS
    ===================================================== */

    const summaryCards = useMemo(() => {
        const data = preview?.data ?? preview;
        const metrics = data?.summary?.metrics;

        if (!metrics || typeof metrics !== "object") {
            return [];
        }

        return Object.entries(metrics).map(([key, value]) => ({
            label: formatLabel(key),
            value: value ?? 0,
        }));
    }, [preview]);

    /* =====================================================
       PAGINATION DATA
    ===================================================== */

    const paginationData =
        preview?.data?.rows ??
        preview?.rows ??
        preview?.data ??
        preview ??
        {};

    const totalElements =
        paginationData?.totalElements ??
        paginationData?.totalRecords ??
        paginationData?.totalItems ??
        rows.length;

    const pageSize = request?.size ?? 20;
    const currentPage = request?.page ?? 0;

    const totalPages =
        paginationData?.totalPages ??
        Math.ceil(totalElements / pageSize);
    /* =====================================================
       INITIAL REPORT PREVIEW

       Load whenever the selected module/report changes.

       Reset sorting to the report-specific default.
       Filter typing does not automatically call the API.
    ===================================================== */

    useEffect(() => {
        if (!activeModule || !activeReportCode) {
            return;
        }

        dispatch(
            setReportSorting({
                sortBy: defaultSortBy,
                sortDirection: "ASC",
            })
        );

        dispatch(
            previewReport(
                buildReportRequest({
                    sortBy: defaultSortBy,
                    sortDirection: "ASC",
                })
            )
        );

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        dispatch,
        activeModule,
        activeReportCode,
    ]);

    /* =====================================================
       INVALID REPORT
    ===================================================== */

    useEffect(() => {
        if (!activeModule || !activeReportCode) {
            navigate("/reports", {
                replace: true,
            });
        }
    }, [
        activeModule,
        activeReportCode,
        navigate,
    ]);

    /* =====================================================
       FILTER APPLY
    ===================================================== */

    const handleApplyFilters = (filters) => {
        dispatch(setReportPage(0));

        dispatch(
            previewReport(
                buildReportRequest({
                    filters,
                    page: 0,
                })
            )
        );
    };

    /* =====================================================
       REFRESH
    ===================================================== */

    const handleRefresh = () => {
        dispatch(clearReportError());

        dispatch(
            previewReport(
                buildReportRequest()
            )
        );
    };

    /* =====================================================
       SORTING
    ===================================================== */

    const handleSort = (column) => {
        const sortBy = getColumnKey(column);

        if (!sortBy) {
            return;
        }

        const sortDirection =
            request?.sortBy === sortBy &&
                request?.sortDirection === "ASC"
                ? "DESC"
                : "ASC";

        dispatch(
            setReportSorting({
                sortBy,
                sortDirection,
            })
        );

        dispatch(setReportPage(0));

        dispatch(
            previewReport(
                buildReportRequest({
                    sortBy,
                    sortDirection,
                    page: 0,
                })
            )
        );
    };

    /* =====================================================
       COLUMN SELECTION
    ===================================================== */

    const handleColumnToggle = (columnKey) => {
        if (!columnKey) {
            return;
        }

        const allColumnKeys = columns
            .map(getColumnKey)
            .filter(Boolean);

        // Empty array means all columns are visible.
        const currentColumns = request?.columns?.length
            ? request.columns
            : allColumnKeys;

        const nextColumns = currentColumns.includes(columnKey)
            ? currentColumns.filter(
                (item) => item !== columnKey
            )
            : [...currentColumns, columnKey];

        if (nextColumns.length === 0) {
            toast.error(
                "At least one column must remain visible."
            );

            return;
        }

        // Empty array represents all columns selected.
        const finalColumns =
            nextColumns.length === allColumnKeys.length
                ? []
                : nextColumns;

        dispatch(setReportColumns(finalColumns));
    };

    const handleSelectAllColumns = () => {
        dispatch(setReportColumns([]));
    };

    const handleClearColumns = () => {
        const firstColumn = columns
            .map(getColumnKey)
            .filter(Boolean)[0];

        if (!firstColumn) {
            return;
        }

        dispatch(setReportColumns([firstColumn]));
    };

    /* =====================================================
       PAGINATION
    ===================================================== */

    const handlePageChange = (page) => {
        if (
            page < 0 ||
            page >= totalPages ||
            previewLoading
        ) {
            return;
        }

        dispatch(setReportPage(page));

        dispatch(
            previewReport(
                buildReportRequest({
                    page,
                })
            )
        );
    };

    const handlePageSizeChange = (event) => {
        const size = Number(event.target.value);

        dispatch(setReportPageSize(size));

        dispatch(
            previewReport(
                buildReportRequest({
                    size,
                    page: 0,
                })
            )
        );
    };

    /* =====================================================
       EXPORT REQUEST
    ===================================================== */

    const getExportRequest = () => {
        return buildReportRequest();
    };

    /* =====================================================
       EXPORT PDF
    ===================================================== */

    const handleExportPdf = async () => {
        try {
            const response = await dispatch(
                exportReportPdf(getExportRequest())
            ).unwrap();

            downloadBlob(
                response,
                getFilename(activeReportCode, "pdf"),
                "application/pdf"
            );

            toast.success("PDF exported successfully.");
        } catch (error) {
            toast.error(
                typeof error === "string"
                    ? error
                    : "Failed to export PDF."
            );
        }
    };

    /* =====================================================
       EXPORT EXCEL
    ===================================================== */

    const handleExportExcel = async () => {
        try {
            const response = await dispatch(
                exportReportExcel(getExportRequest())
            ).unwrap();

            downloadBlob(
                response,
                getFilename(activeReportCode, "xlsx"),
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );

            toast.success("Excel exported successfully.");
        } catch (error) {
            toast.error(
                typeof error === "string"
                    ? error
                    : "Failed to export Excel."
            );
        }
    };

    /* =====================================================
       EXPORT CSV
    ===================================================== */

    const handleExportCsv = async () => {
        try {
            const response = await dispatch(
                exportReportCsv(getExportRequest())
            ).unwrap();

            downloadBlob(
                response,
                getFilename(activeReportCode, "csv"),
                "text/csv;charset=utf-8"
            );

            toast.success("CSV exported successfully.");
        } catch (error) {
            toast.error(
                typeof error === "string"
                    ? error
                    : "Failed to export CSV."
            );
        }
    };

    /* =====================================================
       PRINT REPORT
    ===================================================== */

    const handlePrint = async () => {
        const printWindow = window.open(
            "",
            "_blank",
            "width=1100,height=800"
        );

        if (!printWindow) {
            toast.error(
                "Please allow pop-ups to print the report."
            );

            return;
        }

        try {
            const response = await dispatch(
                exportReportPrint(getExportRequest())
            ).unwrap();

            const html =
                typeof response === "string"
                    ? response
                    : response?.data ||
                    response?.html ||
                    printHtml;

            if (!html || typeof html !== "string") {
                printWindow.close();

                toast.error("Printable report is empty.");

                return;
            }

            printWindow.onload = () => {
                printWindow.focus();
                printWindow.print();
            };

            printWindow.document.open();
            printWindow.document.write(html);
            printWindow.document.close();

        } catch (error) {
            printWindow.close();

            toast.error(
                typeof error === "string"
                    ? error
                    : "Failed to prepare printable report."
            );
        }
    };

    /* =====================================================
       BACK
    ===================================================== */

    const handleBack = () => {
        navigate("/reports");
    };

    /* =====================================================
       INVALID STATE
    ===================================================== */

    if (!activeModule || !activeReportCode) {
        return null;
    }

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div className="min-h-full space-y-5 bg-slate-50 p-4 sm:p-6">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

                <div className="flex items-start gap-3">

                    <button
                        type="button"
                        onClick={handleBack}
                        className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
                        title="Back to reports"
                    >
                        <ArrowLeft size={18} />
                    </button>

                    <div>
                        <div className="flex flex-wrap items-center gap-2">

                            <h1 className="text-xl font-bold text-slate-800">
                                {reportTitle}
                            </h1>

                            <span className="rounded-md bg-blue-50 px-2 py-1 text-[10px] font-semibold uppercase text-blue-600">
                                {formatLabel(activeModule)}
                            </span>

                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                            {reportDefinition?.description ||
                                "View, filter and export report information."}
                        </p>
                    </div>

                </div>

                <div className="flex flex-wrap items-center gap-2">

                    <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={previewLoading}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                        <RefreshCw
                            size={15}
                            className={
                                previewLoading
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        Refresh
                    </button>

                    <button
                        type="button"
                        onClick={handlePrint}
                        disabled={exportLoading?.print}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                        {exportLoading?.print ? (
                            <Loader2
                                size={15}
                                className="animate-spin"
                            />
                        ) : (
                            <Printer size={15} />
                        )}

                        Print
                    </button>

                </div>

            </div>

            {/* =================================================
                EXPORT TOOLBAR
            ================================================= */}

            <div className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center">

                <div className="flex items-center gap-2">

                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <FileText size={19} />
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-slate-700">
                            Report Actions
                        </p>

                        <p className="text-xs text-slate-400">
                            Export the current report data
                        </p>
                    </div>

                </div>

                <div className="flex flex-wrap gap-2">

                    <button
                        type="button"
                        onClick={handleExportPdf}
                        disabled={exportLoading?.pdf}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                    >
                        {exportLoading?.pdf ? (
                            <Loader2
                                size={14}
                                className="animate-spin"
                            />
                        ) : (
                            <FileDown size={14} />
                        )}

                        PDF
                    </button>

                    <button
                        type="button"
                        onClick={handleExportExcel}
                        disabled={exportLoading?.excel}
                        className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                    >
                        {exportLoading?.excel ? (
                            <Loader2
                                size={14}
                                className="animate-spin"
                            />
                        ) : (
                            <FileSpreadsheet size={14} />
                        )}

                        Excel
                    </button>

                    <button
                        type="button"
                        onClick={handleExportCsv}
                        disabled={exportLoading?.csv}
                        className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-100 disabled:opacity-50"
                    >
                        {exportLoading?.csv ? (
                            <Loader2
                                size={14}
                                className="animate-spin"
                            />
                        ) : (
                            <FileText size={14} />
                        )}

                        CSV
                    </button>

                </div>

            </div>

            {/* =================================================
                REPORT FILTERS
            ================================================= */}

            <ReportFilters
                filters={reportFilters}
                loading={previewLoading}
                onApply={handleApplyFilters}
                defaultExpanded={true}
                showKeyword={true}
                showDateRange={true}
                showStatus={true}
            />

            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            {summaryCards.length > 0 && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                    {summaryCards.map((item, index) => {

                        const label =
                            item.label ||
                            item.title ||
                            item.name ||
                            `Summary ${index + 1}`;

                        const value =
                            item.value ??
                            item.amount ??
                            item.count ??
                            0;

                        return (
                            <div
                                key={`${label}-${index}`}
                                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                            >
                                <p className="text-xs font-medium text-slate-500">
                                    {label}
                                </p>

                                <h3 className="mt-2 text-2xl font-bold text-slate-800">
                                    {value}
                                </h3>
                            </div>
                        );
                    })}

                </div>
            )}

            {/* =================================================
                REPORT TABLE SECTION
            ================================================= */}

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                {/* TABLE HEADER */}

                <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center">

                    <div>
                        <h2 className="text-sm font-bold text-slate-800">
                            Report Results
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            {totalElements} records found
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">

                        {/* COLUMN SELECTOR */}

                        <div className="relative">

                            <button
                                type="button"
                                onClick={() =>
                                    setShowColumnMenu((prev) => !prev)
                                }
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                            >
                                <Columns3 size={15} />

                                Columns

                                <ChevronDown size={13} />
                            </button>

                            {showColumnMenu && (
                                <div className="absolute right-0 top-full z-30 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">

                                    <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">

                                        <span className="text-xs font-bold text-slate-700">
                                            Visible Columns
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowColumnMenu(false)
                                            }
                                            className="text-xs text-slate-400 hover:text-slate-700"
                                        >
                                            Close
                                        </button>

                                    </div>

                                    <div className="mb-3 flex gap-3">

                                        <button
                                            type="button"
                                            onClick={handleSelectAllColumns}
                                            className="text-[11px] font-medium text-blue-600"
                                        >
                                            Select All
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleClearColumns}
                                            className="text-[11px] font-medium text-slate-500"
                                        >
                                            Reset
                                        </button>

                                    </div>

                                    <div className="max-h-56 space-y-2 overflow-y-auto">

                                        {columns.map((column) => {
                                            const key = getColumnKey(column);

                                            if (!key) {
                                                return null;
                                            }

                                            return (
                                                <label
                                                    key={key}
                                                    className="flex cursor-pointer items-center gap-2 text-xs text-slate-600"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            !request?.columns?.length ||
                                                            request.columns.includes(key)
                                                        }
                                                        onChange={() =>
                                                            handleColumnToggle(key)
                                                        }
                                                        className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                    />

                                                    {getColumnLabel(column)}
                                                </label>
                                            );
                                        })}

                                    </div>

                                </div>
                            )}

                        </div>

                        <span className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-500">
                            {visibleColumns.length} columns
                        </span>

                    </div>

                </div>

                {/* TABLE CONTENT */}

                {error ? (

                    <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">

                        <AlertCircle
                            size={32}
                            className="mb-3 text-red-400"
                        />

                        <p className="text-sm font-semibold text-slate-700">
                            Unable to load report
                        </p>

                        <p className="mt-1 max-w-md text-xs text-slate-500">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={handleRefresh}
                            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                        >
                            Try Again
                        </button>

                    </div>

                ) : (

                    <ReportTable
                        module={activeModule}
                        reportCode={activeReportCode}
                        columns={visibleColumns}
                        rows={rows}
                        loading={previewLoading}
                        sortBy={request?.sortBy}
                        sortDirection={request?.sortDirection}
                        onSort={handleSort}
                    />

                )}

                {/* =================================================
                    PAGINATION
                ================================================= */}

                <div className="flex flex-col justify-between gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center">

                    <div className="flex items-center gap-2 text-xs text-slate-500">

                        <span>Rows per page</span>

                        <select
                            value={pageSize}
                            onChange={handlePageSizeChange}
                            disabled={previewLoading}
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-blue-400 disabled:opacity-50"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>

                        <span>
                            {totalElements > 0
                                ? `${currentPage * pageSize + 1}-${Math.min(
                                    (currentPage + 1) * pageSize,
                                    totalElements
                                )} of ${totalElements}`
                                : "0 records"}
                        </span>

                    </div>

                    <div className="flex items-center gap-2">

                        <button
                            type="button"
                            disabled={
                                currentPage === 0 ||
                                previewLoading
                            }
                            onClick={() =>
                                handlePageChange(currentPage - 1)
                            }
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Previous
                        </button>

                        <span className="px-2 text-xs font-medium text-slate-600">
                            Page {totalPages === 0 ? 0 : currentPage + 1} of{" "}
                            {totalPages}
                        </span>

                        <button
                            type="button"
                            disabled={
                                currentPage + 1 >= totalPages ||
                                previewLoading
                            }
                            onClick={() =>
                                handlePageChange(currentPage + 1)
                            }
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Next
                        </button>

                    </div>

                </div>

            </section>

        </div>
    );
}
