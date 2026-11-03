import React, { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    Landmark,
    CalendarDays,
    FileText,
    Hash,
    Coins,
    Calculator,
    ClipboardList,
    Building2,
    Banknote,
    RefreshCw,
    CheckCircle,
    XCircle,
    CreditCard,
    User,
    Star,
} from "lucide-react";

import {
    fetchBankAccountById,
} from "../thunks/bankAccountThunks";

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

const BankAccountStatusBadge = ({ status }) => {
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

const PrimaryAccountBadge = ({ primaryAccount }) => {
    return (
        <span className={`
            inline-flex items-center gap-1 rounded-full
            px-3 py-1 text-xs font-semibold
            ${primaryAccount
                ? "bg-amber-100 text-amber-700"
                : "bg-gray-100 text-gray-600"
            }
        `}>
            <Star size={12} />
            {primaryAccount ? "Primary Account" : "Standard Account"}
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

const BankAccountViewDetails = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { id } = useParams();

    const {
        bankAccount,
        loading,
        error,
    } = useSelector((state) => state.bankAccount || {});

    // --------------------------------------------------
    // Fetch bank account details
    // --------------------------------------------------

    useEffect(() => {

        if (id) {
            dispatch(fetchBankAccountById(id));
        }

    }, [
        dispatch,
        id,
    ]);

    // --------------------------------------------------
    // Prevent displaying stale bank account details
    // --------------------------------------------------

    const loaded =
        bankAccount &&
        String(bankAccount.id) === String(id);

    const data = loaded ? bankAccount : null;
    const audit = data?.audit;

    const currencyCode = data?.currency || "INR";

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
                        Loading bank account details...
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

                <Landmark
                    size={42}
                    className="text-gray-300"
                />

                <h2 className="
                    mt-3 text-lg font-semibold text-gray-700
                ">
                    Bank Account Not Found
                </h2>

                <p className="
                    mt-1 text-sm text-gray-500
                ">
                    {error || "Unable to load bank account details."}
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
                                    {data.accountName || "Bank Account Details"}
                                </h1>

                                <BankAccountStatusBadge
                                    status={data.status}
                                />

                                {data.primaryAccount && (
                                    <PrimaryAccountBadge
                                        primaryAccount={data.primaryAccount}
                                    />
                                )}

                            </div>

                            <p className="
                                mt-1 text-sm text-gray-500
                            ">
                                Bank Account Details
                            </p>

                        </div>

                    </div>

                    <div className="
                        flex items-center gap-2 rounded-lg
                        border border-gray-200 bg-white
                        px-3 py-2 text-sm text-gray-600
                    ">
                        <Landmark
                            size={16}
                            className="text-gray-400"
                        />

                        Account Code: {data.accountCode || "—"}
                    </div>

                </div>

            </div>

            {/* Statistics Cards */}

            <div className="
                grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4
            ">

                <InfoCard
                    title="Account Name"
                    value={data.accountName}
                    icon={Landmark}
                    color="blue"
                />

                <InfoCard
                    title="Bank Name"
                    value={data.bankName}
                    icon={Building2}
                    color="purple"
                />

                <InfoCard
                    title="Account Number"
                    value={data.accountNumber}
                    icon={CreditCard}
                    color="green"
                />

                <InfoCard
                    title="Currency"
                    value={currencyCode}
                    icon={Coins}
                    color="amber"
                />

            </div>

            {/* Bank Account Information */}

            <SectionCard
                title="Bank Account Information"
                icon={Landmark}
            >

                <div className="
                    grid grid-cols-1 gap-5
                    sm:grid-cols-2 lg:grid-cols-4
                ">

                    <ReadField
                        label="Account Name"
                        value={data.accountName}
                    />

                    <ReadField
                        label="Account Code"
                        value={data.accountCode}
                    />

                    <ReadField
                        label="Account ID"
                        value={data.id}
                    />

                    <ReadField
                        label="Account Type"
                        value={formatLabel(data.accountType)}
                    />

                    <ReadField
                        label="Bank Name"
                        value={data.bankName}
                    />

                    <ReadField
                        label="Branch Name"
                        value={data.branchName}
                    />
                    <ReadField
                        label="Account Number"
                        value={data.accountNumber}
                    />

                    <ReadField
                        label="IFSC Code"
                        value={data.ifsc}
                    />

                    <ReadField
                        label="SWIFT Code"
                        value={data.swiftCode}
                    />



                    <ReadField
                        label="Currency"
                        value={currencyCode}
                    />

                    <ReadField
                        label="Account Status"
                        value={
                            <BankAccountStatusBadge
                                status={data.status}
                            />
                        }
                    />

                    <ReadField
                        label="Primary Account"
                        value={
                            <PrimaryAccountBadge
                                primaryAccount={data.primaryAccount}
                            />
                        }
                    />

                </div>

            </SectionCard>

            {/* Currency Information */}

            <SectionCard
                title="Currency Information"
                icon={Coins}
            >

                <div className="
                    grid grid-cols-1 gap-5
                    sm:grid-cols-2 lg:grid-cols-4
                ">

                    <ReadField
                        label="Currency Code"
                        value={currencyCode}
                    />

                </div>

            </SectionCard>

            {/* User Information */}

            {Array.isArray(data.userIds) && data.userIds.length > 0 && (

                <SectionCard
                    title="Assigned Users"
                    icon={User}
                >

                    <div className="
                        grid grid-cols-1 gap-5
                        sm:grid-cols-2 lg:grid-cols-4
                    ">

                        <ReadField
                            label="Assigned User IDs"
                            value={data.userIds.join(", ")}
                        />

                        <ReadField
                            label="Total Assigned Users"
                            value={data.userIds.length}
                        />

                    </div>

                </SectionCard>

            )}

            {/* Description */}

            {data.description && (

                <SectionCard
                    title="Account Description"
                    icon={ClipboardList}
                >

                    <p className="
                        whitespace-pre-wrap break-words
                        text-sm leading-6 text-gray-700
                    ">
                        {data.description}
                    </p>

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

export default BankAccountViewDetails;