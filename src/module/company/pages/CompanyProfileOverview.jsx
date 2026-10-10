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
    Upload,
    Undo2,
    MapPin,
    Loader2,
    AlertCircle,
    RotateCcw,
    Coins,
    ReceiptText,
    CalendarDays,
    Building2,
    Globe,
    Activity,
} from "lucide-react";

import {
    fetchAllCompanies,
    fetchCompanyById,
    updateCompany,
    reactivateCompany,
} from "../thunks/companyThunks";


/* =========================================================
   THEME
========================================================= */

const PRIMARY = "#0F4659";


/* =========================================================
   FIELD CONFIG
========================================================= */

const BASIC_FIELDS = [
    { key: "companyName", label: "Company Name", required: true },
    { key: "displayName", label: "Display Name", required: true },
    { key: "legalName", label: "Legal Name" },
    { key: "companyCode", label: "Company Code", required: true },
    { key: "email", label: "Email", type: "email" },
    { key: "phone", label: "Phone", type: "phone" },
    { key: "alternatePhone", label: "Alternate Phone", type: "phone" },
    { key: "website", label: "Website", link: true },
];

const ADDRESS_FIELDS = [
    { key: "addressLine1", label: "Address Line 1" },
    { key: "addressLine2", label: "Address Line 2" },
    { key: "city", label: "City" },
    { key: "state", label: "State" },
    { key: "country", label: "Country" },
    { key: "pincode", label: "Pin Code", type: "pincode" },
];

const TAX_FIELDS = [
    {
        key: "gstNumber",
        label: "GST Number",
        type: "gst",
        upper: true,
    },
    {
        key: "panNumber",
        label: "PAN Number",
        type: "pan",
        upper: true,
    },
    {
        key: "tanNumber",
        label: "TAN Number",
        type: "tan",
        upper: true,
    },
];

const INVOICE_FIELDS = [
    { key: "invoicePrefix", label: "Invoice Prefix" },
    {
        key: "invoiceStartNumber",
        label: "Invoice Start Number",
        type: "number",
    },
    { key: "currency", label: "Currency" },
    {
        key: "financialYearStart",
        label: "Financial Year Start",
        type: "date",
    },
];

const STRING_KEYS = [
    "companyName",
    "displayName",
    "legalName",
    "companyCode",
    "gstNumber",
    "panNumber",
    "tanNumber",
    "email",
    "phone",
    "alternatePhone",
    "website",
    "addressLine1",
    "addressLine2",
    "city",
    "state",
    "country",
    "pincode",
    "invoicePrefix",
    "currency",
];

const TABS = [
    "Dashboard",
    "Transaction",
    "Recent Updates",
    "Top Quotation",
];

const MAX_IMAGE_SIZE = 1024 * 1024;

const IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/bmp",
];


/* =========================================================
   HELPERS
========================================================= */

const toText = (value) =>
    value === null || value === undefined
        ? ""
        : String(value);


function buildPayload(company, patch) {
    const base = {
        ...company,
    };

    STRING_KEYS.forEach((key) => {
        base[key] = toText(company[key]);
    });

    base.invoiceStartNumber = toText(
        company.invoiceStartNumber
    );

    base.financialYearStart =
        company.financialYearStart || "";

    return {
        ...base,
        ...patch,
    };
}


