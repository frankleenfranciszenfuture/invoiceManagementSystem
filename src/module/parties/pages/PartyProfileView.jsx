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
    Building2,
    Users,
    BadgeCheck,
    CircleDollarSign,
    Mail,
    Phone,
    Globe,
    Hash,
    CreditCard,
    Clock3,
    Wallet,
} from "lucide-react";

import {
    fetchPartyById,
    updateParty,
} from "../thunks/partyThunks";

/* =========================================================
   FIELD CONFIG
========================================================= */

const PARTY_FIELDS = [
    {
        key: "companyName",
        label: "Party Name",
        required: true,
    },
    {
        key: "partyCode",
        label: "Party Code",
    },
    {
        key: "partyType",
        label: "Party Type",
        type: "partyType",
        required: true,
    },
    {
        key: "contactPerson",
        label: "Contact Person",
    },
];

const CONTACT_FIELDS = [
    {
        key: "email",
        label: "Email Address",
        type: "email",
    },
    {
        key: "mobile",
        label: "Mobile Number",
        required: true,
    },
    {
        key: "alternateMobile",
        label: "Alternate Mobile",
    },
    {
        key: "website",
        label: "Website",
    },
];

const TAX_FIELDS = [
    {
        key: "gstNumber",
        label: "GST Number",
    },
    {
        key: "panNumber",
        label: "PAN Number",
    },
    {
        key: "creditLimit",
        label: "Credit Limit",
        type: "number",
    },
    {
        key: "paymentTerms",
        label: "Payment Terms",
        type: "paymentTerms",
    },
];

const SETTINGS_FIELDS = [
    {
        key: "status",
        label: "Status",
        type: "status",
    },
];

/* =========================================================
   HELPERS
========================================================= */

const toText = (value) =>
    value === null || value === undefined
        ? ""
        : String(value);

