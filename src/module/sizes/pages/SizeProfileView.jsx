
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
    SquarePen,
    Check,
    X,
    Loader2,
    AlertCircle,
    RotateCcw,
    ShieldCheck,
    BadgeCheck,
    FileText,
    Activity,
    CircleCheck,
    Ruler,
    RefreshCw,
    Trash2,
} from "lucide-react";

import {
    fetchAllSizes,
    fetchSizeById,
    updateSize,
} from "../thunks/sizeThunks";

import { setExsistingSize } from "../slices/sizeSlice";
import { openModal } from "../../ui/uiSlice";
/* =========================================================
   FIELD CONFIG
========================================================= */

const BASIC_FIELDS = [
    {
        key: "sizeName",
        label: "Size Name",
        required: true,
    },
    {
        key: "sizeShortName",
        label: "Size Short Name",
        required: true,
    },
    {
        key: "description",
        label: "Description",
    },
];

const ACCOUNT_FIELDS = [
    {
        key: "status",
        label: "Status",
        type: "status",
        required: true,
    },
];

/* =========================================================
   HELPERS
========================================================= */

const toText = (value) =>
    value === null || value === undefined
        ? ""
        : String(value);

function formatDate(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return toText(value);
    }

    return date.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function timeAgo(milliseconds) {
    const seconds = Math.floor(
        (Date.now() - milliseconds) / 1000
    );

    if (seconds < 60) return "Just now";

    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) return `${minutes} min ago`;

    const hours = Math.floor(minutes / 60);

    if (hours < 24) return `${hours} hr ago`;

    return `${Math.floor(hours / 24)} days ago`;
}

function validate(fields, values) {
    const errors = {};

    fields.forEach((field) => {
        const value = toText(values[field.key]).trim();

        if (field.required && !value) {
            errors[field.key] =
                `${field.label} is required`;
        }
    });

    return errors;
}

function useSavedFlash() {
    const [saved, setSaved] = useState(false);
    const timer = useRef(null);

    useEffect(() => {
        return () => clearTimeout(timer.current);
    }, []);

    const flash = () => {
        setSaved(true);
        clearTimeout(timer.current);

        timer.current = setTimeout(() => {
            setSaved(false);
        }, 2000);
    };

    return [saved, flash];
}

/* =========================================================
   SECTION CARD
========================================================= */

function SectionCard({
    title,
    editing,
    saving,
    saved,
    error,
    onEdit,
    onSave,
    onCancel,
    children,
}) {
    return (
        <div className="flex h-full min-w-0 flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 px-4 pt-4">
                <h3 className="text-[14px] font-semibold text-slate-900">
                    {title}
                </h3>

                <div className="flex items-center gap-2">
                    {saved && !editing && (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10.5px] font-medium text-emerald-600">
                            <Check size={11} />
                            Saved
                        </span>
                    )}

                    {editing ? (
                        <>
                            <button
                                type="button"
                                onClick={onCancel}
                                disabled={saving}
                                className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11.5px] font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                            >
                                <X size={12} />
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={onSave}
                                disabled={saving}
                                className="flex items-center gap-1 rounded-md bg-[#0F4659] px-2.5 py-1.5 text-[11.5px] font-medium text-white shadow-sm transition hover:bg-[#0b3746] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving ? (
                                    <Loader2
                                        size={12}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <Check size={12} />
                                )}

                                {saving ? "Saving..." : "Save"}
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={onEdit}
                            aria-label={`Edit ${title}`}
                            title="Edit"
                            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                        >
                            <SquarePen size={15} />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 px-4 pb-4 pt-2.5">
                {error && (
                    <div className="mb-2.5 flex items-start gap-2 rounded-md bg-red-50 px-2.5 py-2 text-[11.5px] text-red-600">
                        <AlertCircle
                            size={13}
                            className="mt-0.5 shrink-0"
                        />
                        {error}
                    </div>
                )}

                {children}
            </div>
        </div>
    );
}

/* =========================================================
   FIELDS SECTION
========================================================= */

