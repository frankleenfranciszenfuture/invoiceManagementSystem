
import React, {
    useEffect,
    useMemo,
} from "react";

import {
    useDispatch,
    useSelector,
} from "react-redux";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    ArrowLeft,
    FileText,
    User,
    Clock,
    Globe,
    Layers,
    ShieldCheck,
    ArrowRight,
    PlusCircle,
    Pencil,
    Trash2,
    RefreshCw,
} from "lucide-react";

import {
    fetchAuditLogById,
} from "../thunks/auditLogThunks";

import {
    clearSelectedAuditLog,
} from "../slices/auditLogSlice";

/* =====================================================
   ACTION CONFIGURATION
===================================================== */

const actionConfig = {
    CREATE: {
        label: "CREATE",
        color: "bg-green-100 text-green-700",
        icon: PlusCircle,
    },
    UPDATE: {
        label: "UPDATE",
        color: "bg-blue-100 text-blue-700",
        icon: Pencil,
    },
    DELETE: {
        label: "DELETE",
        color: "bg-red-100 text-red-700",
        icon: Trash2,
    },
    STATUS_CHANGE: {
        label: "STATUS CHANGE",
        color: "bg-purple-100 text-purple-700",
        icon: RefreshCw,
    },
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
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
};

/* =====================================================
   JSON PARSER
===================================================== */

const parseSnapshot = (value) => {
    if (!value) {
        return null;
    }

    if (typeof value === "object") {
        return value;
    }

    try {
        return JSON.parse(value);
    } catch {
        return {
            _rawValue: value,
        };
    }
};

/* =====================================================
   VALUE FORMATTER
===================================================== */

const formatValue = (value) => {
    if (value === null || value === undefined || value === "") {
        return "—";
    }

    if (typeof value === "boolean") {
        return value ? "Yes" : "No";
    }

    if (typeof value === "object") {
        return JSON.stringify(value, null, 2);
    }

    return String(value);
};

/* =====================================================
   FIELD LABEL
===================================================== */

const formatFieldName = (field) => {
    return String(field)
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (char) => char.toUpperCase())
        .trim();
};

/* =====================================================
   SNAPSHOT DETAILS
===================================================== */

function SnapshotCard({
    title,
    snapshot,
    type,
}) {
    const isOld = type === "old";

    const entries = snapshot
        ? Object.entries(snapshot).filter(
            ([key]) => key !== "_rawValue"
        )
        : [];

    return (
        <div className="
            overflow-hidden rounded-xl
            border border-gray-200 bg-white
        ">

            <div className={`
                flex items-center justify-between
                border-b px-4 py-3
                ${isOld
                    ? "border-red-100 bg-red-50/60"
                    : "border-green-100 bg-green-50/60"
                }
            `}>
                <div className="flex items-center gap-2">
                    <div className={`
                        flex h-8 w-8 items-center
                        justify-center rounded-lg
                        ${isOld
                            ? "bg-red-100 text-red-600"
                            : "bg-green-100 text-green-600"
                        }
                    `}>
                        {isOld
                            ? <ArrowLeft size={16} />
                            : <ArrowRight size={16} />
                        }
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-800">
                            {title}
                        </h3>

                        <p className="text-[11px] text-gray-500">
                            {isOld
                                ? "Previous record state"
                                : "Current record state"
                            }
                        </p>
                    </div>
                </div>

                <span className={`
                    rounded-full px-2.5 py-1
                    text-[10px] font-semibold
                    ${isOld
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }
                `}>
                    {isOld ? "OLD VALUE" : "NEW VALUE"}
                </span>
            </div>

            <div className="p-4">

                {!snapshot ? (
                    <div className="
                        flex min-h-[150px] flex-col
                        items-center justify-center gap-2
                        text-center
                    ">
                        <FileText className="
                            h-8 w-8 text-gray-300
                        " />

                        <p className="text-sm font-medium text-gray-500">
                            No snapshot available
                        </p>

                        <p className="text-xs text-gray-400">
                            {isOld
                                ? "There was no previous record."
                                : "No new snapshot was recorded."
                            }
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">

                        {snapshot._rawValue !== undefined ? (
                            <pre className="
                                overflow-x-auto rounded-lg
                                bg-gray-50 p-3 text-xs
                                text-gray-700
                            ">
                                {snapshot._rawValue}
                            </pre>
                        ) : (
                            entries.map(([key, value]) => (
                                <div
                                    key={key}
                                    className="
                                        flex flex-col gap-1
                                        border-b border-gray-100
                                        pb-2 last:border-0
                                    "
                                >
                                    <p className="
                                        text-[11px] font-semibold
                                        uppercase tracking-wide
                                        text-gray-400
                                    ">
                                        {formatFieldName(key)}
                                    </p>

                                    {typeof value === "object" &&
                                        value !== null ? (
                                        <pre className="
                                            overflow-x-auto rounded-md
                                            bg-gray-50 p-2 text-xs
                                            text-gray-700
                                        ">
                                            {formatValue(value)}
                                        </pre>
                                    ) : (
                                        <p className="
                                            break-words text-sm
                                            font-medium text-gray-700
                                        ">
                                            {formatValue(value)}
                                        </p>
                                    )}
                                </div>
                            ))
                        )}

                    </div>
                )}

            </div>
        </div>
    );
}