function imageUrl(company, kind) {
    const value =
        company?.[kind] ||
        company?.[`${kind}Url`] ||
        company?.[`${kind}Path`] ||
        null;

    return typeof value === "string"
        ? value
        : null;
}


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

    if (minutes < 60) {
        return `${minutes} min ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
        return `${hours} hr ago`;
    }

    return `${Math.floor(hours / 24)} days ago`;
}


function validateImage(file) {
    if (!IMAGE_TYPES.includes(file.type)) {
        return "Supported files: jpg, jpeg, png, gif, bmp";
    }

    if (file.size > MAX_IMAGE_SIZE) {
        return "Maximum file size is 1MB";
    }

    return "";
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
        } else if (
            value &&
            field.type === "email" &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        ) {
            errors[field.key] = "Enter a valid email";
        } else if (
            value &&
            field.type === "phone" &&
            !/^\+?\d{7,15}$/.test(value)
        ) {
            errors[field.key] = "Enter a valid phone number";
        } else if (
            value &&
            field.type === "pincode" &&
            !/^\d{4,10}$/.test(value)
        ) {
            errors[field.key] = "Enter a valid pin code";
        } else if (
            value &&
            field.type === "gst" &&
            !/^[0-9A-Z]{15}$/i.test(value)
        ) {
            errors[field.key] =
                "GST number must be 15 characters";
        } else if (
            value &&
            field.type === "pan" &&
            !/^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(value)
        ) {
            errors[field.key] =
                "Enter a valid PAN (e.g. ABCDE1234F)";
        } else if (
            value &&
            field.type === "tan" &&
            !/^[A-Z]{4}[0-9]{5}[A-Z]$/i.test(value)
        ) {
            errors[field.key] =
                "Enter a valid TAN (e.g. ABCD12345E)";
        } else if (
            value &&
            field.type === "number" &&
            !/^\d+$/.test(value)
        ) {
            errors[field.key] = "Enter a whole number";
        }
    });

    return errors;
}


/* =========================================================
   SAVED FLASH
========================================================= */

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
    canSave = true,
    onEdit,
    onSave,
    onCancel,
    children,
}) {
    return (
        <section className="flex h-full min-h-0 flex-col rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">

            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">

                <h3 className="text-[13.5px] font-semibold text-[#0F4659]">
                    {title}
                </h3>

                <div className="flex items-center gap-2">

                    {saved && !editing && (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10.5px] font-medium text-emerald-700">
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
                                className="flex items-center gap-1 rounded-md bg-[#0F4659] px-2.5 py-1.5 text-[11.5px] font-medium text-white shadow-sm transition hover:bg-[#0b3746] disabled:cursor-not-allowed disabled:opacity-50"
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
                            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-[#0F4659]/10 hover:text-[#0F4659]"
                        >
                            <SquarePen size={15} />
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="px-4 pb-3 pt-1">

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
        </section>
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
                toText(values[field.key]);
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
            const value = toText(
                draft[field.key]
            ).trim();

            patch[field.key] = field.upper
                ? value.toUpperCase()
                : value;
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
                const value = toText(values[field.key]);

                const display =
                    field.type === "date"
                        ? formatDate(value)
                        : value;

                return (
                    <div
                        key={field.key}
                        className={`py-2.5 ${index > 0
                            ? "border-t border-slate-100"
                            : ""
                            }`}
                    >
                        <p className="text-[11.5px] font-medium text-slate-500">
                            {field.label}
                            {editing && field.required && (
                                <span className="text-red-500">
                                    {" "}*
                                </span>
                            )}
                        </p>

                        {editing ? (
                            <div className="mt-1.5">
                                <input
                                    type={
                                        field.type === "date"
                                            ? "date"
                                            : field.type === "number"
                                                ? "number"
                                                : "text"
                                    }
                                    value={draft[field.key] ?? ""}
                                    onChange={(event) =>
                                        setDraft((previous) => ({
                                            ...previous,
                                            [field.key]: event.target.value,
                                        }))
                                    }
                                    placeholder={field.label}
                                    disabled={saving}
                                    className={`h-9 w-full rounded-md border bg-white px-3 text-[12.5px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 disabled:bg-slate-50 ${errors[field.key]
                                        ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                                        : "border-slate-300 focus:border-[#0F4659] focus:ring-[#0F4659]/10"
                                        }`}
                                />

                                {errors[field.key] && (
                                    <p className="mt-1 text-[11px] text-red-500">
                                        {errors[field.key]}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="mt-0.5 break-words text-[12.5px] leading-5 text-slate-800">
                                {!display ? (
                                    <span className="text-slate-300">-</span>
                                ) : field.link ? (
                                    <a
                                        href={
                                            /^https?:\/\//i.test(display)
                                                ? display
                                                : `https://${display}`
                                        }
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[#0F4659] underline decoration-[#0F4659]/30 underline-offset-2 transition hover:decoration-[#0F4659]"
                                    >
                                        {display}
                                    </a>
                                ) : (
                                    display
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
   IMAGE SECTION
========================================================= */

function ImageSection({
    title,
    savedUrl,
    initials,
    onSave,
}) {
    const fileRef = useRef(null);

    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState("");
    const [serverError, setServerError] = useState("");
    const [saved, flash] = useSavedFlash();

    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    const reset = () => {
        if (preview) {
            URL.revokeObjectURL(preview);
        }

        setFile(null);
        setPreview(null);
        setError("");
        setServerError("");
    };

    const startEdit = () => {
        reset();
        setEditing(true);
    };

    const cancel = () => {
        reset();
        setEditing(false);
    };

    const pick = (event) => {
        const selectedFile = event.target.files?.[0];

        event.target.value = "";

        if (!selectedFile) return;

        const message = validateImage(selectedFile);

        if (message) {
            setError(message);
            return;
        }

        setError("");

        if (preview) {
            URL.revokeObjectURL(preview);
        }

        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
    };

    const save = async () => {
        if (!file) {
            cancel();
            return;
        }

        setSaving(true);
        setServerError("");

        try {
            const result = await onSave(file);

            if (result.ok) {
                reset();
                setEditing(false);
                flash();
            } else {
                setServerError(
                    result.message ||
                    "Failed to upload image."
                );
            }
        } catch (error) {
            setServerError(
                error?.message ||
                "Failed to upload image."
            );
        } finally {
            setSaving(false);
        }
    };

    const shown = preview || savedUrl;

    return (
        <SectionCard
            title={title}
            editing={editing}
            saving={saving}
            saved={saved}
            error={serverError}
            canSave={!!file}
            onEdit={startEdit}
            onSave={save}
            onCancel={cancel}
        >
            <div className="flex min-h-[145px] items-center justify-center rounded-lg bg-slate-50 px-3 py-4">
                <div className="flex h-[104px] w-[104px] items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    {shown ? (
                        <img
                            src={shown}
                            alt={title}
                            className="h-full w-full object-contain p-2"
                        />
                    ) : (
                        <span className="text-[28px] font-bold tracking-tight text-[#0F4659]">
                            {initials}
                        </span>
                    )}
                </div>
            </div>

            {editing && (
                <div className="mt-3 flex flex-col items-center gap-1.5">
                    <div className="flex flex-wrap justify-center gap-2">
                        <button
                            type="button"
                            onClick={() => fileRef.current?.click()}
                            disabled={saving}
                            className="flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-[11.5px] font-medium text-slate-700 transition hover:border-[#0F4659]/40 hover:bg-[#0F4659]/5 hover:text-[#0F4659] disabled:opacity-50"
                        >
                            <Upload size={13} />
                            {file ? "Choose another" : "Upload image"}
                        </button>

                        {file && (
                            <button
                                type="button"
                                onClick={reset}
                                disabled={saving}
                                className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[11.5px] font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                            >
                                <Undo2 size={13} />
                                Discard
                            </button>
                        )}
                    </div>

                    <p className="text-[10.5px] text-slate-400">
                        jpg, jpeg, png, gif, bmp. Max 1MB.
                    </p>

                    {error && (
                        <p className="text-[11px] text-red-500">
                            {error}
                        </p>
                    )}

                    <input
                        ref={fileRef}
                        type="file"
                        accept=".jpg,.jpeg,.png,.gif,.bmp"
                        onChange={pick}
                        className="hidden"
                    />
                </div>
            )}
        </SectionCard>
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
        <div className="min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-3 transition hover:border-[#0F4659]/30 hover:bg-[#0F4659]/[0.03]">
            <div className="flex items-center gap-1.5 text-slate-500">
                <Icon
                    size={14}
                    className="shrink-0 text-[#0F4659]"
                />

                <span className="truncate text-[10.5px] font-medium">
                    {label}
                </span>
            </div>

            <p className="mt-1.5 truncate text-[13px] font-semibold text-[#0F4659]">
                {value || (
                    <span className="text-slate-300">-</span>
                )}
            </p>
        </div>
    );
}


