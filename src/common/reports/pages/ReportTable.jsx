
import React, { useMemo } from "react";

import {
    FileSearch,
    ArrowUpDown,
} from "lucide-react";

/* =========================================================
   HELPERS
   ========================================================= */

const formatValue = (value, dataType) => {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "—";
    }

    if (
        typeof value === "boolean" ||
        dataType === "BOOLEAN"
    ) {
        return value ? "Yes" : "No";
    }

    if (
        dataType === "DATETIME" ||
        dataType === "DATE"
    ) {
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return String(value);
        }

        return dataType === "DATE"
            ? date.toLocaleDateString("en-IN")
            : date.toLocaleString("en-IN");
    }

    if (
        dataType === "NUMBER" ||
        dataType === "DECIMAL" ||
        dataType === "CURRENCY"
    ) {
        const number = Number(value);

        if (!Number.isNaN(number)) {
            return number.toLocaleString("en-IN", {
                maximumFractionDigits: 2,
            });
        }
    }

    if (typeof value === "object") {
        return JSON.stringify(value);
    }

    return String(value);
};

const getColumnKey = (column) =>
    column?.key ||
    column?.field ||
    column?.name ||
    column?.fieldName;

const getColumnLabel = (column) =>
    column?.label ||
    column?.header ||
    column?.title ||
    column?.name ||
    getColumnKey(column);

const getRowValue = (row, column) => {
    const key = getColumnKey(column);

    if (!key) return null;

    return (
        row?.[key] ??
        row?.values?.[key] ??
        row?.[key?.charAt(0).toLowerCase() + key?.slice(1)] ??
        null
    );
};

/* =========================================================
   REPORT TABLE
   ========================================================= */

