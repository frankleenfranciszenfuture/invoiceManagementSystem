import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    Users,
    CalendarDays,
    FileText,
    Hash,
    UserRound,
    Coins,
    CreditCard,
    Calculator,
    ClipboardList,
    Wallet,
    Building2,
    Banknote,
    RefreshCw,
    MapPin,
    Phone,
    Mail,
    Globe,
    Landmark,
    ShieldCheck,
    MapPinned,
    Contact,
} from "lucide-react";

import { fetchPartyById } from "../thunks/partyThunks";

// ------------------------------------------------------
// Helpers
// ------------------------------------------------------

const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(`${date}T00:00:00`);

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

    return `${symbol ? `${symbol} ` : ""}${Number(amount).toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    )}`;
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

const PartyStatusBadge = ({ status }) => {
    const styles = {
        ACTIVE: "bg-green-100 text-green-700",
        INACTIVE: "bg-red-100 text-red-700",
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

const PartyTypeBadge = ({ type }) => {
    const styles = {
        CUSTOMER: "bg-blue-100 text-blue-700",
        SUPPLIER: "bg-purple-100 text-purple-700",
        BOTH: "bg-indigo-100 text-indigo-700",
    };

    return (
        <span className={`
            inline-flex rounded-full px-3 py-1
            text-xs font-semibold
            ${styles[String(type || "").toUpperCase()] ||
            "bg-gray-100 text-gray-700"}
        `}>
            {formatLabel(type)}
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
                        {value ?? "—"}
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
// Address Card
// ------------------------------------------------------

const AddressCard = ({ address, index }) => {
    const audit = address?.audit;

    return (
        <div className="
            rounded-xl border border-gray-200
            bg-gray-50/70 p-4
        ">
            <div className="
                mb-4 flex flex-wrap items-center
                justify-between gap-2
            ">
                <div className="flex items-center gap-2">
                    <div className="
                        flex h-8 w-8 items-center justify-center
                        rounded-lg bg-blue-50 text-blue-600
                    ">
                        <MapPin size={16} />
                    </div>

                    <h3 className="
                        text-sm font-semibold text-gray-800
                    ">
                        Address {index + 1}
                    </h3>
                </div>

                <div className="flex items-center gap-2">
                    {address?.defaultAddress && (
                        <span className="
                            rounded-full bg-blue-100 px-2.5 py-1
                            text-xs font-semibold text-blue-700
                        ">
                            Default Address
                        </span>
                    )}

                    {audit?.active === false && (
                        <span className="
                            rounded-full bg-red-100 px-2.5 py-1
                            text-xs font-semibold text-red-700
                        ">
                            Inactive
                        </span>
                    )}
                </div>
            </div>

            <div className="
                grid grid-cols-1 gap-5
                sm:grid-cols-2 lg:grid-cols-3
            ">
                <ReadField
                    label="Address ID"
                    value={address?.id}
                />

                <ReadField
                    label="Address Line 1"
                    value={address?.addressLine1}
                />

                <ReadField
                    label="Address Line 2"
                    value={address?.addressLine2}
                />

                <ReadField
                    label="City"
                    value={address?.city}
                />

                <ReadField
                    label="District"
                    value={address?.district}
                />

                <ReadField
                    label="State"
                    value={address?.state}
                />

                <ReadField
                    label="Country"
                    value={address?.country}
                />

                <ReadField
                    label="Postal Code"
                    value={address?.postalCode}
                />

                <ReadField
                    label="Created At"
                    value={formatDateTime(audit?.createdAt)}
                />

            </div>
        </div>
    );
};

// ------------------------------------------------------
// Bank Account Card
// ------------------------------------------------------

const BankAccountCard = ({ account, index }) => {
    const audit = account?.audit;

    return (
        <div className="
            rounded-xl border border-gray-200
            bg-gray-50/70 p-4
        ">
            <div className="
                mb-4 flex flex-wrap items-center
                justify-between gap-2
            ">
                <div className="flex items-center gap-2">
                    <div className="
                        flex h-8 w-8 items-center justify-center
                        rounded-lg bg-purple-50 text-purple-600
                    ">
                        <Landmark size={16} />
                    </div>

                    <h3 className="
                        text-sm font-semibold text-gray-800
                    ">
                        Bank Account {index + 1}
                    </h3>
                </div>

                <div className="flex items-center gap-2">
                    {account?.primaryAccount && (
                        <span className="
                            rounded-full bg-blue-100 px-2.5 py-1
                            text-xs font-semibold text-blue-700
                        ">
                            Primary Account
                        </span>
                    )}

                    <span className={`
                        rounded-full px-2.5 py-1
                        text-xs font-semibold
                        ${account?.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }
                    `}>
                        {formatLabel(account?.status)}
                    </span>
                </div>
            </div>

            <div className="
                grid grid-cols-1 gap-5
                sm:grid-cols-2 lg:grid-cols-3
            ">
                <ReadField
                    label="Account ID"
                    value={account?.id}
                />

                <ReadField
                    label="Party ID"
                    value={account?.partyId}
                />

                <ReadField
                    label="Bank Name"
                    value={account?.bankName}
                />

                <ReadField
                    label="Account Holder Name"
                    value={account?.accountHolderName}
                />

                <ReadField
                    label="Account Number"
                    value={account?.accountNumber}
                />

                <ReadField
                    label="IFSC Code"
                    value={account?.ifscCode}
                />

                <ReadField
                    label="Branch Name"
                    value={account?.branchName}
                />

                <ReadField
                    label="Account Type"
                    value={formatLabel(account?.accountType)}
                />

                <ReadField
                    label="Remarks"
                    value={account?.remarks}
                />

                <ReadField
                    label="Created At"
                    value={formatDateTime(audit?.createdAt)}
                />
            </div>
        </div>
    );
};

// ------------------------------------------------------
// Main Component
// ------------------------------------------------------

const PartyViewDetails = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();

    const {
        party,
        loading,
        error,
    } = useSelector((state) => state.party || {});

    // --------------------------------------------------
    // Fetch party details
    // --------------------------------------------------

    useEffect(() => {
        if (id) {
            dispatch(fetchPartyById(id));
        }
    }, [dispatch, id]);

    // --------------------------------------------------
    // Prevent displaying stale party details
    // --------------------------------------------------

    const loaded =
        party &&
        String(party.id) === String(id);

    const data = loaded ? party : null;
    const audit = data?.audit;

    const addresses = Array.isArray(data?.addresses)
        ? data.addresses
        : [];

    const bankAccounts = Array.isArray(data?.bankAccounts)
        ? data.bankAccounts
        : [];

    /* -------------------------------------------------------
  CURRENT PARTY
------------------------------------------------------- */

    const current =
        party && String(party.id) === String(id)
            ? party
            : null;

    const ready = Boolean(current?.id);

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
                        Loading party details...
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
                <Users
                    size={42}
                    className="text-gray-300"
                />

                <h2 className="
                    mt-3 text-lg font-semibold text-gray-700
                ">
                    Party Not Found
                </h2>

                <p className="
                    mt-1 text-sm text-gray-500
                ">
                    {error || "Unable to load party details."}
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
                                    {data.companyName || "Party Details"}
                                </h1>

                                <PartyTypeBadge
                                    type={data.partyType}
                                />

                                <PartyStatusBadge
                                    status={data.status}
                                />
                            </div>

                            <p className="
                                mt-1 text-sm text-gray-500
                            ">
                                Party Code: {data.partyCode || "—"}
                            </p>
                        </div>
                    </div>

                    <div className="
                        flex items-center gap-2 rounded-lg
                        border border-gray-200 bg-white
                        px-3 py-2 text-sm text-gray-600
                    ">
                        <CalendarDays
                            size={16}
                            className="text-gray-400"
                        />

                        Created: {formatDateTime(audit?.createdAt)}
                    </div>

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

                </div>
            </div>

            {/* Statistics Cards */}

            <div className="
                grid grid-cols-1 gap-4
                sm:grid-cols-2 xl:grid-cols-4
            ">
                <InfoCard
                    title="Party Code"
                    value={data.partyCode}
                    icon={Hash}
                    color="blue"
                />

                <InfoCard
                    title="Credit Limit"
                    value={formatAmount(data.creditLimit)}
                    icon={CreditCard}
                    color="purple"
                />

                <InfoCard
                    title="Outstanding Credit"
                    value={formatAmount(data.outstandingCredit)}
                    icon={Wallet}
                    color="amber"
                />

                <InfoCard
                    title="Available Credit"
                    value={formatAmount(data.availableCredit)}
                    icon={Coins}
                    color="green"
                />
            </div>

            {/* Party Information */}

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
                        value={data.id}
                    />

                    <ReadField
                        label="Party Code"
                        value={data.partyCode}
                    />

                    <ReadField
                        label="Party Type"
                        value={
                            <PartyTypeBadge
                                type={data.partyType}
                            />
                        }
                    />

                    <ReadField
                        label="Company Name"
                        value={data.companyName}
                    />

                    <ReadField
                        label="Contact Person"
                        value={data.contactPerson}
                    />

                    <ReadField
                        label="Email"
                        value={data.email}
                    />

                    <ReadField
                        label="Mobile"
                        value={data.mobile}
                    />

                    <ReadField
                        label="Alternate Mobile"
                        value={data.alternateMobile}
                    />

                    <ReadField
                        label="GST Number"
                        value={data.gstNumber}
                    />

                    <ReadField
                        label="PAN Number"
                        value={data.panNumber}
                    />

                    <ReadField
                        label="Website"
                        value={
                            data.website ? (
                                <a
                                    href={data.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="
                                        break-all text-blue-600
                                        hover:underline
                                    "
                                >
                                    {data.website}
                                </a>
                            ) : "—"
                        }
                    />

                    <ReadField
                        label="Party Status"
                        value={
                            <PartyStatusBadge
                                status={data.status}
                            />
                        }
                    />
                </div>
            </SectionCard>

            {/* Credit Information */}

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
                        label="Outstanding Credit"
                        value={formatAmount(data.outstandingCredit)}
                    />

                    <ReadField
                        label="Available Credit"
                        value={formatAmount(data.availableCredit)}
                    />

                    <ReadField
                        label="Payment Terms"
                        value={data.paymentTerms}
                    />
                </div>
            </SectionCard>

            {/* Address Information */}

            <SectionCard
                title={`Address Information (${addresses.length})`}
                icon={MapPinned}
            >
                {addresses.length > 0 ? (
                    <div className="space-y-4">
                        {addresses.map((address, index) => (
                            <AddressCard
                                key={address.id || index}
                                address={address}
                                index={index}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="
                        py-8 text-center text-sm text-gray-400
                    ">
                        <MapPin
                            size={30}
                            className="mx-auto mb-2 text-gray-300"
                        />
                        No addresses available.
                    </div>
                )}
            </SectionCard>

            {/* Bank Account Information */}

            <SectionCard
                title={`Bank Account Information (${bankAccounts.length})`}
                icon={Building2}
            >
                {bankAccounts.length > 0 ? (
                    <div className="space-y-4">
                        {bankAccounts.map((account, index) => (
                            <BankAccountCard
                                key={account.id || index}
                                account={account}
                                index={index}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="
                        py-8 text-center text-sm text-gray-400
                    ">
                        <Landmark
                            size={30}
                            className="mx-auto mb-2 text-gray-300"
                        />
                        No bank accounts available.
                    </div>
                )}
            </SectionCard>

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

export default PartyViewDetails;