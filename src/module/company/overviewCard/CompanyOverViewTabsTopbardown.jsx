import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
    SquarePen,
    Check,
    X,
    Upload,
    Undo2,
    BadgeCheck,
    MapPin,
    Loader2,
    AlertCircle,
    RotateCcw,
    Coins,
    ReceiptText,
    CalendarDays,
} from "lucide-react";

import {
    fetchAllCompanies,
    fetchCompanyById,
    updateCompany,
    reactivateCompany,
} from "../thunks/companyThunks"; // <-- adjust path

/* =========================================================
   FIELD CONFIG  (keys match your backend / slice)
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
    { key: "gstNumber", label: "GST Number", type: "gst", upper: true },
    { key: "panNumber", label: "PAN Number", type: "pan", upper: true },
    { key: "tanNumber", label: "TAN Number", type: "tan", upper: true },
];

const INVOICE_FIELDS = [
    { key: "invoicePrefix", label: "Invoice Prefix" },
    { key: "invoiceStartNumber", label: "Invoice Start Number", type: "number" },
    { key: "currency", label: "Currency" },
    { key: "financialYearStart", label: "Financial Year Start", type: "date" },
];

/* Every text field the thunk calls .trim() on. */
const STRING_KEYS = [
    "companyName", "displayName", "legalName", "companyCode",
    "gstNumber", "panNumber", "tanNumber",
    "email", "phone", "alternatePhone", "website",
    "addressLine1", "addressLine2", "city", "state", "country", "pincode",
    "invoicePrefix", "currency",
];

const TABS = ["Dashboard", "Transaction", "Recent Updates", "Top Quotation"];
const MAX_IMAGE_SIZE = 1024 * 1024; // 1MB
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/bmp"];

/* ---------- helpers ---------- */
const toText = (v) => (v === null || v === undefined ? "" : String(v));

function buildPayload(company, patch) {
    const base = { ...company };
    STRING_KEYS.forEach((k) => (base[k] = toText(company[k])));
    base.invoiceStartNumber = toText(company.invoiceStartNumber);
    base.financialYearStart = company.financialYearStart || "";
    return { ...base, ...patch };
}

function imageUrl(company, kind) {
    const v =
        company?.[kind] ||
        company?.[`${kind}Url`] ||
        company?.[`${kind}Path`] ||
        null;
    return typeof v === "string" ? v : null;
}

