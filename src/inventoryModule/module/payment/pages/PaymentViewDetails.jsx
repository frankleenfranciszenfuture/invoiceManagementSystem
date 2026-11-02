import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    Receipt,
    CalendarDays,
    FileText,
    Hash,
    UserRound,
    Coins,
    CreditCard,
    Calculator,
    ClipboardList,
    Wallet,
    ArrowDownLeft,
    ArrowUpRight,
    RotateCcw,
    Building2,
    Banknote,
    RefreshCw,
} from "lucide-react";

import { fetchPaymentById } from "../thunks/paymentThunks";

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

const formatAmount = (amount, symbol = "") => {
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

const PaymentStatusBadge = ({ status }) => {
    const styles = {
        COMPLETED: "bg-green-100 text-green-700",
        PENDING: "bg-amber-100 text-amber-700",
        FAILED: "bg-red-100 text-red-700",
        REVERSED: "bg-gray-100 text-gray-700",
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

const PaymentTypeBadge = ({ type }) => {
    const styles = {
        SALES: "bg-blue-100 text-blue-700",
        PURCHASE: "bg-purple-100 text-purple-700",
        EXPENSE: "bg-orange-100 text-orange-700",
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

const DirectionBadge = ({ direction }) => {
    const isReceived = direction === "RECEIVED";

    return (
        <span className={`
            inline-flex items-center gap-1.5
            rounded-full px-3 py-1 text-xs font-semibold
            ${isReceived
                ? "bg-green-100 text-green-700"
                : "bg-orange-100 text-orange-700"
            }
        `}>
            {isReceived
                ? <ArrowDownLeft size={14} />
                : <ArrowUpRight size={14} />
            }

            {formatLabel(direction)}
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

const PaymentViewDetails = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();

    const {
        payment,
        loading,
        error,
    } = useSelector((state) => state.payment || {});

    // --------------------------------------------------
    // Fetch payment details
    // --------------------------------------------------

    useEffect(() => {
        if (id) {
            dispatch(fetchPaymentById(id));
        }
    }, [dispatch, id]);

    // --------------------------------------------------
    // Prevent displaying stale payment details
    // --------------------------------------------------

    const loaded =
        payment &&
        String(payment.id) === String(id);

    const data = loaded ? payment : null;
    const audit = data?.audit;

    const currencyCode = data?.currencyCode || "";

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
                        Loading payment details...
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
                    Payment Not Found
                </h2>

                <p className="
                    mt-1 text-sm text-gray-500
                ">
                    {error || "Unable to load payment details."}
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
                                    {data.paymentNumber || "Payment Details"}
                                </h1>

                                <PaymentTypeBadge
                                    type={data.paymentType}
                                />

                                <PaymentStatusBadge
                                    status={data.paymentStatus}
                                />
                            </div>

                            <p className="
                                mt-1 text-sm text-gray-500
                            ">
                                Payment Details
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

                        Payment Date: {formatDate(data.paymentDate)}
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}

            <div className="
                grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4
            ">
                <InfoCard
                    title="Payment Number"
                    value={data.paymentNumber}
                    icon={Hash}
                    color="blue"
                />

                <InfoCard
                    title="Payment Amount"
                    value={formatAmount(
                        data.paymentAmount,
                        currencyCode
                    )}
                    icon={Coins}
                    color="green"
                />

                <InfoCard
                    title="Base Amount (INR)"
                    value={formatAmount(data.baseAmount, "₹")}
                    icon={Calculator}
                    color="purple"
                />

                <InfoCard
                    title="Exchange Rate"
                    value={data.exchangeRate}
                    icon={RefreshCw}
                    color="amber"
                />
            </div>

            {/* Payment Information */}

            <SectionCard
                title="Payment Information"
                icon={Receipt}
            >
                <div className="
                    grid grid-cols-1 gap-5
                    sm:grid-cols-2 lg:grid-cols-4
                ">
                    <ReadField
                        label="Payment Number"
                        value={data.paymentNumber}
                    />

                    <ReadField
                        label="Payment Type"
                        value={<PaymentTypeBadge type={data.paymentType} />}
                    />

                    <ReadField
                        label="Payment Direction"
                        value={
                            <DirectionBadge
                                direction={data.paymentDirection}
                            />
                        }
                    />

                    <ReadField
                        label="Payment Date"
                        value={formatDate(data.paymentDate)}
                    />

                    <ReadField
                        label="Payment Status"
                        value={
                            <PaymentStatusBadge
                                status={data.paymentStatus}
                            />
                        }
                    />

                    <ReadField
                        label="Payment ID"
                        value={data.id}
                    />

                    <ReadField
                        label="Payment Method"
                        value={formatLabel(data.paymentMethod)}
                    />

                    <ReadField
                        label="Reference Number"
                        value={data.referenceNumber}
                    />
                </div>

                {data.notes && (
                    <div className="
                        mt-5 border-t border-gray-100 pt-4
                    ">
                        <ReadField
                            label="Notes"
                            value={data.notes}
                        />
                    </div>
                )}
            </SectionCard>

            {/* Source Document Information */}

            <SectionCard
                title="Source Document Information"
                icon={FileText}
            >
                <div className="
                    grid grid-cols-1 gap-5
                    sm:grid-cols-2 lg:grid-cols-4
                ">
                    <ReadField
                        label="Source Document Number"
                        value={data.sourceNumber}
                    />

                    <ReadField
                        label="Source Document ID"
                        value={data.sourceId}
                    />

                    <ReadField
                        label="Source Type"
                        value={formatLabel(data.paymentType)}
                    />

                    <ReadField
                        label="Customer ID"
                        value={data.customerId}
                    />

                    <ReadField
                        label="Customer Name"
                        value={data.customerName}
                    />

                    <ReadField
                        label="Party ID"
                        value={data.partyId}
                    />

                    <ReadField
                        label="Party Name"
                        value={data.partyName}
                    />
                </div>
            </SectionCard>

            {/* Bank / Cash Account Information */}

            <SectionCard
                title="Bank & Cash Account Information"
                icon={Building2}
            >
                <div className="
                    grid grid-cols-1 gap-5
                    sm:grid-cols-2 lg:grid-cols-4
                ">
                    <ReadField
                        label="Payment Method"
                        value={formatLabel(data.paymentMethod)}
                    />

                    <ReadField
                        label="Bank Account ID"
                        value={data.bankAccountId}
                    />

                    <ReadField
                        label="Bank Account Name"
                        value={data.bankAccountName}
                    />

                    <ReadField
                        label="Cash Account ID"
                        value={data.cashAccountId}
                    />

                    <ReadField
                        label="Cash Account Name"
                        value={data.cashAccountName}
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
                        label="Currency ID"
                        value={data.currencyId}
                    />

                    <ReadField
                        label="Currency Code"
                        value={data.currencyCode}
                    />

                    <ReadField
                        label="Currency Name"
                        value={data.currencyName}
                    />

                    <ReadField
                        label="Exchange Rate"
                        value={data.exchangeRate}
                    />
                </div>
            </SectionCard>

            {/* Amount Information */}

            <SectionCard
                title="Amount Breakdown"
                icon={Calculator}
            >
                <div className="
                    grid grid-cols-1 gap-5
                    sm:grid-cols-2 lg:grid-cols-4
                ">
                    <ReadField
                        label="Payment Amount"
                        value={formatAmount(
                            data.paymentAmount,
                            currencyCode
                        )}
                    />

                    <ReadField
                        label="Exchange Rate"
                        value={data.exchangeRate}
                    />

                    <ReadField
                        label="Base Amount (INR)"
                        value={formatAmount(
                            data.baseAmount,
                            "₹"
                        )}
                    />
                </div>
            </SectionCard>

            {/* Reversal Information */}

            {(
                data.paymentStatus === "REVERSED" ||
                data.reversalReason
            ) && (
                    <SectionCard
                        title="Payment Reversal Information"
                        icon={RotateCcw}
                    >
                        <div className="
                        grid grid-cols-1 gap-5
                        sm:grid-cols-2 lg:grid-cols-4
                    ">
                            <ReadField
                                label="Payment Status"
                                value={
                                    <PaymentStatusBadge
                                        status={data.paymentStatus}
                                    />
                                }
                            />

                            <ReadField
                                label="Reversal Reason"
                                value={data.reversalReason}
                            />
                        </div>
                    </SectionCard>
                )}

            {/* Additional Notes */}

            {data.notes && (
                <SectionCard
                    title="Additional Notes"
                    icon={ClipboardList}
                >
                    <p className="
                        whitespace-pre-wrap break-words
                        text-sm leading-6 text-gray-700
                    ">
                        {data.notes}
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

export default PaymentViewDetails;