/* =========================================================
   COVER ART
========================================================= */

function CoverArt() {
    return (
        <div className="relative h-full w-full overflow-hidden bg-gradient-to-r from-[#0F4659] via-[#15586A] to-[#287486]">
            <div className="absolute -right-10 -top-24 h-64 w-64 rounded-full border border-white/10" />
            <div className="absolute -right-2 -top-16 h-48 w-48 rounded-full border border-white/10" />
            <div className="absolute right-24 top-8 h-24 w-24 rounded-full bg-white/[0.04]" />
            <div className="absolute -bottom-24 left-[35%] h-48 w-48 rounded-full bg-white/[0.04]" />

            <div className="relative flex h-full items-center px-6 sm:px-8">
                <div className="flex items-center gap-3 text-white">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10">
                        <Building2 size={23} />
                    </div>

                    <div>
                        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/70">
                            Company profile
                        </p>

                        <p className="mt-0.5 text-[17px] font-semibold">
                            Business Overview
                        </p>
                    </div>
                </div>
            </div>
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

    const {
        company,
        companies,
        loading,
        error,
    } = useSelector((state) => state.company);

    /* -------------------------------------------------------
       COMPANY ID
    ------------------------------------------------------- */

    const id = companyId ?? paramId;

    const current = id
        ? company
        : companies?.[0];

    const ready = !!current?.id;

    /* -------------------------------------------------------
       LOCAL UI STATE
    ------------------------------------------------------- */

    const [tab, setTab] = useState("Dashboard");
    const [activity, setActivity] = useState([]);

    /* -------------------------------------------------------
       FETCH COMPANY
    ------------------------------------------------------- */

    useEffect(() => {
        if (id) {
            dispatch(fetchCompanyById(id));
        } else {
            dispatch(fetchAllCompanies());
        }
    }, [id, dispatch]);

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
       SAVE COMPANY
    ------------------------------------------------------- */

    const saveFields = async (patch, label) => {
        const response = await dispatch(
            updateCompany({
                id: current.id,
                data: buildPayload(current, patch),
            })
        );

        if (updateCompany.fulfilled.match(response)) {
            if (label) {
                logActivity(`Updated ${label}`);
            }

            return { ok: true };
        }

        return {
            ok: false,
            message:
                response.payload ||
                "Failed to update company.",
        };
    };

    /* -------------------------------------------------------
       REACTIVATE
    ------------------------------------------------------- */

    const handleReactivate = async () => {
        const response = await dispatch(
            reactivateCompany(current.id)
        );

        if (reactivateCompany.fulfilled.match(response)) {
            logActivity("Reactivated company");

            if (id) {
                dispatch(fetchCompanyById(id));
            } else {
                dispatch(fetchAllCompanies());
            }
        }
    };

    /* -------------------------------------------------------
       RETRY
    ------------------------------------------------------- */

    const retry = () => {
        if (id) {
            dispatch(fetchCompanyById(id));
        } else {
            dispatch(fetchAllCompanies());
        }
    };

    /* =======================================================
       LOADING
    ======================================================= */

    if (!ready && loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <Loader2
                    size={26}
                    className="animate-spin text-[#0F4659]"
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
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                    <AlertCircle
                        size={28}
                        className="text-slate-400"
                    />
                </div>

                <p className="text-sm text-slate-500">
                    {error || "No company found."}
                </p>

                <button
                    type="button"
                    onClick={retry}
                    className="flex items-center gap-1.5 rounded-md bg-[#0F4659] px-3.5 py-2 text-[12px] font-medium text-white transition hover:bg-[#0b3746]"
                >
                    <RotateCcw size={13} />
                    Try again
                </button>
            </div>
        );
    }

    /* =======================================================
       DERIVED VALUES
    ======================================================= */

    const initials = toText(current.companyName)
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase();

    const isActive =
        (current.status || "ACTIVE") === "ACTIVE";

    const logoSrc = imageUrl(current, "logo");

    const location = [
        current.city,
        current.state,
    ]
        .filter(Boolean)
        .join(", ");

    const nextInvoice =
        `${toText(current.invoicePrefix)}${toText(
            current.invoiceStartNumber
        )}`;

    /* =======================================================
       UI
    ======================================================= */

    return (
        <div className="min-h-full bg-[#F7F9FA]">

            {/* PAGE HEADER */}
            {/* <div className="border-b border-slate-200 bg-white ml-2 px-4 py-4 sm:px-6 mt-5 py-6 mr-2">
                <div className="flex flex-wrap items-center justify-between gap-3">

                    <div className="flex items-center gap-3 ">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0F4659]/10 text-[#0F4659]">
                            <Building2 size={20} />
                        </div>

                        <div>
                            <h1 className="text-[17px] font-semibold text-slate-900">
                                Company Profile
                            </h1>

                            <p className="mt-0.5 text-[11.5px] text-slate-500">
                                View and manage company information
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate("/companies")}
                        className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-[12px] font-medium text-slate-600 transition hover:border-[#0F4659]/30 hover:bg-[#0F4659]/5 hover:text-[#0F4659]"
                    >
                        <Undo2 size={14} />
                        Back to Companies
                    </button>
                </div>
            </div> */}

            {/* PAGE CONTENT */}
            <div className="space-y-5 p-4 sm:p-6">

                {/* PROFILE HEADER CARD */}
                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                    {/* <div className="h-[105px] overflow-hidden">
                        <CoverArt />
                    </div> */}

                    <div className="flex flex-wrap items-start justify-between gap-4 px-4 pb-4 sm:px-5 bg-gradient-to-br from-[#0F4659]/70 to-[#0F4659] shadow-md">

                        <div className="flex min-w-0 flex-1 items-start gap-3">

                            {/* COMPANY AVATAR */}
                            <div
                                className=" mt-2 flex h-[76px] w-[76px] shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-4 border-white bg-white shadow-md"
                                onClick={() => navigate("/companies")}
                                title="Back to companies"
                            >
                                {logoSrc ? (
                                    <img
                                        src={logoSrc}
                                        alt="Company logo"
                                        className="h-full w-full object-contain p-1.5"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-[#0F4659] text-white">
                                        <span className="text-[22px] font-bold">
                                            {initials}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* COMPANY DETAILS */}
                            <div className="min-w-0 pt-2">
                                <h2
                                    className="cursor-pointer truncate text-[19px] font-semibold text-[white] transition hover:text-[#15586A]"
                                    onClick={() => navigate("/companies")}
                                >
                                    {current.companyName}
                                </h2>

                                <p className="mt-0.5 text-[11.5px] text-white">
                                    {current.displayName || current.companyCode || "-"}
                                </p>

                                <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11.5px] text-slate-500">

                                    {location && (
                                        <span className="flex items-center gap-1.5">
                                            <MapPin
                                                size={13}
                                                className="text-[#0F4659]"
                                            />
                                            {location}
                                        </span>
                                    )}

                                    {current.website && (
                                        <span className="flex items-center gap-1.5">
                                            <Globe
                                                size={13}
                                                className="text-[#0F4659]"
                                            />
                                            <a
                                                href={
                                                    /^https?:\/\//i.test(current.website)
                                                        ? current.website
                                                        : `https://${current.website}`
                                                }
                                                target="_blank"
                                                rel="noreferrer"
                                                className="max-w-[180px] truncate text-[#0F4659] hover:underline"
                                            >
                                                {current.website}
                                            </a>
                                        </span>
                                    )}

                                    <span>
                                        Code:{" "}
                                        <b className="font-semibold text-slate-800">
                                            {current.companyCode || "-"}
                                        </b>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* STATUS + REACTIVATE */}
                        <div className="flex items-center gap-2 pt-2">

                            <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-semibold ${isActive
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-slate-100 text-slate-600"
                                    }`}
                            >
                                <span
                                    className={`h-1.5 w-1.5 rounded-full ${isActive
                                        ? "bg-emerald-500"
                                        : "bg-slate-400"
                                        }`}
                                />
                                {current.status || "ACTIVE"}
                            </span>

                            {!isActive && (
                                <button
                                    type="button"
                                    onClick={handleReactivate}
                                    className="flex items-center gap-1.5 rounded-md border border-emerald-200 bg-white px-3 py-1.5 text-[11.5px] font-medium text-emerald-700 transition hover:bg-emerald-50"
                                >
                                    <RotateCcw size={13} />
                                    Reactivate
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                {/* OVERVIEW STATISTICS */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                    <StatTile
                        icon={Coins}
                        label="Currency"
                        value={current.currency}
                    />

                    <StatTile
                        icon={ReceiptText}
                        label="Next Invoice Number"
                        value={nextInvoice}
                    />

                    <StatTile
                        icon={CalendarDays}
                        label="Financial Year Start"
                        value={formatDate(current.financialYearStart)}
                    />
                </div>

                {/* PROFILE TABS */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                    <div className="overflow-x-auto border-b border-slate-200 px-4 sm:px-5">
                        <nav className="flex min-w-max gap-6">
                            {TABS.map((tabName) => (
                                <button
                                    key={tabName}
                                    type="button"
                                    onClick={() => setTab(tabName)}
                                    className={`border-b-2 px-0.5 py-3 text-[12.5px] transition ${tab === tabName
                                        ? "border-[#0F4659] font-semibold text-[#0F4659]"
                                        : "border-transparent text-slate-500 hover:text-[#0F4659]"
                                        }`}
                                >
                                    {tabName}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {tab !== "Dashboard" ? (
                        <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 p-8 text-center">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0F4659]/10 text-[#0F4659]">
                                <Activity size={20} />
                            </div>

                            <p className="text-[13px] font-medium text-slate-700">
                                {tab}
                            </p>

                            <p className="text-[11.5px] text-slate-400">
                                {tab} will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4 bg-[#F7F9FA] p-3 sm:p-5">

                            {/* ROW 1: COMPANY INFORMATION + IMAGES */}
                            <div className="grid items-stretch gap-4 lg:grid-cols-2">

                                <FieldsSection
                                    title="Company Information"
                                    fields={BASIC_FIELDS}
                                    values={current}
                                    onSave={(patch) =>
                                        saveFields(
                                            patch,
                                            "company information"
                                        )
                                    }
                                />

                                <div className="flex flex-col gap-4">
                                    <ImageSection
                                        title="Company Logo"
                                        savedUrl={imageUrl(current, "logo")}
                                        initials={initials}
                                        onSave={(file) =>
                                            saveFields(
                                                { logo: file },
                                                "company logo"
                                            )
                                        }
                                    />

                                    <ImageSection
                                        title="Signature"
                                        savedUrl={imageUrl(current, "signature")}
                                        initials={initials}
                                        onSave={(file) =>
                                            saveFields(
                                                { signature: file },
                                                "signature"
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            {/* ROW 2: ADDRESS + ACTIVITY */}
                            <div className="grid items-stretch gap-4 lg:grid-cols-2">

                                <FieldsSection
                                    title="Address Information"
                                    fields={ADDRESS_FIELDS}
                                    values={current}
                                    onSave={(patch) =>
                                        saveFields(
                                            patch,
                                            "address information"
                                        )
                                    }
                                />

                                <section className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

                                    <div className="flex items-center gap-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0F4659]/10 text-[#0F4659]">
                                            <Activity size={16} />
                                        </div>

                                        <div>
                                            <h3 className="text-[13.5px] font-semibold text-[#0F4659]">
                                                Activity Overview
                                            </h3>

                                            <p className="text-[10.5px] text-slate-400">
                                                Recent changes to this company
                                            </p>
                                        </div>
                                    </div>

                                    <h4 className="mb-2 mt-5 text-[12px] font-semibold text-slate-700">
                                        Recent Activity
                                    </h4>

                                    {activity.length === 0 ? (
                                        <div className="flex min-h-[150px] flex-1 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6">
                                            <p className="max-w-[250px] text-center text-[11.5px] leading-5 text-slate-400">
                                                Changes you make on this page will appear here.
                                            </p>
                                        </div>
                                    ) : (
                                        <ul className="overflow-hidden rounded-lg border border-slate-100">
                                            {activity.map((activityItem, index) => (
                                                <li
                                                    key={activityItem.at + index}
                                                    className={`flex items-center justify-between gap-3 px-3 py-3 ${index > 0
                                                        ? "border-t border-slate-100"
                                                        : ""
                                                        }`}
                                                >
                                                    <div className="flex min-w-0 items-center gap-2">
                                                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#0F4659]" />

                                                        <span className="text-[11.5px] text-slate-700">
                                                            {activityItem.text}
                                                        </span>
                                                    </div>

                                                    <span className="shrink-0 text-[10.5px] text-slate-400">
                                                        {timeAgo(activityItem.at)}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </section>
                            </div>

                            {/* ROW 3: TAX + INVOICE SETTINGS */}
                            <div className="grid items-stretch gap-4 lg:grid-cols-2">

                                <FieldsSection
                                    title="Tax Information"
                                    fields={TAX_FIELDS}
                                    values={current}
                                    onSave={(patch) =>
                                        saveFields(
                                            patch,
                                            "tax information"
                                        )
                                    }
                                />

                                <FieldsSection
                                    title="Invoice Settings"
                                    fields={INVOICE_FIELDS}
                                    values={current}
                                    onSave={(patch) =>
                                        saveFields(
                                            patch,
                                            "invoice settings"
                                        )
                                    }
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}