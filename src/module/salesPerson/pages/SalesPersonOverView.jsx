
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
    FileText,
    Activity,
    CircleCheck,
    Shield,
    UserRound,
} from "lucide-react";

import {
    fetchAllSalesPersons,
    fetchSalesPersonById,
    updateSalesPerson,
} from "../thunks/salesPersonThunks";

/* =========================================================
   FIELD CONFIGURATION
   ========================================================= */

const BASIC_FIELDS = [
    {
        key: "salesPersonCode",
        label: "Sales Person Code",
        required: true,
    },
    {
        key: "salesPersonType",
        label: "Sales Person Type",
    },
    {
        key: "salesPersonName",
        label: "Sales Person Name",
        required: true,
    },
    {
        key: "email",
        label: "Email",
        type: "email",
    },
    {
        key: "mobile",
        label: "Mobile",
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

const getErrorMessage = (error, fallback) => {
    if (typeof error === "string") {
        return error;
    }

    return (
        error?.response?.data?.message ||
        error?.message ||
        fallback
    );
};

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
    const seconds = Math.max(
        0,
        Math.floor((Date.now() - milliseconds) / 1000)
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

            return;
        }

        if (
            field.type === "email" &&
            value &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        ) {
            errors[field.key] =
                "Enter a valid email address";
        }
    });

    return errors;
}

