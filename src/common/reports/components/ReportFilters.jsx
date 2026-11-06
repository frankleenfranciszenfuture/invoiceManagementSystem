
import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
    Filter,
    Search,
    CalendarDays,
    RotateCcw,
    ChevronDown,
    ChevronUp,
    SlidersHorizontal,
    X,
} from "lucide-react";

import {
    setReportFilter,
    resetReportFilters,
} from "../slices/reportSlice";
import CustomISelect from "../../custom/CustomISelect";

/* =========================================================
   HELPERS
   ========================================================= */

const formatLabel = (value = "") =>
    String(value)
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/_/g, " ")
        .replace(/-/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());

const getFilterName = (filter) =>
    filter?.name ||
    filter?.field ||
    filter?.key ||
    filter?.fieldName ||
    "";

const getFilterOptions = (filter) =>
    Array.isArray(filter?.options) ? filter.options : [];

const normalizeFilterType = (type) =>
    String(type || "TEXT").toUpperCase();

/* =========================================================
   FILTER INPUT
   ========================================================= */

const FilterInput = ({
    filter,
    value,
    onChange,
}) => {
    const type = normalizeFilterType(filter.type);

    const commonClass =
        "w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100";

    if (type === "SELECT" || type === "DROPDOWN") {
        return (
            <CustomISelect
                name={filter.name}
                value={value ?? ""}
                onChange={(selected) =>
                    onChange(selected?.value ?? selected ?? "")
                }
                options={[
                    {
                        value: "",
                        label: filter.placeholder || "All",
                    },
                    ...getFilterOptions(filter).map((option) => ({
                        value:
                            typeof option === "object"
                                ? option.value
                                : option,
                        label:
                            typeof option === "object"
                                ? option.label
                                : formatLabel(option),
                    })),
                ]}
                placeholder={filter.placeholder || "All"}
                width="100%"
                size="md"
            />
        );

    }

    if (type === "MULTI_SELECT" || type === "MULTISELECT") {
        const selectedValues = Array.isArray(value) ? value : [];

        return (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="max-h-36 space-y-2 overflow-y-auto">
                    {getFilterOptions(filter).map((option, index) => {
                        const optionValue =
                            typeof option === "object"
                                ? option.value
                                : option;

                        const optionLabel =
                            typeof option === "object"
                                ? option.label
                                : formatLabel(option);

                        const checked = selectedValues.includes(
                            optionValue
                        );

                        return (
                            <label
                                key={`${optionValue}-${index}`}
                                className="flex cursor-pointer items-center gap-2 text-xs text-slate-600"
                            >
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(event) => {
                                        const nextValues = event.target.checked
                                            ? [...selectedValues, optionValue]
                                            : selectedValues.filter(
                                                (item) => item !== optionValue
                                            );

                                        onChange(nextValues);
                                    }}
                                    className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />

                                {optionLabel}
                            </label>
                        );
                    })}
                </div>
            </div>
        );
    }

    if (type === "BOOLEAN" || type === "CHECKBOX") {
        return (
            <label className="flex min-h-[42px] cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3">
                <input
                    type="checkbox"
                    checked={Boolean(value)}
                    onChange={(event) => onChange(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />

                <span className="text-sm text-slate-600">
                    {filter.checkboxLabel || filter.placeholder || "Yes"}
                </span>
            </label>
        );
    }

    if (type === "DATE") {
        return (
            <div className="relative">
                <CalendarDays
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                    type="date"
                    value={value || ""}
                    onChange={(event) => onChange(event.target.value || null)}
                    className={`${commonClass} pl-9`}
                />
            </div>
        );
    }

    if (type === "NUMBER" || type === "DECIMAL" || type === "INTEGER") {
        return (
            <input
                type="number"
                value={value ?? ""}
                min={filter.min}
                max={filter.max}
                step={filter.step || "any"}
                placeholder={filter.placeholder || "Enter value"}
                onChange={(event) =>
                    onChange(
                        event.target.value === ""
                            ? ""
                            : Number(event.target.value)
                    )
                }
                className={commonClass}
            />
        );
    }

    if (type === "DATE_RANGE") {
        const rangeValue =
            value && typeof value === "object"
                ? value
                : { fromDate: "", toDate: "" };

        return (
            <div className="grid grid-cols-2 gap-2">
                <input
                    type="date"
                    value={rangeValue.fromDate || ""}
                    onChange={(event) =>
                        onChange({
                            ...rangeValue,
                            fromDate: event.target.value,
                        })
                    }
                    className={commonClass}
                />

                <input
                    type="date"
                    value={rangeValue.toDate || ""}
                    min={rangeValue.fromDate || undefined}
                    onChange={(event) =>
                        onChange({
                            ...rangeValue,
                            toDate: event.target.value,
                        })
                    }
                    className={commonClass}
                />
            </div>
        );
    }

    return (
        <input
            type="text"
            value={value ?? ""}
            placeholder={filter.placeholder || "Enter value"}
            maxLength={filter.maxLength}
            onChange={(event) => onChange(event.target.value)}
            className={commonClass}
        />
    );
};

/* =========================================================
   REPORT FILTERS
   ========================================================= */

export default function ReportFilters({
    filters = [],
    onApply,
    loading = false,
    defaultExpanded = true,
    showKeyword = true,
    showDateRange = true,
    showStatus = true,
}) {
    const dispatch = useDispatch();

    const reportFilters = useSelector(
        (state) => state.reports?.request?.filters
    );

    const [expanded, setExpanded] = useState(defaultExpanded);

    const [draftFilters, setDraftFilters] = useState(null);

    const currentFilters = useMemo(
        () => ({
            keyword: "",
            fromDate: null,
            toDate: null,
            status: "ALL",
            filters: {},
            ...(reportFilters || {}),
            filters: {
                ...(reportFilters?.filters || {}),
            },
        }),
        [reportFilters]
    );

    const activeFiltersCount = useMemo(() => {
        let count = 0;

        if (currentFilters.keyword) count++;
        if (currentFilters.fromDate) count++;
        if (currentFilters.toDate) count++;

        if (
            currentFilters.status &&
            currentFilters.status !== "ALL"
        ) {
            count++;
        }

        count += Object.values(currentFilters.filters || {}).filter(
            (value) =>
                value !== "" &&
                value !== null &&
                value !== undefined &&
                (!Array.isArray(value) || value.length > 0)
        ).length;

        return count;
    }, [currentFilters]);

    const updateFilter = (name, value) => {
        if (
            name === "keyword" ||
            name === "fromDate" ||
            name === "toDate" ||
            name === "status"
        ) {
            dispatch(
                setReportFilter({
                    name,
                    value,
                })
            );
        } else {
            dispatch(
                setReportFilter({
                    name,
                    value,
                })
            );
        }
    };

    const handleReset = () => {
        dispatch(resetReportFilters());

        if (onApply) {
            onApply({
                keyword: "",
                fromDate: null,
                toDate: null,
                status: "ALL",
                filters: {},
            });
        }
    };

    const handleApply = () => {
        if (
            currentFilters.fromDate &&
            currentFilters.toDate &&
            currentFilters.fromDate > currentFilters.toDate
        ) {
            return;
        }

        if (onApply) {
            onApply(currentFilters);
        }
    };

    const hasInvalidDateRange =
        currentFilters.fromDate &&
        currentFilters.toDate &&
        currentFilters.fromDate > currentFilters.toDate;

    return (
        <section className="overflow-visible rounded-xl border border-slate-200 bg-white shadow-sm">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

                <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <SlidersHorizontal size={17} />
                    </div>

                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-sm font-bold text-slate-800">
                                Report Filters
                            </h2>

                            {activeFiltersCount > 0 && (
                                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                                    {activeFiltersCount} Active
                                </span>
                            )}
                        </div>

                        <p className="mt-0.5 text-xs text-slate-400">
                            Refine your report results
                        </p>
                    </div>

                </div>

                <div className="flex items-center gap-2">

                    <button
                        type="button"
                        onClick={handleReset}
                        disabled={loading || activeFiltersCount === 0}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <RotateCcw size={13} />
                        Reset
                    </button>

                    <button
                        type="button"
                        onClick={() => setExpanded((prev) => !prev)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
                        aria-label={expanded ? "Collapse filters" : "Expand filters"}
                    >
                        {expanded ? (
                            <ChevronUp size={17} />
                        ) : (
                            <ChevronDown size={17} />
                        )}
                    </button>

                </div>

            </div>

            {/* =================================================
                FILTER CONTENT
            ================================================= */}

            {expanded && (
                <div className="space-y-5 p-5">

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                        {/* KEYWORD */}

                        {showKeyword && (
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                                    Search
                                </label>

                                <div className="relative">
                                    <Search
                                        size={15}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        type="text"
                                        value={currentFilters.keyword || ""}
                                        placeholder="Search records..."
                                        onChange={(event) =>
                                            updateFilter(
                                                "keyword",
                                                event.target.value
                                            )
                                        }
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                            </div>
                        )}

                        {/* FROM DATE */}

                        {showDateRange && (
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                                    From Date
                                </label>

                                <div className="relative">
                                    <CalendarDays
                                        size={15}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        type="date"
                                        value={currentFilters.fromDate || ""}
                                        max={currentFilters.toDate || undefined}
                                        onChange={(event) =>
                                            updateFilter(
                                                "fromDate",
                                                event.target.value || null
                                            )
                                        }
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                            </div>
                        )}

                        {/* TO DATE */}

                        {showDateRange && (
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                                    To Date
                                </label>

                                <div className="relative">
                                    <CalendarDays
                                        size={15}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        type="date"
                                        value={currentFilters.toDate || ""}
                                        min={currentFilters.fromDate || undefined}
                                        onChange={(event) =>
                                            updateFilter(
                                                "toDate",
                                                event.target.value || null
                                            )
                                        }
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                            </div>
                        )}

                        {/* STATUS */}

                        {showStatus && (
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                                    Status
                                </label>
                                <CustomISelect
                                    name="status"
                                    value={currentFilters.status || "ALL"}
                                    onChange={(selected) =>
                                        updateFilter(
                                            "status",
                                            selected?.value ?? selected ?? "ALL"
                                        )
                                    }
                                    options={[
                                        { value: "ALL", label: "All Status" },
                                        { value: "ACTIVE", label: "Active" },
                                        { value: "INACTIVE", label: "Inactive" },
                                        { value: "PENDING", label: "Pending" },
                                        { value: "COMPLETED", label: "Completed" },
                                        { value: "CANCELLED", label: "Cancelled" },
                                        { value: "PAID", label: "Paid" },
                                        { value: "PARTIAL", label: "Partial" },
                                        { value: "UNPAID", label: "Unpaid" },
                                    ]}
                                    placeholder="Select Status"
                                    width="100%"
                                    size="md"
                                />
                            </div>
                        )}

                        {/* DYNAMIC FILTERS */}

                        {filters.map((filter) => {
                            const name = getFilterName(filter);

                            if (!name) return null;

                            const value =
                                currentFilters.filters?.[name] ?? "";

                            return (
                                <div key={name}>
                                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                                        {filter.label ||
                                            filter.displayName ||
                                            formatLabel(name)}

                                        {filter.required && (
                                            <span className="ml-1 text-red-500">
                                                *
                                            </span>
                                        )}
                                    </label>

                                    <FilterInput
                                        filter={filter}
                                        value={value}
                                        onChange={(nextValue) =>
                                            updateFilter(name, nextValue)
                                        }
                                    />

                                    {filter.description && (
                                        <p className="mt-1 text-[11px] text-slate-400">
                                            {filter.description}
                                        </p>
                                    )}
                                </div>
                            );
                        })}

                    </div>

                    {/* DATE VALIDATION */}

                    {hasInvalidDateRange && (
                        <p className="text-xs font-medium text-red-500">
                            From date cannot be later than the to date.
                        </p>
                    )}

                    {/* ACTIONS */}

                    <div className="flex flex-col justify-between gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center">

                        <p className="text-xs text-slate-400">
                            {filters.length} additional report filters available
                        </p>

                        <button
                            type="button"
                            onClick={handleApply}
                            disabled={loading || Boolean(hasInvalidDateRange)}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Applying...
                                </>
                            ) : (
                                <>
                                    <Filter size={14} />
                                    Apply Filters
                                </>
                            )}
                        </button>

                    </div>

                </div>
            )}

        </section>
    );
}