function FieldsSection({
    title,
    fields,
    values,
    onSave,
}) {
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [draft, setDraft] = useState({});
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");

    const [saved, flash] = useSavedFlash();

    const startEdit = () => {
        const draftValues = {};

        fields.forEach((field) => {
            draftValues[field.key] =
                values[field.key] ?? "";
        });

        setDraft(draftValues);
        setErrors({});
        setServerError("");
        setEditing(true);
    };

    const cancel = () => {
        if (saving) return;

        setEditing(false);
        setErrors({});
        setServerError("");
    };

    const save = async () => {
        const validationErrors = validate(fields, draft);

        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        const patch = {};

        fields.forEach((field) => {
            patch[field.key] =
                toText(draft[field.key]).trim();
        });

        setSaving(true);
        setServerError("");

        try {
            const result = await onSave(patch);

            if (result.ok) {
                setEditing(false);
                flash();
            } else {
                setServerError(
                    result.message ||
                    "Failed to save unit changes."
                );
            }
        } catch (error) {
            setServerError(
                error?.message ||
                "Failed to save unit changes."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <SectionCard
            title={title}
            editing={editing}
            saving={saving}
            saved={saved}
            error={serverError}
            onEdit={startEdit}
            onSave={save}
            onCancel={cancel}
        >
            {fields.map((field, index) => {
                const value = values[field.key];

                return (
                    <div
                        key={field.key}
                        className={`py-2.5 ${index > 0
                            ? "border-t border-slate-100"
                            : ""
                            }`}
                    >
                        <p className="text-[12px] font-medium text-slate-700">
                            {field.label}

                            {editing && field.required && (
                                <span className="text-red-500">
                                    {" "}*
                                </span>
                            )}
                        </p>

                        {editing ? (
                            <div className="mt-1.5">
                                {field.type === "status" ? (
                                    <select
                                        value={
                                            draft[field.key] ||
                                            "ACTIVE"
                                        }
                                        onChange={(event) =>
                                            setDraft((previous) => ({
                                                ...previous,
                                                [field.key]:
                                                    event.target.value,
                                            }))
                                        }
                                        disabled={saving}
                                        className="h-[34px] w-full rounded-lg border border-slate-300 bg-white px-3 text-[13px] text-slate-800 outline-none transition focus:border-[#0F4659] focus:ring-2 focus:ring-[#0F4659]/10 disabled:bg-slate-50"
                                    >
                                        <option value="ACTIVE">
                                            ACTIVE
                                        </option>
                                        <option value="INACTIVE">
                                            INACTIVE
                                        </option>
                                        <option value="DRAFT">
                                            DRAFT
                                        </option>
                                    </select>
                                ) : (
                                    <textarea
                                        value={
                                            draft[field.key] ?? ""
                                        }
                                        onChange={(event) =>
                                            setDraft((previous) => ({
                                                ...previous,
                                                [field.key]:
                                                    event.target.value,
                                            }))
                                        }
                                        placeholder={field.label}
                                        disabled={saving}
                                        rows={
                                            field.key === "description"
                                                ? 3
                                                : 1
                                        }
                                        className={`w-full rounded-lg border bg-white px-3 py-2 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 disabled:bg-slate-50 ${errors[field.key]
                                            ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                                            : "border-slate-300 focus:border-[#0F4659] focus:ring-[#0F4659]/10"
                                            }`}
                                    />
                                )}

                                {errors[field.key] && (
                                    <p className="mt-1 text-[11.5px] text-red-500">
                                        {errors[field.key]}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="mt-1 break-words text-[12.5px] leading-5 text-slate-800">
                                {field.type === "status" ? (
                                    <span
                                        className={`inline-flex rounded-full px-2 py-1 text-[11px] font-medium ${String(value || "ACTIVE").toUpperCase() === "ACTIVE"
                                            ? "bg-emerald-50 text-emerald-600"
                                            : String(value || "").toUpperCase() === "INACTIVE"
                                                ? "bg-slate-100 text-slate-600"
                                                : "bg-amber-50 text-amber-600"
                                            }`}
                                    >
                                        {value || "ACTIVE"}
                                    </span>
                                ) : (
                                    toText(value) || (
                                        <span className="text-slate-300">
                                            -
                                        </span>
                                    )
                                )}
                            </p>
                        )}
                    </div>
                );
            })}
        </SectionCard>
    );
}

/* =========================================================
   SIZE AVATAR
========================================================= */

function SizeAvatarSection({ sizeName, initials }) {
    return (
        <div className="flex h-full min-h-[190px] flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between px-4 pt-4">
                <h3 className="text-[14px] font-semibold text-slate-900">
                    Size Profile
                </h3>
            </div>

            <div className="flex flex-1 items-center justify-center px-3 py-5">
                <div
                    className="flex h-[110px] w-[110px] items-center justify-center rounded-full border-4 border-[#0F4659]/10 bg-gradient-to-br from-[#0F4659]/80 to-[#0F4659] shadow-sm"
                    title={sizeName || "Size"}
                >
                    <span className="text-[30px] font-bold tracking-tight text-white">
                        {initials}
                    </span>
                </div>
            </div>

            <div className="border-t border-slate-100 px-4 py-2.5 text-center">
                <p className="truncate text-[12px] text-slate-400">
                    {sizeName || "Size profile"}
                </p>
            </div>
        </div>
    );
}

/* =========================================================
   STAT TILE
========================================================= */

function StatTile({
    icon: Icon,
    label,
    value,
    bgColor = "bg-[#166534]/80",
}) {
    return (
        <div
            className={`group min-w-0 rounded-lg border border-white/20 ${bgColor} px-3 py-2.5 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg`}
        >
            <div className="flex items-center gap-1.5 text-gray-100">
                <Icon
                    size={14}
                    className="shrink-0 transition-all duration-300 group-hover:animate-pulse group-hover:text-cyan-200"
                />
                <span className="truncate text-[10.5px]">
                    {label}
                </span>
            </div>

            <p className="mt-1 truncate text-[14px] font-semibold leading-tight text-white">
                {value || "-"}
            </p>
        </div>
    );
}

/* =========================================================
   PAGE
========================================================= */

export default function SizeProfileView({ sizeId }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id: paramId } = useParams();

    const {
        size,
        sizes,
        loading,
        error,
    } = useSelector((state) => state.size || {});

    const id =
        sizeId && typeof sizeId === "object"
            ? sizeId.id
            : sizeId ?? paramId;

    const current =
        id != null
            ? (
                String(size?.id) === String(id)
                    ? size
                    : sizes?.find(
                        (item) =>
                            String(item.id) === String(id)
                    )
            )
            : size || sizes?.[0];

    const ready = Boolean(current?.id);

    const [activity, setActivity] = useState([]);

    useEffect(() => {
        if (id != null) {
            dispatch(fetchSizeById(id));
        } else {
            dispatch(fetchAllSizes());
        }
    }, [id, dispatch]);

    const logActivity = (text) => {
        setActivity((previous) => [
            {
                text,
                at: Date.now(),
            },
            ...previous,
        ].slice(0, 8));
    };

    /* SAVE UNIT FIELDS */

    const saveFields = async (patch, label) => {
        if (!current?.id) {
            return {
                ok: false,
                message: "Size ID is missing.",
            };
        }

        const data = {
            sizeName: current.sizeName ?? "",
            sizeShortName: current.sizeShortName ?? "",
            description: current.description ?? "",
            status: current.status || "ACTIVE",
            ...patch,
        };

        const response = await dispatch(
            updateSize({
                id: current.id,
                data,
            })
        );

        if (updateSize.fulfilled.match(response)) {
            logActivity(
                label || "Updated size information"
            );

            return { ok: true };
        }

        return {
            ok: false,
            message:
                typeof response.payload === "string"
                    ? response.payload
                    : response.payload?.message ||
                    response.error?.message ||
                    "Failed to update unit.",
        };
    };



    const retry = () => {
        if (id != null) {
            dispatch(fetchSizeById(id));
        } else {
            dispatch(fetchAllSizes());
        }
    };

    if (!ready && loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center text-slate-400">
                <Loader2
                    size={26}
                    className="animate-spin"
                />
            </div>
        );
    }

    if (!ready) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 text-center">
                <AlertCircle
                    size={32}
                    className="text-slate-300"
                />

                <p className="text-sm text-slate-500">
                    {error || "No size found."}
                </p>

                <button
                    type="button"
                    onClick={retry}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[13px] font-medium text-slate-700 transition hover:bg-slate-50"
                >
                    <RotateCcw size={13} />
                    Try again
                </button>
            </div>
        );
    }

    const sizeName = toText(current.sizeName);
    const sizeShortName = toText(current.sizeShortName);

    const initials =
        sizeName
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((word) => word[0])
            .join("")
            .toUpperCase() || "SN";

    const status = toText(
        current.status || "ACTIVE"
    ).toUpperCase();

    const isActive = status === "ACTIVE";

    const createdDate = formatDate(current.createdAt);
    const updatedDate = formatDate(current.updatedAt);

    return (
        <div className="w-full space-y-4 p-3">
            {/* PROFILE HEADER */}

            <div className="w-full space-y-4">
                <div className="rounded-xl border border-lime-400 bg-white p-4">
                    <div className="flex flex-wrap items-start justify-between gap-4 px-2 py-3 pb-5">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            {/* LEFT: UNIT DETAILS */}
                            <div className="flex min-w-0 items-start gap-4">
                                <div
                                    className="flex h-[86px] w-[86px] shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-[4px] border-white bg-gradient-to-br from-[#408DFB]/70 to-[#0F4659] shadow-md"
                                    onClick={() => navigate("/sizes")}
                                    title="Back to Units"
                                >
                                    <span className="text-[24px] font-bold tracking-tight text-white">
                                        {initials}
                                    </span>
                                </div>

                                <div className="min-w-0 pt-2.5">
                                    <h2
                                        className="cursor-pointer text-[24px] font-semibold leading-tight text-gray-500 hover:text-[#0F4659]/70"
                                        onClick={() => navigate("/sizes")}
                                    >
                                        {sizeName || "Size"}
                                    </h2>

                                    <p className="mt-0.5 text-[12px] text-gray-500">
                                        Size ID: {current.id}
                                    </p>

                                    <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px] text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Ruler size={13} />
                                            Short Name: {sizeShortName || "-"}
                                        </span>

                                        <span className="flex items-center gap-1">
                                            <FileText size={13} />
                                            {current.description || "No description"}
                                        </span>

                                        <span>
                                            Status:{" "}
                                            <b
                                                className={`font-semibold ${isActive
                                                    ? "text-emerald-600"
                                                    : "text-slate-500"
                                                    }`}
                                            >
                                                {status}
                                            </b>
                                        </span>
                                    </div>
                                </div>
                            </div>


                        </div>
                        {/* RIGHT CORNER: EDIT ACTION */}
                        <div className="ml-auto flex shrink-0 items-start">
                            <button
                                type="button"
                                onClick={() => {
                                    if (!current?.id) {
                                        console.error("Size ID is missing:", current);
                                        return;
                                    }

                                    dispatch(setExsistingSize(current));

                                    dispatch(
                                        openModal({
                                            type: "editSize",
                                            data: current,
                                        })
                                    );
                                }}
                                title="Edit Unit"
                                className="
        inline-flex items-center gap-2
        rounded-lg border border-slate-200
        bg-white px-3 py-2
        text-sm font-medium text-slate-600
        transition hover:bg-slate-50
    "
                            >
                                <SquarePen size={15} />
                                Edit
                            </button>
                        </div>
                    </div>
                </div>

                {/* Size OVERVIEW */}

                <div className="grid grid-cols-1 items-stretch gap-4">
                    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                        <h3 className="text-[14px] font-semibold text-slate-900">
                            Size Overview
                        </h3>

                        <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                            <StatTile
                                icon={Ruler}
                                label="Size Name"
                                value={sizeName}
                                bgColor="bg-[#0B57D0]"
                            />

                            <StatTile
                                icon={BadgeCheck}
                                label="Status"
                                value={status}
                                bgColor="bg-[#FF8904]"
                            />

                            <StatTile
                                icon={FileText}
                                label="Unit ID"
                                value={current.id}
                                bgColor="bg-[#166534]"
                            />
                        </div>

                        <h4 className="mb-2 mt-5 text-[13px] font-semibold text-slate-900">
                            Size Details
                        </h4>

                        <div className="space-y-0">
                            <div className="flex items-start justify-between gap-4 border-t border-slate-100 px-3 py-3 text-[12.5px]">
                                <span className="shrink-0 text-slate-500">
                                    Size Name
                                </span>

                                <span className="break-words text-right font-medium text-slate-800">
                                    {sizeName || "-"}
                                </span>
                            </div>

                            <div className="flex items-start justify-between gap-4 border-t border-slate-100 px-3 py-3 text-[12.5px]">
                                <span className="shrink-0 text-slate-500">
                                    Size Short Name
                                </span>

                                <span className="break-words text-right font-medium text-slate-800">
                                    {sizeShortName || "-"}
                                </span>
                            </div>

                            <div className="flex items-start justify-between gap-4 border-t border-slate-100 px-3 py-3 text-[12.5px]">
                                <span className="shrink-0 text-slate-500">
                                    Description
                                </span>

                                <span className="max-w-[70%] break-words text-right font-medium text-slate-800">
                                    {current.description || "-"}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-4 border-t border-slate-100 px-3 py-3 text-[12.5px]">
                                <span className="text-slate-500">
                                    Status
                                </span>

                                <span
                                    className={`font-medium ${isActive
                                        ? "text-emerald-600"
                                        : "text-slate-500"
                                        }`}
                                >
                                    {status}
                                </span>
                            </div>

                            {createdDate && (
                                <div className="flex items-center justify-between gap-4 border-t border-slate-100 px-3 py-3 text-[12.5px]">
                                    <span className="text-slate-500">
                                        Created Date
                                    </span>

                                    <span className="font-medium text-slate-800">
                                        {createdDate}
                                    </span>
                                </div>
                            )}

                            {updatedDate && (
                                <div className="flex items-center justify-between gap-4 border-t border-slate-100 px-3 py-3 text-[12.5px]">
                                    <span className="text-slate-500">
                                        Updated Date
                                    </span>

                                    <span className="font-medium text-slate-800">
                                        {updatedDate}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* UNIT INFORMATION */}

                <div className="grid grid-cols-1 items-start gap-4">
                    <div className="grid grid-cols-1 content-start gap-4">
                        <FieldsSection
                            title="Basic Information"
                            fields={BASIC_FIELDS}
                            values={current}
                            onSave={(patch) =>
                                saveFields(
                                    patch,
                                    "Updated basic unit information"
                                )
                            }
                        />

                        <FieldsSection
                            title="Account Information"
                            fields={ACCOUNT_FIELDS}
                            values={current}
                            onSave={(patch) =>
                                saveFields(
                                    patch,
                                    "Updated size status"
                                )
                            }
                        />

                        <SizeAvatarSection
                            unitName={sizeName}
                            initials={initials}
                        />

                        {/* RECENT ACTIVITY */}

                        <div className="flex h-full min-h-[190px] flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <h3 className="flex items-center gap-2 text-[14px] font-semibold text-slate-900">
                                <Activity
                                    size={15}
                                    className="text-[#0F4659]"
                                />
                                Recent Activity
                            </h3>

                            {activity.length === 0 ? (
                                <div className="flex flex-1 items-center justify-center">
                                    <p className="px-3 py-8 text-center text-[13px] text-slate-400">
                                        Changes you make on this page will appear here.
                                    </p>
                                </div>
                            ) : (
                                <ul className="mt-3">
                                    {activity.map(
                                        (activityItem, index) => (
                                            <li
                                                key={
                                                    activityItem.at +
                                                    index
                                                }
                                                className={`flex items-center justify-between gap-3 px-3 py-3 text-[12.5px] ${index > 0
                                                    ? "border-t border-slate-100"
                                                    : ""
                                                    }`}
                                            >
                                                <span className="flex items-center gap-2 text-slate-800">
                                                    <CircleCheck
                                                        size={13}
                                                        className="shrink-0 text-emerald-500"
                                                    />
                                                    {activityItem.text}
                                                </span>

                                                <span className="shrink-0 text-[11.5px] text-slate-400">
                                                    {timeAgo(activityItem.at)}
                                                </span>
                                            </li>
                                        )
                                    )}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