function formatDate(v) {
    if (!v) return "";
    const d = new Date(v);
    return Number.isNaN(d.getTime())
        ? toText(v)
        : d.toLocaleDateString(undefined, {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
}

function timeAgo(ms) {
    const s = Math.floor((Date.now() - ms) / 1000);
    if (s < 60) return "Just now";
    const m = Math.floor(s / 60);
    if (m < 60) return `${m} min ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} hr ago`;
    return `${Math.floor(h / 24)} days ago`;
}

function validateImage(file) {
    if (!IMAGE_TYPES.includes(file.type))
        return "Supported files: jpg, jpeg, png, gif, bmp";
    if (file.size > MAX_IMAGE_SIZE) return "Maximum file size is 1MB";
    return "";
}

function validate(fields, values) {
    const errors = {};
    fields.forEach((f) => {
        const v = toText(values[f.key]).trim();
        if (f.required && !v) errors[f.key] = `${f.label} is required`;
        else if (v && f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
            errors[f.key] = "Enter a valid email";
        else if (v && f.type === "phone" && !/^\+?\d{7,15}$/.test(v))
            errors[f.key] = "Enter a valid phone number";
        else if (v && f.type === "pincode" && !/^\d{4,10}$/.test(v))
            errors[f.key] = "Enter a valid pin code";
        else if (v && f.type === "gst" && !/^[0-9A-Z]{15}$/i.test(v))
            errors[f.key] = "GST number must be 15 characters";
        else if (v && f.type === "pan" && !/^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(v))
            errors[f.key] = "Enter a valid PAN (e.g. ABCDE1234F)";
        else if (v && f.type === "tan" && !/^[A-Z]{4}[0-9]{5}[A-Z]$/i.test(v))
            errors[f.key] = "Enter a valid TAN (e.g. ABCD12345E)";
        else if (v && f.type === "number" && !/^\d+$/.test(v))
            errors[f.key] = "Enter a whole number";
    });
    return errors;
}

function useSavedFlash() {
    const [saved, setSaved] = useState(false);
    const timer = useRef(null);
    useEffect(() => () => clearTimeout(timer.current), []);
    const flash = () => {
        setSaved(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setSaved(false), 2000);
    };
    return [saved, flash];
}

/* =========================================================
   SECTION CARD  (title + pen  ->  Cancel / Save)
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
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between px-5 pt-5">
                <h3 className="text-[15px] font-semibold text-slate-900">{title}</h3>

                <div className="flex items-center gap-2">
                    {saved && !editing && (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-600">
                            <Check size={12} /> Saved
                        </span>
                    )}

                    {editing ? (
                        <>
                            <button
                                type="button"
                                onClick={onCancel}
                                disabled={saving}
                                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12.5px] font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                            >
                                <X size={13} /> Cancel
                            </button>
                            <button
                                type="button"
                                onClick={onSave}
                                disabled={saving || !canSave}
                                className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-[12.5px] font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving ? (
                                    <Loader2 size={13} className="animate-spin" />
                                ) : (
                                    <Check size={13} />
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
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-700 transition hover:bg-slate-100"
                        >
                            <SquarePen size={17} />
                        </button>
                    )}
                </div>
            </div>

            <div className="px-5 pb-5 pt-3">
                {error && (
                    <div className="mb-3 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-[12.5px] text-red-600">
                        <AlertCircle size={14} className="mt-0.5 shrink-0" />
                        {error}
                    </div>
                )}
                {children}
            </div>
        </div>
    );
}

/* =========================================================
   FIELDS SECTION  (label above value, like the reference)
   onSave(patch) must return Promise<{ ok, message }>
========================================================= */
function FieldsSection({ title, fields, values, onSave }) {
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [draft, setDraft] = useState({});
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [saved, flash] = useSavedFlash();

    const startEdit = () => {
        const d = {};
        fields.forEach((f) => (d[f.key] = toText(values[f.key])));
        setDraft(d);
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
        const errs = validate(fields, draft);
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;

        const patch = {};
        fields.forEach((f) => {
            const v = toText(draft[f.key]).trim();
            patch[f.key] = f.upper ? v.toUpperCase() : v;
        });

        setSaving(true);
        setServerError("");
        const result = await onSave(patch);
        setSaving(false);

        if (result.ok) {
            setEditing(false);
            flash();
        } else {
            setServerError(result.message || "Failed to save changes.");
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
            {fields.map((f, i) => {
                const value = toText(values[f.key]);
                const display = f.type === "date" ? formatDate(value) : value;

                return (
                    <div
                        key={f.key}
                        className={`py-3.5 ${i > 0 ? "border-t border-slate-100" : ""}`}
                    >
                        <p className="text-[13px] font-medium text-slate-800">
                            {f.label}:
                            {editing && f.required && (
                                <span className="text-red-500"> *</span>
                            )}
                        </p>

                        {editing ? (
                            <div className="mt-1.5">
                                <input
                                    type={f.type === "date" ? "date" : "text"}
                                    value={draft[f.key] ?? ""}
                                    onChange={(e) =>
                                        setDraft({ ...draft, [f.key]: e.target.value })
                                    }
                                    placeholder={f.label}
                                    disabled={saving}
                                    className={`h-9 w-full rounded-lg border bg-white px-3 text-[14px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 disabled:bg-slate-50 ${errors[f.key]
                                        ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                                        : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                                        }`}
                                />
                                {errors[f.key] && (
                                    <p className="mt-1 text-[12px] text-red-500">
                                        {errors[f.key]}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="mt-1 break-words text-[13.5px] text-slate-800">
                                {!display ? (
                                    <span className="text-slate-300">-</span>
                                ) : f.link ? (
                                    <a
                                        href={
                                            /^https?:\/\//i.test(display)
                                                ? display
                                                : `https://${display}`
                                        }
                                        target="_blank"
                                        rel="noreferrer"
                                        className="underline decoration-slate-300 underline-offset-2 transition hover:text-blue-600"
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
   IMAGE SECTION  (signature)
   Sends a File through updateCompany (thunk reads data.signature)
========================================================= */
function ImageSection({ title, savedUrl, initials, onSave }) {
    const fileRef = useRef(null);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState("");
    const [serverError, setServerError] = useState("");
    const [saved, flash] = useSavedFlash();

    useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

    const reset = () => {
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

    const pick = (e) => {
        const f = e.target.files?.[0];
        e.target.value = "";
        if (!f) return;
        const msg = validateImage(f);
        if (msg) return setError(msg);
        setError("");
        setFile(f);
        setPreview(URL.createObjectURL(f));
    };

    const save = async () => {
        if (!file) return cancel();

        setSaving(true);
        setServerError("");
        const result = await onSave(file);
        setSaving(false);

        if (result.ok) {
            reset();
            setEditing(false);
            flash();
        } else {
            setServerError(result.message || "Failed to upload image.");
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
            <div className="flex justify-center rounded-xl bg-slate-50 py-6">
                <div className="flex h-[150px] w-[150px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-200">
                    {shown ? (
                        <img
                            src={shown}
                            alt={title}
                            className="h-full w-full bg-white object-contain p-2"
                        />
                    ) : (
                        <span className="text-[40px] font-bold tracking-tight text-white">
                            {initials}
                        </span>
                    )}
                </div>
            </div>

            {editing && (
                <div className="mt-4 flex flex-col items-center gap-2">
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => fileRef.current?.click()}
                            disabled={saving}
                            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[12.5px] font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
                        >
                            <Upload size={13} /> {file ? "Choose another" : "Upload image"}
                        </button>
                        {file && (
                            <button
                                type="button"
                                onClick={reset}
                                disabled={saving}
                                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12.5px] font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                            >
                                <Undo2 size={13} /> Discard new image
                            </button>
                        )}
                    </div>
                    <p className="text-[11.5px] text-slate-400">
                        jpg, jpeg, png, gif, bmp. Max 1MB.
                    </p>
                    {error && <p className="text-[12px] text-red-500">{error}</p>}
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

/* Stat tile: plain outline icon, small label, bold number */
function StatTile({ icon: Icon, label, value }) {
    return (
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5">
            <Icon size={20} className="shrink-0 text-slate-700" />
            <div className="min-w-0">
                <p className="text-[11.5px] text-slate-500">{label}</p>
                <p className="truncate text-[20px] font-semibold leading-tight text-slate-900">
                    {value || <span className="text-slate-300">-</span>}
                </p>
            </div>
        </div>
    );
}

/* Mountain cover illustration (swap for an <img> if you have a cover image) */
function CoverArt() {
    return (
        <svg
            viewBox="0 0 800 160"
            preserveAspectRatio="xMidYMid slice"
            className="h-full w-full"
            aria-hidden="true"
        >
            <defs>
                <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#2c6a9b" />
                    <stop offset="1" stopColor="#c3dcec" />
                </linearGradient>
            </defs>
            <rect width="800" height="160" fill="url(#sky)" />
            <path
                d="M0 120 L90 72 L150 96 L240 48 L330 100 L420 62 L520 106 L610 56 L700 96 L800 70 L800 160 L0 160Z"
                fill="#86aecb"
                opacity="0.85"
            />
            <path
                d="M0 138 L120 92 L200 112 L330 28 L400 82 L462 52 L560 112 L650 86 L760 122 L800 106 L800 160 L0 160Z"
                fill="#3a6a92"
            />
            <path d="M330 28 L298 64 L316 58 L330 72 L346 56 L364 64Z" fill="#f4f8fb" />
            <path d="M462 52 L440 76 L455 70 L463 82 L478 68 L488 78Z" fill="#f4f8fb" />
            <path
                d="M0 152 Q200 128 400 146 T800 140 L800 160 L0 160Z"
                fill="#24496b"
            />
        </svg>
    );
}

/* =========================================================
   PAGE
========================================================= */
export default function CompanyOverViewTabsTopbardown({ companyId }) {
    const dispatch = useDispatch();
    const { id: paramId } = useParams();

    /* Store key must match your reducer name, e.g. { company: companyReducer } */
    const { company, companies, loading, error } = useSelector(
        (state) => state.company
    );

    /* Which company? prop > route param > first company in the list */
    const id = companyId ?? paramId;
    const current = id ? company : companies?.[0];
    const ready = !!current?.id;

    const [tab, setTab] = useState("Dashboard");
    const [activity, setActivity] = useState([]); // session activity (not from API)
    const [logoBusy, setLogoBusy] = useState(false);
    const [logoError, setLogoError] = useState("");
    const logoRef = useRef(null);

    useEffect(() => {
        if (id) dispatch(fetchCompanyById(id));
        else dispatch(fetchAllCompanies());
    }, [id, dispatch]);

    const logActivity = (text) =>
        setActivity((prev) => [{ text, at: Date.now() }, ...prev].slice(0, 8));

    /* Merge the changed fields into the full company and PUT it */
    const saveFields = async (patch, label) => {
        const res = await dispatch(
            updateCompany({ id: current.id, data: buildPayload(current, patch) })
        );
        if (updateCompany.fulfilled.match(res)) {
            if (label) logActivity(`Updated ${label}`);
            return { ok: true };
        }
        return { ok: false, message: res.payload || "Failed to update company." };
    };

    const handleLogoPick = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;

        const msg = validateImage(file);
        if (msg) return setLogoError(msg);

        setLogoError("");
        setLogoBusy(true);
        const result = await saveFields({ logo: file }, "company logo");
        setLogoBusy(false);
        if (!result.ok) setLogoError(result.message);
    };

    const handleReactivate = () => dispatch(reactivateCompany(current.id));

    const retry = () =>
        id ? dispatch(fetchCompanyById(id)) : dispatch(fetchAllCompanies());

    /* ---------- loading / error / empty ---------- */
    if (!ready && loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center text-slate-400">
                <Loader2 size={26} className="animate-spin" />
            </div>
        );
    }

    if (!ready) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 text-center">
                <AlertCircle size={32} className="text-slate-300" />
                <p className="text-sm text-slate-500">
                    {error || "No company found."}
                </p>
                <button
                    type="button"
                    onClick={retry}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[13px] font-medium text-slate-700 transition hover:bg-slate-50"
                >
                    <RotateCcw size={13} /> Try again
                </button>
            </div>
        );
    }

    const initials = toText(current.companyName)
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();

    const isActive = (current.status || "ACTIVE") === "ACTIVE";
    const logoSrc = imageUrl(current, "logo");
    const location = [current.city, current.state].filter(Boolean).join(", ");
    const nextInvoice = `${toText(current.invoicePrefix)}${toText(
        current.invoiceStartNumber
    )}`;

    return (
        <div className="min-h-full bg-[#f7f8fa]">
            {/* ================= TABS ================= */}
            <div className="border-b border-slate-200 bg-white px-6 pt-4">
                <nav className="-mb-px flex gap-7">
                    {TABS.map((t) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setTab(t)}
                            className={`border-b-2 pb-3 text-[13.5px] transition ${tab === t
                                ? "border-blue-600 font-semibold text-slate-900"
                                : "border-transparent text-slate-400 hover:text-slate-600"
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </nav>
            </div>

            {/* ================= BODY ================= */}
            {tab !== "Dashboard" ? (
                <div className="p-10 text-center text-sm text-slate-400">
                    {tab} will appear here.
                </div>
            ) : (
                <div className="space-y-5 p-5">
                    {/* ---------- PROFILE HEADER ---------- */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                        <div className="h-[125px] overflow-hidden rounded-xl">
                            <CoverArt />
                        </div>

                        <div className="flex flex-wrap items-start justify-between gap-4 px-5 pb-3">
                            <div className="flex items-start gap-4">
                                {/* Avatar overlaps the cover */}
                                <div className="-mt-[44px] flex h-[88px] w-[88px] shrink-0 items-center justify-center overflow-hidden rounded-full border-[4px] border-white bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
                                    {logoSrc ? (
                                        <img
                                            src={logoSrc}
                                            alt="Company logo"
                                            className="h-full w-full bg-white object-contain p-1.5"
                                        />
                                    ) : (
                                        <span className="text-[28px] font-bold tracking-tight text-white">
                                            {initials}
                                        </span>
                                    )}
                                </div>

                                <div className="pt-3">
                                    <h2 className="text-[16px] font-semibold leading-tight text-slate-900">
                                        {current.companyName}
                                    </h2>
                                    <p className="mt-0.5 text-[12px] text-slate-500">
                                        @{toText(current.companyCode).toLowerCase() ||
                                            toText(current.displayName).toLowerCase()}
                                    </p>
                                    <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px] text-slate-500">
                                        {location && (
                                            <span className="flex items-center gap-1 text-slate-700">
                                                <MapPin size={13} /> {location}
                                            </span>
                                        )}
                                        <span>
                                            Code:{" "}
                                            <b className="font-semibold text-slate-900">
                                                {current.companyCode || "-"}
                                            </b>
                                        </span>
                                        <span>
                                            Status:{" "}
                                            <b
                                                className={`font-semibold ${isActive
                                                    ? "text-emerald-600"
                                                    : "text-slate-500"
                                                    }`}
                                            >
                                                {current.status || "ACTIVE"}
                                            </b>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-1.5 pt-3">
                                <div className="flex items-center gap-2">
                                    {!isActive && (
                                        <button
                                            type="button"
                                            onClick={handleReactivate}
                                            className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3.5 py-2 text-[13px] font-medium text-emerald-600 transition hover:bg-emerald-50"
                                        >
                                            <RotateCcw size={14} /> Reactivate
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => logoRef.current?.click()}
                                        disabled={logoBusy}
                                        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-[13px] text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
                                    >
                                        {logoBusy ? (
                                            <Loader2 size={14} className="animate-spin" />
                                        ) : (
                                            <SquarePen size={14} />
                                        )}
                                        {logoBusy ? "Uploading..." : "Edit Logo"}
                                    </button>
                                    <input
                                        ref={logoRef}
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.gif,.bmp"
                                        onChange={handleLogoPick}
                                        className="hidden"
                                    />
                                </div>
                                {logoError && (
                                    <p className="text-[12px] text-red-500">{logoError}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ---------- TWO COLUMNS ---------- */}
                    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,36fr)_minmax(0,64fr)]">
                        {/* LEFT: editable information cards */}
                        <div className="space-y-5">
                            <FieldsSection
                                title="Company Information"
                                fields={BASIC_FIELDS}
                                values={current}
                                onSave={(p) => saveFields(p, "company information")}
                            />
                            <FieldsSection
                                title="Address Information"
                                fields={ADDRESS_FIELDS}
                                values={current}
                                onSave={(p) => saveFields(p, "address information")}
                            />
                            <FieldsSection
                                title="Tax Information"
                                fields={TAX_FIELDS}
                                values={current}
                                onSave={(p) => saveFields(p, "tax information")}
                            />
                            <FieldsSection
                                title="Invoice Settings"
                                fields={INVOICE_FIELDS}
                                values={current}
                                onSave={(p) => saveFields(p, "invoice settings")}
                            />
                        </div>

                        {/* RIGHT: activity overview + signature */}
                        <div className="space-y-5">
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <h3 className="text-[15px] font-semibold text-slate-900">
                                    Activity Overview
                                </h3>

                                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                    <StatTile
                                        icon={Coins}
                                        label="Currency"
                                        value={current.currency}
                                    />
                                    <StatTile
                                        icon={ReceiptText}
                                        label="Invoice Start"
                                        value={nextInvoice}
                                    />
                                    <StatTile
                                        icon={CalendarDays}
                                        label="Financial Year"
                                        value={formatDate(current.financialYearStart)}
                                    />
                                </div>

                                <h4 className="mb-2 mt-7 text-[14px] font-semibold text-slate-900">
                                    Recent Activity
                                </h4>

                                {activity.length === 0 ? (
                                    <p className="px-3 py-4 text-[13px] text-slate-400">
                                        Changes you make on this page will appear here.
                                    </p>
                                ) : (
                                    <ul>
                                        {activity.map((a, i) => (
                                            <li
                                                key={a.at + i}
                                                className={`flex items-center justify-between px-3 py-3.5 text-[13px] ${i > 0 ? "border-t border-slate-100" : ""
                                                    }`}
                                            >
                                                <span className="text-slate-800">{a.text}</span>
                                                <span className="text-[12px] text-slate-400">
                                                    {timeAgo(a.at)}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <ImageSection
                                title="Signature"
                                savedUrl={imageUrl(current, "signature")}
                                initials={initials}
                                onSave={(file) => saveFields({ signature: file }, "signature")}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}