/* =====================================================
   COMPONENT
===================================================== */

export default function AuditLogDetails() {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { id } = useParams();

    /* =====================================================
       REDUX STATE
    ===================================================== */

    const {
        selectedAuditLog,
        detailsLoading,
        detailsError,
    } = useSelector(
        (state) => state.auditLogs || {}
    );

    /* =====================================================
       FETCH AUDIT DETAILS
    ===================================================== */

    useEffect(() => {
        if (!id) {
            return;
        }

        dispatch(clearSelectedAuditLog());

        dispatch(fetchAuditLogById(id));

        return () => {
            dispatch(clearSelectedAuditLog());
        };

    }, [dispatch, id]);

    /* =====================================================
       PARSED SNAPSHOTS
    ===================================================== */

    const oldSnapshot = useMemo(
        () => parseSnapshot(selectedAuditLog?.oldValue),
        [selectedAuditLog?.oldValue]
    );

    const newSnapshot = useMemo(
        () => parseSnapshot(selectedAuditLog?.newValue),
        [selectedAuditLog?.newValue]
    );

    /* =====================================================
       CHANGED FIELDS
    ===================================================== */

    const changedFields = useMemo(() => {
        if (!oldSnapshot || !newSnapshot) {
            return [];
        }

        const keys = new Set([
            ...Object.keys(oldSnapshot),
            ...Object.keys(newSnapshot),
        ]);

        return [...keys].filter((key) => {
            return (
                JSON.stringify(oldSnapshot[key]) !==
                JSON.stringify(newSnapshot[key])
            );
        });

    }, [oldSnapshot, newSnapshot]);

    /* =====================================================
       LOADING
    ===================================================== */

    if (detailsLoading) {
        return (
            <div className="
                flex min-h-[300px] items-center
                justify-center bg-gray-50
            ">
                <p className="text-sm text-gray-500">
                    Loading audit details...
                </p>
            </div>
        );
    }

    /* =====================================================
       ERROR / NOT FOUND
    ===================================================== */

    if (detailsError || !selectedAuditLog) {
        return (
            <div className="
                flex min-h-[300px] flex-col
                items-center justify-center gap-3
                bg-gray-50 px-4
            ">
                <FileText className="
                    h-12 w-12 text-gray-300
                " />

                <p className="text-sm font-medium text-gray-700">
                    {detailsError || "Audit log not found."}
                </p>

                <button
                    type="button"
                    onClick={() => navigate("/audit-logs")}
                    className="
                        flex items-center gap-2
                        rounded-lg bg-blue-500
                        px-4 py-2 text-xs
                        font-medium text-white
                        hover:bg-blue-600
                    "
                >
                    <ArrowLeft size={14} />
                    Back to Audit Logs
                </button>
            </div>
        );
    }

    /* =====================================================
       AUDIT DATA
    ===================================================== */

    const audit = selectedAuditLog;

    const action = String(
        audit.action || ""
    ).toUpperCase();

    const config =
        actionConfig[action] || {
            label: action || "UNKNOWN",
            color: "bg-gray-100 text-gray-700",
            icon: FileText,
        };

    const ActionIcon = config.icon;

    /* =====================================================
       PAGE
    ===================================================== */

    return (
        <div className="
            min-h-screen bg-gray-50
            px-3 py-5 font-sans text-[13px]
        ">

            <div className="mx-auto w-full max-w-7xl">

                {/* HEADER */}

                <div className="
                    mb-5 flex flex-wrap
                    items-center justify-between gap-3
                ">
                    <div className="flex items-center gap-3">

                        <button
                            type="button"
                            onClick={() => navigate("/audit-logs")}
                            className="
                                flex h-9 w-9 items-center
                                justify-center rounded-lg
                                border border-gray-200
                                bg-white text-gray-600
                                transition hover:bg-gray-100
                            "
                        >
                            <ArrowLeft size={17} />
                        </button>

                        <div>
                            <h1 className="
                                text-lg font-semibold text-gray-800
                            ">
                                Audit Log Details
                            </h1>

                            <p className="mt-0.5 text-xs text-gray-500">
                                Review the recorded activity and changes.
                            </p>
                        </div>

                    </div>

                    <span className="
                        rounded-lg border border-gray-200
                        bg-white px-3 py-2
                        text-xs font-medium text-gray-600
                    ">
                        Audit ID: #{audit.id}
                    </span>
                </div>

                {/* ACTIVITY SUMMARY */}

                <div className="
                    mb-5 rounded-xl border
                    border-gray-200 bg-white p-5
                ">

                    <div className="
                        flex flex-wrap items-start
                        justify-between gap-4
                    ">

                        <div className="flex items-center gap-3">

                            <div className="
                                flex h-12 w-12 shrink-0
                                items-center justify-center
                                rounded-xl bg-blue-50
                                text-blue-600
                            ">
                                <ActionIcon size={23} />
                            </div>

                            <div>
                                <h2 className="
                                    text-base font-semibold
                                    text-gray-800
                                ">
                                    {audit.description || "Audit Activity"}
                                </h2>

                                <p className="mt-1 text-xs text-gray-500">
                                    {audit.entityName || audit.moduleName || "—"}
                                    {" "}
                                    · Entity ID: {audit.entityId ?? "—"}
                                </p>
                            </div>

                        </div>

                        <span className={`
                            rounded-full px-3 py-1.5
                            text-xs font-semibold
                            ${config.color}
                        `}>
                            {config.label}
                        </span>

                    </div>

                    {/* DETAILS GRID */}

                    <div className="
                        mt-5 grid grid-cols-1 gap-4
                        border-t border-gray-100 pt-4
                        sm:grid-cols-2 lg:grid-cols-4
                    ">

                        <div>
                            <p className="
                                mb-1 text-[11px] font-semibold
                                uppercase tracking-wide text-gray-400
                            ">
                                Module
                            </p>

                            <div className="flex items-center gap-2">
                                <Layers
                                    size={14}
                                    className="text-gray-400"
                                />

                                <p className="font-medium text-gray-700">
                                    {audit.moduleName ||
                                        audit.entityName || "—"}
                                </p>
                            </div>
                        </div>

                        <div>
                            <p className="
                                mb-1 text-[11px] font-semibold
                                uppercase tracking-wide text-gray-400
                            ">
                                Performed By
                            </p>

                            <div className="flex items-center gap-2">
                                <User
                                    size={14}
                                    className="text-gray-400"
                                />

                                <p className="font-medium text-gray-700">
                                    {audit.performedByName || "—"}
                                </p>
                            </div>

                            <p className="ml-5 mt-1 text-[10px] text-gray-400">
                                ID: {audit.performedBy ?? "—"}
                            </p>
                        </div>

                        <div>
                            <p className="
                                mb-1 text-[11px] font-semibold
                                uppercase tracking-wide text-gray-400
                            ">
                                Performer Type
                            </p>

                            <div className="flex items-center gap-2">
                                <ShieldCheck
                                    size={14}
                                    className="text-gray-400"
                                />

                                <p className="font-medium text-gray-700">
                                    {audit.performedByType || "—"}
                                </p>
                            </div>
                        </div>

                        <div>
                            <p className="
                                mb-1 text-[11px] font-semibold
                                uppercase tracking-wide text-gray-400
                            ">
                                Date & Time
                            </p>

                            <div className="flex items-center gap-2">
                                <Clock
                                    size={14}
                                    className="text-gray-400"
                                />

                                <p className="font-medium text-gray-700">
                                    {formatDate(audit.createdAt)}
                                </p>
                            </div>
                        </div>

                        <div>
                            <p className="
                                mb-1 text-[11px] font-semibold
                                uppercase tracking-wide text-gray-400
                            ">
                                IP Address
                            </p>

                            <div className="flex items-center gap-2">
                                <Globe
                                    size={14}
                                    className="text-gray-400"
                                />

                                <p className="
                                    break-all font-medium text-gray-700
                                ">
                                    {audit.ipAddress || "—"}
                                </p>
                            </div>
                        </div>

                        <div>
                            <p className="
                                mb-1 text-[11px] font-semibold
                                uppercase tracking-wide text-gray-400
                            ">
                                Entity Name
                            </p>

                            <p className="font-medium text-gray-700">
                                {audit.entityName || "—"}
                            </p>
                        </div>

                        <div>
                            <p className="
                                mb-1 text-[11px] font-semibold
                                uppercase tracking-wide text-gray-400
                            ">
                                Entity ID
                            </p>

                            <p className="font-medium text-gray-700">
                                {audit.entityId ?? "—"}
                            </p>
                        </div>

                        <div>
                            <p className="
                                mb-1 text-[11px] font-semibold
                                uppercase tracking-wide text-gray-400
                            ">
                                Changed Fields
                            </p>

                            <p className="font-medium text-gray-700">
                                {changedFields.length}
                            </p>
                        </div>

                    </div>
                </div>

                {/* SNAPSHOT COMPARISON */}

                <div className="mb-4">
                    <h2 className="
                        text-sm font-semibold text-gray-800
                    ">
                        Record Snapshot
                    </h2>

                    <p className="mt-1 text-xs text-gray-500">
                        Compare the previous and recorded values.
                    </p>
                </div>

                <div className="
                    grid grid-cols-1 gap-4
                    lg:grid-cols-2
                ">
                    <SnapshotCard
                        title="Previous Values"
                        snapshot={oldSnapshot}
                        type="old"
                    />

                    <SnapshotCard
                        title="New Values"
                        snapshot={newSnapshot}
                        type="new"
                    />
                </div>

                {/* CHANGED FIELDS */}

                {changedFields.length > 0 && (
                    <div className="
                        mt-5 overflow-hidden rounded-xl
                        border border-gray-200 bg-white
                    ">

                        <div className="
                            border-b border-gray-200
                            px-4 py-3
                        ">
                            <h3 className="
                                text-sm font-semibold text-gray-800
                            ">
                                Changed Fields
                            </h3>

                            <p className="mt-1 text-xs text-gray-500">
                                {changedFields.length} field(s) changed
                                in this activity.
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[600px]">

                                <thead className="bg-gray-50">
                                    <tr>
                                        {[
                                            "Field",
                                            "Previous Value",
                                            "New Value",
                                        ].map((header) => (
                                            <th
                                                key={header}
                                                className="
                                                    px-4 py-3 text-left
                                                    text-xs font-semibold
                                                    uppercase tracking-wide
                                                    text-gray-500
                                                "
                                            >
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {changedFields.map((field) => (
                                        <tr
                                            key={field}
                                            className="
                                                border-t border-gray-100
                                                text-xs
                                            "
                                        >
                                            <td className="
                                                px-4 py-3 font-semibold
                                                text-gray-700
                                            ">
                                                {formatFieldName(field)}
                                            </td>

                                            <td className="
                                                max-w-[250px] break-words
                                                px-4 py-3 text-red-600
                                            ">
                                                {formatValue(
                                                    oldSnapshot?.[field]
                                                )}
                                            </td>

                                            <td className="
                                                max-w-[250px] break-words
                                                px-4 py-3 text-green-700
                                            ">
                                                {formatValue(
                                                    newSnapshot?.[field]
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>

                            </table>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
