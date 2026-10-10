
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
    Landmark,
    Wallet,
    BadgeCheck,
    CircleDollarSign,
    CreditCard,
    Building2,
    Hash,
    Clock3,
} from "lucide-react";

import {
    fetchBankAccountById,
    updateBankAccount,
    reactivateBankAccount,
} from "../thunks/bankAccountThunks";

/* =========================================================
   FIELD CONFIG
========================================================= */

const ACCOUNT_FIELDS = [
    {
        key: "accountName",
        label: "Account Name",
        required: true,
    },
    {
        key: "accountCode",
        label: "Account Code",
    },
    {
        key: "accountType",
        label: "Account Type",
        type: "accountType",
        required: true,
    },
    {
        key: "currency",
        label: "Currency",
        type: "currency",
        required: true,
    },
];

const BANK_FIELDS = [
    {
        key: "bankName",
        label: "Bank Name",
        required: true,
    },
    {
        key: "accountNumber",
        label: "Account Number",
        required: true,
    },
    {
        key: "ifsc",
        label: "IFSC Code",
    },
];

const SETTINGS_FIELDS = [
    {
        key: "primaryAccount",
        label: "Primary Account",
        type: "boolean",
    },
    {
        key: "status",
        label: "Status",
        type: "status",
    },
    {
        key: "description",
        label: "Description",
        type: "textarea",
    },
];

/* =========================================================
   HELPERS
========================================================= */

