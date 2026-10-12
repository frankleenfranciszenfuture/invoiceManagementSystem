
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import {
    SquarePen,
    Check,
    X,
    Loader2,
    AlertCircle,
    RotateCcw,
    Building2,
    CircleDollarSign,
    Hash,
    ReceiptText,
} from "lucide-react";

import {
    fetchCompanyById,
    updateCompany,
    reactivateCompany,
} from "../thunks/companyThunks";

import CustomSelect from "../../../common/custom/CustomSelect";

/* =========================================================
   FIELD CONFIG
========================================================= */

const COMPANY_DETAILS = [
    {
        key: "legalName",
        label: "Legal Name",
        required: true,
    },
    {
        key: "financialYearStart",
        label: "Financial Year Start",
        required: true,
    },
];

const COMPANY_FIELDS = [
    {
        key: "addressLine1",
        label: "Address Line 1",
        required: true,
        type: "textarea",
    },
    {
        key: "addressLine2",
        label: "Address Line 2",
        type: "textarea",
    },
    {
        key: "city",
        label: "City",
    },
    {
        key: "state",
        label: "State",
        required: true,
    },
    {
        key: "country",
        label: "Country",
        required: true,
    },
    {
        key: "pincode",
        label: "PinCode",
        required: true,
    },
];

const CONTACT_FIELDS = [
    {
        key: "email",
        label: "Email Address",
    },
    {
        key: "phone",
        label: "Phone Number",
    },
    {
        key: "alternatePhone",
        label: "Alternate Phone Number",
    },
];

const TAX_FIELDS = [
    {
        key: "gstNumber",
        label: "GSTIN",
    },
    {
        key: "panNumber",
        label: "PAN",
    },
    {
        key: "tanNumber",
        label: "TAN",
    },
];

