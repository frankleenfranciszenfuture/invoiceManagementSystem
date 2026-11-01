import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    Receipt,
    CalendarDays,
    ShieldCheck,
    FileText,
    Hash,
    Tag,
    UserRound,
    Warehouse,
    Coins,
    CreditCard,
    Percent,
    Calculator,
    ClipboardList,
} from "lucide-react";

import { fetchExpenseById } from "../thunks/expenseThunks";

// ------------------------------------------------------
// Helpers
// ------------------------------------------------------

const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

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

const formatAmount = (amount, symbol = "") => {
    if (amount === null || amount === undefined || amount === "") {
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

            <div className="break-words text-sm font-medium text-gray-700">
                {value === null || value === undefined || value === ""
                    ? "—"
                    : value}
            </div>
        </div>
    );
};

const StatusBadge = ({ status }) => {
    const styles = {
        DRAFT: "bg-gray-100 text-gray-700",
        APPROVED: "bg-green-100 text-green-700",
        REJECTED: "bg-red-100 text-red-700",
        CANCELLED: "bg-orange-100 text-orange-700",
    };

    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[status] || "bg-gray-100 text-gray-700"
                }`}
        >
            {formatLabel(status)}
        </span>
    );
};

const PaymentStatusBadge = ({ status }) => {
    const styles = {
        PAID: "bg-green-100 text-green-700",
        PARTIAL: "bg-amber-100 text-amber-700",
        UNPAID: "bg-red-100 text-red-700",
    };

    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[status] || "bg-gray-100 text-gray-700"
                }`}
        >
            {formatLabel(status)}
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
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${styles[color] || styles.blue
                        }`}
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

const ExpenseViewDetails = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();

    const {
        expense,
        loading,
        error,
    } = useSelector((state) => state.expense);

    // Fetch expense details
    useEffect(() => {
        if (id) {
            dispatch(fetchExpenseById(id));
        }
    }, [dispatch, id]);

    // Prevent displaying stale expense details
    const loaded =
        expense && String(expense.id) === String(id);

    const data = loaded ? expense : null;
    const audit = data?.audit;

    const currencySymbol = data?.currencySymbol || data?.currencyCode || "";

    // Loading
    if (loading && !loaded) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

                    <p className="mt-3 text-sm text-gray-500">
                        Loading expense details...
                    </p>
                </div>
            </div>
        );
    }

    // Error / Not Found
    if (!loaded) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center">
                <Receipt size={42} className="text-gray-300" />

                <h2 className="mt-3 text-lg font-semibold text-gray-700">
                    Expense Not Found
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    {error || "Unable to load expense details."}
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

    return (
        <div className="mt-3 space-y-6 pb-8">

            {/* Header */}
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
                                    {data.expenseNo || "Expense Details"}
                                </h1>

                                <StatusBadge status={data.expenseStatus} />

                                <PaymentStatusBadge status={data.paymentStatus} />
                            </div>

                            <p className="mt-1 text-sm text-gray-500">
                                Expense Details
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600">
                        <CalendarDays size={16} className="text-gray-400" />
                        Expense Date: {formatDate(data.expenseDate)}
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <InfoCard
                    title="Expense Number"
                    value={data.expenseNo}
                    icon={Hash}
                    color="blue"
                />

                <InfoCard
                    title="Total Amount"
                    value={formatAmount(data.totalAmount, currencySymbol)}
                    icon={Coins}
                    color="green"
                />

                <InfoCard
                    title="Paid Amount"
                    value={formatAmount(data.paidAmount, currencySymbol)}
                    icon={CreditCard}
                    color="purple"
                />

                <InfoCard
                    title="Due Amount"
                    value={formatAmount(data.dueAmount, currencySymbol)}
                    icon={Calculator}
                    color="amber"
                />
            </div>

            {/* Expense Information */}
            <SectionCard
                title="Expense Information"
                icon={Receipt}
            >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <ReadField
                        label="Expense Number"
                        value={data.expenseNo}
                    />

                    <ReadField
                        label="Expense Type"
                        value={formatLabel(data.expenseType)}
                    />

                    <ReadField
                        label="Expense Date"
                        value={formatDate(data.expenseDate)}
                    />

                    <ReadField
                        label="Reference Number"
                        value={data.referenceNo}
                    />

                    <ReadField
                        label="Expense Status"
                        value={<StatusBadge status={data.expenseStatus} />}
                    />

                    <ReadField
                        label="Payment Status"
                        value={<PaymentStatusBadge status={data.paymentStatus} />}
                    />

                    <ReadField
                        label="Expense ID"
                        value={data.id}
                    />
                </div>

                {data.description && (
                    <div className="mt-5 border-t border-gray-100 pt-4">
                        <ReadField
                            label="Description"
                            value={data.description}
                        />
                    </div>
                )}
            </SectionCard>

            {/* Category and Vendor Information */}
            <SectionCard
                title="Category & Vendor Information"
                icon={Tag}
            >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <ReadField
                        label="Category Code"
                        value={data.categoryCode}
                    />

                    <ReadField
                        label="Category Name"
                        value={data.categoryName}
                    />

                    <ReadField
                        label="Vendor Name"
                        value={data.vendorName}
                    />

                    <ReadField
                        label="Vendor ID"
                        value={data.vendorId}
                    />

                    <ReadField
                        label="Warehouse ID"
                        value={data.warehouseId}
                    />
                </div>
            </SectionCard>

            {/* Currency and Tax Information */}
            <SectionCard
                title="Currency & Tax Information"
                icon={Percent}
            >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <ReadField
                        label="Currency Code"
                        value={data.currencyCode}
                    />

                    <ReadField
                        label="Currency Name"
                        value={data.currencyName}
                    />

                    <ReadField
                        label="Currency Symbol"
                        value={data.currencySymbol}
                    />

                    <ReadField
                        label="Exchange Rate (INR)"
                        value={data.exchangeRate}
                    />

                    <ReadField
                        label="Tax Name"
                        value={data.taxName}
                    />

                    <ReadField
                        label="Tax Master ID"
                        value={data.taxMasterId}
                    />
                </div>
            </SectionCard>

            {/* Amount Information */}
            <SectionCard
                title="Amount Breakdown"
                icon={Calculator}
            >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <ReadField
                        label="Amount"
                        value={formatAmount(data.amount, currencySymbol)}
                    />

                    <ReadField
                        label="Discount Amount"
                        value={formatAmount(data.discountAmount, currencySymbol)}
                    />

                    <ReadField
                        label="Taxable Amount"
                        value={formatAmount(data.taxableAmount, currencySymbol)}
                    />

                    <ReadField
                        label="CGST Amount"
                        value={formatAmount(data.cgstAmount, currencySymbol)}
                    />

                    <ReadField
                        label="SGST Amount"
                        value={formatAmount(data.sgstAmount, currencySymbol)}
                    />

                    <ReadField
                        label="IGST Amount"
                        value={formatAmount(data.igstAmount, currencySymbol)}
                    />

                    <ReadField
                        label="Total Tax Amount"
                        value={formatAmount(data.totalTaxAmount, currencySymbol)}
                    />

                    <ReadField
                        label="Total Amount"
                        value={formatAmount(data.totalAmount, currencySymbol)}
                    />
                </div>
            </SectionCard>

            {/* Base INR Amount Information */}
            <SectionCard
                title="Base Amount (INR)"
                icon={Coins}
            >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <ReadField
                        label="Base Amount"
                        value={formatAmount(data.baseAmount, "₹")}
                    />

                    <ReadField
                        label="Base Discount Amount"
                        value={formatAmount(data.baseDiscountAmount, "₹")}
                    />

                    <ReadField
                        label="Base Taxable Amount"
                        value={formatAmount(data.baseTaxableAmount, "₹")}
                    />

                    <ReadField
                        label="Base CGST Amount"
                        value={formatAmount(data.baseCgstAmount, "₹")}
                    />

                    <ReadField
                        label="Base SGST Amount"
                        value={formatAmount(data.baseSgstAmount, "₹")}
                    />

                    <ReadField
                        label="Base IGST Amount"
                        value={formatAmount(data.baseIgstAmount, "₹")}
                    />

                    <ReadField
                        label="Base Total Tax Amount"
                        value={formatAmount(data.baseTotalTaxAmount, "₹")}
                    />

                    <ReadField
                        label="Base Total Amount"
                        value={formatAmount(data.baseTotalAmount, "₹")}
                    />
                </div>
            </SectionCard>

            {/* Payment Information */}
            <SectionCard
                title="Payment Information"
                icon={CreditCard}
            >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <ReadField
                        label="Payment Status"
                        value={<PaymentStatusBadge status={data.paymentStatus} />}
                    />

                    <ReadField
                        label="Paid Amount"
                        value={formatAmount(data.paidAmount, currencySymbol)}
                    />

                    <ReadField
                        label="Due Amount"
                        value={formatAmount(data.dueAmount, currencySymbol)}
                    />

                    <ReadField
                        label="Total Amount"
                        value={formatAmount(data.totalAmount, currencySymbol)}
                    />
                </div>
            </SectionCard>

            {/* Approval Information */}
            <SectionCard
                title="Approval Information"
                icon={ShieldCheck}
            >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <ReadField
                        label="Approved By"
                        value={data.approvedBy}
                    />

                    <ReadField
                        label="Approved At"
                        value={formatDateTime(data.approvedAt)}
                    />

                    <ReadField
                        label="Rejected By"
                        value={data.rejectedBy}
                    />

                    <ReadField
                        label="Rejected At"
                        value={formatDateTime(data.rejectedAt)}
                    />
                </div>

                {data.rejectionReason && (
                    <div className="mt-5 rounded-lg border border-red-100 bg-red-50 p-4">
                        <p className="mb-1 text-xs font-semibold text-red-600">
                            Rejection Reason
                        </p>

                        <p className="text-sm leading-6 text-red-700">
                            {data.rejectionReason}
                        </p>
                    </div>
                )}
            </SectionCard>

            {/* Notes */}
            {data.notes && (
                <SectionCard
                    title="Additional Notes"
                    icon={ClipboardList}
                >
                    <p className="whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">
                        {data.notes}
                    </p>
                </SectionCard>
            )}

            {/* Audit Information */}
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

export default ExpenseViewDetails;