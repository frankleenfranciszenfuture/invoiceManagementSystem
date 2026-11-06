import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    Pencil,
    FileText,
    CalendarDays,
    UserRound,
    Package,
    MapPin,
    Building2,
    CreditCard,
    Receipt,
    RefreshCw,
    CheckCircle,
    Clock,
    Wallet,
    ShoppingCart,
    Truck,
    Percent,
    View,
} from "lucide-react";

import {
    fetchInvoiceById,
} from "../thunks/invoiceThunks";

import {
    setExistingInvoice,
    setInvoiceForEdit,
} from "../slices/invoiceSlice";

// ============================================================
// HELPERS
// ============================================================

const pick = (...values) =>
    values.find(
        (value) =>
            value !== undefined &&
            value !== null &&
            value !== ""
    );

const number = (value) => {
    const result = Number(value ?? 0);
    return Number.isFinite(result) ? result : 0;
};

const formatAmount = (value, invoice) => {
    const amount = number(value);

    const currencyCode =
        invoice?.currencyCode ||
        invoice?.currency?.currencyCode ||
        "INR";

    try {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: currencyCode,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    } catch {
        return `${currencyCode} ${amount.toFixed(2)}`;
    }
};

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

const formatQuantity = (value) =>
    number(value).toLocaleString("en-IN", {
        maximumFractionDigits: 4,
    });

const getInvoiceStatus = (invoice) =>
    String(
        invoice?.status ||
        invoice?.invoiceStatus ||
        "DRAFT"
    ).toUpperCase();

const getCustomer = (invoice) =>
    invoice?.customer || invoice?.party || {};

const getCustomerName = (invoice) => {
    const customer = getCustomer(invoice);

    return (
        customer?.companyName ||
        customer?.displayName ||
        customer?.partyName ||
        [
            customer?.firstName,
            customer?.lastName,
        ].filter(Boolean).join(" ") ||
        invoice?.customerName ||
        invoice?.partyName ||
        "—"
    );
};

const getSalesPersonName = (invoice) => {
    const salesPerson = invoice?.salesPerson || {};

    return (
        salesPerson?.fullName ||
        salesPerson?.name ||
        [
            salesPerson?.firstName,
            salesPerson?.lastName,
        ].filter(Boolean).join(" ") ||
        invoice?.salesPersonName ||
        "—"
    );
};

const getDefaultAddress = (customer) => {
    const addresses = Array.isArray(customer?.addresses)
        ? customer.addresses
        : [];

    return (
        addresses.find((address) => address.defaultAddress) ||
        addresses[0] ||
        null
    );
};

const getPrimaryBank = (customer) => {
    const accounts = Array.isArray(customer?.bankAccounts)
        ? customer.bankAccounts
        : [];

    return (
        accounts.find((account) => account.primaryAccount) ||
        accounts[0] ||
        null
    );
};

// ============================================================
// REUSABLE COMPONENTS
// ============================================================

const SectionCard = ({
    title,
    icon: Icon,
    children,
    right,
}) => (
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm">

        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">

            <div className="flex items-center gap-2">

                {Icon && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#0095FD]">
                        <Icon size={17} />
                    </div>
                )}

                <h3 className="text-sm font-semibold text-gray-800">
                    {title}
                </h3>

            </div>

            {right}

        </div>

        <div className="p-5">
            {children}
        </div>

    </section>
);

const ReadField = ({
    label,
    value,
    className = "",
}) => (
    <div className={`min-w-0 ${className}`}>

        <p className="mb-1 text-xs font-medium text-gray-500">
            {label}
        </p>

        <p className="break-words text-sm font-medium text-gray-800">
            {value !== undefined &&
                value !== null &&
                value !== ""
                ? value
                : "—"}
        </p>

    </div>
);

const StatusBadge = ({ status }) => {

    const colors = {
        DRAFT: "bg-yellow-50 text-yellow-700 border-yellow-200",
        SENT: "bg-blue-50 text-blue-700 border-blue-200",
        APPROVED: "bg-indigo-50 text-indigo-700 border-indigo-200",
        PARTIAL: "bg-amber-50 text-amber-700 border-amber-200",
        PARTIALLY_PAID: "bg-amber-50 text-amber-700 border-amber-200",
        PAID: "bg-green-50 text-green-700 border-green-200",
        OVERDUE: "bg-red-50 text-red-700 border-red-200",
        CANCELLED: "bg-gray-50 text-gray-600 border-gray-200",
    };

    const icons = {
        DRAFT: Clock,
        SENT: Truck,
        APPROVED: CheckCircle,
        PARTIAL: Wallet,
        PARTIALLY_PAID: Wallet,
        PAID: CheckCircle,
        OVERDUE: Clock,
        CANCELLED: Clock,
    };

    const Icon = icons[status] || Clock;

    return (
        <span
            className={`
                inline-flex items-center gap-1.5
                rounded-full border px-3 py-1.5
                text-xs font-semibold
                ${colors[status] || "bg-gray-50 text-gray-600 border-gray-200"}
            `}
        >
            <Icon size={13} />
            {status?.replaceAll("_", " ") || "DRAFT"}
        </span>
    );
};