export default function ReportTable({
    module = "",
    reportCode = "",

    preview = null,

    columns: columnsProp,
    rows: rowsProp,

    loading = false,

    sortBy,
    sortDirection = "ASC",

    onSort,
}) {

    /* =====================================================
       REPORT DATA

       Supports:
       1. Complete preview response
       2. Individual columns and rows props
       ===================================================== */

    const sourceColumns = useMemo(() => {
        const data = preview?.data ?? preview;

        const columns =
            columnsProp ??
            data?.columns ??
            data?.headers ??
            [];

        return Array.isArray(columns) ? columns : [];
    }, [columnsProp, preview]);

    const sourceRows = useMemo(() => {
        const data = preview?.data ?? preview;

        const rows =
            rowsProp ??
            data?.rows ??
            data?.content ??
            [];

        if (Array.isArray(rows)) {
            return rows;
        }

        if (Array.isArray(rows?.content)) {
            return rows.content;
        }

        if (Array.isArray(rows?.rows)) {
            return rows.rows;
        }

        return [];
    }, [rowsProp, preview]);

    /* =====================================================
       NORMALIZE COLUMNS
       ===================================================== */

    const normalizedColumns = useMemo(() => {
        if (!Array.isArray(sourceColumns)) {
            return [];
        }

        return sourceColumns
            .map((column) => {
                if (typeof column === "string") {
                    return {
                        key: column,
                        label: column,
                        dataType: "STRING",
                    };
                }

                return {
                    ...column,
                    key: getColumnKey(column),
                    label: getColumnLabel(column),
                };
            })
            .filter((column) => column.key);
    }, [sourceColumns]);

    /* =====================================================
       VISIBLE COLUMNS
       ===================================================== */

    const visibleColumns = useMemo(
        () =>
            normalizedColumns.filter(
                (column) => column.visible !== false
            ),
        [normalizedColumns]
    );

    /* =====================================================
       NORMALIZE ROWS

       Backend:
       rows.content[].values

       Frontend:
       [{ id: 1, displayName: "..." }]
       ===================================================== */

    const normalizedRows = useMemo(() => {
        if (!Array.isArray(sourceRows)) {
            return [];
        }

        return sourceRows.map((row, index) => {
            const values = row?.values ?? row ?? {};

            return {
                ...values,
                id: row?.id ?? values?.id ?? index,
                __rowIndex: index,
            };
        });
    }, [sourceRows]);

    /* =====================================================
       EMPTY STATE
       ===================================================== */

    if (!loading && normalizedRows.length === 0) {
        return (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white">

                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                    <FileSearch
                        size={26}
                        className="text-slate-400"
                    />
                </div>

                <h3 className="text-sm font-semibold text-slate-700">
                    No records found
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                    No data is available for the selected report or filters.
                </p>

            </div>
        );
    }

    /* =====================================================
       RENDER
       ===================================================== */

    return (
        <div className="relative w-full overflow-hidden rounded-xl border border-slate-200 bg-white">

            {/* LOADING OVERLAY */}

            {loading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">

                    <div className="flex items-center gap-2 text-sm font-medium text-blue-600">

                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />

                        Loading report...

                    </div>

                </div>
            )}

            {/* REPORT INFORMATION */}

            {(module || reportCode) && (
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-3">

                    <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-700">
                            {reportCode || "Report Data"}
                        </p>

                        {module && (
                            <p className="mt-0.5 text-[10px] text-slate-400">
                                Module: {module}
                            </p>
                        )}
                    </div>

                    <span className="text-[10px] font-medium text-slate-400">
                        {visibleColumns.length} columns
                    </span>

                </div>
            )}

            {/* TABLE */}

            <div className="w-full overflow-x-auto">

                <table className="min-w-full border-collapse text-left">

                    {/* HEADER */}

                    <thead className="border-b border-slate-200 bg-slate-50">

                        <tr>

                            {visibleColumns.map((column) => {
                                const key = column.key;
                                const sortable = Boolean(onSort);

                                return (
                                    <th
                                        key={key}
                                        className="whitespace-nowrap px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500"
                                    >

                                        <button
                                            type="button"
                                            disabled={!sortable}
                                            onClick={() => onSort?.(key)}
                                            className={`inline-flex items-center gap-2 ${sortable
                                                ? "cursor-pointer hover:text-blue-600"
                                                : "cursor-default"
                                                }`}
                                        >

                                            {column.label}

                                            {sortable && (
                                                <ArrowUpDown
                                                    size={12}
                                                    className={
                                                        sortBy === key
                                                            ? "text-blue-600"
                                                            : "text-slate-300"
                                                    }
                                                />
                                            )}

                                            {sortBy === key && (
                                                <span className="text-[9px] text-blue-600">
                                                    {sortDirection === "ASC"
                                                        ? "ASC"
                                                        : "DESC"}
                                                </span>
                                            )}

                                        </button>

                                    </th>
                                );
                            })}

                        </tr>

                    </thead>

                    {/* BODY */}

                    <tbody className="divide-y divide-slate-100">

                        {normalizedRows.map((row, rowIndex) => (

                            <tr
                                key={row.id ?? rowIndex}
                                className="transition-colors hover:bg-blue-50/40"
                            >

                                {visibleColumns.map((column) => {
                                    const value = getRowValue(
                                        row,
                                        column
                                    );

                                    const key = column.key;

                                    const isStatus =
                                        key?.toLowerCase().includes("status");

                                    const isBoolean =
                                        column.dataType === "BOOLEAN" ||
                                        typeof value === "boolean";

                                    return (
                                        <td
                                            key={key}
                                            className="whitespace-nowrap px-5 py-4 text-xs text-slate-600"
                                        >

                                            {isStatus ? (

                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${String(value).toUpperCase() === "ACTIVE" ||
                                                        String(value).toUpperCase() === "PAID"
                                                        ? "bg-emerald-50 text-emerald-700"
                                                        : "bg-slate-100 text-slate-600"
                                                        }`}
                                                >
                                                    {formatValue(
                                                        value,
                                                        column.dataType
                                                    )}
                                                </span>

                                            ) : isBoolean ? (

                                                <span
                                                    className={`inline-flex items-center gap-1.5 ${value
                                                        ? "text-emerald-600"
                                                        : "text-slate-400"
                                                        }`}
                                                >

                                                    <span
                                                        className={`h-1.5 w-1.5 rounded-full ${value
                                                            ? "bg-emerald-500"
                                                            : "bg-slate-300"
                                                            }`}
                                                    />

                                                    {formatValue(
                                                        value,
                                                        column.dataType
                                                    )}

                                                </span>

                                            ) : (

                                                <span
                                                    className={
                                                        key === "displayName" ||
                                                            key === "invoiceNumber" ||
                                                            key === "partyName"
                                                            ? "font-semibold text-slate-800"
                                                            : ""
                                                    }
                                                >
                                                    {formatValue(
                                                        value,
                                                        column.dataType
                                                    )}
                                                </span>

                                            )}

                                        </td>
                                    );
                                })}

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

            {/* FOOTER */}

            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-3">

                <span className="text-[11px] text-slate-500">
                    Showing{" "}
                    <span className="font-semibold text-slate-700">
                        {normalizedRows.length}
                    </span>{" "}
                    records
                </span>

                <span className="text-[10px] text-slate-400">
                    {reportCode || "Report data"}
                </span>

            </div>

        </div>
    );
}
