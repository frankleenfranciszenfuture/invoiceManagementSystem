import React, { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    Building2,
    CalendarDays,
    FileText,
    Hash,
    Mail,
    Phone,
    Globe,
    MapPin,
    Receipt,
    Coins,
    CheckCircle,
    XCircle,
    Star,
    Image,
    CreditCard,
} from "lucide-react";

import {
    fetchCompanyById,
} from "../thunks/companyThunks";

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

const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
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

const CompanyStatusBadge = ({ status }) => {
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
            "bg-gray-100 text-gray-700"}
        `}>
            {formatLabel(status)}
        </span>
    );
};

const DefaultCompanyBadge = ({ isDefault }) => {
    return (
        <span className={`
            inline-flex items-center gap-1 rounded-full
            px-3 py-1 text-xs font-semibold
            ${isDefault
                ? "bg-amber-100 text-amber-700"
                : "bg-gray-100 text-gray-600"
            }
        `}>
            <Star size={12} />
            {isDefault ? "Default Company" : "Standard Company"}
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

const CompanyViewDetails = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { id } = useParams();

    const {
        company,
        loading,
        error,
    } = useSelector((state) => state.company || {});

    // --------------------------------------------------
    // Fetch company details
    // --------------------------------------------------

    useEffect(() => {

        if (id) {
            dispatch(fetchCompanyById(id));
        }

    }, [
        dispatch,
        id,
    ]);

    // --------------------------------------------------
    // Prevent displaying stale company details
    // --------------------------------------------------

    const loaded =
        company &&
        String(company.id) === String(id);

    const data = loaded ? company : null;
    const audit = data?.audit;

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
                        Loading company details...
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

                <Building2
                    size={42}
                    className="text-gray-300"
                />

                <h2 className="
                    mt-3 text-lg font-semibold text-gray-700
                ">
                    Company Not Found
                </h2>

                <p className="
                    mt-1 text-sm text-gray-500
                ">
                    {error || "Unable to load company details."}
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
                                    {data.displayName ||
                                        data.companyName ||
                                        "Company Details"}
                                </h1>

                                <CompanyStatusBadge
                                    status={data.status}
                                />

                                {data.isDefault && (
                                    <DefaultCompanyBadge
                                        isDefault={data.isDefault}
                                    />
                                )}

                            </div>

                            <p className="
                                mt-1 text-sm text-gray-500
                            ">
                                {data.legalName || data.companyName}
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

                        Company Code: {data.companyCode || "—"}
                    </div>

                </div>

            </div>

            {/* Statistics Cards */}

            <div className="
                grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4
            ">

                <InfoCard
                    title="Company Name"
                    value={data.companyName}
                    icon={Building2}
                    color="blue"
                />

                <InfoCard
                    title="Company Code"
                    value={data.companyCode}
                    icon={Hash}
                    color="purple"
                />

                <InfoCard
                    title="Currency"
                    value={data.currency}
                    icon={Coins}
                    color="green"
                />

                <InfoCard
                    title="Invoice Prefix"
                    value={data.invoicePrefix}
                    icon={Receipt}
                    color="amber"
                />

            </div>

            {/* Company Information */}

            <SectionCard
                title="Company Information"
                icon={Building2}
            >

                <div className="
                    grid grid-cols-1 gap-5
                    sm:grid-cols-2 lg:grid-cols-4
                ">

                    <ReadField
                        label="Company Name"
                        value={data.companyName}
                    />

                    <ReadField
                        label="Display Name"
                        value={data.displayName}
                    />

                    <ReadField
                        label="Legal Name"
                        value={data.legalName}
                    />

                    <ReadField
                        label="Company Code"
                        value={data.companyCode}
                    />

                    <ReadField
                        label="Company ID"
                        value={data.id}
                    />

                    <ReadField
                        label="Company Status"
                        value={
                            <CompanyStatusBadge
                                status={data.status}
                            />
                        }
                    />

                    <ReadField
                        label="Default Company"
                        value={
                            <DefaultCompanyBadge
                                isDefault={data.isDefault}
                            />
                        }
                    />

                    <ReadField
                        label="Active"
                        value={data.active === true ? "Yes" : data.active === false ? "No" : "—"}
                    />

                </div>

            </SectionCard>

            {/* Tax Information */}

            <SectionCard
                title="Tax Information"
                icon={FileText}
            >

                <div className="
                    grid grid-cols-1 gap-5
                    sm:grid-cols-2 lg:grid-cols-4
                ">

                    <ReadField
                        label="GST Number"
                        value={data.gstNumber}
                    />

                    <ReadField
                        label="PAN Number"
                        value={data.panNumber}
                    />

                    <ReadField
                        label="TAN Number"
                        value={data.tanNumber}
                    />

                </div>

            </SectionCard>

            {/* Contact Information */}

            <SectionCard
                title="Contact Information"
                icon={Phone}
            >

                <div className="
                    grid grid-cols-1 gap-5
                    sm:grid-cols-2 lg:grid-cols-4
                ">

                    <ReadField
                        label="Email"
                        value={data.email}
                    />

                    <ReadField
                        label="Phone"
                        value={data.phone}
                    />

                    <ReadField
                        label="Alternate Phone"
                        value={data.alternatePhone}
                    />

                    <ReadField
                        label="Website"
                        value={data.website}
                    />

                </div>

            </SectionCard>

            {/* Address Information */}

            <SectionCard
                title="Address Information"
                icon={MapPin}
            >

                <div className="
                    grid grid-cols-1 gap-5
                    sm:grid-cols-2 lg:grid-cols-4
                ">

                    <ReadField
                        label="Address Line 1"
                        value={data.addressLine1}
                    />

                    <ReadField
                        label="Address Line 2"
                        value={data.addressLine2}
                    />

                    <ReadField
                        label="City"
                        value={data.city}
                    />

                    <ReadField
                        label="State"
                        value={data.state}
                    />

                    <ReadField
                        label="Country"
                        value={data.country}
                    />

                    <ReadField
                        label="Pincode"
                        value={data.pincode}
                    />

                </div>

            </SectionCard>

            {/* Invoice and Financial Information */}

            <SectionCard
                title="Invoice & Financial Information"
                icon={Receipt}
            >

                <div className="
                    grid grid-cols-1 gap-5
                    sm:grid-cols-2 lg:grid-cols-4
                ">

                    <ReadField
                        label="Invoice Prefix"
                        value={data.invoicePrefix}
                    />

                    <ReadField
                        label="Invoice Start Number"
                        value={data.invoiceStartNumber}
                    />

                    <ReadField
                        label="Currency"
                        value={data.currency}
                    />

                    <ReadField
                        label="Financial Year Start"
                        value={formatDate(data.financialYearStart)}
                    />

                </div>

            </SectionCard>

            {/* Company Documents */}

            {(data.logo || data.signature) && (

                <SectionCard
                    title="Company Documents"
                    icon={Image}
                >

                    <div className="
                        grid grid-cols-1 gap-6
                        sm:grid-cols-2
                    ">

                        {data.logo && (
                            <div>
                                <p className="
                                    mb-3 text-xs font-medium text-gray-400
                                ">
                                    Company Logo
                                </p>

                                <div className="
                                    flex min-h-36 items-center justify-center
                                    rounded-lg border border-gray-200 bg-gray-50 p-4
                                ">
                                    <img
                                        src={data.logo}
                                        alt="Company Logo"
                                        className="
                                            max-h-32 max-w-full object-contain
                                        "
                                    />
                                </div>
                            </div>
                        )}

                        {data.signature && (
                            <div>
                                <p className="
                                    mb-3 text-xs font-medium text-gray-400
                                ">
                                    Authorized Signature
                                </p>

                                <div className="
                                    flex min-h-36 items-center justify-center
                                    rounded-lg border border-gray-200 bg-gray-50 p-4
                                ">
                                    <img
                                        src={data.signature}
                                        alt="Company Signature"
                                        className="
                                            max-h-32 max-w-full object-contain
                                        "
                                    />
                                </div>
                            </div>
                        )}

                    </div>

                </SectionCard>

            )}

            {/* Audit Information */}

            <SectionCard
                title="Audit Information"
                icon={FileText}
            >

                <div className="
                    grid grid-cols-1 gap-5
                    sm:grid-cols-2 lg:grid-cols-4
                ">

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

export default CompanyViewDetails;