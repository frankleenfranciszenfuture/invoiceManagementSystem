
import React from "react";

import { useSelector } from "react-redux";

import {
    Eye,
    FileText,
    User,
    Clock,
    Globe,
    Layers,
} from "lucide-react";

import Pagination from "../../../common/pagination/table/Pagination";
import ToolTipText from "../../../common/toolTip/ToolTipText";

/* =====================================================
   ACTION COLORS
===================================================== */

const actionColors = {
    CREATE: "bg-green-100 text-green-700",
    UPDATE: "bg-blue-100 text-blue-700",
    DELETE: "bg-red-100 text-red-700",
    STATUS_CHANGE: "bg-purple-100 text-purple-700",
};

/* =====================================================
   PERFORMER COLORS
===================================================== */

const performerColors = {
    ADMIN: "bg-indigo-100 text-indigo-700",
    EMPLOYEE: "bg-orange-100 text-orange-700",
};

/* =====================================================
   DATE FORMAT
===================================================== */

const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "—";
    }

    return parsedDate.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

/* =====================================================
   COMPONENT
===================================================== */

export default function AuditLogTable({
    auditLogs = [],
    onView = () => { },
    onPageChange = () => { },
    onPageSizeChange = () => { },
}) {

    /* =====================================================
       REDUX STATE
    ===================================================== */

    const {
        loading = false,
        error = null,
        pagination = {},
    } = useSelector(
        (state) => state.auditLogs || {}
    );

    const {
        pageNumber = 0,
        pageSize = 10,
        totalPages = 0,
        totalElements = 0,
    } = pagination;

    const currentAuditLogs = Array.isArray(auditLogs)
        ? auditLogs
        : [];

    /* =====================================================
       LOADING
    ===================================================== */

    if (loading && !currentAuditLogs.length) {
        return (
            <div className="flex items-center justify-center py-10">
                <p className="text-gray-500">
                    Loading audit logs...
                </p>
            </div>
        );
    }

    /* =====================================================
       ERROR
    ===================================================== */

    if (error && !currentAuditLogs.length) {
        return (
            <div className="
                rounded-xl border border-red-200
                bg-white p-8 text-center
            ">
                <p className="text-red-500">
                    {error}
                </p>
            </div>
        );
    }

    /* =====================================================
       EMPTY STATE
    ===================================================== */

    if (!currentAuditLogs.length) {
        return (
            <div className="
                rounded-2xl border border-gray-200
                bg-white p-8 text-center
            ">
                <FileText className="
                    mx-auto mb-3 h-10 w-10 text-gray-300
                " />

                <p className="text-gray-500">
                    No audit logs found.
                </p>
            </div>
        );
    }

    /* =====================================================
       TABLE
    ===================================================== */

    return (
        <div className="
            overflow-x-auto overflow-y-visible
            rounded-xl border border-gray-200 bg-white
        ">

            <table className="w-full min-w-[1100px]">

                {/* HEADER */}

                <thead className="
                    border-b border-gray-300
                    bg-[#FAF9F7]/20
                ">
                    <tr>
                        {[
                            "Activity",
                            "Module",
                            "Entity ID",
                            "Action",
                            "Performed By",
                            "Performer Type",
                            "IP Address",
                            "Date & Time",
                            "Actions",
                        ].map((header) => (
                            <th
                                key={header}
                                className={`
                                    px-5 py-3 text-xs
                                    font-semibold uppercase
                                    tracking-wide text-gray-500
                                    ${header === "Actions"
                                        ? "text-right"
                                        : "text-left"
                                    }
                                `}
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>

                {/* BODY */}

                <tbody>
                    {currentAuditLogs.map((audit, index) => {

                        const action = String(
                            audit.action || ""
                        ).trim().toUpperCase();

                        const performerType = String(
                            audit.performedByType || ""
                        ).trim().toUpperCase();

                        const moduleName =
                            audit.moduleName ||
                            audit.entityName ||
                            "—";

                        return (
                            <tr
                                key={audit.id || index}
                                className="
                                    border-b border-gray-100
                                    text-xs transition-colors
                                    hover:bg-gray-50
                                "
                            >

                                {/* ACTIVITY */}

                                <td className="px-5 py-3">
                                    <div className="
                                        flex min-w-0 items-center gap-3
                                    ">
                                        <div className="
                                            flex h-9 w-9 shrink-0
                                            items-center justify-center
                                            rounded-lg bg-blue-50
                                            text-blue-600
                                        ">
                                            <FileText size={17} />
                                        </div>

                                        <div className="min-w-0">
                                            <p
                                                className="
                                                    max-w-[220px] truncate
                                                    font-medium text-gray-800
                                                "
                                                title={audit.description || ""}
                                            >
                                                {audit.description || "—"}
                                            </p>

                                            <p className="text-xs text-gray-500">
                                                Audit ID: #{audit.id}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                {/* MODULE */}

                                <td className="px-5 py-3">
                                    <div className="flex items-center gap-2">
                                        <Layers
                                            size={13}
                                            className="text-gray-400"
                                        />

                                        <span className="
                                            inline-block rounded-md
                                            bg-gray-100 px-2 py-1
                                            font-medium text-gray-700
                                        ">
                                            {moduleName}
                                        </span>
                                    </div>
                                </td>

                                {/* ENTITY ID */}

                                <td className="px-5 py-3">
                                    <span className="
                                        font-medium text-gray-700
                                    ">
                                        #{audit.entityId ?? "—"}
                                    </span>
                                </td>

                                {/* ACTION */}

                                <td className="px-5 py-3">
                                    <span className={`
                                        inline-block rounded-full
                                        px-2.5 py-1 text-xs
                                        font-semibold
                                        ${actionColors[action] ||
                                        "bg-gray-100 text-gray-700"
                                        }
                                    `}>
                                        {action || "—"}
                                    </span>
                                </td>

                                {/* PERFORMED BY */}

                                <td className="px-5 py-3">
                                    <div className="flex items-center gap-2">
                                        <User
                                            size={14}
                                            className="shrink-0 text-gray-400"
                                        />

                                        <span className="
                                            font-medium text-gray-700
                                        ">
                                            {audit.performedByName || "—"}
                                        </span>
                                    </div>

                                    <p className="
                                        ml-5 mt-0.5 text-[10px]
                                        text-gray-400
                                    ">
                                        ID: {audit.performedBy ?? "—"}
                                    </p>
                                </td>

                                {/* PERFORMER TYPE */}

                                <td className="px-5 py-3">
                                    <span className={`
                                        inline-block rounded-full
                                        px-2.5 py-1 text-xs
                                        font-medium
                                        ${performerColors[performerType] ||
                                        "bg-gray-100 text-gray-700"
                                        }
                                    `}>
                                        {performerType || "—"}
                                    </span>
                                </td>

                                {/* IP ADDRESS */}

                                <td className="px-5 py-3">
                                    <div className="flex items-center gap-1.5">
                                        <Globe
                                            size={13}
                                            className="text-gray-400"
                                        />

                                        <span className="text-gray-600">
                                            {audit.ipAddress || "—"}
                                        </span>
                                    </div>
                                </td>

                                {/* DATE */}

                                <td className="px-5 py-3">
                                    <div className="
                                        flex items-center gap-1.5
                                    ">
                                        <Clock
                                            size={13}
                                            className="text-gray-400"
                                        />

                                        <span className="
                                            whitespace-nowrap text-gray-600
                                        ">
                                            {formatDate(audit.createdAt)}
                                        </span>
                                    </div>
                                </td>

                                {/* ACTIONS */}

                                <td className="px-5 py-3">
                                    <div className="
                                        flex items-center justify-end gap-2
                                    ">
                                        <button
                                            type="button"
                                            onClick={() => onView(audit)}
                                            title="View audit details"
                                            className="
                                                group relative flex h-8 w-8
                                                items-center justify-center
                                                rounded-lg bg-blue-50
                                                text-blue-600 transition
                                                hover:bg-blue-100
                                                hover:text-blue-700
                                            "
                                        >
                                            <Eye size={16} />

                                            <ToolTipText
                                                text="View Details"
                                                position="bottom"
                                            />
                                        </button>
                                    </div>
                                </td>

                            </tr>
                        );
                    })}
                </tbody>

            </table>

            {/* PAGINATION */}

            <Pagination
                page={Number(pageNumber) || 0}
                size={Number(pageSize) || 10}
                totalElements={Number(totalElements) || 0}
                totalPages={Number(totalPages) || 0}
                loading={loading}
                label="audit logs"
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
            />

        </div>
    );
}