const toText = (value) =>
    value === null || value === undefined
        ? ""
        : String(value);

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

            if (field.type === "boolean") {
                patch[field.key] = Boolean(value);
            } else {
                patch[field.key] = toText(value).trim();
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

    const renderInput = (field) => {
        const value = draft[field.key];

        const commonClass = `
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

        if (field.type === "boolean") {
            return (
                <select
                    value={value ? "true" : "false"}
                    onChange={(event) =>
                        updateDraft(
                            field.key,
                            event.target.value === "true"
                        )
                    }
                    disabled={saving}
                    className={`${commonClass} h-[34px]`}
                >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                </select>
            );
        }

        if (field.type === "status") {
            return (
                <select
                    value={value || "ACTIVE"}
                    onChange={(event) =>
                        updateDraft(field.key, event.target.value)
                    }
                    disabled={saving}
                    className={`${commonClass} h-[34px]`}
                >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="DRAFT">DRAFT</option>
                </select>
            );
        }

        if (field.type === "accountType") {
            return (
                <select
                    value={value || ""}
                    onChange={(event) =>
                        updateDraft(field.key, event.target.value)
                    }
                    disabled={saving}
                    className={`${commonClass} h-[34px]`}
                >
                    <option value="">Select account type</option>
                    <option value="CURRENT">CURRENT</option>
                    <option value="SAVINGS">SAVINGS</option>
                </select>
            );
        }

        if (field.type === "currency") {
            return (
                <select
                    value={value || "INR"}
                    onChange={(event) =>
                        updateDraft(field.key, event.target.value)
                    }
                    disabled={saving}
                    className={`${commonClass} h-[34px]`}
                >
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                </select>
            );
        }

        if (field.type === "textarea") {
            return (
                <textarea
                    rows={3}
                    value={value ?? ""}
                    onChange={(event) =>
                        updateDraft(field.key, event.target.value)
                    }
                    disabled={saving}
                    placeholder={field.label}
                    className={`${commonClass} min-h-[76px] py-2`}
                />
            );
        }

        return (
            <input
                type="text"
                value={value ?? ""}
                onChange={(event) =>
                    updateDraft(field.key, event.target.value)
                }
                placeholder={field.label}
                disabled={saving}
                className={`${commonClass} h-[34px]`}
            />
        );
    };

    const renderValue = (field, value) => {
        if (field.type === "boolean") {
            const checked = Boolean(value);

            return (
                <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium ${checked
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-amber-50 text-amber-600"
                        }`}
                >
                    {checked ? <Check size={11} /> : <X size={11} />}
                    {checked ? "Yes" : "No"}
                </span>
            );
        }

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
                    className={`py-2.5 ${index > 0 ? "border-t border-slate-100" : ""
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
                <Icon size={14} className="shrink-0 text-gray-100" />
                <span className="truncate text-[10.5px]">{label}</span>
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

export default function BankAccountProfileOverview({ bankAccountId }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id: paramId } = useParams();

    const id = bankAccountId ?? paramId;

    const {
        bankAccount,
        loading,
        error,
    } = useSelector((state) => state.bankAccount || {});

    const [activity, setActivity] = useState([]);

    /* -------------------------------------------------------
       FETCH BANK ACCOUNT
    ------------------------------------------------------- */

    useEffect(() => {
        if (id) {
            dispatch(fetchBankAccountById(id));
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
       CURRENT ACCOUNT
    ------------------------------------------------------- */

    const current =
        bankAccount &&
            String(bankAccount.id) === String(id)
            ? bankAccount
            : null;

    const ready = Boolean(current?.id);

    /* -------------------------------------------------------
       SAVE BANK ACCOUNT
    ------------------------------------------------------- */

    const saveFields = async (patch) => {
        if (!current?.id) {
            return {
                ok: false,
                message: "Bank account ID is missing.",
            };
        }

        const response = await dispatch(
            updateBankAccount({
                id: current.id,
                data: {
                    ...current,
                    ...patch,
                },
            })
        );

        if (updateBankAccount.fulfilled.match(response)) {
            return { ok: true };
        }

        return {
            ok: false,
            message:
                response.payload ||
                "Failed to update bank account.",
        };
    };

    /* -------------------------------------------------------
       REACTIVATE BANK ACCOUNT
    ------------------------------------------------------- */

    const handleReactivate = async () => {
        if (!current?.id) return;

        const response = await dispatch(
            reactivateBankAccount(current.id)
        );

        if (reactivateBankAccount.fulfilled.match(response)) {
            logActivity("Reactivated bank account");

            dispatch(fetchBankAccountById(current.id));
        }
    };

    /* -------------------------------------------------------
       RETRY
    ------------------------------------------------------- */

    const retry = () => {
        if (id) {
            dispatch(fetchBankAccountById(id));
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
                    {error || "No bank account found."}
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
                    onClick={() => navigate("/bankAccount")}
                    className="text-[13px] font-medium text-[#0F4659] hover:underline"
                >
                    Back to Bank Accounts
                </button>
            </div>
        );
    }

    /* =======================================================
       DERIVED VALUES
    ======================================================= */

    const initials =
        toText(current.accountName)
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((word) => word[0])
            .join("")
            .toUpperCase() || "BA";

    const isActive =
        String(current.status || "ACTIVE").toUpperCase() === "ACTIVE";

    const isPrimary = Boolean(current.primaryAccount);

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
                                onClick={() => navigate("/bankAccount")}
                                title="Back to Bank Accounts"
                            >
                                <Landmark size={32} className="text-white" />
                            </div>

                            {/* ACCOUNT DETAILS */}

                            <div className="pt-1">
                                <h2 className="text-[24px] font-semibold leading-tight text-[#0F4659]">
                                    {current.accountName || "Bank Account"}
                                </h2>

                                <p className="mt-0.5 text-[12px] text-[#0F4659]">
                                    Account Code: {current.accountCode || "-"}
                                </p>

                                <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px] text-slate-500">
                                    <span className="flex items-center gap-1 text-slate-700">
                                        <Building2 size={13} />
                                        {current.bankName || "-"}
                                    </span>

                                    <span className="flex items-center gap-1 text-slate-700">
                                        <CreditCard size={13} />
                                        {current.accountType || "-"}
                                    </span>

                                    <span className="flex items-center gap-1 text-slate-700">
                                        <CircleDollarSign size={13} />
                                        {current.currency || "INR"}
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

                {/* ACCOUNT OVERVIEW */}

                <div className="grid grid-cols-1 items-stretch gap-4">
                    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                        <h3 className="text-[14px] font-semibold text-slate-900">
                            Account Overview
                        </h3>

                        <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                            <StatTile
                                icon={Landmark}
                                label="Bank"
                                value={current.bankName}
                            />

                            <StatTile
                                icon={Wallet}
                                label="Account Type"
                                value={current.accountType}
                            />

                            <StatTile
                                icon={BadgeCheck}
                                label="Primary Account"
                                value={isPrimary ? "Yes" : "No"}
                            />

                            <StatTile
                                icon={CircleDollarSign}
                                label="Currency"
                                value={current.currency}
                            />
                        </div>

                        <h4 className="mb-2 mt-5 text-[13px] font-semibold text-slate-900">
                            Account Details
                        </h4>

                        <div className="space-y-0">
                            <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-3 py-3 text-[12.5px]">
                                <span className="text-slate-500">
                                    Account Number
                                </span>

                                <span className="break-all text-right font-medium text-slate-800">
                                    {current.accountNumber || "-"}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-3 py-3 text-[12.5px]">
                                <span className="text-slate-500">
                                    IFSC Code
                                </span>

                                <span className="font-medium text-slate-800">
                                    {current.ifsc || "-"}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-3 py-3 text-[12.5px]">
                                <span className="text-slate-500">
                                    Account Code
                                </span>

                                <span className="font-medium text-slate-800">
                                    {current.accountCode || "-"}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-3 py-3 text-[12.5px]">
                                <span className="text-slate-500">
                                    Description
                                </span>

                                <span className="max-w-[65%] whitespace-pre-wrap text-right font-medium text-slate-800">
                                    {current.description || "-"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ROW 1 — EDITABLE BANK INFORMATION + ACTIVITY */}

                <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
                    {/* LEFT — BANK ACCOUNT INFORMATION */}

                    <div className="grid grid-cols-1 content-start gap-4">
                        <FieldsSection
                            title="Account Information"
                            fields={ACCOUNT_FIELDS}
                            values={current}
                            onSave={saveFields}
                            onActivity={logActivity}
                        />

                        <FieldsSection
                            title="Bank Details"
                            fields={BANK_FIELDS}
                            values={current}
                            onSave={saveFields}
                            onActivity={logActivity}
                        />

                        <FieldsSection
                            title="Account Settings"
                            fields={SETTINGS_FIELDS}
                            values={current}
                            onSave={saveFields}
                            onActivity={logActivity}
                        />
                    </div>

                    {/* ACTIVITY */}

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
