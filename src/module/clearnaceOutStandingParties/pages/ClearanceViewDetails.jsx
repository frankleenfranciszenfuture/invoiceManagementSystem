
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
    Wallet,
    CalendarDays,
    FileText,
    Hash,
    Users,
    Coins,
    CreditCard,
    Calculator,
    Building2,
    Banknote,
    RefreshCw,
    Receipt,
    ShieldCheck,
    CircleDollarSign,
    UserRound,
    Landmark,
} from "lucide-react";

import {
    fetchClearanceById,
} from "../thunks/clearanceThunks";

/* =========================================================
   HELPERS
========================================================= */

const formatDate = (date) => {
    if (!date) return "—";

    const dateValue = String(date).split("T")[0];
    const parts = dateValue.split("-");

    if (parts.length !== 3) {
        return date;
    }

    const [year, month, day] = parts;

    const parsedDate = new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
    );

    if (Number.isNaN(parsedDate.getTime())) {
        return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

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

const formatAmount = (amount, symbol = "₹") => {
    if (
        amount === null ||
        amount === undefined ||
        amount === ""
    ) {
        return "—";
    }

    const value = Number(amount);

    if (!Number.isFinite(value)) {
        return "—";
    }

    return `${symbol ? `${symbol} ` : ""}${value.toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    )
        } `;
};

/* =========================================================
   SECTION CARD
========================================================= */

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

/* =========================================================
   READ FIELD
========================================================= */

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

/* =========================================================
   CLEARANCE STATUS BADGE
========================================================= */

const ClearanceStatusBadge = ({ status }) => {

    const styles = {
        ACTIVE: "bg-green-100 text-green-700",
        INACTIVE: "bg-red-100 text-red-700",
        DRAFT: "bg-amber-100 text-amber-700",
    };

    const normalizedStatus = String(
        status || ""
    ).toUpperCase();

    return (
        <span className={`
inline - flex rounded - full px - 3 py - 1
text - xs font - semibold
            ${styles[normalizedStatus] ||
            "bg-gray-100 text-gray-700"
            }
`}>
            {formatLabel(status)}
        </span>
    );
};

/* =========================================================
   PARTY TYPE BADGE
========================================================= */

const PartyTypeBadge = ({ type }) => {

    const styles = {
        CUSTOMER: "bg-blue-100 text-blue-700",
        SUPPLIER: "bg-purple-100 text-purple-700",
        BOTH: "bg-indigo-100 text-indigo-700",
    };

    const normalizedType = String(
        type || ""
    ).toUpperCase();

    return (
        <span className={`
inline - flex rounded - full px - 3 py - 1
text - xs font - semibold
            ${styles[normalizedType] ||
            "bg-gray-100 text-gray-700"
            }
`}>
            {formatLabel(type)}
        </span>
    );
};

/* =========================================================
   PAYMENT METHOD BADGE
========================================================= */

const PaymentMethodBadge = ({ method }) => {

    const styles = {
        CASH: "bg-green-100 text-green-700",
        UPI: "bg-blue-100 text-blue-700",
        BANK_TRANSFER: "bg-purple-100 text-purple-700",
        CARD: "bg-indigo-100 text-indigo-700",
        CHEQUE: "bg-orange-100 text-orange-700",
        CREDIT: "bg-amber-100 text-amber-700",
    };

    const normalizedMethod = String(
        method || ""
    ).toUpperCase();

    return (
        <span className={`
inline - flex rounded - full px - 3 py - 1
text - xs font - semibold
            ${styles[normalizedMethod] ||
            "bg-gray-100 text-gray-700"
            }
`}>
            {formatLabel(method)}
        </span>
    );
};

/* =========================================================
   INFO CARD
========================================================= */

const InfoCard = ({
    title,
    value,
    icon: Icon,
    color,
}) => {

    const styles = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        purple: "bg-purple-50 text-purple-600",
        amber: "bg-amber-50 text-amber-600",
        red: "bg-red-50 text-red-600",
    };

    return (
        <div className="
            rounded-xl border border-gray-200
            bg-white p-4 shadow-sm transition
            hover:shadow-md
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
                        mt-2 truncate text-lg font-bold
                        text-gray-800
                    ">
                        {value ?? "—"}
                    </p>

                </div>

                <div className={`
                    flex h - 10 w - 10 shrink - 0 items - center
justify - center rounded - lg
                    ${styles[color] || styles.blue}
`}>
                    <Icon size={20} />
                </div>

            </div>

        </div>
    );
};

