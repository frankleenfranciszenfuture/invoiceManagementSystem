
import React, { useEffect, useMemo, useState } from "react";

import {
    Search,
    CalendarDays,
    RotateCcw,
    FileSearch,
    Loader2,
} from "lucide-react";

import {
    getReportBuilderConfig,
} from "../config/reportModuleConfig";

export default function RegisterCreate({
    module,
    reportCode,
    title,
    onGenerate,
}) {
    /*
     * ============================================================
     * GET CONFIGURATION
     * ============================================================
     */

    const config = useMemo(
        () => getReportBuilderConfig(module, reportCode),
        [module, reportCode]
    );

    const filterDefinitions = config?.filters || [];

    const defaultSortBy = config?.defaultSortBy || "createdAt";

    /*
     * ============================================================
     * GENERATE INITIAL DYNAMIC FILTERS
     * ============================================================
     */

    const initialFilters = useMemo(() => {
        return Object.fromEntries(
            filterDefinitions.map((field) => [
                field.key,
                field.defaultValue ?? "",
            ])
        );
    }, [filterDefinitions]);

    /*
     * ============================================================
     * COMMON STATES
     * ============================================================
     */

    const [keyword, setKeyword] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [status, setStatus] = useState("ALL");

    const [filters, setFilters] = useState(initialFilters);

    const [page, setPage] = useState(0);
    const [size, setSize] = useState(20);

    const [sortBy, setSortBy] = useState(defaultSortBy);
    const [sortDirection, setSortDirection] = useState("DESC");

    // Columns will be populated by your future drag-and-drop column builder.
    const [columns, setColumns] = useState([]);

    const [loading, setLoading] = useState(false);

    /*
     * ============================================================
     * RESET WHEN REPORT CHANGES
     * ============================================================
     */

    useEffect(() => {
        setKeyword("");
        setFromDate("");
        setToDate("");
        setStatus("ALL");

        setFilters(initialFilters);

        setPage(0);
        setSize(20);

        setSortBy(defaultSortBy);
        setSortDirection("DESC");

        setColumns([]);
    }, [module, reportCode, initialFilters, defaultSortBy]);

    /*
     * ============================================================
     * INPUT STYLES
     * ============================================================
     */

    const inputClass =
        "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

    /*
     * ============================================================
     * COMMON HANDLERS
     * ============================================================
     */

    const handleFilterChange = (key, value) => {
        setFilters((previous) => ({
            ...previous,
            [key]: value,
        }));
    };

    /*
     * ============================================================
     * DYNAMIC FILTER RENDERING
     * ============================================================
     */

    const renderDynamicFilter = (field) => {
        const value = filters[field.key] ?? "";

        const fieldType = field.type?.toUpperCase() || "TEXT";

        // SELECT
        if (fieldType === "SELECT") {
            return (
                <select
                    value={value}
                    onChange={(e) =>
                        handleFilterChange(field.key, e.target.value)
                    }
                    className={inputClass}
                >
                    <option value="">
                        {field.placeholder || "All"}
                    </option>

                    {field.options?.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                        >
                            {option.label}
                        </option>
                    ))}
                </select>
            );
        }

        // TEXT / NUMBER / DATE
        return (
            <input
                type={
                    fieldType === "NUMBER"
                        ? "number"
                        : fieldType === "DATE"
                            ? "date"
                            : "text"
                }
                value={value}
                placeholder={field.placeholder || ""}
                min={field.min}
                max={field.max}
                step={field.step}
                onChange={(e) =>
                    handleFilterChange(field.key, e.target.value)
                }
                className={inputClass}
            />
        );
    };

    /*
     * ============================================================
     * BUILD COMMON REPORT REQUEST
     * ============================================================
     */

    const buildRequest = () => {
        return {
            module: module?.toUpperCase(),
            reportCode,

            filters: {
                keyword,
                fromDate: fromDate || null,
                toDate: toDate || null,
                status,

                // Dynamic filters from reportModuleConfig
                filters: {
                    ...filters,
                },
            },

            page,
            size,
            sortBy,
            sortDirection,

            // Used later by drag-and-drop column selection
            columns: [...columns],
        };
    };

    /*
     * ============================================================
     * GENERATE REPORT
     * ============================================================
     */

    const handleGenerate = async () => {
        if (!config) {
            console.error(
                `Report configuration not found: ${module}/${reportCode}`
            );
            return;
        }

        if (!onGenerate) {
            console.error("onGenerate callback is required.");
            return;
        }

        try {
            setLoading(true);

            const request = buildRequest();

            console.log("REPORT REQUEST:", request);

            await onGenerate(request);
        } finally {
            setLoading(false);
        }
    };

    /*
     * ============================================================
     * RESET
     * ============================================================
     */

    const handleReset = () => {
        setKeyword("");
        setFromDate("");
        setToDate("");
        setStatus("ALL");

        setFilters(initialFilters);

        setPage(0);
        setSize(20);

        setSortBy(defaultSortBy);
        setSortDirection("DESC");

        setColumns([]);
    };

    /*
     * ============================================================
     * CONFIGURATION VALIDATION
     * ============================================================
     */

    if (!config) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                <h3 className="font-semibold text-red-700">
                    Report configuration not found
                </h3>

                <p className="mt-1 text-sm text-red-600">
                    No configuration exists for {module} / {reportCode}.
                    Please check reportModuleConfig.js.
                </p>
            </div>
        );
    }

    /*
     * ============================================================
     * UI
     * ============================================================
     */

    return (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">

            {/* Header */}

            <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4">

                <div className="rounded-lg bg-blue-50 p-2">
                    <FileSearch className="h-5 w-5 text-blue-600" />
                </div>

                <div>
                    <h2 className="text-base font-semibold text-gray-800">
                        {title || reportCode.replaceAll("_", " ")}
                    </h2>

                    <p className="text-xs text-gray-500">
                        Configure filters to generate your report
                    </p>
                </div>

            </div>

            <div className="space-y-6 p-5">

                {/* ==================================================
                    COMMON FILTERS
                ================================================== */}

                <section>

                    <h3 className="mb-3 text-sm font-semibold text-gray-700">
                        General Filters
                    </h3>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

                        {/* Keyword */}

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-600">
                                Keyword
                            </label>

                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

                                <input
                                    value={keyword}
                                    onChange={(e) =>
                                        setKeyword(e.target.value)
                                    }
                                    placeholder="Search..."
                                    className={`${inputClass} pl-9`}
                                />
                            </div>
                        </div>

                        {/* From Date */}

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-600">
                                From Date
                            </label>

                            <div className="relative">
                                <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) =>
                                        setFromDate(e.target.value)
                                    }
                                    className={`${inputClass} pl-9`}
                                />
                            </div>
                        </div>

                        {/* To Date */}

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-600">
                                To Date
                            </label>

                            <div className="relative">
                                <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) =>
                                        setToDate(e.target.value)
                                    }
                                    className={`${inputClass} pl-9`}
                                />
                            </div>
                        </div>

                        {/* Common Status */}

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-600">
                                Status
                            </label>

                            <select
                                value={status}
                                onChange={(e) =>
                                    setStatus(e.target.value)
                                }
                                className={inputClass}
                            >
                                <option value="ALL">All Status</option>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                        </div>

                        {/* DYNAMIC CONFIG FILTERS */}

                        {filterDefinitions.map((field) => (
                            <div key={field.key}>

                                <label className="mb-1.5 block text-sm font-medium text-gray-600">
                                    {field.label}
                                </label>

                                {renderDynamicFilter(field)}

                            </div>
                        ))}

                    </div>

                </section>

                {/* ==================================================
                    DISPLAY SETTINGS
                ================================================== */}

                <section>

                    <h3 className="mb-3 text-sm font-semibold text-gray-700">
                        Display Settings
                    </h3>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

                        {/* Page Size */}

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-600">
                                Records Per Page
                            </label>

                            <select
                                value={size}
                                onChange={(e) => setSize(Number(e.target.value))}
                                className={inputClass}
                            >
                                {[10, 20, 50, 100].map((value) => (
                                    <option key={value} value={value}>
                                        {value}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sort By */}

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-600">
                                Sort By
                            </label>

                            <input
                                type="text"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className={inputClass}
                                placeholder="Sort property"
                            />
                        </div>

                        {/* Sort Direction */}

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-600">
                                Sort Direction
                            </label>

                            <select
                                value={sortDirection}
                                onChange={(e) =>
                                    setSortDirection(e.target.value)
                                }
                                className={inputClass}
                            >
                                <option value="DESC">Descending</option>
                                <option value="ASC">Ascending</option>
                            </select>
                        </div>

                    </div>

                </section>

                {/* ==================================================
                    FUTURE DRAG AND DROP COLUMNS
                ================================================== */}

                <section>

                    <h3 className="mb-2 text-sm font-semibold text-gray-700">
                        Report Columns
                    </h3>

                    <p className="text-sm text-gray-500">
                        Columns will be configured using the report
                        column drag-and-drop builder.
                    </p>

                </section>

                {/* ==================================================
                    ACTIONS
                ================================================== */}

                <div className="flex flex-wrap justify-end gap-3 border-t border-gray-200 pt-4">

                    <button
                        type="button"
                        onClick={handleReset}
                        disabled={loading}
                        className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    >
                        <RotateCcw size={16} />
                        Reset
                    </button>

                    <button
                        type="button"
                        onClick={handleGenerate}
                        disabled={loading}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                        {loading ? (
                            <Loader2
                                size={16}
                                className="animate-spin"
                            />
                        ) : (
                            <FileSearch size={16} />
                        )}

                        {loading
                            ? "Generating..."
                            : "Generate Report"}
                    </button>

                </div>

            </div>
        </div>
    );
}