const SummaryTile = ({
    label,
    value,
    highlight = false,
}) => (
    <div
        className={`
            rounded-xl border p-4
            ${highlight
                ? "border-blue-100 bg-blue-50"
                : "border-gray-100 bg-gray-50/70"
            }
        `}
    >

        <p className="text-xs font-medium text-gray-500">
            {label}
        </p>

        <p
            className={`
                mt-2 text-lg font-semibold
                ${highlight ? "text-blue-700" : "text-gray-800"}
            `}
        >
            {value}
        </p>

    </div>
);

// ============================================================
// PAGE
// ============================================================

export default function InvoiceViewDetails() {

    const { id } = useParams();

    const dispatch = useDispatch();
    const navigate = useNavigate();

    // ========================================================
    // REDUX STATE
    // ========================================================

    const {
        exsistingInvoice,
        previewInvoice,
        previewInvoiceId,
        previewLoading,
        previewError,
    } = useSelector((state) => state.invoice);

    // Always prioritize the URL ID.
    const selectedInvoiceId = id;

    // Check whether the loaded invoice matches the URL.
    const hasMatchingPreview =
        Boolean(previewInvoice) &&
        String(previewInvoiceId) === String(id) &&
        String(previewInvoice.id ?? previewInvoice.invoiceId) === String(id);

    const invoice = hasMatchingPreview ? previewInvoice : null;

    const loaded = Boolean(invoice);
    const loading = previewLoading;
    const error = previewError;


    // ========================================================
    // FETCH INVOICE DETAILS
    // ========================================================

    useEffect(() => {
        if (!id || hasMatchingPreview) return;

        dispatch(fetchInvoiceById(id));
    }, [id, dispatch, hasMatchingPreview]);

    // ========================================================
    // ACTIONS
    // ========================================================

    const handleBack = () => {
        navigate("/invoices");
    };

    const handleEdit = () => {
        if (!loaded) return;

        if (getInvoiceStatus(invoice) !== "DRAFT") {
            return;
        }

        dispatch(setExistingInvoice(invoice));

        navigate(
            `/invoices/edit/${invoice.id ?? invoice.invoiceId}`
        );
    };

    const handleRefresh = () => {
        if (!id) return;

        dispatch(fetchInvoiceById(id));
    };

    // ========================================================
    // LOADING / ERROR
    // ========================================================

    if (!loaded) {

        return (
            <div className="flex min-h-[350px] flex-col items-center justify-center gap-4">

                {loading ? (
                    <>
                        <RefreshCw
                            size={28}
                            className="animate-spin text-[#0095FD]"
                        />

                        <p className="text-sm text-gray-500">
                            Loading invoice details...
                        </p>
                    </>
                ) : (
                    <>
                        <p className="text-sm text-red-500">
                            {error || "Invoice not found."}
                        </p>

                        <div className="flex gap-2">

                            <button
                                type="button"
                                onClick={handleRefresh}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                            >
                                Try Again
                            </button>

                            <button
                                type="button"
                                onClick={handleBack}
                                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                            >
                                Back
                            </button>

                        </div>
                    </>
                )}

            </div>
        );
    }

    // ========================================================
    // INVOICE DATA
    // ========================================================

    const customer = getCustomer(invoice);

    const address = getDefaultAddress(customer);

    const bank = getPrimaryBank(customer);

    const items = Array.isArray(invoice.invoiceItems)
        ? invoice.invoiceItems
        : [];

    const status = getInvoiceStatus(invoice);

    const isDraft = status === "DRAFT";

    const grandTotal = number(invoice.grandTotal);

    const paidAmount = number(
        pick(
            invoice.paidAmount,
            invoice.receivedTotalAmount,
            invoice.totalPaidAmount,
            0
        )
    );

    const pendingAmount = Math.max(
        grandTotal - paidAmount,
        0
    );

    const statsCards = [
        {
            title: "Grand Total",
            value: formatAmount(invoice.grandTotal, invoice),
            description: "Total invoice value",
            icon: Wallet,
            color: "blue",
        },
        {
            title: "Paid Amount",
            value: formatAmount(paidAmount, invoice),
            description: "Amount received",
            icon: CheckCircle,
            color: "green",
        },
        {
            title: "Pending Amount",
            value: formatAmount(pendingAmount, invoice),
            description: "Remaining invoice amount",
            icon: Clock,
            color: "amber",
        },
        {
            title: "Total Tax",
            value: formatAmount(invoice.taxAmount, invoice),
            description: "Total GST amount",
            icon: Receipt,
            color: "purple",
        },
    ];

    const colorStyles = {
        blue: {
            icon: "bg-blue-50 text-blue-600",
            value: "text-blue-700",
        },
        green: {
            icon: "bg-green-50 text-green-600",
            value: "text-green-700",
        },
        amber: {
            icon: "bg-amber-50 text-amber-600",
            value: "text-amber-700",
        },
        purple: {
            icon: "bg-purple-50 text-purple-600",
            value: "text-purple-700",
        },
    };

    const currentInvoice = invoice || exsistingInvoice;

    const invoiceId =
        currentInvoice?.id ??
        currentInvoice?.invoiceId ??
        id;


    // Preview selected invoice
    // Preview invoice in a new browser tab
    const handlePreview = () => {
        const recordId =
            invoice?.id ??
            invoice?.invoiceId ??
            id;

        if (!recordId) {
            toast.error("Please select an invoice first");
            return;
        }

        const previewUrl =
            `${window.location.origin}/invoices/preview/${recordId}`;

        window.open(
            previewUrl,
            "_blank",
            "noopener,noreferrer"
        );
    };

    // ========================================================
    // RENDER
    // ========================================================

    return (

        <div className="space-y-4 p-3">

            {/* =================================================
                TOP HEADER
            ================================================= */}

            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">

                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

                    <div className="flex min-w-0 items-start gap-3">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <FileText size={24} />
                        </div>

                        <div className="min-w-0">

                            <div className="flex flex-wrap items-center gap-3">

                                <h2 className="text-xl font-semibold text-[#12203F]">
                                    Invoice Details
                                </h2>

                                <StatusBadge status={status} />

                            </div>

                            <p className="mt-1 text-sm text-gray-500">
                                {invoice.invoiceNumber || "—"}
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                                Manage and review invoice information.
                            </p>

                        </div>

                    </div>

                    <div className="flex flex-wrap items-center gap-2">

                        <button
                            type="button"
                            onClick={handleBack}
                            className="
                                flex items-center gap-2
                                rounded-lg border border-gray-200
                                px-4 py-2.5 text-sm font-medium
                                text-gray-600 transition
                                hover:bg-gray-50
                            "
                        >
                            <ArrowLeft size={15} />
                            Back
                        </button>

                        <button
                            type="button"
                            onClick={handleRefresh}
                            disabled={loading}
                            className="
                                flex items-center gap-2
                                rounded-lg border border-gray-200
                                px-4 py-2.5 text-sm font-medium
                                text-gray-600 transition
                                hover:bg-gray-50
                                disabled:opacity-50
                            "
                        >
                            <RefreshCw
                                size={15}
                                className={loading ? "animate-spin" : ""}
                            />
                            Ref
                        </button>

                        {isDraft && (
                            <button
                                type="button"
                                onClick={handleEdit}
                                className="
                                    flex items-center gap-2
                                    rounded-lg bg-[#0095FD]
                                    px-4 py-2.5 text-sm font-medium
                                    text-white transition
                                    hover:bg-[#0085E5]
                                "
                            >
                                <Pencil size={15} />
                                Edit
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={handlePreview}
                            disabled={!invoice}
                            className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <View size={14} />
                            Preview
                        </button>
                    </div>

                </div>

            </div>

            {/* =================================================
                INVOICE SUMMARY
            ================================================= */}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

                <SummaryTile
                    label="Invoice Number"
                    value={invoice.invoiceNumber}
                />

                <SummaryTile
                    label="Invoice Date"
                    value={formatDate(invoice.invoiceDate)}
                />

                <SummaryTile
                    label="Due Date"
                    value={formatDate(invoice.dueDate)}
                />

                <SummaryTile
                    label="Grand Total"
                    value={formatAmount(invoice.grandTotal, invoice)}
                    highlight
                />

            </div>

            {/* =================================================
                INVOICE INFORMATION
            ================================================= */}

            <SectionCard
                title="Invoice Information"
                icon={FileText}
            >

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

                    <ReadField
                        label="Invoice ID"
                        value={`#${invoice.id}`}
                    />

                    <ReadField
                        label="Invoice Number"
                        value={invoice.invoiceNumber}
                    />

                    <ReadField
                        label="Invoice Type"
                        value={invoice.invoiceType?.replaceAll("_", " ")}
                    />

                    <ReadField
                        label="Invoice Status"
                        value={status.replaceAll("_", " ")}
                    />

                    <ReadField
                        label="Invoice Date"
                        value={formatDate(invoice.invoiceDate)}
                    />

                    <ReadField
                        label="Due Date"
                        value={formatDate(invoice.dueDate)}
                    />

                    <ReadField
                        label="Customer ID"
                        value={invoice.customerId}
                    />

                    <ReadField
                        label="Customer Name"
                        value={getCustomerName(invoice)}
                    />

                    <ReadField
                        label="Salesperson ID"
                        value={invoice.salesPersonId}
                    />

                    <ReadField
                        label="Salesperson Name"
                        value={getSalesPersonName(invoice)}
                    />

                    <ReadField
                        label="Company Name"
                        value={invoice.companyName}
                    />

                    <ReadField
                        label="Company Code"
                        value={invoice.companyCode}
                    />

                </div>

                <div className="mt-5 border-t border-gray-100 pt-4">

                    <ReadField
                        label="Notes"
                        value={invoice.notes}
                    />

                    <div className="mt-4">
                        <ReadField
                            label="Terms and Conditions"
                            value={invoice.termsAndConditions}
                        />
                    </div>

                </div>

            </SectionCard>

            {/* =================================================
                CUSTOMER INFORMATION
            ================================================= */}

            <SectionCard
                title="Customer Information"
                icon={UserRound}
            >

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

                    <ReadField
                        label="Customer Name"
                        value={getCustomerName(invoice)}
                    />

                    <ReadField
                        label="Customer Code"
                        value={pick(customer.partyCode, invoice.customerCode)}
                    />

                    <ReadField
                        label="Party Type"
                        value={customer.partyType}
                    />

                    <ReadField
                        label="Contact Person"
                        value={customer.contactPerson}
                    />

                    <ReadField
                        label="Email"
                        value={pick(customer.email, invoice.customerEmail)}
                    />

                    <ReadField
                        label="Mobile"
                        value={pick(customer.mobile, invoice.customerMobile)}
                    />

                    <ReadField
                        label="Alternate Mobile"
                        value={customer.alternateMobile}
                    />

                    <ReadField
                        label="GST Number"
                        value={customer.gstNumber}
                    />

                    <ReadField
                        label="PAN Number"
                        value={customer.panNumber}
                    />

                    <ReadField
                        label="Website"
                        value={customer.website}
                    />

                    <ReadField
                        label="Customer Status"
                        value={customer.status}
                    />

                    <ReadField
                        label="Credit Limit"
                        value={formatAmount(customer.creditLimit, invoice)}
                    />

                    <ReadField
                        label="Outstanding Credit"
                        value={formatAmount(customer.outstandingCredit, invoice)}
                    />

                    <ReadField
                        label="Available Credit"
                        value={formatAmount(customer.availableCredit, invoice)}
                    />

                </div>

            </SectionCard>

            {/* =================================================
                CUSTOMER ADDRESS
            ================================================= */}

            <SectionCard
                title="Customer Address"
                icon={MapPin}
                right={
                    address?.defaultAddress && (
                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600">
                            Default Address
                        </span>
                    )
                }
            >

                {address ? (

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

                        <ReadField
                            label="Address Line 1"
                            value={address.addressLine1}
                        />

                        <ReadField
                            label="Address Line 2"
                            value={address.addressLine2}
                        />

                        <ReadField
                            label="City"
                            value={address.city}
                        />

                        <ReadField
                            label="District"
                            value={address.district}
                        />

                        <ReadField
                            label="State"
                            value={address.state}
                        />

                        <ReadField
                            label="Country"
                            value={address.country}
                        />

                        <ReadField
                            label="Postal Code"
                            value={address.postalCode}
                        />

                    </div>

                ) : (
                    <p className="text-sm text-gray-400">
                        No customer address available.
                    </p>
                )}

                {customer.addresses?.length > 1 && (

                    <div className="mt-5 border-t border-gray-100 pt-4">

                        <h4 className="mb-3 text-sm font-semibold text-gray-700">
                            All Customer Addresses
                        </h4>

                        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">

                            {customer.addresses.map((item, index) => (

                                <div
                                    key={item.id || index}
                                    className="rounded-lg border border-gray-100 bg-gray-50 p-4"
                                >

                                    <div className="mb-2 flex items-center justify-between">

                                        <p className="text-xs font-semibold text-gray-700">
                                            Address {index + 1}
                                        </p>

                                        {item.defaultAddress && (
                                            <span className="text-[10px] font-medium text-green-600">
                                                DEFAULT
                                            </span>
                                        )}

                                    </div>

                                    <p className="text-sm text-gray-700">
                                        {item.addressLine1}
                                    </p>

                                    {item.addressLine2 && (
                                        <p className="text-sm text-gray-600">
                                            {item.addressLine2}
                                        </p>
                                    )}

                                    <p className="mt-1 text-sm text-gray-500">
                                        {[
                                            item.city,
                                            item.district,
                                            item.state,
                                            item.country,
                                            item.postalCode,
                                        ].filter(Boolean).join(", ")}
                                    </p>

                                </div>

                            ))}

                        </div>

                    </div>

                )}

            </SectionCard>

            {/* =================================================
                CUSTOMER BANK ACCOUNT
            ================================================= */}

            <SectionCard
                title="Customer Bank Account"
                icon={CreditCard}
            >

                {bank ? (

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

                        <ReadField
                            label="Bank Name"
                            value={bank.bankName}
                        />

                        <ReadField
                            label="Account Holder Name"
                            value={bank.accountHolderName}
                        />

                        <ReadField
                            label="Account Number"
                            value={bank.accountNumber}
                        />

                        <ReadField
                            label="IFSC Code"
                            value={bank.ifscCode}
                        />

                        <ReadField
                            label="Branch Name"
                            value={bank.branchName}
                        />

                        <ReadField
                            label="Account Type"
                            value={bank.accountType}
                        />

                        <ReadField
                            label="Primary Account"
                            value={bank.primaryAccount ? "Yes" : "No"}
                        />

                        <ReadField
                            label="Bank Status"
                            value={bank.status}
                        />

                    </div>

                ) : (
                    <p className="text-sm text-gray-400">
                        No customer bank account available.
                    </p>
                )}

                {customer.bankAccounts?.length > 1 && (

                    <div className="mt-5 border-t border-gray-100 pt-4">

                        <h4 className="mb-3 text-sm font-semibold text-gray-700">
                            All Customer Bank Accounts
                        </h4>

                        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">

                            {customer.bankAccounts.map((account, index) => (

                                <div
                                    key={account.id || index}
                                    className="rounded-lg border border-gray-100 bg-gray-50 p-4"
                                >

                                    <div className="mb-3 flex items-center justify-between">

                                        <p className="text-sm font-semibold text-gray-800">
                                            {account.bankName}
                                        </p>

                                        {account.primaryAccount && (
                                            <span className="rounded-full bg-green-50 px-2 py-1 text-[10px] font-medium text-green-600">
                                                PRIMARY
                                            </span>
                                        )}

                                    </div>

                                    <div className="grid grid-cols-2 gap-3">

                                        <ReadField
                                            label="Account Holder"
                                            value={account.accountHolderName}
                                        />

                                        <ReadField
                                            label="Account Number"
                                            value={account.accountNumber}
                                        />

                                        <ReadField
                                            label="IFSC"
                                            value={account.ifscCode}
                                        />

                                        <ReadField
                                            label="Account Type"
                                            value={account.accountType}
                                        />

                                    </div>

                                </div>

                            ))}

                        </div>

                    </div>

                )}

            </SectionCard>

            {/* =================================================
                SALESPERSON INFORMATION
            ================================================= */}

            <SectionCard
                title="Salesperson Information"
                icon={UserRound}
            >

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

                    <ReadField
                        label="Salesperson ID"
                        value={invoice.salesPersonId}
                    />

                    <ReadField
                        label="Salesperson Name"
                        value={getSalesPersonName(invoice)}
                    />

                    <ReadField
                        label="Email"
                        value={invoice.salesPerson?.email}
                    />

                    <ReadField
                        label="Mobile"
                        value={invoice.salesPerson?.mobile}
                    />

                </div>

            </SectionCard>

            {/* =================================================
                COMPANY AND BANK INFORMATION
            ================================================= */}

            <SectionCard
                title="Company & Bank Information"
                icon={Building2}
            >

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

                    <ReadField
                        label="Company ID"
                        value={invoice.companyId}
                    />

                    <ReadField
                        label="Company Name"
                        value={invoice.companyName}
                    />

                    <ReadField
                        label="Company Code"
                        value={invoice.companyCode}
                    />



                    <ReadField
                        label="Bank Name"
                        value={invoice.bankName}
                    />

                    <ReadField
                        label="Bank Account ID"
                        value={invoice.branchName}
                    />

                    <ReadField
                        label="Account Number"
                        value={invoice.accountNumber}
                    />

                    <ReadField
                        label="IFSC Code"
                        value={invoice.ifsc}
                    />

                    <ReadField
                        label="IFSC Code"
                        value={invoice.swiftCode}
                    />

                </div>

            </SectionCard>

            {/* =================================================
                EMAIL SIGNATURE
            ================================================= */}

            <SectionCard
                title="Email Signature"
                icon={FileText}
            >

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

                    <ReadField
                        label="Signature ID"
                        value={invoice.emailSignatureId}
                    />

                    <ReadField
                        label="Signature Name"
                        value={invoice.signatureName}
                    />

                    <ReadField
                        label="User ID"
                        value={invoice.userId}
                    />

                    <ReadField
                        label="Default for New Messages"
                        value={
                            invoice.defaultForNewMessages
                                ? "Yes"
                                : "No"
                        }
                    />

                    <ReadField
                        label="Default for Replies"
                        value={
                            invoice.defaultForReplies
                                ? "Yes"
                                : "No"
                        }
                    />

                </div>

                {invoice.signatureContent && (
                    <div className="mt-5 border-t border-gray-100 pt-4">

                        <p className="mb-2 text-xs font-medium text-gray-500">
                            Signature Content
                        </p>

                        <div
                            className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700"
                            dangerouslySetInnerHTML={{
                                __html: invoice.signatureContent,
                            }}
                        />

                    </div>
                )}

            </SectionCard>

            {/* =================================================
                CURRENCY AND DISCOUNT INFORMATION
            ================================================= */}

            <SectionCard
                title="Currency & Discount Information"
                icon={Receipt}
            >

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

                    <ReadField
                        label="Currency ID"
                        value={invoice.currencyId}
                    />

                    <ReadField
                        label="Currency Code"
                        value={invoice.currencyCode}
                    />

                    <ReadField
                        label="Currency Name"
                        value={invoice.currencyName}
                    />

                    <ReadField
                        label="Currency Symbol"
                        value={invoice.currencySymbol}
                    />

                    <ReadField
                        label="Exchange Rate"
                        value={number(invoice.exchangeRate).toFixed(8)}
                    />

                    <ReadField
                        label="Discount Mode"
                        value={invoice.discountMode}
                    />

                    <ReadField
                        label="Discount Type"
                        value={invoice.discountType}
                    />

                    <ReadField
                        label="Discount Value"
                        value={
                            invoice.discountMode === "PERCENTAGE" ||
                                invoice.discountType === "PERCENTAGE"
                                ? `${number(invoice.discountValue)}%`
                                : formatAmount(invoice.discountValue, invoice)
                        }
                    />

                </div>

            </SectionCard>

            {/* =================================================
                INVOICE ITEMS
            ================================================= */}

            <SectionCard
                title="Invoice Items"
                icon={Package}
                right={
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                        {items.length} Items
                    </span>
                }
            >

                <div className="overflow-x-auto">

                    <table className="w-full min-w-[1250px]">

                        <thead className="border-b border-gray-200 bg-gray-50">

                            <tr>
                                {[
                                    "Product",
                                    "HSN",
                                    "Unit",
                                    "Size",
                                    "Quantity",
                                    "Base Unit Price",
                                    "Unit Price",
                                    "Gross Amount",
                                    "Discount",
                                    "Taxable Amount",
                                    "Tax",
                                    "Tax Amount",
                                    "Total Amount",
                                ].map((heading) => (

                                    <th
                                        key={heading}
                                        className="whitespace-nowrap px-3 py-3 text-left text-[11px] font-semibold uppercase text-gray-500"
                                    >
                                        {heading}
                                    </th>

                                ))}

                            </tr>

                        </thead>

                        <tbody>

                            {items.length > 0 ? (

                                items.map((item, index) => (

                                    <tr
                                        key={item.id || index}
                                        className="border-b border-gray-100 transition hover:bg-gray-50"
                                    >

                                        {/* PRODUCT */}

                                        <td className="px-3 py-4">

                                            <p className="max-w-[200px] truncate text-xs font-semibold text-gray-800">
                                                {item.productName || "—"}
                                            </p>

                                            {item.description && (
                                                <p className="mt-1 max-w-[200px] truncate text-[10px] text-gray-400">
                                                    {item.description}
                                                </p>
                                            )}

                                            <p className="mt-1 text-[10px] text-gray-400">
                                                ID: #{item.productId ?? "—"}
                                            </p>

                                        </td>

                                        {/* HSN */}

                                        <td className="px-3 py-4 text-xs text-gray-600">
                                            {item.hsnCode || "—"}
                                        </td>

                                        {/* UNIT */}

                                        <td className="px-3 py-4 text-xs text-gray-600">
                                            {item.unitName || "—"}
                                        </td>

                                        {/* SIZE */}

                                        <td className="px-3 py-4 text-xs text-gray-600">
                                            {item.sizeName || "—"}
                                        </td>

                                        {/* QUANTITY */}

                                        <td className="px-3 py-4 text-xs font-medium text-gray-700">
                                            {formatQuantity(item.quantity)}
                                        </td>

                                        {/* BASE UNIT PRICE */}

                                        <td className="whitespace-nowrap px-3 py-4 text-xs text-gray-700">
                                            {formatAmount(item.baseUnitPrice, {
                                                currencyCode: "INR",
                                            })}
                                        </td>

                                        {/* UNIT PRICE */}

                                        <td className="whitespace-nowrap px-3 py-4 text-xs text-gray-700">
                                            {formatAmount(item.unitPrice, invoice)}
                                        </td>

                                        {/* GROSS */}

                                        <td className="whitespace-nowrap px-3 py-4 text-xs text-gray-700">
                                            {formatAmount(item.grossAmount, invoice)}
                                        </td>

                                        {/* DISCOUNT */}

                                        <td className="px-3 py-4">

                                            <p className="text-xs font-medium text-gray-700">
                                                {item.discountType === "PERCENTAGE"
                                                    ? `${number(item.discountValue)}%`
                                                    : formatAmount(item.discountValue, invoice)}
                                            </p>

                                            <p className="mt-1 text-[10px] text-gray-400">
                                                {formatAmount(item.discountAmount, invoice)}
                                            </p>

                                        </td>

                                        {/* TAXABLE */}

                                        <td className="whitespace-nowrap px-3 py-4 text-xs text-gray-700">
                                            {formatAmount(item.taxableAmount, invoice)}
                                        </td>

                                        {/* TAX */}

                                        <td className="px-3 py-4">

                                            <p className="text-xs font-medium text-gray-700">
                                                {item.taxName || "—"}
                                            </p>

                                            <p className="mt-1 text-[10px] text-gray-400">
                                                {number(item.taxPercentage)}%
                                            </p>

                                        </td>

                                        {/* TAX AMOUNT */}

                                        <td className="whitespace-nowrap px-3 py-4 text-xs text-gray-700">
                                            {formatAmount(item.taxAmount, invoice)}
                                        </td>

                                        {/* TOTAL */}

                                        <td className="whitespace-nowrap px-3 py-4 text-xs font-semibold text-gray-900">
                                            {formatAmount(item.totalAmount, invoice)}
                                        </td>

                                    </tr>

                                ))

                            ) : (

                                <tr>
                                    <td
                                        colSpan={13}
                                        className="px-4 py-10 text-center text-sm text-gray-400"
                                    >
                                        No invoice items found.
                                    </td>
                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>

                {/* ITEM TAX BREAKDOWN */}

                {items.length > 0 && (

                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">

                        <SummaryTile
                            label="CGST"
                            value={formatAmount(
                                items.reduce(
                                    (total, item) =>
                                        total + number(item.cgstAmount),
                                    0
                                ),
                                invoice
                            )}
                        />

                        <SummaryTile
                            label="SGST"
                            value={formatAmount(
                                items.reduce(
                                    (total, item) =>
                                        total + number(item.sgstAmount),
                                    0
                                ),
                                invoice
                            )}
                        />

                        <SummaryTile
                            label="IGST"
                            value={formatAmount(
                                items.reduce(
                                    (total, item) =>
                                        total + number(item.igstAmount),
                                    0
                                ),
                                invoice
                            )}
                        />

                    </div>

                )}

            </SectionCard>

            {/* =================================================
                TAX AND TOTAL CARDS
            ================================================= */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                {statsCards.map((card) => {

                    const Icon = card.icon;
                    const styles = colorStyles[card.color];

                    return (
                        <div
                            key={card.title}
                            className="
                                rounded-xl
                                border border-gray-200
                                bg-white
                                p-4
                                shadow-sm
                                transition
                                hover:shadow-md
                            "
                        >

                            <div className="flex items-start justify-between gap-3">

                                <div className="min-w-0">

                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                        {card.title}
                                    </p>

                                    <h3 className={`mt-2 truncate text-xl font-bold ${styles.value}`}>
                                        {card.value}
                                    </h3>

                                    <p className="mt-1 text-xs text-gray-400">
                                        {card.description}
                                    </p>

                                </div>

                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${styles.icon}`}>
                                    <Icon size={20} />
                                </div>

                            </div>

                        </div>
                    );
                })}

            </div>

            {/* =================================================
                INVOICE AMOUNT SUMMARY
            ================================================= */}
            <SectionCard
                title="Invoice Amount Summary"
                icon={Receipt}
            >

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-1">

                    {/* BASE INR AMOUNTS */}

                    <div>

                        <h4 className="mb-4 text-sm font-semibold text-gray-700">
                            Base Currency Amounts (INR)
                        </h4>

                        <div className="overflow-hidden rounded-xl border border-gray-200">

                            <table className="w-full text-sm">

                                <tbody className="divide-y divide-gray-100">

                                    {[
                                        ["Base Subtotal", invoice.baseSubtotal],
                                        ["Base Discount", invoice.baseDiscountAmount],
                                        ["Base Taxable Amount", invoice.baseTaxableAmount],
                                        ["Base Total Tax", invoice.baseTaxAmount],
                                    ].map(([label, amount]) => (
                                        <tr key={label}>
                                            <td className="px-4 py-3 text-gray-500">
                                                {label}
                                            </td>

                                            <td className="px-4 py-3 text-right font-medium text-gray-800">
                                                {formatAmount(amount, { currencyCode: "INR" })}
                                            </td>
                                        </tr>
                                    ))}

                                    <tr className="bg-gray-50">
                                        <td className="px-4 py-3 font-semibold text-gray-700">
                                            Base Grand Total
                                        </td>

                                        <td className="px-4 py-3 text-right font-bold text-gray-900">
                                            {formatAmount(
                                                invoice.baseGrandTotal,
                                                { currencyCode: "INR" }
                                            )}
                                        </td>
                                    </tr>

                                </tbody>

                            </table>

                        </div>

                    </div>

                    {/* SELECTED CURRENCY AMOUNTS */}

                    <div>

                        <h4 className="mb-4 text-sm font-semibold text-gray-700">
                            Invoice Currency Amounts ({invoice.currencyCode || "INR"})
                        </h4>

                        <div className="overflow-hidden rounded-xl border border-gray-200">

                            <table className="w-full text-sm">

                                <tbody className="divide-y divide-gray-100">

                                    {[
                                        ["Subtotal", invoice.subtotal],
                                        ["Discount Amount", invoice.discountAmount],
                                        ["Taxable Amount", invoice.taxableAmount],
                                        ["CGST", invoice.cgstAmount],
                                        ["SGST", invoice.sgstAmount],
                                        ["IGST", invoice.igstAmount],
                                        ["Total Tax", invoice.taxAmount],
                                        ["Shipping Amount", invoice.shippingAmount],
                                    ].map(([label, amount]) => (
                                        <tr key={label}>
                                            <td className="px-4 py-3 text-gray-500">
                                                {label}
                                            </td>

                                            <td className="px-4 py-3 text-right font-medium text-gray-800">
                                                {formatAmount(amount, invoice)}
                                            </td>
                                        </tr>
                                    ))}

                                    <tr className="bg-blue-50">
                                        <td className="px-4 py-3 font-semibold text-gray-700">
                                            Grand Total
                                        </td>

                                        <td className="px-4 py-3 text-right font-bold text-blue-700">
                                            {formatAmount(invoice.grandTotal, invoice)}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className="px-4 py-3 text-green-600">
                                            Paid Amount
                                        </td>

                                        <td className="px-4 py-3 text-right font-semibold text-green-600">
                                            {formatAmount(paidAmount, invoice)}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className="px-4 py-3 text-amber-600">
                                            Pending Amount
                                        </td>

                                        <td className="px-4 py-3 text-right font-semibold text-amber-600">
                                            {formatAmount(pendingAmount, invoice)}
                                        </td>
                                    </tr>

                                </tbody>

                            </table>

                        </div>

                    </div>

                </div>

            </SectionCard>

        </div>
    );
}