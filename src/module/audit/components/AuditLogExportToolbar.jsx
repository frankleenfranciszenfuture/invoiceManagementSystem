
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    FileText,
    FileSpreadsheet,
    FileDown,
    Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

import { exportAuditLogs } from "../thunks/auditLogThunks";

const exportOptions = [
    {
        format: "pdf",
        label: "PDF",
        icon: FileText,
        className: "border-red-200 text-red-600 hover:bg-red-50",
    },
    {
        format: "excel",
        label: "Excel",
        icon: FileSpreadsheet,
        className: "border-green-200 text-green-600 hover:bg-green-50",
    },
    {
        format: "csv",
        label: "CSV",
        icon: FileDown,
        className: "border-blue-200 text-blue-600 hover:bg-blue-50",
    },
];

export default function AuditLogExportToolbar({
    filters = {},
    totalElements = 0,
}) {
    const dispatch = useDispatch();

    const {
        exportLoading = false,
        exportFormat = null,
    } = useSelector((state) => state.auditLogs || {});

    const handleExport = async (format) => {
        if (exportLoading) return;

        try {
            const result = await dispatch(
                exportAuditLogs({
                    format,
                    filters,
                })
            ).unwrap();

            toast.success(
                `${format.toUpperCase()} export downloaded successfully.`
            );
        } catch (error) {
            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message || "Unable to export audit logs."
            );
        }
    };

    return (
        <div className="
            mb-4 flex flex-wrap items-center
            justify-between gap-3 rounded-xl
            border border-gray-200 bg-white
            px-4 py-3
        ">
            <div>
                <p className="text-sm font-semibold text-gray-700">
                    Export Audit Logs
                </p>

                <p className="mt-1 text-xs text-gray-500">
                    Export all {Number(totalElements) || 0} matching records.
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                {exportOptions.map((option) => {
                    const Icon = option.icon;
                    const isCurrentExport =
                        exportLoading && exportFormat === option.format;

                    return (
                        <button
                            key={option.format}
                            type="button"
                            disabled={exportLoading || !totalElements}
                            onClick={() => handleExport(option.format)}
                            className={`
                                flex items-center gap-2 rounded-lg
                                border bg-white px-3 py-2
                                text-xs font-semibold transition
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                                ${option.className}
                            `}
                        >
                            {isCurrentExport ? (
                                <Loader2
                                    size={15}
                                    className="animate-spin"
                                />
                            ) : (
                                <Icon size={15} />
                            )}

                            {isCurrentExport
                                ? `Exporting ${option.label}...`
                                : option.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
