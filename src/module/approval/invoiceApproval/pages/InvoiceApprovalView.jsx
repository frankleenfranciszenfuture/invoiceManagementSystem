
import React, { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    FileCheck,
    CalendarDays,
    FileText,
    Hash,
    CheckCircle,
    XCircle,
    Clock,
    User,
    MessageSquare,
    Receipt,
    CircleDollarSign,
    Eye,
    History,
    Send,
    ShieldCheck,
} from "lucide-react";

import {
    fetchInvoiceApprovalById,
    fetchInvoiceApprovalHistory,
} from "../thunks/invoiceApprovalThunks";

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

const formatAmount = (value) => {
    if (value === null || value === undefined || value === "") {
        return "—";
    }

    const amount = Number(value);

    if (!Number.isFinite(amount)) return "—";

    return amount.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
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

// ------------------------------------------------------
// Approval Status Badge
// ------------------------------------------------------

const ApprovalStatusBadge = ({ status }) => {
    const normalizedStatus = String(status || "").toUpperCase();

    const styles = {
        PENDING: "bg-amber-100 text-amber-700",
        APPROVED: "bg-green-100 text-green-700",
        REJECTED: "bg-red-100 text-red-700",
        CANCELLED: "bg-gray-100 text-gray-600",
    };

    const icons = {
        PENDING: Clock,
        APPROVED: CheckCircle,
        REJECTED: XCircle,
        CANCELLED: XCircle,
    };

    const Icon = icons[normalizedStatus];

    return (
        <span className={`
            inline-flex items-center gap-1.5 rounded-full
            px-3 py-1 text-xs font-semibold
            ${styles[normalizedStatus] || "bg-gray-100 text-gray-700"}
        `}>
            {Icon && <Icon size={13} />}
            {formatLabel(status)}
        </span>
    );
};

// ------------------------------------------------------
// Invoice Type Badge
// ------------------------------------------------------

const InvoiceTypeBadge = ({ type }) => {
    return (
        <span className="
            inline-flex rounded-full bg-blue-100
            px-3 py-1 text-xs font-semibold text-blue-700
        ">
            {formatLabel(type)}
        </span>
    );
};

// ------------------------------------------------------
// Info Card
// ------------------------------------------------------

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
// Comment Card
// ------------------------------------------------------

const CommentCard = ({ title, comment, icon: Icon, color }) => {
    const styles = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        red: "bg-red-50 text-red-600",
        gray: "bg-gray-50 text-gray-600",
    };

    return (
        <div className="
            rounded-xl border border-gray-200 bg-white p-4
        ">
            <div className="flex items-center gap-2">
                <div className={`
                    flex h-9 w-9 items-center justify-center
                    rounded-lg
                    ${styles[color] || styles.gray}
                `}>
                    <Icon size={17} />
                </div>

                <h3 className="text-sm font-semibold text-gray-700">
                    {title}
                </h3>
            </div>

            <p className="
                mt-3 whitespace-pre-wrap break-words
                text-sm leading-6 text-gray-600
            ">
                {comment || "No comment provided."}
            </p>
        </div>
    );
};

// ------------------------------------------------------
// Main Component
// ------------------------------------------------------

