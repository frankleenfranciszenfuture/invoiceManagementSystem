
import React, {
    useEffect,
    useRef,
    useState,
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
    SquarePen,
    Check,
    X,
    Loader2,
    AlertCircle,
    RotateCcw,
    ShieldCheck,
    BadgeCheck,
    Clock3,
    FileText,
    Activity,
    CircleCheck,
    CircleX,
    Shield,
} from "lucide-react";

import {
    fetchAllRoles,
    fetchRoleById,
    updateRole,
    updateRoleStatus,
} from "../thunks/roleThunks";

/* =========================================================
   FIELD CONFIG
========================================================= */

const BASIC_FIELDS = [
    {
        key: "roleName",
        label: "Role Name",
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

    if (seconds < 60) {
        return "Just now";
    }

    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) {
        return `${minutes} min ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
        return `${hours} hr ago`;
    }

    return `${Math.floor(hours / 24)} days ago`;
}

function validate(fields, values) {
    const errors = {};

    fields.forEach((field) => {
        const value = toText(
            values[field.key]
        ).trim();

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
        return () => {
            clearTimeout(timer.current);
        };
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
    canSave = true,
    onEdit,
    onSave,
    onCancel,
    children,
}) {
    return (
        <div className="flex h-full min-w-0 flex-col rounded-xl border border-slate-200 bg-white shadow-sm">

            {/* HEADER */}

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
                                disabled={saving || !canSave}
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

            {/* CONTENT */}

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

    /* START EDIT */

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

    /* CANCEL */

    const cancel = () => {
        setEditing(false);
        setErrors({});
        setServerError("");
    };

    /* SAVE */

    const save = async () => {
        const validationErrors = validate(
            fields,
            draft
        );

        setErrors(validationErrors);

        if (
            Object.keys(validationErrors).length > 0
        ) {
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
                    "Failed to save changes."
                );
            }
        } catch (error) {
            setServerError(
                error?.message ||
                "Failed to save changes."
            );
        } finally {
            setSaving(false);
        }
    };

    /* FIELD DISPLAY */

    const displayValue = (field, value) => {
        if (field.type === "status") {
            return value || "ACTIVE";
        }

        return toText(value);
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
                                        className={`inline-flex rounded-full px-2 py-1 text-[11px] font-medium ${String(value || "ACTIVE").toUpperCase() ===
                                            "ACTIVE"
                                            ? "bg-emerald-50 text-emerald-600"
                                            : String(value || "").toUpperCase() ===
                                                "INACTIVE"
                                                ? "bg-slate-100 text-slate-600"
                                                : "bg-amber-50 text-amber-600"
                                            }`}
                                    >
                                        {value || "ACTIVE"}
                                    </span>
                                ) : (
                                    displayValue(field, value) || (
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
   ROLE AVATAR SECTION
========================================================= */

function RoleAvatarSection({
    roleName,
    initials,
}) {
    return (
        <div className="flex h-full min-h-[190px] flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between px-4 pt-4">
                <h3 className="text-[14px] font-semibold text-slate-900">
                    Role Profile
                </h3>
            </div>

            <div className="flex flex-1 items-center justify-center px-3 py-5">
                <div
                    className="flex h-[110px] w-[110px] items-center justify-center rounded-full border-4 border-[#0F4659]/10 bg-gradient-to-br from-[#0F4659]/80 to-[#0F4659] shadow-sm"
                    title={roleName || "Role"}
                >
                    <span className="text-[30px] font-bold tracking-tight text-white">
                        {initials}
                    </span>
                </div>
            </div>

            <div className="border-t border-slate-100 px-4 py-2.5 text-center">
                <p className="truncate text-[12px] text-slate-400">
                    {roleName || "Role profile"}
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
}) {
    return (
        <div className="min-w-0 rounded-lg border border-slate-200 bg-[#0F4659] px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-gray-100">
                <Icon
                    size={14}
                    className="shrink-0 text-gray-100"
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

export default function RoleProfileOverview({
    roleId,
}) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { id: paramId } = useParams();

    const {
        role,
        roles,
        loading,
        error,
    } = useSelector((state) => state.role || {});

    /* ROLE ID */

    const id = roleId ?? paramId;

    const current = id
        ? (
            String(role?.id) === String(id)
                ? role
                : roles?.find(
                    (item) =>
                        String(item.id) === String(id)
                )
        )
        : roles?.[0];

    const ready = Boolean(current?.id);

    /* LOCAL UI STATE */

    const [activity, setActivity] = useState([]);

    /* FETCH ROLE */

    useEffect(() => {
        if (id) {
            dispatch(fetchRoleById(id));
        } else {
            dispatch(fetchAllRoles());
        }
    }, [id, dispatch]);

    /* ACTIVITY */

    const logActivity = (text) => {
        setActivity((previous) => [
            {
                text,
                at: Date.now(),
            },
            ...previous,
        ].slice(0, 8));
    };

    /* SAVE ROLE FIELDS */

    const saveFields = async (patch, label) => {
        if (!current?.id) {
            return {
                ok: false,
                message: "Role ID is missing.",
            };
        }

        let response;

        /*
         * Use the dedicated status endpoint when
         * only the status field is being updated.
         */

        if (
            Object.keys(patch).length === 1 &&
            Object.prototype.hasOwnProperty.call(
                patch,
                "status"
            )
        ) {
            response = await dispatch(
                updateRoleStatus({
                    id: current.id,
                    status: patch.status,
                })
            );
        } else {
            response = await dispatch(
                updateRole({
                    id: current.id,
                    data: {
                        roleName: current.roleName,
                        description: current.description || "",
                        status: current.status || "ACTIVE",
                        ...patch,
                    },
                })
            );
        }

        if (
            updateRole.fulfilled.match(response) ||
            updateRoleStatus.fulfilled.match(response)
        ) {
            if (label) {
                logActivity(`Updated ${label}`);
            }

            return {
                ok: true,
            };
        }

        return {
            ok: false,
            message:
                response.payload ||
                "Failed to update role.",
        };
    };

    /* RETRY */

    const retry = () => {
        if (id) {
            dispatch(fetchRoleById(id));
        } else {
            dispatch(fetchAllRoles());
        }
    };

    /* LOADING */

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

    /* EMPTY / ERROR */

    if (!ready) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 text-center">
                <AlertCircle
                    size={32}
                    className="text-slate-300"
                />

                <p className="text-sm text-slate-500">
                    {error || "No role found."}
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

    /* DERIVED VALUES */

    const roleName = toText(current.roleName);

    const initials =
        roleName
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((word) => word[0])
            .join("")
            .toUpperCase() || "RO";

    const status = String(
        current.status || "ACTIVE"
    ).toUpperCase();

    const isActive = status === "ACTIVE";

    const createdDate = formatDate(
        current.createdAt
    );

    const updatedDate = formatDate(
        current.updatedAt
    );

    /* UI */

    return (
        <div className="w-full space-y-4 p-3">

            {/* PROFILE HEADER */}

            <div className="w-full space-y-4">
                <div className="rounded-xl border border-slate-100 bg-white p-4">
                    <div className="flex flex-wrap items-start justify-between gap-4 px-2 py-3 pb-5">
                        <div className="flex items-start gap-4">

                            {/* AVATAR */}

                            <div
                                className="flex h-[86px] w-[86px] shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-[4px] border-white bg-gradient-to-br from-[#0F4659]/70 to-[#0F4659] shadow-md"
                                onClick={() => navigate("/roles")}
                                title="Back to Roles"
                            >
                                <span className="text-[24px] font-bold tracking-tight text-white">
                                    {initials}
                                </span>
                            </div>

                            {/* ROLE DETAILS */}

                            <div className="pt-2.5">
                                <h2
                                    className="cursor-pointer text-[24px] font-semibold leading-tight text-[#0F4659] hover:text-[#0F4659]/70"
                                    onClick={() => navigate("/roles")}
                                >
                                    {roleName || "Role"}
                                </h2>

                                <p className="mt-0.5 text-[12px] text-[#0F4659]">
                                    Role ID: {current.id}
                                </p>

                                <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px] text-slate-500">
                                    <span className="flex items-center gap-1 text-slate-700">
                                        <Shield size={13} />
                                        {roleName || "-"}
                                    </span>

                                    <span className="flex items-center gap-1 text-slate-700">
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
                </div>

                {/* ROLE OVERVIEW */}

                <div className="grid grid-cols-1 items-stretch gap-4">
                    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                        <h3 className="text-[14px] font-semibold text-slate-900">
                            Role Overview
                        </h3>

                        <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                            <StatTile
                                icon={ShieldCheck}
                                label="Role Name"
                                value={current.roleName}
                            />

                            <StatTile
                                icon={BadgeCheck}
                                label="Status"
                                value={status}
                            />

                            <StatTile
                                icon={FileText}
                                label="Role ID"
                                value={current.id}
                            />
                        </div>

                        <h4 className="mb-2 mt-5 text-[13px] font-semibold text-slate-900">
                            Role Details
                        </h4>

                        <div className="space-y-0">
                            <div className="flex items-start justify-between gap-4 border-t border-slate-100 px-3 py-3 text-[12.5px]">
                                <span className="shrink-0 text-slate-500">
                                    Role Name
                                </span>

                                <span className="break-words text-right font-medium text-slate-800">
                                    {current.roleName || "-"}
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

                {/* ROLE INFORMATION + PROFILE */}

                <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-1">


                    {/*  ROLE PROFILE + ACTIVITY */}

                    <div className="grid grid-cols-1 content-start gap-4">

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
                                                    {timeAgo(
                                                        activityItem.at
                                                    )}
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