const formatAmount = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

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
            errors[field.key] = `${field.label} is required`;
        }
    });

    const email = toText(values.email).trim();

    if (
        fields.some((field) => field.key === "email") &&
        email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
        errors.email = "Enter a valid email address";
    }

    if (
        fields.some((field) => field.key === "creditLimit") &&
        values.creditLimit !== "" &&
        values.creditLimit !== null &&
        (
            !Number.isFinite(Number(values.creditLimit)) ||
            Number(values.creditLimit) < 0
        )
    ) {
        errors.creditLimit = "Credit limit cannot be negative";
    }

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
                                className="flex items-center gap-1 rounded-md bg-[#0F4659] px-2.5 py-1.5 text-[11.5px] font-medium text-white shadow-sm transition hover:bg-[#0a3543] disabled:cursor-not-allowed disabled:opacity-60"
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
                            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-100 hover:text-[#0F4659]"
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
   EDITABLE FIELDS SECTION
========================================================= */

function FieldsSection({
    title,
    fields,
    values,
    onSave,
    onActivity,
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
            draftValues[field.key] = values[field.key];
        });

        setDraft(draftValues);
        setErrors({});
        setServerError("");
        setEditing(true);
    };

    const cancel = () => {
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
            const value = draft[field.key];

            if (field.type === "number") {
                patch[field.key] =
                    value === "" || value === null
                        ? 0
                        : Number(value);
            } else {
                patch[field.key] =
                    typeof value === "boolean"
                        ? value
                        : toText(value).trim();
            }
        });

        setSaving(true);
        setServerError("");

        try {
            const result = await onSave(patch);

            if (result.ok) {
                setEditing(false);
                flash();
                onActivity?.(`Updated ${title.toLowerCase()}`);
            } else {
                setServerError(
                    result.message || "Failed to save changes."
                );
            }
        } catch (error) {
            setServerError(
                error?.message || "Failed to save changes."
            );
        } finally {
            setSaving(false);
        }
    };

    const updateDraft = (key, value) => {
        setDraft((previous) => ({
            ...previous,
            [key]: value,
        }));

        setErrors((previous) => ({
            ...previous,
            [key]: "",
        }));
    };

    const commonClass = (field) => `
        w-full rounded-lg border bg-white px-3
        text-[13px] text-slate-800 outline-none
        transition focus:border-[#0F4659]
        focus:ring-2 focus:ring-[#0F4659]/10
        disabled:bg-slate-50
        ${errors[field.key]
            ? "border-red-400"
            : "border-slate-300"
        }
    `;

    const renderInput = (field) => {
        const value = draft[field.key];
        const className = commonClass(field);

        if (field.type === "status") {
            return (
                <select
                    value={value || "ACTIVE"}
                    onChange={(event) =>
                        updateDraft(field.key, event.target.value)
                    }
                    disabled={saving}
                    className={`${className} h-[34px]`}
                >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="DRAFT">DRAFT</option>
                </select>
            );
        }

        if (field.type === "partyType") {
            return (
                <select
                    value={value || ""}
                    onChange={(event) =>
                        updateDraft(field.key, event.target.value)
                    }
                    disabled={saving}
                    className={`${className} h-[34px]`}
                >
                    <option value="">Select party type</option>
                    <option value="SUPPLIER">SUPPLIER</option>
                    <option value="CUSTOMER">CUSTOMER</option>
                    <option value="BOTH">BOTH</option>
                </select>
            );
        }

        if (field.type === "paymentTerms") {
            return (
                <select
                    value={value || "30 Days"}
                    onChange={(event) =>
                        updateDraft(field.key, event.target.value)
                    }
                    disabled={saving}
                    className={`${className} h-[34px]`}
                >
                    <option value="Due on Receipt">Due on Receipt</option>
                    <option value="7 Days">7 Days</option>
                    <option value="15 Days">15 Days</option>
                    <option value="30 Days">30 Days</option>
                    <option value="45 Days">45 Days</option>
                    <option value="60 Days">60 Days</option>
                    <option value="90 Days">90 Days</option>
                </select>
            );
        }

        return (
            <input
                type={
                    field.type === "email"
                        ? "email"
                        : field.type === "number"
                            ? "number"
                            : "text"
                }
                min={field.type === "number" ? "0" : undefined}
                step={field.type === "number" ? "0.01" : undefined}
                value={value ?? ""}
                onChange={(event) =>
                    updateDraft(field.key, event.target.value)
                }
                placeholder={field.label}
                disabled={saving}
                className={`${className} h-[34px]`}
            />
        );
    };

    const renderValue = (field, value) => {
        if (field.type === "status") {
            const status = toText(value || "ACTIVE").toUpperCase();

            const statusClass =
                status === "ACTIVE"
                    ? "bg-emerald-50 text-emerald-600"
                    : status === "INACTIVE"
                        ? "bg-slate-100 text-slate-600"
                        : "bg-amber-50 text-amber-600";

            return (
                <span
                    className={`inline-flex rounded-full px-2 py-1 text-[11px] font-medium ${statusClass}`}
                >
                    {status}
                </span>
            );
        }

        if (field.type === "number") {
            return formatAmount(value);
        }

        return value ? (
            toText(value)
        ) : (
            <span className="text-slate-300">-</span>
        );
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
            {fields.map((field, index) => (
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
                            <span className="text-red-500"> *</span>
                        )}
                    </p>

                    {editing ? (
                        <div className="mt-1.5">
                            {renderInput(field)}

                            {errors[field.key] && (
                                <p className="mt-1 text-[11.5px] text-red-500">
                                    {errors[field.key]}
                                </p>
                            )}
                        </div>
                    ) : (
                        <p className="mt-1 break-words text-[12.5px] leading-5 text-slate-800">
                            {renderValue(field, values[field.key])}
                        </p>
                    )}
                </div>
            ))}
        </SectionCard>
    );
}

/* =========================================================
   STAT TILE
========================================================= */