const SETTINGS_FIELDS = [
    {
        key: "invoicePrefix",
        label: "Invoice Prefix",
    },
    {
        key: "invoiceStartNumber",
        label: "Invoice Start Number",
        type: "number",
    },
    {
        key: "currency",
        label: "Currency",
        type: "currency",
        required: true,
    },
    {
        key: "financialYearStart",
        label: "Financial Year Start",
    },
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

function timeAgo(milliseconds) {
    const seconds = Math.floor(
        (Date.now() - milliseconds) / 1000,
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

        if (
            field.type === "number" &&
            value &&
            (!Number.isFinite(Number(value)) ||
                Number(value) < 0)
        ) {
            errors[field.key] =
                `${field.label} must be a valid non-negative number`;
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

            if (field.type === "number") {
                patch[field.key] =
                    value === "" || value == null
                        ? null
                        : Number(value);
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
                    result.message || "Failed to save changes.",
                );
            }
        } catch (error) {
            setServerError(
                error?.message || "Failed to save changes.",
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
                <CustomSelect
                    value={value || "ACTIVE"}
                    onChange={(event) =>
                        updateDraft(
                            field.key,
                            event.target.value,
                        )
                    }
                    disabled={saving}
                    options={[
                        {
                            value: "ACTIVE",
                            label: "ACTIVE",
                        },
                        {
                            value: "INACTIVE",
                            label: "INACTIVE",
                        },
                        {
                            value: "VERIFIED",
                            label: "VERIFIED",
                        },
                        {
                            value: "NOT VERIFIED",
                            label: "NOT VERIFIED",
                        },
                    ]}
                />
            );
        }

        if (field.type === "currency") {
            return (
                <CustomSelect
                    value={value || "INR"}
                    onChange={(event) =>
                        updateDraft(
                            field.key,
                            event.target.value,
                        )
                    }
                    disabled={saving}
                    options={[
                        { value: "INR", label: "INR" },
                        { value: "USD", label: "USD" },
                        { value: "EURO", label: "EURO" },
                    ]}
                />
            );
        }

        if (field.type === "textarea") {
            return (
                <textarea
                    rows={3}
                    value={value ?? ""}
                    onChange={(event) =>
                        updateDraft(
                            field.key,
                            event.target.value,
                        )
                    }
                    disabled={saving}
                    placeholder={field.label}
                    className={`${className} min-h-[76px] py-2`}
                />
            );
        }

        return (
            <input
                type={
                    field.type === "number"
                        ? "number"
                        : "text"
                }
                min={field.type === "number" ? 0 : undefined}
                value={value ?? ""}
                onChange={(event) =>
                    updateDraft(
                        field.key,
                        event.target.value,
                    )
                }
                placeholder={field.label}
                disabled={saving}
                className={`${className} h-[34px]`}
            />
        );
    };

    const renderValue = (field, value) => {
        if (field.type === "status") {
            const status = toText(
                value || "ACTIVE",
            ).toUpperCase();

            const statusClass =
                status === "ACTIVE" ||
                    status === "VERIFIED"
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

        return value !== null &&
            value !== undefined &&
            toText(value).trim() !== "" ? (
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
                            <span className="text-red-500">
                                {" "}*
                            </span>
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
                        <p className="mt-1 break-words whitespace-pre-wrap text-[12.5px] leading-5 text-slate-800">
                            {renderValue(
                                field,
                                values[field.key],
                            )}
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
   COMPANY IMAGE CARD
========================================================= */

function CompanyImageCard({
    title,
    field,
    image,
    initials,
    saving,
    onSave,
    onActivity,
}) {
    const inputRef = useRef(null);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);

    /* -------------------------------------------------------
       CREATE AND CLEAN UP PREVIEW URL
    ------------------------------------------------------- */

    useEffect(() => {
        if (!file) {
            setPreview(null);
            return undefined;
        }

        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);

        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [file]);

    /* -------------------------------------------------------
       SELECT IMAGE
    ------------------------------------------------------- */

    const handleSelect = (event) => {
        const selectedFile = event.target.files?.[0];

        // Allow the same file to be selected again.
        event.target.value = "";

        if (!selectedFile) return;

        const allowedTypes = [
            "image/png",
            "image/jpeg",
            "image/webp",
            "image/gif",
        ];

        if (!allowedTypes.includes(selectedFile.type)) {
            toast.error(
                "Select a PNG, JPG, WEBP, or GIF image.",
            );
            return;
        }

        if (selectedFile.size > 5 * 1024 * 1024) {
            toast.error("Image size must be 5 MB or less.");
            return;
        }

        setFile(selectedFile);
    };

    /* -------------------------------------------------------
       CANCEL IMAGE
    ------------------------------------------------------- */

    const handleCancel = () => {
        setFile(null);

        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    /* -------------------------------------------------------
       SAVE IMAGE
    ------------------------------------------------------- */

    const handleSave = async () => {
        if (!file) {
            toast.error("Please select an image first.");
            return;
        }

        setUploading(true);

        try {
            const result = await onSave(field, file);

            if (result?.ok) {
                setFile(null);

                if (inputRef.current) {
                    inputRef.current.value = "";
                }

                toast.success(result.message);

                onActivity?.(
                    field === "logo"
                        ? "Updated company logo"
                        : "Updated company signature",
                );
            } else {
                toast.error(
                    result?.message || "Failed to save image.",
                );
            }
        } catch (error) {
            toast.error(
                error?.message || "Failed to save image.",
            );
        } finally {
            setUploading(false);
        }
    };

    const displayedImage = preview || image;
    const isSaving = saving || uploading;

    return (
        <div className="flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            {/* HEADER */}

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h3 className="text-[14px] font-semibold text-slate-900">
                        {title}
                    </h3>

                    <p className="mt-1 text-[11.5px] text-slate-500">
                        Upload or update your {title.toLowerCase()}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={isSaving}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#0F4659]/20 px-3 py-2 text-[12px] font-medium text-[#0F4659] transition hover:bg-[#0F4659]/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <SquarePen size={13} />
                    {displayedImage ? "Change" : "Upload"}
                </button>

                <input
                    ref={inputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="hidden"
                    onChange={handleSelect}
                />
            </div>

            {/* IMAGE PREVIEW */}

            <div className="flex min-h-[220px] items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4">
                {displayedImage ? (
                    <img
                        src={displayedImage}
                        alt={`${title}`}
                        className="max-h-[250px] max-w-full object-contain"
                    />
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#0F4659]">
                            <span className="text-2xl font-semibold text-white">
                                {initials}
                            </span>
                        </div>

                        <p className="text-[12px] text-slate-400">
                            No {title.toLowerCase()} uploaded
                        </p>
                    </div>
                )}
            </div>

            {/* SELECTED FILE */}

            {file && (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-3">
                    <div className="min-w-0">
                        <p className="truncate text-[12px] font-medium text-slate-700">
                            {file.name}
                        </p>

                        <p className="mt-1 text-[10.5px] text-amber-600">
                            Unsaved changes
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={isSaving}
                            className="flex items-center gap-1 rounded-md px-2 py-1.5 text-[11.5px] font-medium text-slate-600 hover:bg-slate-200 disabled:opacity-50"
                        >
                            <X size={12} />
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-1.5 rounded-md bg-[#0F4659] px-3 py-1.5 text-[11.5px] font-medium text-white transition hover:bg-[#0a3543] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isSaving ? (
                                <Loader2
                                    size={12}
                                    className="animate-spin"
                                />
                            ) : (
                                <Check size={12} />
                            )}

                            {isSaving
                                ? "Saving..."
                                : field === "logo"
                                    ? "Save Logo"
                                    : "Save Signature"}
                        </button>
                    </div>
                </div>
            )}

            {!file && (
                <p className="mt-3 text-[10.5px] text-slate-400">
                    PNG, JPG, WEBP, or GIF · Maximum 5 MB
                </p>
            )}
        </div>
    );
}

/* =========================================================
   PAGE
========================================================= */

export default function CompanyProfileOverview({
    companyId,
}) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id: paramId } = useParams();

    const id = companyId ?? paramId;

    const {
        company,
        loading,
        error,
    } = useSelector((state) => state.company || {});

    const [activity, setActivity] = useState([]);

    /* -------------------------------------------------------
       FETCH COMPANY
    ------------------------------------------------------- */

    useEffect(() => {
        if (id) {
            dispatch(fetchCompanyById(id));
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
       CURRENT COMPANY
    ------------------------------------------------------- */

    const current =
        company && String(company.id) === String(id)
            ? company
            : null;

    const ready = Boolean(current?.id);

    /* -------------------------------------------------------
       SAVE COMPANY FIELDS
    ------------------------------------------------------- */

    const saveFields = async (patch) => {
        if (!current?.id) {
            return {
                ok: false,
                message: "Company ID is missing.",
            };
        }

        try {
            const response = await dispatch(
                updateCompany({
                    id: current.id,
                    data: {
                        ...current,
                        ...patch,
                    },
                }),
            );

            if (updateCompany.fulfilled.match(response)) {
                logActivity("Updated company information");
                return { ok: true };
            }

            return {
                ok: false,
                message:
                    typeof response.payload === "string"
                        ? response.payload
                        : response.payload?.message ||
                        response.error?.message ||
                        "Failed to update company.",
            };
        } catch (error) {
            return {
                ok: false,
                message:
                    error?.message ||
                    "Failed to update company.",
            };
        }
    };

    /* -------------------------------------------------------
       SAVE COMPANY IMAGE
       Reuses the existing multipart updateCompany thunk.
    ------------------------------------------------------- */

    const saveCompanyImage = async (field, file) => {
        if (!current?.id) {
            return {
                ok: false,
                message: "Company ID is missing.",
            };
        }

        if (!["logo", "signature"].includes(field)) {
            return {
                ok: false,
                message: "Invalid company image field.",
            };
        }

        if (!(file instanceof File)) {
            return {
                ok: false,
                message: "Please select an image first.",
            };
        }

        try {
            const response = await dispatch(
                updateCompany({
                    id: current.id,
                    data: {
                        ...current,
                        [field]: file,
                    },
                }),
            );

            if (!updateCompany.fulfilled.match(response)) {
                return {
                    ok: false,
                    message:
                        typeof response.payload === "string"
                            ? response.payload
                            : response.payload?.message ||
                            response.error?.message ||
                            `Failed to save company ${field}.`,
                };
            }

            // The update succeeded. Refresh company details.
            // A refresh failure does not undo a successful upload.
            dispatch(fetchCompanyById(current.id));

            return {
                ok: true,
                message:
                    field === "logo"
                        ? "Company logo saved successfully."
                        : "Company signature saved successfully.",
            };
        } catch (error) {
            return {
                ok: false,
                message:
                    error?.message ||
                    `Failed to save company ${field}.`,
            };
        }
    };

    /* -------------------------------------------------------
       REACTIVATE COMPANY
    ------------------------------------------------------- */

    const handleReactivate = async () => {
        if (!current?.id) return;

        const response = await dispatch(
            reactivateCompany(current.id),
        );

        if (reactivateCompany.fulfilled.match(response)) {
            toast.success("Company reactivated successfully.");
            logActivity("Reactivated company");
            dispatch(fetchCompanyById(current.id));
        } else {
            toast.error(
                typeof response.payload === "string"
                    ? response.payload
                    : response.payload?.message ||
                    response.error?.message ||
                    "Failed to reactivate company.",
            );
        }
    };

    /* -------------------------------------------------------
       RETRY
    ------------------------------------------------------- */

    const retry = () => {
        if (id) {
            dispatch(fetchCompanyById(id));
        }
    };

    /* =======================================================
       LOADING
    ======================================================= */

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

    /* =======================================================
       EMPTY / ERROR
    ======================================================= */

    if (!ready) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 text-center">
                <AlertCircle
                    size={32}
                    className="text-slate-300"
                />

                <p className="text-sm text-slate-500">
                    {error || "No company found."}
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
                    onClick={() => navigate("/company")}
                    className="text-[13px] font-medium text-[#0F4659] hover:underline"
                >
                    Back to Companies
                </button>
            </div>
        );
    }

    /* =======================================================
       DERIVED VALUES
    ======================================================= */

    const displayName =
        current.displayName ||
        current.companyName ||
        current.legalName ||
        "Company";

    const initials =
        toText(displayName)
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((word) => word[0])
            .join("")
            .toUpperCase() || "CO";

    const status = toText(
        current.status || "ACTIVE",
    ).toUpperCase();

    const isActive = status === "ACTIVE";

    /* =======================================================
       UI
    ======================================================= */

    return (
        <div className="w-full space-y-4 p-3">
            {/* COMPANY HEADER */}

            <div className="rounded-xl border border-slate-100 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-4 px-2 py-3 pb-5">
                    <div className="flex min-w-0 items-start gap-4">
                        {/* COMPANY AVATAR */}

                        <div
                            className="flex h-[86px] w-[86px] shrink-0 items-center justify-center overflow-hidden rounded-full border-[4px] border-white bg-gradient-to-br from-[#0F4659]/70 to-[#0F4659] shadow-md"
                            title="Company"
                        >
                            {current.logo ? (
                                <img
                                    src={current.logo}
                                    alt={`${displayName} logo`}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span className="text-[25px] font-semibold text-white">
                                    {initials}
                                </span>
                            )}
                        </div>

                        {/* COMPANY DETAILS */}

                        <div className="min-w-0 pt-1">
                            <h2 className="break-words text-[24px] font-semibold leading-tight text-[#0F4659]">
                                {displayName}
                            </h2>

                            <p className="mt-0.5 text-[12px] text-[#0F4659]">
                                Company Code:{" "}
                                {current.companyCode || "-"}
                            </p>

                            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px] text-slate-500">
                                <span className="flex items-center gap-1 text-slate-700">
                                    <Building2 size={13} />
                                    {current.legalName ||
                                        current.companyName ||
                                        "-"}
                                </span>

                                <span className="flex items-center gap-1 text-slate-700">
                                    <ReceiptText size={13} />
                                    GSTIN: {current.gstNumber || "-"}
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
                                        {status}
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

            {/* COMPANY OVERVIEW */}

            <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <h3 className="text-[14px] font-semibold text-slate-900">
                    Company Overview
                </h3>

                <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                    <StatTile
                        icon={Building2}
                        label="Company"
                        value={displayName}
                    />

                    <StatTile
                        icon={Hash}
                        label="Company Code"
                        value={current.companyCode}
                    />

                    <StatTile
                        icon={ReceiptText}
                        label="GSTIN"
                        value={current.gstNumber}
                    />

                    <StatTile
                        icon={CircleDollarSign}
                        label="Currency"
                        value={current.currency || "INR"}
                    />
                </div>
            </div>

            {/* EDITABLE SECTIONS + ACTIVITY */}

            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
                {/* LEFT COLUMN */}

                <div className="grid grid-cols-1 content-start gap-4">
                    <FieldsSection
                        title="Company Details"
                        fields={COMPANY_DETAILS}
                        values={current}
                        onSave={saveFields}
                        onActivity={logActivity}
                    />

                    <FieldsSection
                        title="Address Information"
                        fields={COMPANY_FIELDS}
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
                        title="Tax Information"
                        fields={TAX_FIELDS}
                        values={current}
                        onSave={saveFields}
                        onActivity={logActivity}
                    />

                    <FieldsSection
                        title="Company Settings"
                        fields={SETTINGS_FIELDS}
                        values={current}
                        onSave={saveFields}
                        onActivity={logActivity}
                    />


                </div>

                {/* RECENT ACTIVITY */}





                <div className="grid grid-cols-1 content-start gap-4">
                    {/* COMPANY LOGO */}

                    <CompanyImageCard
                        title="Company Logo"
                        field="logo"
                        image={current.logo}
                        initials={initials}
                        onSave={saveCompanyImage}
                        onActivity={logActivity}
                    />

                    {/* COMPANY SIGNATURE */}

                    <CompanyImageCard
                        title="Company Signature"
                        field="signature"
                        image={current.signature}
                        initials={initials}
                        onSave={saveCompanyImage}
                        onActivity={logActivity}
                    />
                    <div className="flex w-max-full flex-col rounded-xl border border-slate-200 bg-white p-4  shadow-sm lg:min-h-[800px]">

                        <h3 className=" text-[14px] font-semibold text-slate-900">
                            Recent Activity
                        </h3>

                        {activity.length === 0 ? (
                            <div className="flex flex-1 items-center justify-center">
                                <p className="px-3 py-8 text-center text-[13px] text-slate-400">
                                    Changes you make on this page will
                                    appear here.
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
