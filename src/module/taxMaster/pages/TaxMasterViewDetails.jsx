
import React, { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    Receipt,
    CalendarDays,
    FileText,
    Hash,
    CheckCircle,
    XCircle,
    User,
    Percent,
    Calculator,
    Info,
} from "lucide-react";

import {
    fetchTaxMasterById,
} from "../thunks/taxMasterThunks";

// ------------------------------------------------------
// Helpers
// ------------------------------------------------------

const formatDateTime = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return date;
    }

    return parsedDate.toLocaleString("en-IN", {
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

const formatRate = (value) => {
    if (value === null || value === undefined || value === "") {
        return "—";
    }

    return `${Number(value).toFixed(2)}%`;
};

// ------------------------------------------------------
// Reusable Components
// ------------------------------------------------------

const SectionCard = ({ title, icon: Icon, children }) => {
    return (
        <section className="
            overflow-hidden rounded-xl border
            border-gray-200 bg-white shadow-sm
        ">
            <div className="
                flex items-center gap-2 border-b
                border-gray-100 px-5 py-4
            ">
                {Icon && (
                    <div className="
                        flex h-9 w-9 items-center justify-center
                        rounded-lg bg-blue-50 text-blue-600
                    ">
                        <Icon size={18} />
                    </div>
                )}

                <h2 className="
                    text-sm font-semibold text-gray-800
                ">
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
            <p className="
                mb-1 text-xs font-medium text-gray-400
            ">
                {label}
            </p>

            <div className="
                break-words text-sm font-medium text-gray-700
            ">
                {value === null ||
                    value === undefined ||
                    value === ""
                    ? "—"
                    : value}
            </div>
        </div>
    );
};

const TaxMasterStatusBadge = ({ status }) => {

    const styles = {
        ACTIVE: "bg-green-100 text-green-700",
        INACTIVE: "bg-red-100 text-red-700",
        DRAFT: "bg-amber-100 text-amber-700",
    };

    return (
        <span className={`
            inline-flex rounded-full px-3 py-1
            text-xs font-semibold
            ${styles[String(status || "").toUpperCase()] ||
            "bg-gray-100 text-gray-700"
            }
        `}>
            {formatLabel(status)}
        </span>
    );
};

const BooleanBadge = ({
    value,
    trueLabel = "Yes",
    falseLabel = "No",
}) => {
    return (
        <span className={`
            inline-flex items-center gap-1 rounded-full
            px-3 py-1 text-xs font-semibold
            ${value
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }
        `}>
            {value
                ? <CheckCircle size={12} />
                : <XCircle size={12} />
            }

            {value ? trueLabel : falseLabel}
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
        <div className="
            rounded-xl border border-gray-200
            bg-white p-4 shadow-sm transition hover:shadow-md
        ">
            <div className="
                flex items-center justify-between gap-3
            ">
                <div className="min-w-0">
                    <p className="
                        text-xs font-medium uppercase
                        tracking-wide text-gray-500
                    ">
                        {title}
                    </p>

                    <p className="
                        mt-2 truncate text-lg font-bold text-gray-800
                    ">
                        {value || "—"}
                    </p>
                </div>

                <div className={`
                    flex h-10 w-10 shrink-0 items-center
                    justify-center rounded-lg
                    ${styles[color] || styles.blue}
                `}>
                    <Icon size={20} />
                </div>
            </div>
        </div>
    );
};

// ------------------------------------------------------
// Main Component
// ------------------------------------------------------

const TaxMasterViewDetails = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { id } = useParams();

    const {
        taxMaster,
        loading,
        error,
    } = useSelector((state) => state.taxMaster || {});

    // --------------------------------------------------
    // Fetch Tax Master Details
    // --------------------------------------------------

    useEffect(() => {

        if (id) {
            dispatch(fetchTaxMasterById(id));
        }

    }, [
        dispatch,
        id,
    ]);

    // --------------------------------------------------
    // Prevent Displaying Stale Details
    // --------------------------------------------------

    const loaded =
        taxMaster &&
        String(taxMaster.id) === String(id);

    const data = loaded ? taxMaster : null;

    const audit = data?.audit || {};

    // --------------------------------------------------
    // Loading
    // --------------------------------------------------

    if (loading && !loaded) {

        return (
            <div className="
                flex min-h-[400px] items-center justify-center
            ">
                <div className="text-center">

                    <div className="
                        mx-auto h-9 w-9 animate-spin rounded-full
                        border-4 border-blue-100 border-t-blue-600
                    " />

                    <p className="
                        mt-3 text-sm text-gray-500
                    ">
                        Loading tax master details...
                    </p>

                </div>
            </div>
        );
    }

    // --------------------------------------------------
    // Error / Not Found
    // --------------------------------------------------

    if (!loaded) {

        return (
            <div className="
                flex min-h-[400px] flex-col items-center justify-center
            ">

                <Receipt
                    size={42}
                    className="text-gray-300"
                />

                <h2 className="
                    mt-3 text-lg font-semibold text-gray-700
                ">
                    Tax Master Not Found
                </h2>

                <p className="
                    mt-1 text-sm text-gray-500
                ">
                    {error || "Unable to load tax master details."}
                </p>

                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="
                        mt-5 flex items-center gap-2 rounded-lg
                        bg-blue-600 px-4 py-2 text-sm font-medium
                        text-white transition hover:bg-blue-700
                    "
                >
                    <ArrowLeft size={16} />
                    Go Back
                </button>

            </div>
        );
    }

    // --------------------------------------------------
    // Render
    // --------------------------------------------------

    return (

        <div className="mt-3 space-y-6 pb-8">

            {/* Header */}

            <div className="
                rounded-xl border border-gray-100
                bg-white p-5 shadow-sm
            ">

                <div className="
                    flex flex-col justify-between gap-4
                    lg:flex-row lg:items-center
                ">

                    <div className="
                        flex items-start gap-3
                    ">

                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            title="Go back"
                            className="
                                mt-1 flex h-9 w-9 shrink-0
                                items-center justify-center rounded-lg
                                border border-gray-200 bg-white
                                text-gray-600 transition hover:bg-gray-50
                            "
                        >
                            <ArrowLeft size={18} />
                        </button>

                        <div>

                            <div className="
                                flex flex-wrap items-center gap-3
                            ">

                                <h1 className="
                                    text-xl font-bold text-gray-800
                                ">
                                    {data.taxName || "Tax Master Details"}
                                </h1>

                                <TaxMasterStatusBadge
                                    status={data.status}
                                />

                            </div>

                            <p className="
                                mt-1 text-sm text-gray-500
                            ">
                                Tax master configuration and details
                            </p>

                        </div>

                    </div>

                    <div className="
                        flex items-center gap-2 rounded-lg
                        border border-gray-200 bg-white
                        px-3 py-2 text-sm text-gray-600
                    ">
                        <Hash
                            size={16}
                            className="text-gray-400"
                        />

                        Tax ID: {data.id || "—"}
                    </div>

                </div>

            </div>

            {/* Statistics Cards */}

            <div className="
                grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4
            ">

                <InfoCard
                    title="Tax Name"
                    value={data.taxName}
                    icon={Receipt}
                    color="blue"
                />

                <InfoCard
                    title="Tax Type"
                    value={formatLabel(data.taxType)}
                    icon={FileText}
                    color="purple"
                />

                <InfoCard
                    title="Total Tax Rate"
                    value={formatRate(data.taxRate)}
                    icon={Percent}
                    color="green"
                />

                <InfoCard
                    title="Status"
                    value={formatLabel(data.status)}
                    icon={CheckCircle}
                    color="amber"
                />

            </div>

            {/* Tax Master Information */}

            <SectionCard
                title="Tax Master Information"
                icon={Receipt}
            >

                <div className="
                    grid grid-cols-1 gap-5
                    sm:grid-cols-2 lg:grid-cols-4
                ">

                    <ReadField
                        label="Tax Name"
                        value={data.taxName}
                    />

                    <ReadField
                        label="Tax ID"
                        value={data.id}
                    />

                    <ReadField
                        label="Tax Type"
                        value={formatLabel(data.taxType)}
                    />

                    <ReadField
                        label="Total Tax Rate"
                        value={formatRate(data.taxRate)}
                    />

                    <ReadField
                        label="Status"
                        value={
                            <TaxMasterStatusBadge
                                status={data.status}
                            />
                        }
                    />

                    <ReadField
                        label="Active"
                        value={
                            <BooleanBadge
                                value={data.active}
                            />
                        }
                    />

                    <ReadField
                        label="Description"
                        value={data.description}
                    />

                </div>

            </SectionCard>

            {/* Tax Rate Breakdown */}

            <SectionCard
                title="Tax Rate Breakdown"
                icon={Calculator}
            >

                <div className="
                    grid grid-cols-1 gap-4 sm:grid-cols-3
                ">

                    <div className="
                        rounded-xl border border-blue-100
                        bg-blue-50/50 p-4
                    ">
                        <div className="
                            flex items-center justify-between
                        ">
                            <p className="
                                text-xs font-medium uppercase
                                tracking-wide text-gray-500
                            ">
                                CGST Rate
                            </p>

                            <Percent
                                size={18}
                                className="text-blue-600"
                            />
                        </div>

                        <p className="
                            mt-3 text-2xl font-bold text-blue-700
                        ">
                            {formatRate(data.cgstRate)}
                        </p>

                    </div>

                    <div className="
                        rounded-xl border border-purple-100
                        bg-purple-50/50 p-4
                    ">
                        <div className="
                            flex items-center justify-between
                        ">
                            <p className="
                                text-xs font-medium uppercase
                                tracking-wide text-gray-500
                            ">
                                SGST Rate
                            </p>

                            <Percent
                                size={18}
                                className="text-purple-600"
                            />
                        </div>

                        <p className="
                            mt-3 text-2xl font-bold text-purple-700
                        ">
                            {formatRate(data.sgstRate)}
                        </p>

                    </div>

                    <div className="
                        rounded-xl border border-green-100
                        bg-green-50/50 p-4
                    ">
                        <div className="
                            flex items-center justify-between
                        ">
                            <p className="
                                text-xs font-medium uppercase
                                tracking-wide text-gray-500
                            ">
                                IGST Rate
                            </p>

                            <Percent
                                size={18}
                                className="text-green-600"
                            />
                        </div>

                        <p className="
                            mt-3 text-2xl font-bold text-green-700
                        ">
                            {formatRate(data.igstRate)}
                        </p>

                    </div>

                </div>

                <div className="
                    mt-5 flex items-start gap-2 rounded-lg
                    border border-blue-100 bg-blue-50 p-3
                ">
                    <Info
                        size={17}
                        className="mt-0.5 shrink-0 text-blue-600"
                    />

                    <p className="
                        text-xs leading-5 text-blue-700
                    ">
                        {String(data.taxType).toUpperCase() === "CGST_SGST"
                            ? "This tax uses CGST and SGST components. Both rates are applied separately."
                            : String(data.taxType).toUpperCase() === "IGST"
                                ? "This tax uses the IGST component for inter-state transactions."
                                : "Tax rate breakdown based on the configured tax type."
                        }
                    </p>
                </div>

            </SectionCard>

            {/* Tax Settings */}

            <SectionCard
                title="Tax Settings"
                icon={CheckCircle}
            >

                <div className="
                    grid grid-cols-1 gap-5
                    sm:grid-cols-2 lg:grid-cols-4
                ">

                    <ReadField
                        label="Tax Status"
                        value={
                            <TaxMasterStatusBadge
                                status={data.status}
                            />
                        }
                    />

                    <ReadField
                        label="Active"
                        value={
                            <BooleanBadge
                                value={data.active}
                                trueLabel="Active"
                                falseLabel="Inactive"
                            />
                        }
                    />

                    <ReadField
                        label="Tax Type"
                        value={formatLabel(data.taxType)}
                    />

                    <ReadField
                        label="Total Tax Rate"
                        value={formatRate(data.taxRate)}
                    />

                </div>

            </SectionCard>

            {/* Audit Information */}

            <SectionCard
                title="Audit Information"
                icon={CalendarDays}
            >

                <div className="
                    grid grid-cols-1 gap-5
                    sm:grid-cols-2 lg:grid-cols-4
                ">

                    <ReadField
                        label="Created At"
                        value={formatDateTime(audit.createdAt)}
                    />

                    <ReadField
                        label="Updated At"
                        value={formatDateTime(audit.updatedAt)}
                    />

                    <ReadField
                        label="Created By"
                        value={audit.createdBy}
                    />

                    <ReadField
                        label="Updated By"
                        value={audit.updatedBy}
                    />

                    <ReadField
                        label="Audit Active"
                        value={
                            <BooleanBadge
                                value={audit.active}
                            />
                        }
                    />

                </div>

            </SectionCard>

        </div>
    );
};

export default TaxMasterViewDetails;
