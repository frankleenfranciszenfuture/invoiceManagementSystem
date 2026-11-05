
import React, { useEffect } from "react";

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
    Scale,
    Tag,
    CalendarDays,
    ShieldCheck,
    FileText,
    Hash,
    AlignLeft,
    Barcode,
} from "lucide-react";

import { fetchUnitById } from "../thunks/unitThunks";

// ------------------------------------------------------
// Helpers
// ------------------------------------------------------

const formatDateTime = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const formatLabel = (value) => {
    if (!value) return "—";

    return String(value)
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

// ------------------------------------------------------
// Reusable Components
// ------------------------------------------------------

const SectionCard = ({ title, icon: Icon, children }) => {
    return (
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

            <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">

                {Icon && (
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <Icon size={18} />
                    </div>
                )}

                <h2 className="text-sm font-semibold text-gray-800">
                    {title}
                </h2>

            </div>

            <div className="p-5">
                {children}
            </div>

        </section>
    );
};

const ReadField = ({ label, value }) => {
    return (
        <div className="min-w-0">

            <p className="mb-1 text-xs font-medium text-gray-400">
                {label}
            </p>

            <p className="break-words text-sm font-medium text-gray-700">
                {value === null || value === undefined || value === ""
                    ? "—"
                    : value}
            </p>

        </div>
    );
};

const StatusBadge = ({ status }) => {
    const styles = {
        ACTIVE: "bg-green-100 text-green-700",
        INACTIVE: "bg-red-100 text-red-700",
        DRAFT: "bg-gray-100 text-gray-700",
    };

    const normalizedStatus = String(status || "").toUpperCase();

    return (
        <span
            className={`
                inline-flex rounded-full px-3 py-1 text-xs font-semibold
                ${styles[normalizedStatus] ||
                "bg-gray-100 text-gray-700"
                }
            `}
        >
            {formatLabel(normalizedStatus)}
        </span>
    );
};

const InfoCard = ({ title, value, icon: Icon, color }) => {
    const styles = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        purple: "bg-purple-50 text-purple-600",
        amber: "bg-amber-50 text-amber-600",
    };

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">

            <div className="flex items-center justify-between gap-3">

                <div className="min-w-0">

                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        {title}
                    </p>

                    <p className="mt-2 truncate text-lg font-bold text-gray-800">
                        {value || "—"}
                    </p>

                </div>

                <div
                    className={`
                        flex h-10 w-10 shrink-0 items-center justify-center
                        rounded-lg
                        ${styles[color] || styles.blue}
                    `}
                >
                    <Icon size={20} />
                </div>

            </div>

        </div>
    );
};

// ------------------------------------------------------
// Main Component
// ------------------------------------------------------

const UnitViewDetails = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();

    // ==================================================
    // REDUX STATE
    // ==================================================

    const {
        unit,
        loading,
        error,
    } = useSelector((state) => state.unit);

    // ==================================================
    // FETCH UNIT DETAILS
    // ==================================================

    useEffect(() => {
        if (id) {
            dispatch(fetchUnitById(id));
        }
    }, [dispatch, id]);

    // ==================================================
    // PREVENT STALE UNIT DETAILS
    // ==================================================

    const loaded =
        unit && String(unit.id) === String(id);

    const data = loaded ? unit : null;
    const audit = data?.audit;

    // ==================================================
    // LOADING
    // ==================================================

    if (loading && !loaded) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">

                <div className="text-center">

                    <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

                    <p className="mt-3 text-sm text-gray-500">
                        Loading unit details...
                    </p>

                </div>

            </div>
        );
    }

    // ==================================================
    // ERROR / NOT FOUND
    // ==================================================

    if (!loaded) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center">

                <Scale
                    size={42}
                    className="text-gray-300"
                />

                <h2 className="mt-3 text-lg font-semibold text-gray-700">
                    Unit Not Found
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    {error || "Unable to load unit details."}
                </p>

                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="mt-5 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                    <ArrowLeft size={16} />
                    Go Back
                </button>

            </div>
        );
    }

    // ==================================================
    // RENDER
    // ==================================================

    return (
        <div className="mt-3 space-y-6 pb-8">

            {/* HEADER */}

            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">

                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

                    <div className="flex items-start gap-3">

                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            title="Go back"
                            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50"
                        >
                            <ArrowLeft size={18} />
                        </button>

                        <div>

                            <div className="flex flex-wrap items-center gap-3">

                                <h1 className="text-xl font-bold text-gray-800">
                                    {data.unitName}
                                </h1>

                                <StatusBadge status={data.status} />

                            </div>

                            <p className="mt-1 text-sm text-gray-500">
                                Unit Details
                            </p>

                        </div>

                    </div>

                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600">

                        <CalendarDays
                            size={16}
                            className="text-gray-400"
                        />

                        Created {formatDateTime(audit?.createdAt)}

                    </div>

                </div>

            </div>

            {/* STATISTICS CARDS */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <InfoCard
                    title="Unit Code"
                    value={data.unitCode}
                    icon={Hash}
                    color="blue"
                />

                <InfoCard
                    title="Short Name"
                    value={data.unitShortName}
                    icon={Tag}
                    color="green"
                />

                <InfoCard
                    title="Unit Status"
                    value={formatLabel(data.status)}
                    icon={ShieldCheck}
                    color="purple"
                />

                <InfoCard
                    title="Unit ID"
                    value={data.id}
                    icon={Scale}
                    color="amber"
                />

            </div>

            {/* UNIT INFORMATION */}

            <SectionCard
                title="Unit Information"
                icon={Scale}
            >

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

                    <ReadField
                        label="Unit Code"
                        value={data.unitCode}
                    />

                    <ReadField
                        label="Unit Name"
                        value={data.unitName}
                    />

                    <ReadField
                        label="Short Name"
                        value={data.unitShortName}
                    />

                    <ReadField
                        label="Unit ID"
                        value={data.id}
                    />

                    <ReadField
                        label="Unit Status"
                        value={<StatusBadge status={data.status} />}
                    />

                </div>

            </SectionCard>

            {/* DESCRIPTION INFORMATION */}

            <SectionCard
                title="Description Information"
                icon={AlignLeft}
            >

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                    <ReadField
                        label="Description"
                        value={data.description}
                    />

                </div>

                {data.description && (
                    <div className="mt-5 rounded-lg border border-gray-100 bg-gray-50 p-4">

                        <div className="mb-2 flex items-center gap-2">

                            <FileText
                                size={16}
                                className="text-blue-600"
                            />

                            <p className="text-xs font-semibold text-gray-500">
                                Unit Description
                            </p>

                        </div>

                        <p className="text-sm leading-6 text-gray-700">
                            {data.description}
                        </p>

                    </div>
                )}

            </SectionCard>

            {/* AUDIT INFORMATION */}

            <SectionCard
                title="Audit Information"
                icon={FileText}
            >

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

                    <ReadField
                        label="Created At"
                        value={formatDateTime(audit?.createdAt)}
                    />

                    <ReadField
                        label="Updated At"
                        value={formatDateTime(audit?.updatedAt)}
                    />

                    <ReadField
                        label="Created By"
                        value={audit?.createdBy}
                    />

                    <ReadField
                        label="Updated By"
                        value={audit?.updatedBy}
                    />

                    <ReadField
                        label="Active"
                        value={
                            audit?.active === true
                                ? "Yes"
                                : audit?.active === false
                                    ? "No"
                                    : "—"
                        }
                    />

                </div>

            </SectionCard>

        </div>
    );
};

export default UnitViewDetails;