const InvoiceApprovalView = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { id } = useParams();

    const {
        selectedApproval,
        approvalHistory,
        loading,
        error,
    } = useSelector((state) => state.invoiceApproval || {});

    // --------------------------------------------------
    // Fetch approval details and history
    // --------------------------------------------------

    useEffect(() => {
        if (id) {
            dispatch(fetchInvoiceApprovalById(id));
        }
    }, [
        dispatch,
        id,
    ]);

    useEffect(() => {
        if (selectedApproval?.invoiceId) {
            dispatch(
                fetchInvoiceApprovalHistory(
                    selectedApproval.invoiceId
                )
            );
        }
    }, [
        dispatch,
        selectedApproval?.invoiceId,
    ]);

    // --------------------------------------------------
    // Prevent displaying stale approval details
    // --------------------------------------------------

    const loaded =
        selectedApproval &&
        String(selectedApproval.id) === String(id);

    const data = loaded ? selectedApproval : null;

    // --------------------------------------------------
    // Invoice Preview
    // --------------------------------------------------

    const handleViewInvoice = () => {
        if (!data?.invoiceId) return;

        navigate(`/invoices/preview/${data.invoiceId}`);
    };

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
                        Loading invoice approval details...
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

                <FileCheck
                    size={42}
                    className="text-gray-300"
                />

                <h2 className="
                    mt-3 text-lg font-semibold text-gray-700
                ">
                    Invoice Approval Not Found
                </h2>

                <p className="
                    mt-1 text-sm text-gray-500
                ">
                    {error || "Unable to load invoice approval details."}
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
                                    {data.invoiceNumber || "Invoice Approval"}
                                </h1>

                                <ApprovalStatusBadge
                                    status={data.status}
                                />

                                <InvoiceTypeBadge
                                    type={data.invoiceType}
                                />

                            </div>

                            <p className="
                                mt-1 text-sm text-gray-500
                            ">
                                Invoice approval details and history
                            </p>

                        </div>

                    </div>

                    <div className="flex flex-wrap items-center gap-2">

                        <div className="
                            flex items-center gap-2 rounded-lg
                            border border-gray-200 bg-white
                            px-3 py-2 text-sm text-gray-600
                        ">
                            <Hash
                                size={16}
                                className="text-gray-400"
                            />

                            Approval ID: {data.id || "—"}
                        </div>

                        <button
                            type="button"
                            onClick={handleViewInvoice}
                            className="
                                flex items-center gap-2 rounded-lg
                                bg-blue-600 px-4 py-2 text-sm
                                font-medium text-white transition
                                hover:bg-blue-700
                            "
                        >
                            <Eye size={16} />
                            View Invoice
                        </button>

                    </div>

                </div>

            </div>

            {/* Statistics Cards */}

            <div className="
                grid grid-cols-1 gap-4
                sm:grid-cols-2 xl:grid-cols-4
            ">

                <InfoCard
                    title="Invoice Number"
                    value={data.invoiceNumber}
                    icon={Receipt}
                    color="blue"
                />

                <InfoCard
                    title="Grand Total"
                    value={formatAmount(data.grandTotal)}
                    icon={CircleDollarSign}
                    color="green"
                />

                <InfoCard
                    title="Approval Status"
                    value={formatLabel(data.status)}
                    icon={ShieldCheck}
                    color="purple"
                />

                <InfoCard
                    title="Submitted By"
                    value={data.submittedByName}
                    icon={User}
                    color="amber"
                />

            </div>

            {/* Approval Information */}

            <SectionCard
                title="Approval Information"
                icon={FileCheck}
            >

                <div className="
                    grid grid-cols-1 gap-5
                    sm:grid-cols-2 lg:grid-cols-4
                ">

                    <ReadField
                        label="Approval ID"
                        value={data.id}
                    />

                    <ReadField
                        label="Approval Status"
                        value={
                            <ApprovalStatusBadge
                                status={data.status}
                            />
                        }
                    />

                    <ReadField
                        label="Invoice ID"
                        value={data.invoiceId}
                    />

                    <ReadField
                        label="Invoice Number"
                        value={data.invoiceNumber}
                    />

                    <ReadField
                        label="Invoice Type"
                        value={
                            <InvoiceTypeBadge
                                type={data.invoiceType}
                            />
                        }
                    />

                    <ReadField
                        label="Grand Total"
                        value={formatAmount(data.grandTotal)}
                    />

                </div>

            </SectionCard>

            {/* Submission Information */}

            <SectionCard
                title="Submission Information"
                icon={Send}
            >

                <div className="
                    grid grid-cols-1 gap-5
                    sm:grid-cols-2 lg:grid-cols-4
                ">

                    <ReadField
                        label="Submitted By"
                        value={data.submittedByName}
                    />

                    <ReadField
                        label="Submitted By ID"
                        value={data.submittedById}
                    />

                    <ReadField
                        label="Submitted At"
                        value={formatDateTime(data.submittedAt)}
                    />

                    <ReadField
                        label="Submission Comment"
                        value={data.submissionComment}
                    />

                </div>

            </SectionCard>

            {/* Decision Information */}

            <SectionCard
                title="Decision Information"
                icon={ShieldCheck}
            >

                <div className="
                    grid grid-cols-1 gap-5
                    sm:grid-cols-2 lg:grid-cols-4
                ">

                    <ReadField
                        label="Decision Status"
                        value={
                            <ApprovalStatusBadge
                                status={data.status}
                            />
                        }
                    />

                    <ReadField
                        label="Decided By"
                        value={data.decidedByName}
                    />

                    <ReadField
                        label="Decided By ID"
                        value={data.decidedById}
                    />

                    <ReadField
                        label="Decided At"
                        value={formatDateTime(data.decidedAt)}
                    />

                </div>

            </SectionCard>

            {/* Comments */}

            <SectionCard
                title="Approval Comments"
                icon={MessageSquare}
            >

                <div className="
                    grid grid-cols-1 gap-4 lg:grid-cols-2
                ">

                    <CommentCard
                        title="Submission Comment"
                        comment={data.submissionComment}
                        icon={Send}
                        color="blue"
                    />

                    <CommentCard
                        title="Decision Comment"
                        comment={data.decisionComment}
                        icon={MessageSquare}
                        color={
                            data.status === "REJECTED"
                                ? "red"
                                : data.status === "APPROVED"
                                    ? "green"
                                    : "gray"
                        }
                    />

                </div>

            </SectionCard>

            {/* Approval History */}

            <SectionCard
                title="Invoice Approval History"
                icon={History}
            >

                {approvalHistory?.length > 0 ? (

                    <div className="relative space-y-5">

                        {approvalHistory.map((history, index) => (

                            <div
                                key={history.id || index}
                                className="
                                    relative flex gap-4
                                "
                            >

                                {/* Timeline */}

                                <div className="
                                    relative flex flex-col items-center
                                ">

                                    <div className={`
                                        z-10 flex h-9 w-9 shrink-0
                                        items-center justify-center
                                        rounded-full
                                        ${history.status === "APPROVED"
                                            ? "bg-green-100 text-green-600"
                                            : history.status === "REJECTED"
                                                ? "bg-red-100 text-red-600"
                                                : history.status === "PENDING"
                                                    ? "bg-amber-100 text-amber-600"
                                                    : "bg-gray-100 text-gray-500"
                                        }
                                    `}>
                                        {history.status === "APPROVED" ? (
                                            <CheckCircle size={17} />
                                        ) : history.status === "REJECTED" ? (
                                            <XCircle size={17} />
                                        ) : (
                                            <Clock size={17} />
                                        )}
                                    </div>

                                    {index !== approvalHistory.length - 1 && (
                                        <div className="
                                            absolute top-9 h-full
                                            w-px bg-gray-200
                                        " />
                                    )}

                                </div>

                                {/* History Details */}

                                <div className="
                                    mb-2 min-w-0 flex-1 rounded-xl
                                    border border-gray-200 bg-gray-50 p-4
                                ">

                                    <div className="
                                        flex flex-wrap items-center
                                        justify-between gap-2
                                    ">

                                        <div className="
                                            flex flex-wrap items-center gap-2
                                        ">

                                            <h3 className="
                                                text-sm font-semibold
                                                text-gray-800
                                            ">
                                                {history.invoiceNumber || data.invoiceNumber}
                                            </h3>

                                            <ApprovalStatusBadge
                                                status={history.status}
                                            />

                                        </div>

                                        <span className="
                                            flex items-center gap-1
                                            text-xs text-gray-400
                                        ">
                                            <CalendarDays size={13} />

                                            {formatDateTime(
                                                history.decidedAt ||
                                                history.submittedAt
                                            )}
                                        </span>

                                    </div>

                                    <div className="
                                        mt-3 grid grid-cols-1 gap-3
                                        sm:grid-cols-2
                                    ">

                                        <ReadField
                                            label="Submitted By"
                                            value={history.submittedByName}
                                        />

                                        <ReadField
                                            label="Decided By"
                                            value={history.decidedByName}
                                        />

                                    </div>

                                    {history.submissionComment && (
                                        <div className="mt-3">
                                            <ReadField
                                                label="Submission Comment"
                                                value={history.submissionComment}
                                            />
                                        </div>
                                    )}

                                    {history.decisionComment && (
                                        <div className="mt-3">
                                            <ReadField
                                                label="Decision Comment"
                                                value={history.decisionComment}
                                            />
                                        </div>
                                    )}

                                </div>

                            </div>

                        ))}

                    </div>

                ) : (

                    <div className="
                        flex flex-col items-center justify-center
                        py-10 text-center
                    ">

                        <History
                            size={38}
                            className="text-gray-300"
                        />

                        <h3 className="
                            mt-3 text-sm font-semibold text-gray-700
                        ">
                            No Approval History
                        </h3>

                        <p className="
                            mt-1 text-sm text-gray-500
                        ">
                            No previous approval records are available for this invoice.
                        </p>

                    </div>

                )}

            </SectionCard>

            {/* Audit / Record Information */}

            <SectionCard
                title="Record Information"
                icon={FileText}
            >

                <div className="
                    grid grid-cols-1 gap-5
                    sm:grid-cols-2 lg:grid-cols-4
                ">

                    <ReadField
                        label="Approval Record ID"
                        value={data.id}
                    />

                    <ReadField
                        label="Invoice Record ID"
                        value={data.invoiceId}
                    />

                    <ReadField
                        label="Submission Date"
                        value={formatDateTime(data.submittedAt)}
                    />

                    <ReadField
                        label="Decision Date"
                        value={formatDateTime(data.decidedAt)}
                    />

                </div>

            </SectionCard>

        </div>
    );
};

export default InvoiceApprovalView;