function StatTile({ icon: Icon, label, value }) {
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

export default function PartyProfileView({ partyId }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id: paramId } = useParams();

    const id = partyId ?? paramId;

    const {
        party,
        loading,
        error,
    } = useSelector((state) => state.party || {});

    const [activity, setActivity] = useState([]);

    /* -------------------------------------------------------
       FETCH PARTY
    ------------------------------------------------------- */

    useEffect(() => {
        if (id) {
            dispatch(fetchPartyById(id));
        }
    }, [dispatch, id]);

    /* -------------------------------------------------------
       ACTIVITY
    ------------------------------------------------------- */

    const logActivity = (text) => {
        setActivity((previous) => [
            {
                text,
                at: Date.now(),
            },
            ...previous,
        ].slice(0, 8));
    };

    /* -------------------------------------------------------
       CURRENT PARTY
    ------------------------------------------------------- */

    const current =
        party && String(party.id) === String(id)
            ? party
            : null;

    const ready = Boolean(current?.id);

    /* -------------------------------------------------------
       SAVE PARTY
    ------------------------------------------------------- */

    const saveFields = async (patch) => {
        if (!current?.id) {
            return {
                ok: false,
                message: "Party ID is missing.",
            };
        }

        const response = await dispatch(
            updateParty({
                id: current.id,
                data: {
                    ...current,
                    ...patch,
                },
            })
        );

        if (updateParty.fulfilled.match(response)) {
            return { ok: true };
        }

        return {
            ok: false,
            message:
                response.payload?.message ||
                response.payload ||
                response.error?.message ||
                "Failed to update party.",
        };
    };

    /* -------------------------------------------------------
       REACTIVATE PARTY
    ------------------------------------------------------- */

    const handleReactivate = async () => {
        if (!current?.id) return;

        const response = await dispatch(
            updateParty({
                id: current.id,
                data: {
                    ...current,
                    status: "ACTIVE",
                },
            })
        );

        if (updateParty.fulfilled.match(response)) {
            logActivity("Reactivated party");
        }
    };

    /* -------------------------------------------------------
       RETRY
    ------------------------------------------------------- */

    const retry = () => {
        if (id) {
            dispatch(fetchPartyById(id));
        }
    };

    /* =======================================================
       LOADING
    ======================================================= */

    if (!ready && loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center text-slate-400">
                <Loader2 size={26} className="animate-spin" />
            </div>
        );
    }

    /* =======================================================
       EMPTY / ERROR
    ======================================================= */

    if (!ready) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 text-center">
                <AlertCircle size={32} className="text-slate-300" />

                <p className="text-sm text-slate-500">
                    {typeof error === "string"
                        ? error
                        : error?.message || "No party found."}
                </p>

                <button
                    type="button"
                    onClick={retry}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[13px] font-medium text-slate-700 transition hover:bg-slate-50"
                >
                    <RotateCcw size={13} />
                    Try again
                </button>

                <button
                    type="button"
                    onClick={() => navigate("/parties")}
                    className="text-[13px] font-medium text-[#0F4659] hover:underline"
                >
                    Back to Parties
                </button>
            </div>
        );
    }

    /* =======================================================
       DERIVED VALUES
    ======================================================= */

    const initials =
        toText(current.companyName)
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((word) => word[0])
            .join("")
            .toUpperCase() || "P";

    const isActive =
        String(current.status || "ACTIVE").toUpperCase() === "ACTIVE";

    const partyType = toText(current.partyType || "SUPPLIER");

    /* =======================================================
       UI
    ======================================================= */

    return (
        <div className="w-full space-y-4 p-3">
            {/* PROFILE HEADER */}

            <div className="w-full space-y-4">
                <div className="rounded-xl border border-slate-100 bg-white p-4">
                    <div className="flex flex-wrap items-start justify-between gap-4 px-2 py-3 pb-5">
                        <div className="flex items-start gap-4">
                            {/* AVATAR */}

                            <div
                                className="-mt-[15px] flex h-[86px] w-[86px] shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-[4px] border-white bg-gradient-to-br from-[#0F4659]/70 to-[#0F4659] shadow-md"
                                onClick={() => navigate("/parties")}
                                title="Back to Parties"
                            >
                                <span className="text-[25px] font-semibold text-white">
                                    {initials}
                                </span>
                            </div>

                            {/* PARTY DETAILS */}

                            <div className="pt-1">
                                <h2 className="text-[24px] font-semibold leading-tight text-[#0F4659]">
                                    {current.companyName || "Party"}
                                </h2>

                                <p className="mt-0.5 text-[12px] text-[#0F4659]">
                                    Party Code: {current.partyCode || "-"}
                                </p>

                                <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px] text-slate-500">
                                    <span className="flex items-center gap-1 text-slate-700">
                                        <Users size={13} />
                                        {partyType}
                                    </span>

                                    <span className="flex items-center gap-1 text-slate-700">
                                        <Phone size={13} />
                                        {current.mobile || "-"}
                                    </span>

                                    <span className="flex items-center gap-1 text-slate-700">
                                        <Mail size={13} />
                                        {current.email || "-"}
                                    </span>

                                    <span>
                                        Status:{" "}
                                        <b
                                            className={
                                                isActive
                                                    ? "font-semibold text-emerald-600"
                                                    : "font-semibold text-slate-500"
                                            }
                                        >
                                            {current.status || "ACTIVE"}
                                        </b>
                                    </span>
                                </div>
                            </div>
                        </div>
                        {/* RIGHT SIDE: OUTSTANDING CLEARANCE + REACTIVATE */}

                        <div className="ml-auto flex flex-wrap items-start justify-end gap-3 pt-2">

                            {/* OUTSTANDING CLEARANCE STAT CARD */}

                            <button
                                type="button"
                                onClick={() => navigate("/clearances")}
                                className="group min-w-[190px] rounded-xl border border-amber-200 bg-white px-4 py-3 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"
                                title="View Outstanding Clearance"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                                            Outstanding Clearance
                                        </p>

                                        <p className="mt-1 text-[21px] font-semibold leading-tight text-amber-600">
                                            ₹{Number(current.outstandingCredit || 0).toLocaleString("en-IN", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </p>

                                        <p className="mt-1 text-[11px] text-slate-400">
                                            View clearance details
                                        </p>
                                    </div>

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 transition group-hover:bg-amber-100">
                                        <Wallet size={19} />
                                    </div>
                                </div>
                            </button>

                            {/* REACTIVATE */}

                            {!isActive && (
                                <button
                                    type="button"
                                    onClick={handleReactivate}
                                    disabled={loading}
                                    className="mt-1 flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3.5 py-2 text-[13px] font-medium text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        <RotateCcw size={14} />
                                    )}
                                    Reactivate
                                </button>
                            )}
                        </div>
                        {/* REACTIVATE */}

                        {!isActive && (
                            <div className="pt-2.5">
                                <button
                                    type="button"
                                    onClick={handleReactivate}
                                    disabled={loading}
                                    className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3.5 py-2 text-[13px] font-medium text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <Loader2
                                            size={14}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <RotateCcw size={14} />
                                    )}
                                    Reactivate
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* PARTY OVERVIEW */}

                <div className="grid grid-cols-1 items-stretch gap-4">
                    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                        <h3 className="text-[14px] font-semibold text-slate-900">
                            Party Overview
                        </h3>

                        <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
                            <StatTile
                                icon={Building2}
                                label="Party Name"
                                value={current.companyName}
                            />

                            <StatTile
                                icon={Users}
                                label="Party Type"
                                value={partyType}
                            />

                            {/* <StatTile
                                icon={BadgeCheck}
                                label="Status"
                                value={current.status || "ACTIVE"}
                            /> */}

                            <StatTile
                                icon={CircleDollarSign}
                                label="Credit Limit"
                                value={`₹ ${formatAmount(current.creditLimit)}`}
                            />

                            <StatTile
                                icon={CircleDollarSign}
                                label="OutStanding Credit Limit"
                                value={`₹ ${formatAmount(current.outstandingCredit)}`}
                            />

                            <StatTile
                                icon={CircleDollarSign}
                                label="Available Credit Limit"
                                value={`₹ ${formatAmount(current.availableCredit)}`}
                            />
                        </div>

                        <h4 className="mb-2 mt-5 text-[13px] font-semibold text-slate-900">
                            Party Details
                        </h4>

                        <div className="space-y-0">
                            <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-3 py-3 text-[12.5px]">
                                <span className="text-slate-500">
                                    Contact Person
                                </span>

                                <span className="break-words text-right font-medium text-slate-800">
                                    {current.contactPerson || "-"}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-3 py-3 text-[12.5px]">
                                <span className="text-slate-500">
                                    GST Number
                                </span>

                                <span className="font-medium text-slate-800">
                                    {current.gstNumber || "-"}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-3 py-3 text-[12.5px]">
                                <span className="text-slate-500">
                                    PAN Number
                                </span>

                                <span className="font-medium text-slate-800">
                                    {current.panNumber || "-"}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-3 py-3 text-[12.5px]">
                                <span className="text-slate-500">
                                    Payment Terms
                                </span>

                                <span className="font-medium text-slate-800">
                                    {current.paymentTerms || "-"}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-3 py-3 text-[12.5px]">
                                <span className="text-slate-500">
                                    Website
                                </span>

                                <span className="max-w-[65%] break-all text-right font-medium text-slate-800">
                                    {current.website || "-"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* EDITABLE INFORMATION + ACTIVITY */}

                <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
                    {/* LEFT — PARTY INFORMATION */}

                    <div className="grid grid-cols-1 content-start gap-4">
                        <FieldsSection
                            title="Party Information"
                            fields={PARTY_FIELDS}
                            values={current}
                            onSave={saveFields}
                            onActivity={logActivity}
                        />

                        <FieldsSection
                            title="Contact Details"
                            fields={CONTACT_FIELDS}
                            values={current}
                            onSave={saveFields}
                            onActivity={logActivity}
                        />

                        <FieldsSection
                            title="Tax & Credit Details"
                            fields={TAX_FIELDS}
                            values={current}
                            onSave={saveFields}
                            onActivity={logActivity}
                        />

                        <FieldsSection
                            title="Party Settings"
                            fields={SETTINGS_FIELDS}
                            values={current}
                            onSave={saveFields}
                            onActivity={logActivity}
                        />
                    </div>

                    {/* RIGHT — RECENT ACTIVITY */}

                    <div className="flex h-full min-h-[250px] flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <h3 className="text-[14px] font-semibold text-slate-900">
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
                                {activity.map((item, index) => (
                                    <li
                                        key={`${item.at}-${index}`}
                                        className={`flex items-center justify-between gap-3 px-3 py-3 text-[12.5px] ${index > 0
                                            ? "border-t border-slate-100"
                                            : ""
                                            }`}
                                    >
                                        <span className="text-slate-800">
                                            {item.text}
                                        </span>

                                        <span className="shrink-0 text-[11.5px] text-slate-400">
                                            {timeAgo(item.at)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