function normalizeSalesPerson(response) {
    const data = response?.data ?? response;

    if (!data || typeof data !== "object") {
        return null;
    }

    return data;
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
   EDITABLE FIELDS SECTION
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
                values[field.key] ?? (
                    field.key === "status"
                        ? "ACTIVE"
                        : ""
                );
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
        const validationErrors = validate(
            fields,
            draft
        );

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
            const result = await onSave(patch, title);

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
                getErrorMessage(
                    error,
                    "Failed to save changes."
                )
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
                                    <input
                                        type={
                                            field.type === "email"
                                                ? "email"
                                                : "text"
                                        }
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
                                        className={`h-[34px] w-full rounded-lg border bg-white px-3 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 disabled:bg-slate-50 ${errors[field.key]
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
                                        className={`inline-flex rounded-full px-2 py-1 text-[11px] font-medium ${String(
                                            value || "ACTIVE"
                                        ).toUpperCase() === "ACTIVE"
                                            ? "bg-emerald-50 text-emerald-600"
                                            : String(value).toUpperCase() === "INACTIVE"
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
   SALESPERSON PROFILE
   ========================================================= */

function SalesPersonAvatarSection({
    salesPersonName,
    initials,
}) {
    return (
        <div className="flex h-full min-h-[190px] flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between px-4 pt-4">
                <h3 className="text-[14px] font-semibold text-slate-900">
                    Sales Person Profile
                </h3>
            </div>

            <div className="flex flex-1 items-center justify-center px-3 py-5">
                <div
                    className="flex h-[110px] w-[110px] items-center justify-center rounded-full border-4 border-[#0F4659]/10 bg-gradient-to-br from-[#0F4659]/80 to-[#0F4659] shadow-sm"
                    title={salesPersonName || "Sales Person"}
                >
                    <span className="text-[30px] font-bold tracking-tight text-white">
                        {initials}
                    </span>
                </div>
            </div>

            <div className="border-t border-slate-100 px-4 py-2.5 text-center">
                <p className="truncate text-[12px] text-slate-400">
                    {salesPersonName || "Sales Person"}
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
   SALES PERSON OVERVIEW PAGE
   ========================================================= */

export default function SalesPersonOverView() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { id } = useParams();

    const {
        salesPerson,
        salesPersons,
        loading,
        error,
    } = useSelector((state) => state.salesPerson || {});

    const [activity, setActivity] = useState([]);

    const requestSequence = useRef(0);

    /* =====================================================
       SELECT CURRENT SALESPERSON
       ===================================================== */

    const current = React.useMemo(() => {
        if (id) {
            if (
                salesPerson?.id != null &&
                String(salesPerson.id) === String(id)
            ) {
                return salesPerson;
            }

            return salesPersons?.find(
                (item) => String(item.id) === String(id)
            ) || null;
        }

        return salesPerson?.id
            ? salesPerson
            : salesPersons?.[0] || null;
    }, [id, salesPerson, salesPersons]);

    const ready = Boolean(current?.id);

    /* =====================================================
       FETCH SALESPERSON
       ===================================================== */

    useEffect(() => {
        const sequence = ++requestSequence.current;

        const request = id
            ? dispatch(fetchSalesPersonById(id))
            : dispatch(fetchAllSalesPersons());

        return () => {
            // Ignore stale local request handling on navigation.
            if (requestSequence.current === sequence) {
                requestSequence.current += 1;
            }
        };
    }, [id, dispatch]);

    /* =====================================================
       ACTIVITY LOG
       ===================================================== */

    const logActivity = (text) => {
        setActivity((previous) => [
            {
                text,
                at: Date.now(),
            },
            ...previous,
        ].slice(0, 8));
    };

    /* =====================================================
       SAVE SALES PERSON FIELDS
       ===================================================== */

    const saveFields = async (patch, label) => {
        if (!current?.id) {
            return {
                ok: false,
                message: "Sales Person ID is missing.",
            };
        }

        try {
            const payload = {
                salesPersonCode:
                    current.salesPersonCode ?? "",
                salesPersonType:
                    current.salesPersonType ?? "",
                salesPersonName:
                    current.salesPersonName ?? "",
                email: current.email ?? "",
                mobile: current.mobile ?? "",
                status: current.status || "ACTIVE",
                ...patch,
            };

            const response = await dispatch(
                updateSalesPerson({
                    id: current.id,
                    data: payload,
                })
            );

            if (
                !updateSalesPerson.fulfilled.match(response)
            ) {
                return {
                    ok: false,
                    message: getErrorMessage(
                        response.payload,
                        "Failed to update Sales Person."
                    ),
                };
            }

            const updated = normalizeSalesPerson(
                response.payload
            );

            if (updated) {
                // The slice updates salesPerson and the list
                // when the API response contains data.
                dispatch({
                    type: "salesPerson/setSelectedSalesPersonView",
                    payload: updated,
                });
            }

            logActivity(`Updated ${label}`);

            return { ok: true };
        } catch (err) {
            return {
                ok: false,
                message: getErrorMessage(
                    err,
                    "Failed to update Sales Person."
                ),
            };
        }
    };

    /* =====================================================
       RETRY
       ===================================================== */

    const retry = () => {
        if (id) {
            dispatch(fetchSalesPersonById(id));
        } else {
            dispatch(fetchAllSalesPersons());
        }
    };

    /* =====================================================
       LOADING
       ===================================================== */

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

    /* =====================================================
       EMPTY / ERROR
       ===================================================== */

    if (!ready) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 text-center">
                <AlertCircle
                    size={32}
                    className="text-slate-300"
                />

                <p className="text-sm text-slate-500">
                    {error || "No Sales Person found."}
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
                    onClick={() => navigate("/salesPersons")}
                    className="text-[12px] font-medium text-[#0F4659] hover:underline"
                >
                    Back to Sales Persons
                </button>
            </div>
        );
    }

    /* =====================================================
       DERIVED VALUES
       ===================================================== */

    const salesPersonName = toText(
        current.salesPersonName
    );

    const initials =
        salesPersonName
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((word) => word[0])
            .join("")
            .toUpperCase() || "SP";

    const status = String(
        current.status || "ACTIVE"
    ).toUpperCase();

    const isActive = status === "ACTIVE";

    const createdDate = formatDate(current.createdAt);
    const updatedDate = formatDate(current.updatedAt);

    /* =====================================================
       UI
       ===================================================== */

    return (
        <div className="w-full space-y-4 p-3">
            {/* PROFILE HEADER */}

            <div className="w-full space-y-4">
                <div className="rounded-xl border border-slate-100 bg-white p-4">
                    <div className="flex flex-wrap items-start justify-between gap-4 px-2 py-3 pb-5">
                        <div className="flex items-start gap-4">
                            <button
                                type="button"
                                className="flex h-[86px] w-[86px] shrink-0 items-center justify-center overflow-hidden rounded-full border-[4px] border-white bg-gradient-to-br from-[#0F4659]/70 to-[#0F4659] shadow-md"
                                onClick={() => navigate("/salesPersons")}
                                title="Back to Sales Persons"
                            >
                                <span className="text-[24px] font-bold tracking-tight text-white">
                                    {initials}
                                </span>
                            </button>

                            <div className="pt-2.5">
                                <h2
                                    className="cursor-pointer text-[24px] font-semibold leading-tight text-[#0F4659] hover:text-[#0F4659]/70"
                                    onClick={() =>
                                        navigate("/salesPersons")
                                    }
                                >
                                    {salesPersonName || "Sales Person"}
                                </h2>

                                <p className="mt-0.5 text-[12px] text-[#0F4659]">
                                    Sales Person ID: {current.id}
                                </p>

                                <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px] text-slate-500">
                                    <span className="flex items-center gap-1 text-slate-700">
                                        <UserRound size={13} />
                                        {current.salesPersonCode || "-"}
                                    </span>

                                    <span className="flex items-center gap-1 text-slate-700">
                                        <FileText size={13} />
                                        {current.salesPersonType || "No type specified"}
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

                {/* SALES PERSON OVERVIEW */}

                <div className="grid grid-cols-1 items-stretch gap-4">
                    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                        <h3 className="text-[14px] font-semibold text-slate-900">
                            Sales Person Overview
                        </h3>

                        <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                            <StatTile
                                icon={ShieldCheck}
                                label="Sales Person Name"
                                value={current.salesPersonName}
                            />

                            <StatTile
                                icon={FileText}
                                label="Sales Person Code"
                                value={current.salesPersonCode}
                            />

                            <StatTile
                                icon={BadgeCheck}
                                label="Status"
                                value={status}
                            />
                        </div>


                    </div>
                </div>

                {/* EDITABLE INFORMATION + PROFILE */}

                <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
                    <div className="grid grid-cols-1 content-start gap-4 lg:col-span-1">
                        <FieldsSection
                            title="Basic Information"
                            fields={BASIC_FIELDS}
                            values={current}
                            onSave={saveFields}
                        />
                    </div>
                    <SalesPersonAvatarSection
                        salesPersonName={salesPersonName}
                        initials={initials}
                    />
                </div>


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
    );
}