/* =========================================================
   CREDIT COMPARISON CARD
========================================================= */

const CreditComparisonCard = ({
    title,
    before,
    after,
}) => {

    return (
        <div className="
            rounded-xl border border-gray-200
            bg-gray-50/70 p-4
        ">

            <p className="
                text-xs font-semibold uppercase
                tracking-wide text-gray-500
            ">
                {title}
            </p>

            <div className="
                mt-4 grid grid-cols-1 gap-4
                sm:grid-cols-2
            ">

                <div>

                    <p className="
                        mb-1 text-xs text-gray-400
                    ">
                        Before Clearance
                    </p>

                    <p className="
                        text-base font-semibold text-gray-700
                    ">
                        {formatAmount(before)}
                    </p>

                </div>

                <div>

                    <p className="
                        mb-1 text-xs text-gray-400
                    ">
                        After Clearance
                    </p>

                    <p className={`
text - base font - semibold
                        ${Number(after || 0) >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }
`}>
                        {formatAmount(after)}
                    </p>

                </div>

            </div>

        </div>
    );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const ClearanceViewDetails = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { id } = useParams();

    /* =====================================================
       REDUX STATE
    ===================================================== */

    const {
        existingClearance,
        loading,
        error,
    } = useSelector(
        (state) => state.clearance || {}
    );

    /* =====================================================
       FETCH CLEARANCE DETAILS
    ===================================================== */

    useEffect(() => {

        if (id) {
            dispatch(fetchClearanceById(id));
        }

    }, [
        dispatch,
        id,
    ]);

    /* =====================================================
       PREVENT STALE DETAILS
    ===================================================== */

    const loaded =
        existingClearance &&
        String(existingClearance.id) === String(id);

    const data = loaded
        ? existingClearance
        : null;

    const audit = data?.audit;

    /* =====================================================
       LOADING
    ===================================================== */

    if (loading && !loaded) {

        return (
            <div className="
                flex min-h-[400px]
                items-center justify-center
            ">

                <div className="text-center">

                    <div className="
                        mx-auto h-9 w-9 animate-spin
                        rounded-full border-4
                        border-blue-100 border-t-blue-600
                    " />

                    <p className="
                        mt-3 text-sm text-gray-500
                    ">
                        Loading credit clearance details...
                    </p>

                </div>

            </div>
        );
    }

    /* =====================================================
       ERROR / NOT FOUND
    ===================================================== */

    if (!loaded) {

        return (
            <div className="
                flex min-h-[400px] flex-col
                items-center justify-center
            ">

                <Wallet
                    size={42}
                    className="text-gray-300"
                />

                <h2 className="
                    mt-3 text-lg font-semibold text-gray-700
                ">
                    Clearance Not Found
                </h2>

                <p className="
                    mt-1 text-sm text-gray-500
                ">
                    {error || "Unable to load credit clearance details."}
                </p>

                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="
                        mt-5 flex items-center gap-2
                        rounded-lg bg-blue-600 px-4 py-2
                        text-sm font-medium text-white
                        transition hover:bg-blue-700
                    "
                >
                    <ArrowLeft size={16} />
                    Go Back
                </button>

            </div>
        );
    }

    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <div className="mt-3 space-y-6 pb-8">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="
                rounded-xl border border-gray-100
                bg-white p-5 shadow-sm
            ">

                <div className="
                    flex flex-col justify-between gap-4
                    lg:flex-row lg:items-center
                ">

                    {/* CLEARANCE TITLE */}

                    <div className="
                        flex items-start gap-3
                    ">

                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            title="Go back"
                            className="
                                mt-1 flex h-9 w-9 shrink-0
                                items-center justify-center
                                rounded-lg border border-gray-200
                                bg-white text-gray-600
                                transition hover:bg-gray-50
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
                                    {data.clearanceNo || "Clearance Details"}
                                </h1>

                                <PartyTypeBadge
                                    type={data.partyType}
                                />

                                <ClearanceStatusBadge
                                    status={data.status}
                                />

                            </div>

                            <p className="
                                mt-1 text-sm text-gray-500
                            ">
                                Credit Clearance Details
                            </p>

                        </div>

                    </div>

                    {/* CLEARANCE DATE */}

                    <div className="
                        flex items-center gap-2 rounded-lg
                        border border-gray-200 bg-white
                        px-3 py-2 text-sm text-gray-600
                    ">

                        <CalendarDays
                            size={16}
                            className="text-gray-400"
                        />

                        Clearance Date: {formatDate(data.clearanceDate)}

                    </div>

                </div>

            </div>

            {/* =================================================
                STATISTICS CARDS
            ================================================= */}

            <div className="
                grid grid-cols-1 gap-4
                sm:grid-cols-2 xl:grid-cols-4
            ">

                <InfoCard
                    title="Clearance Number"
                    value={data.clearanceNo}
                    icon={Hash}
                    color="blue"
                />

                <InfoCard
                    title="Clearance Amount"
                    value={formatAmount(data.clearanceAmount)}
                    icon={Wallet}
                    color="green"
                />

                <InfoCard
                    title="Previous Outstanding"
                    value={formatAmount(data.previousOutstandingCredit)}
                    icon={Calculator}
                    color="amber"
                />

                <InfoCard
                    title="Remaining Outstanding"
                    value={formatAmount(data.remainingOutstandingCredit)}
                    icon={Coins}
                    color="purple"
                />

            </div>

            {/* =================================================
                CLEARANCE INFORMATION
            ================================================= */}

            <SectionCard
                title="Clearance Information"
                icon={Receipt}
            >

                <div className="
                    grid grid-cols-1 gap-5
                    sm:grid-cols-2 lg:grid-cols-4
                ">

                    <ReadField
                        label="Clearance ID"
                        value={data.id}
                    />

                    <ReadField
                        label="Clearance Number"
                        value={data.clearanceNo}
                    />

                    <ReadField
                        label="Clearance Date"
                        value={formatDate(data.clearanceDate)}
                    />

                    <ReadField
                        label="Clearance Amount"
                        value={formatAmount(data.clearanceAmount)}
                    />

                    <ReadField
                        label="Clearance Status"
                        value={
                            <ClearanceStatusBadge
                                status={data.status}
                            />
                        }
                    />

                    <ReadField
                        label="Remarks"
                        value={data.remarks}
                    />

                </div>

            </SectionCard>

            {/* =================================================
                PARTY INFORMATION
            ================================================= */}

            <SectionCard
                title="Party Information"
                icon={Users}
            >

                <div className="
                    grid grid-cols-1 gap-5
                    sm:grid-cols-2 lg:grid-cols-4
                ">

                    <ReadField
                        label="Party ID"
                        value={data.partyId}
                    />

                    <ReadField
                        label="Party Code"
                        value={data.partyCode}
                    />

                    <ReadField
                        label="Party Name"
                        value={data.partyName}
                    />

                    <ReadField
                        label="Party Type"
                        value={
                            <PartyTypeBadge
                                type={data.partyType}
                            />
                        }
                    />

                </div>

            </SectionCard>

            {/* =================================================
                PAYMENT INFORMATION
            ================================================= */}

            <SectionCard
                title="Payment Information"
                icon={CreditCard}
            >

                <div className="
                    grid grid-cols-1 gap-5
                    sm:grid-cols-2 lg:grid-cols-4
                ">

                    <ReadField
                        label="Payment Method"
                        value={
                            <PaymentMethodBadge
                                method={data.paymentMethod}
                            />
                        }
                    />

                    <ReadField
                        label="Payment Reference Number"
                        value={data.paymentReferenceNumber}
                    />

                    <ReadField
                        label="Payment Date"
                        value={formatDate(data.clearanceDate)}
                    />

                    <ReadField
                        label="Payment Amount"
                        value={formatAmount(data.clearanceAmount)}
                    />

                </div>

            </SectionCard>

            {/* =================================================
                CREDIT INFORMATION
            ================================================= */}

            <SectionCard
                title="Credit Information"
                icon={Calculator}
            >

                <div className="
                    grid grid-cols-1 gap-5
                    sm:grid-cols-2 lg:grid-cols-4
                ">

                    <ReadField
                        label="Credit Limit"
                        value={formatAmount(data.creditLimit)}
                    />

                    <ReadField
                        label="Previous Outstanding Credit"
                        value={formatAmount(data.previousOutstandingCredit)}
                    />

                    <ReadField
                        label="Clearance Amount"
                        value={formatAmount(data.clearanceAmount)}
                    />

                    <ReadField
                        label="Remaining Outstanding Credit"
                        value={formatAmount(data.remainingOutstandingCredit)}
                    />

                </div>

                <div className="
                    mt-6 grid grid-cols-1 gap-4
                    lg:grid-cols-2
                ">

                    <CreditComparisonCard
                        title="Available Credit"
                        before={data.availableCreditBeforeClearance}
                        after={data.availableCreditAfterClearance}
                    />

                    <div className="
                        rounded-xl border border-blue-100
                        bg-blue-50/50 p-4
                    ">

                        <div className="
                            flex items-center gap-2
                        ">

                            <div className="
                                flex h-9 w-9 items-center justify-center
                                rounded-lg bg-blue-100 text-blue-600
                            ">
                                <ShieldCheck size={18} />
                            </div>

                            <p className="
                                text-sm font-semibold text-gray-800
                            ">
                                Credit Clearance Summary
                            </p>

                        </div>

                        <div className="
                            mt-4 space-y-3
                        ">

                            <div className="
                                flex items-center justify-between gap-3
                            ">

                                <span className="text-xs text-gray-500">
                                    Credit Limit
                                </span>

                                <span className="
                                    text-sm font-semibold text-gray-700
                                ">
                                    {formatAmount(data.creditLimit)}
                                </span>

                            </div>

                            <div className="
                                flex items-center justify-between gap-3
                            ">

                                <span className="text-xs text-gray-500">
                                    Previous Outstanding
                                </span>

                                <span className="
                                    text-sm font-semibold text-gray-700
                                ">
                                    {formatAmount(data.previousOutstandingCredit)}
                                </span>

                            </div>

                            <div className="
                                flex items-center justify-between gap-3
                            ">

                                <span className="text-xs text-gray-500">
                                    Amount Cleared
                                </span>

                                <span className="
                                    text-sm font-semibold text-green-600
                                ">
                                    {formatAmount(data.clearanceAmount)}
                                </span>

                            </div>

                            <div className="
                                border-t border-blue-100 pt-3
                                flex items-center justify-between gap-3
                            ">

                                <span className="
                                    text-xs font-semibold text-gray-600
                                ">
                                    Remaining Outstanding
                                </span>

                                <span className="
                                    text-sm font-bold text-amber-600
                                ">
                                    {formatAmount(data.remainingOutstandingCredit)}
                                </span>

                            </div>

                        </div>

                    </div>

                </div>

            </SectionCard>

            {/* =================================================
                AUDIT INFORMATION
            ================================================= */}

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

export default ClearanceViewDetails;
