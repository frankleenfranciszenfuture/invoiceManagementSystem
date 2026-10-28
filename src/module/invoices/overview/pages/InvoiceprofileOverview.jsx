import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import InvoiceTemplate1 from "../template/InvoiceTemplate1";

import {
    LayoutDashboard,
    FileText,
    Users,
    MapPin,
    History,
    CreditCard,
    Package,
    Pencil,
    X,
    Check,
    CircleDollarSign,
    BadgeCheck,
    View,
    Building2,
    Landmark,
    PenLine,
} from "lucide-react";

import {
    fetchInvoiceById,
    editInvoice,
    removeInvoice,
} from "../../thunks/invoiceThunks";

import {
    setEditingField,
    clearSelectedInvoice,
    addRecentActivity,
    setInvoiceField,
    setExistingInvoice,
} from "../../slices/invoiceSlice";

const TABS = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "details", label: "Invoice Details", icon: FileText },
    { id: "companyDetails", label: "Company Details", icon: FileText },
    { id: "preview", label: "Preview", icon: View },
    { id: "parties", label: "Customer & Address", icon: Users },
    { id: "items", label: "Invoice Items", icon: Package },
    { id: "activities", label: "Activities", icon: History },
    { id: "account", label: "Account", icon: CreditCard },
];

const FIELD_GROUPS = {
    companyDetails: [
        ["companyName", "Company Name"],
        ["legalName", "Legal Name"],
        ["companyCode", "Company Code"],
        ["gstNumber", "Gst Number"],
        ["email", "Email"],
        ["phone", "Phone"],
        ["website", "Website"],
        ["addressLine1", "AddressLine1"],
        ["addressLine2", "AddressLine2"],
        ["city", "City"],
        ["state", "State"],
        ["country", "Country"],
        ["pincode", "Pincode"]
        ["termsAndConditions", "Terms and conditions", "textarea"],
        ["notes", "Notes", "textarea"],
    ],

    details: [
        ["invoiceNumber", "Invoice number"],
        ["invoiceType", "Invoice type"],
        ["invoiceDate", "Invoice date", "date"],
        ["dueDate", "Due date", "date"],
        ["invoiceStatus", "Invoice status"],
        ["termsAndConditions", "Terms and conditions", "textarea"],
        ["notes", "Notes", "textarea"],
    ],
    parties: [
        ["customerName", "Customer name"],
        ["customerId", "Customer ID"],
        ["salesPersonName", "Salesperson name"],
        ["salesPersonId", "Salesperson ID"],
    ],
    account: [
        ["currencyName", "Currency name"],
        ["currencyId", "Currency ID"],
        ["exchangeRate", "Exchange rate", "number"],
    ],
};

const hasValue = (value) =>
    value !== null &&
    value !== undefined &&
    String(value).trim() !== "";

const toDisplay = (value) => {
    if (value === null || value === undefined || value === "") {
        return "—";
    }

    if (typeof value === "object") {
        return addressToString(value);
    }

    return String(value);
};

const addressToString = (address) => {
    if (address === null || address === undefined || address === "") {
        return "—";
    }

    if (typeof address === "string") {
        return address;
    }

    if (typeof address !== "object") {
        return String(address);
    }

    const parts = [
        address.addressLine1,
        address.addressLine2,
        address.street,
        address.city,
        address.state,
        address.province,
        address.postalCode,
        address.pincode,
        address.zipCode,
        address.country,
    ].filter(hasValue);

    return parts.length ? parts.join(", ") : "—";
};

const formatMoney = (value, currency) => {
    if (value === null || value === undefined || value === "") {
        return "—";
    }

    const amount = Number(value);

    if (!Number.isFinite(amount)) {
        return String(value);
    }

    const formatted = amount.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    return currency ? `${currency}-${formatted}` : formatted;
};

const getStatusStyles = (value) => {
    const status = String(value || "DRAFT").toUpperCase();

    if (["PAID", "ACTIVE", "COMPLETED"].includes(status)) {
        return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    }

    if (["OVERDUE", "CANCELLED", "REJECTED"].includes(status)) {
        return "bg-rose-50 text-rose-700 ring-rose-200";
    }

    if (["SENT", "PARTIAL", "PARTIALLY_PAID"].includes(status)) {
        return "bg-blue-50 text-blue-700 ring-blue-200";
    }

    return "bg-amber-50 text-amber-700 ring-amber-200";
};

function Section({
    title,
    description,
    action,
    children,
    className = "",
}) {
    return (
        <section
            className={`min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white ${className}`}
        >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                <div className="min-w-0">
                    <h2 className="font-semibold text-slate-800">
                        {title}
                    </h2>

                    {description && (
                        <p className="mt-1 text-sm text-slate-500">
                            {description}
                        </p>
                    )}
                </div>

                {action}
            </div>

            <div className="min-w-0 p-5">{children}</div>
        </section>
    );
}

function Field({
    label,
    value,
    editing = false,
    type = "text",
    onChange,
}) {
    const isTextArea = type === "textarea";

    return (
        <div className="min-w-0">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                {label}
            </label>

            {editing ? (
                isTextArea ? (
                    <textarea
                        rows={3}
                        value={value ?? ""}
                        onChange={onChange}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                ) : (
                    <input
                        type={type}
                        value={value ?? ""}
                        onChange={onChange}
                        step={type === "number" ? "any" : undefined}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                )
            ) : (
                <p className="whitespace-pre-wrap break-words text-sm font-medium text-slate-700">
                    {toDisplay(value)}
                </p>
            )}
        </div>
    );
}

function EditActions({
    editing,
    saving,
    onEdit,
    onCancel,
    onSave,
}) {
    if (!editing) {
        return (
            <button
                type="button"
                onClick={onEdit}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
                <Pencil size={14} />
                Edit
            </button>
        );
    }

    return (
        <div className="flex gap-2">
            <button
                type="button"
                onClick={onCancel}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
                <X size={14} />
                Cancel
            </button>

            <button
                type="button"
                onClick={onSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
                <Check size={14} />
                {saving ? "Saving..." : "Save"}
            </button>
        </div>
    );
}

function SummaryField({ label, value }) {
    return (
        <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {label}
            </p>

            <p className="mt-1 break-words text-sm font-medium text-slate-700">
                {toDisplay(value)}
            </p>
        </div>
    );
}

/**
 * Displays company, bank and signature data from the invoice API response.
 * Supports both flat response fields and nested related objects.
 */
function InvoiceCompanyBankSignature({ invoice }) {
    const companyName =
        invoice?.companyName ||
        invoice?.company?.companyName ||
        invoice?.company?.name ||
        "";

    const companyCode =
        invoice?.companyCode ||
        invoice?.company?.companyCode ||
        invoice?.company?.code ||
        "";

    const companyGstNumber =
        invoice?.gstNumber ||
        invoice?.company?.gstNumber ||
        invoice?.company?.gstNumber ||
        "";

    const companyAddressLine1 =
        invoice?.addressLine1 ||
        invoice?.company?.addressLine1 ||
        invoice?.company?.addressLine1 ||
        "";

    const companyAddressLine2 =
        invoice?.addressLine2 ||
        invoice?.company?.addressLine2 ||
        invoice?.company?.addressLine2 ||
        "";

    const companyCity =
        invoice?.city ||
        invoice?.company?.city ||
        invoice?.company?.city ||
        "";

    const companyState =
        invoice?.state ||
        invoice?.company?.state ||
        invoice?.company?.state ||
        "";

    const companyCountry =
        invoice?.country ||
        invoice?.company?.country ||
        invoice?.company?.country ||
        "";

    const companyPincode =
        invoice?.pincode ||
        invoice?.company?.pincode ||
        invoice?.company?.pincode ||
        "";

    const companyPhone =
        invoice?.phone ||
        invoice?.company?.phone ||
        invoice?.company?.phone ||
        "";

    const companyEmail =
        invoice?.email ||
        invoice?.company?.email ||
        invoice?.company?.email ||
        "";

    const companyWebsite =
        invoice?.website ||
        invoice?.company?.website ||
        invoice?.company?.website ||
        "";


    const logoUrl =
        invoice?.logo ||
        invoice?.companyLogo ||
        invoice?.company?.logo ||
        invoice?.company?.logoUrl ||
        "";

    const bankName =
        invoice?.bankName ||
        invoice?.bankAccount?.bankName ||
        invoice?.bankAccountName ||
        "";

    const accountNumber =
        invoice?.accountNumber ||
        invoice?.bankAccount?.accountNumber ||
        "";

    const ifsc =
        invoice?.ifsc ||
        invoice?.bankAccount?.ifsc ||
        invoice?.bankAccount?.ifscCode ||
        "";

    const signatureName =
        invoice?.signatureName ||
        invoice?.emailSignature?.signatureName ||
        invoice?.emailSignature?.name ||
        "";

    const signatureContent =
        invoice?.signatureContent ||
        invoice?.emailSignature?.signatureContent ||
        invoice?.emailSignature?.content ||
        "";

    return (
        <Section
            title="Company, Bank & Signature"
            description="Company identity and payment details associated with this invoice"
            className="xl:col-span-2"
        >
            <div className="mb-2 flex min-w-0 items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                {logoUrl ? (
                    <img
                        src={logoUrl}
                        alt={companyName || "Company logo"}
                        className="h-16 w-16 shrink-0 rounded-lg border border-slate-200 bg-white p-1 object-contain"
                        onError={(event) => {
                            event.currentTarget.style.display = "none";
                        }}
                    />
                ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <Building2 size={26} />
                    </div>
                )}

                <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Company Details

                    </p>

                    <p className="mt-2 break-words text-sm font-semibold text-slate-800">
                        {companyName || "Company name unavailable"}

                    </p>

                    {companyCode && (
                        <p className="mt-1 break-words text-xs text-slate-500">
                            Company Code : {companyCode}
                        </p>
                    )}

                    {companyAddressLine1 && (
                        <p className="mt-1 break-words text-xs text-slate-500">
                            Address : {companyAddressLine1} {companyAddressLine2}

                        </p>
                    )}



                    {(companyCity || companyState || companyCountry) && (
                        <p className="mt-1 break-words text-xs text-gray-500">
                            {companyCity && (
                                <span className="text-gray-400">
                                    City: <span className="font-medium text-blue-400">{companyCity}</span>
                                </span>
                            )}

                            {companyState && (
                                <span className="ml-2 text-gray-400">
                                    State: <span className="font-medium text-blue-400">{companyState}</span>
                                </span>
                            )}

                            {companyCountry && (
                                <span className="ml-2 text-gray-400">
                                    Country: <span className="font-medium text-blue-400">{companyCountry}</span>
                                </span>
                            )}
                        </p>
                    )}

                    {(companyPhone || companyEmail || companyWebsite) && (
                        <p className="mt-1 break-words text-xs text-gray-500 font-semibold">
                            {companyPhone && (
                                <span className="text-gray-400">
                                    Mobile: <span className="font-medium text-blue-400">{companyPhone}</span>
                                </span>
                            )}

                            {companyEmail && (
                                <span className="ml-2 text-gray-400">
                                    State: <span className="font-medium text-blue-400">{companyEmail}</span>
                                </span>
                            )}

                            {companyWebsite && (
                                <span className="ml-2 text-gray-400">
                                    Country: <span className="font-medium text-blue-400">{companyWebsite}</span>
                                </span>
                            )}
                        </p>
                    )}
                </div>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
                {/* Company */}


                {/* Bank */}
                <div className="flex min-w-0 items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                        <Landmark size={22} />
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Bank Details
                        </p>

                        <p className="mt-2 break-words text-sm font-semibold text-slate-800">
                            {bankName || "Bank not available"}
                        </p>

                        <p className="mt-2 break-all text-xs text-slate-500">
                            Account Number: {accountNumber || "—"}
                        </p>

                        <p className="mt-1 break-all text-xs text-slate-500">
                            IFSC: {ifsc || "—"}
                        </p>
                    </div>
                </div>

                {/* Signature */}
                <div className="flex min-w-0 items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                        <PenLine size={22} />
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Email Signature
                        </p>

                        <p className="mt-2 break-words text-sm font-semibold text-slate-800">
                            {signatureName || "No signature selected"}
                        </p>

                        {signatureContent ? (
                            <div
                                className="mt-2 break-words text-sm text-slate-600 [&_a]:text-blue-600 [&_strong]:font-semibold"
                                dangerouslySetInnerHTML={{
                                    __html: signatureContent,
                                }}
                            />
                        ) : (
                            <p className="mt-1 text-xs text-slate-400">
                                Signature content unavailable
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </Section>
    );
}

export default function InvoiceprofileOverview() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {
        invoice,
        loading = false,
        error,
        editingField,
        existingInvoice,
        activities = [],
        recentActivities = [],
    } = useSelector((state) => state.invoice || {});

    const [activeTab, setActiveTab] = useState("overview");
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [deleting, setDeleting] = useState(false);

    const selectedInvoiceFromRedux = useSelector(
        (state) => state.invoice?.exsistingInvoice
    );

    useEffect(() => {
        dispatch(setEditingField(null));
        dispatch(clearSelectedInvoice());

        if (id) {
            dispatch(fetchInvoiceById(id));
        }

        return () => {
            dispatch(clearSelectedInvoice());
            dispatch(setEditingField(null));
        };
    }, [id, dispatch]);

    const currentInvoice = invoice || existingInvoice;

    const allActivities = useMemo(
        () =>
            [...(recentActivities || []), ...(activities || [])].sort(
                (a, b) =>
                    new Date(b.createdAt || b.date || 0) -
                    new Date(a.createdAt || a.date || 0)
            ),
        [recentActivities, activities]
    );

    const completeness = useMemo(() => {
        if (!currentInvoice) return 0;

        const currency =
            currentInvoice.currencyName ||
            currentInvoice.currencyCode ||
            currentInvoice.currencyId;

        const required = [
            currentInvoice.invoiceNumber,
            currentInvoice.invoiceType,
            currentInvoice.customerName || currentInvoice.customerId,
            currentInvoice.invoiceDate,
            currentInvoice.dueDate,
            currentInvoice.invoiceStatus || currentInvoice.status,
            currency,
            currentInvoice.exchangeRate,
        ];

        return Math.round(
            (required.filter(hasValue).length / required.length) * 100
        );
    }, [currentInvoice]);

    const startEdit = (section) => {
        setSaveError("");
        dispatch(setEditingField(section));
    };

    const setField = (field) => (event) => {
        dispatch(
            setInvoiceField({
                field,
                value: event.target.value,
            })
        );
    };

    const invoiceId =
        currentInvoice?.id ??
        currentInvoice?.invoiceId ??
        id;

    const handlePreview = () => {
        if (!invoiceId) {
            toast.error("Please select an invoice first");
            return;
        }

        if (currentInvoice) {
            dispatch(setExistingInvoice(currentInvoice));
        }

        navigate(`/invoices/preview/${invoiceId}`);
    };

    const cancelEdit = async () => {
        setSaveError("");
        dispatch(setEditingField(null));

        if (id) {
            const result = await dispatch(fetchInvoiceById(id));

            if (fetchInvoiceById.rejected.match(result)) {
                setSaveError(
                    result.payload?.message ||
                    result.error?.message ||
                    "Couldn't reload the saved invoice."
                );
            }
        }
    };

    const save = async () => {
        if (!invoice || saving) return;

        setSaving(true);
        setSaveError("");

        try {
            // Keep the existing thunk argument convention.
            const result = await dispatch(editInvoice(invoice));

            if (editInvoice.fulfilled.match(result)) {
                dispatch(
                    addRecentActivity({
                        type: "invoice",
                        title: `Invoice ${invoice.invoiceNumber || ""} details updated`.trim(),
                        createdAt: new Date().toISOString(),
                    })
                );

                dispatch(setEditingField(null));

                if (id) {
                    const refreshResult = await dispatch(
                        fetchInvoiceById(id)
                    );

                    if (fetchInvoiceById.rejected.match(refreshResult)) {
                        setSaveError(
                            "Invoice was saved, but refreshing its latest details failed."
                        );
                    }
                }
            } else {
                const payload = result.payload;

                setSaveError(
                    typeof payload === "string"
                        ? payload
                        : payload?.message ||
                        result.error?.message ||
                        "Couldn't save invoice changes."
                );
            }
        } catch (err) {
            setSaveError(
                err?.message || "Couldn't save invoice changes."
            );
        } finally {
            setSaving(false);
        }
    };

    const remove = async () => {
        if (!currentInvoice || deleting) return;

        const recordId =
            currentInvoice.id ??
            currentInvoice.invoiceId ??
            id;

        if (!recordId) {
            setSaveError(
                "This invoice has no ID, so it cannot be deleted."
            );
            return;
        }

        const confirmed = window.confirm(
            `Delete invoice ${currentInvoice.invoiceNumber || ""}? This action cannot be undone.`
        );

        if (!confirmed) return;

        setDeleting(true);
        setSaveError("");

        try {
            const result = await dispatch(removeInvoice(recordId));

            if (removeInvoice.fulfilled.match(result)) {
                navigate("/invoices");
            } else {
                const payload = result.payload;

                setSaveError(
                    typeof payload === "string"
                        ? payload
                        : payload?.message ||
                        result.error?.message ||
                        "Couldn't delete invoice."
                );
            }
        } catch (err) {
            setSaveError(
                err?.message || "Couldn't delete invoice."
            );
        } finally {
            setDeleting(false);
        }
    };

    const getInvoiceEditRoute = (record, recordId) => {
        const type = String(
            record?.invoiceType || record?.type || ""
        ).toUpperCase();

        switch (type) {
            case "PRODUCT":
            case "PRODUCT_INVOICE":
                return `/invoices/product/edit/${recordId}`;

            case "SERVICE":
            case "SERVICE_INVOICE":
                return `/invoices/service/edit/${recordId}`;

            case "SALE":
            case "SALES":
            case "SALE_INVOICE":
            case "SALES_INVOICE":
                return `/invoices/sale/edit/${recordId}`;

            case "TAX":
            case "TAX_INVOICE":
                return `/invoices/tax/edit/${recordId}`;

            default:
                return "/invoices";
        }
    };

    const handleEdit = () => {
        if (deleting) return;

        const selectedInvoice =
            currentInvoice || selectedInvoiceFromRedux;

        const recordId =
            selectedInvoice?.id ??
            selectedInvoice?.invoiceId ??
            id;

        if (!recordId) {
            setSaveError(
                "This invoice has no ID, so it cannot be edited."
            );
            return;
        }

        if (!selectedInvoice) {
            setSaveError(
                "Please select an invoice before editing."
            );
            return;
        }

        setSaveError("");
        dispatch(setExistingInvoice(selectedInvoice));

        navigate(getInvoiceEditRoute(selectedInvoice, recordId));
    };

    if (loading && (!invoice || !invoice.id)) {
        return (
            <p className="px-6 py-16 text-center text-slate-400">
                Loading invoice...
            </p>
        );
    }

    if (!invoice || (!invoice.id && !loading)) {
        return (
            <div className="px-6 py-16 text-center">
                <p className="text-slate-500">
                    {error
                        ? "We couldn't load this invoice. Check your connection and try again."
                        : "This invoice doesn't exist or was deleted."}
                </p>

                <button
                    type="button"
                    onClick={() => navigate("/invoices")}
                    className="mt-4 text-sm font-medium text-blue-600 hover:underline"
                >
                    Back to invoices
                </button>
            </div>
        );
    }

    const status = String(
        currentInvoice.invoiceStatus ||
        currentInvoice.status ||
        "DRAFT"
    ).toUpperCase();

    const currency =
        currentInvoice.currencyCode ||
        currentInvoice.currencyName ||
        currentInvoice.currencyId ||
        "";

    const billingAddress =
        currentInvoice.billingAddress ||
        currentInvoice.customer?.billingAddress || {
            addressLine1: currentInvoice.billingAddressLine1,
            addressLine2: currentInvoice.billingAddressLine2,
            city: currentInvoice.billingCity,
            state: currentInvoice.billingState,
            postalCode:
                currentInvoice.billingPostalCode ||
                currentInvoice.billingPincode,
            country: currentInvoice.billingCountry,
        };

    const shippingAddress =
        currentInvoice.shippingAddress ||
        currentInvoice.customer?.shippingAddress || {
            addressLine1: currentInvoice.shippingAddressLine1,
            addressLine2: currentInvoice.shippingAddressLine2,
            city: currentInvoice.shippingCity,
            state: currentInvoice.shippingState,
            postalCode:
                currentInvoice.shippingPostalCode ||
                currentInvoice.shippingPincode,
            country: currentInvoice.shippingCountry,
        };

    const currentEditing = editingField === activeTab;

    const items = Array.isArray(currentInvoice.invoiceItems)
        ? currentInvoice.invoiceItems
        : [];

    const amountRows = [
        ["Subtotal", currentInvoice.subtotal],
        ["Discount", currentInvoice.discountAmount],
        ["Tax amount", currentInvoice.taxAmount],
        ["Shipping amount", currentInvoice.shippingAmount],
        ["Grand total", currentInvoice.grandTotal],
    ];

    return (
        <div className="invoice-profile-compact box-border min-h-full min-w-0 w-full space-y-4 bg-slate-50/50 p-3">
            <div className="border-b border-gray-200" />

            {/* Summary cards */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                    {
                        label: "Grand total",
                        value: formatMoney(
                            currentInvoice.grandTotal,
                            currency
                        ),
                        icon: CircleDollarSign,
                        color: "text-blue-600",
                    },
                    {
                        label: "Tax amount",
                        value: formatMoney(
                            currentInvoice.taxAmount,
                            currency
                        ),
                        icon: CreditCard,
                        color: "text-emerald-600",
                    },
                    {
                        label: "Invoice items",
                        value: items.length,
                        icon: Package,
                        color: "text-indigo-600",
                    },
                    {
                        label: "Completeness",
                        value: `${completeness}%`,
                        icon: BadgeCheck,
                        color: "text-violet-600",
                    },
                ].map((item) => {
                    const Icon = item.icon;

                    return (
                        <div
                            key={item.label}
                            className="rounded-xl border border-slate-200 bg-white px-5 py-4"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    {item.label}
                                </p>

                                <Icon
                                    size={17}
                                    className={item.color}
                                />
                            </div>

                            <p
                                className={`mt-2 break-words text-xl font-semibold ${item.color}`}
                            >
                                {item.value}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200">
                <div className="flex gap-5 overflow-x-auto sm:gap-7">
                    {TABS.map(
                        ({ id: tabId, label, icon: Icon }) => (
                            <button
                                key={tabId}
                                type="button"
                                onClick={() => setActiveTab(tabId)}
                                className={`flex shrink-0 items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition ${activeTab === tabId
                                    ? "border-blue-600 text-blue-600"
                                    : "border-transparent text-slate-500 hover:text-slate-800"
                                    }`}
                            >
                                <Icon size={16} />
                                {label}

                                {tabId === "items" &&
                                    items.length > 0 && (
                                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                                            {items.length}
                                        </span>
                                    )}
                            </button>
                        )
                    )}
                </div>
            </div>

            {saveError && (
                <div
                    role="alert"
                    className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                >
                    {saveError}
                </div>
            )}

            {/* Overview */}
            {activeTab === "overview" && (
                <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2">
                    <Section
                        title="Invoice summary"
                        description="Key information for this invoice"
                    >
                        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                            <SummaryField
                                label="Invoice number"
                                value={currentInvoice.invoiceNumber}
                            />
                            <SummaryField
                                label="Invoice type"
                                value={currentInvoice.invoiceType}
                            />
                            <SummaryField
                                label="Status"
                                value={status.replaceAll("_", " ")}
                            />
                            <SummaryField
                                label="Invoice date"
                                value={currentInvoice.invoiceDate}
                            />
                            <SummaryField
                                label="Due date"
                                value={currentInvoice.dueDate}
                            />
                            <SummaryField
                                label="Customer"
                                value={currentInvoice.customerName}
                            />
                            <SummaryField
                                label="Salesperson"
                                value={currentInvoice.salesPersonName}
                            />
                            <SummaryField
                                label="Currency"
                                value={currency}
                            />
                        </div>
                    </Section>

                    <Section
                        title="Invoice totals"
                        description="Amounts stored on this invoice"
                    >
                        <div className="space-y-4">
                            {amountRows.map(([label, value]) => (
                                <div
                                    key={label}
                                    className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0"
                                >
                                    <span className="text-sm text-slate-500">
                                        {label}
                                    </span>

                                    <span
                                        className={`text-sm font-semibold ${label === "Grand total"
                                            ? "text-blue-700"
                                            : "text-slate-800"
                                            }`}
                                    >
                                        {formatMoney(value, currency)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Section>

                    <Section
                        title="Recent activity"
                        description="Latest profile activities"
                    >
                        {allActivities.length ? (
                            <div className="space-y-4">
                                {allActivities.slice(0, 5).map(
                                    (activity, index) => (
                                        <div
                                            key={`${activity.createdAt ||
                                                activity.date ||
                                                "activity"
                                                }-${index}`}
                                            className="flex gap-3"
                                        >
                                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />

                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-slate-700">
                                                    {activity.title ||
                                                        activity.description ||
                                                        activity.type ||
                                                        "Invoice updated"}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-400">
                                                    {toDisplay(
                                                        activity.createdAt ||
                                                        activity.date
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400">
                                No activity recorded yet.
                            </p>
                        )}
                    </Section>

                    <Section
                        title="Profile completeness"
                        description="How many key invoice fields have been provided"
                    >
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                                className="h-full rounded-full bg-blue-600 transition-all"
                                style={{
                                    width: `${completeness}%`,
                                }}
                            />
                        </div>

                        <p className="mt-2 text-sm text-slate-500">
                            {completeness}% of key invoice fields are filled.
                        </p>

                        <button
                            type="button"
                            onClick={() => setActiveTab("details")}
                            className="mt-4 text-sm font-medium text-blue-600 hover:underline"
                        >
                            Review invoice details →
                        </button>
                    </Section>

                    {/* NEW: Company, bank and signature details */}
                    <InvoiceCompanyBankSignature
                        invoice={currentInvoice}
                    />
                </div>
            )}

            {/* Editable invoice details, parties and account */}
            {["details", "parties", "account"].includes(activeTab) && (
                <Section
                    title={
                        TABS.find((tab) => tab.id === activeTab)?.label ||
                        "Invoice details"
                    }
                    description={
                        activeTab === "details"
                            ? "Review and update the invoice number, dates, status and terms."
                            : activeTab === "parties"
                                ? "Customer and salesperson references associated with this invoice."
                                : "Currency and exchange-rate details for this invoice."
                    }
                    action={
                        <EditActions
                            editing={currentEditing}
                            saving={saving}
                            onEdit={() => startEdit(activeTab)}
                            onCancel={cancelEdit}
                            onSave={save}
                        />
                    }
                >
                    <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
                        {FIELD_GROUPS[activeTab].map(
                            ([field, label, type = "text"]) => (
                                <Field
                                    key={field}
                                    label={label}
                                    value={currentInvoice[field]}
                                    type={type}
                                    editing={currentEditing}
                                    onChange={setField(field)}
                                />
                            )
                        )}
                    </div>

                    {activeTab === "parties" && (
                        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                                <div className="mb-2 flex items-center gap-2 text-slate-600">
                                    <MapPin size={16} />
                                    <h3 className="text-sm font-semibold">
                                        Billing address
                                    </h3>
                                </div>

                                <p className="whitespace-pre-wrap break-words text-sm text-slate-600">
                                    {addressToString(billingAddress)}
                                </p>
                            </div>

                            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                                <div className="mb-2 flex items-center gap-2 text-slate-600">
                                    <MapPin size={16} />
                                    <h3 className="text-sm font-semibold">
                                        Shipping address
                                    </h3>
                                </div>

                                <p className="whitespace-pre-wrap break-words text-sm text-slate-600">
                                    {addressToString(shippingAddress)}
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === "account" && (
                        <div className="mt-6 rounded-lg border border-slate-100 bg-slate-50 p-4">
                            <div className="mb-4 flex items-center gap-2 text-slate-700">
                                <CircleDollarSign size={17} />
                                <h3 className="text-sm font-semibold">
                                    Amount breakdown
                                </h3>
                            </div>

                            <div className="space-y-3">
                                {amountRows.map(([label, value]) => (
                                    <div
                                        key={label}
                                        className="flex items-center justify-between gap-4"
                                    >
                                        <span className="text-sm text-slate-500">
                                            {label}
                                        </span>

                                        <span className="text-sm font-semibold text-slate-800">
                                            {formatMoney(value, currency)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Section>
            )}

            {/* Invoice items */}
            {activeTab === "items" && (
                <Section
                    title="Invoice items"
                    description="Products or services included in this invoice"
                >
                    {items.length ? (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                        <th className="px-3 py-3 font-semibold">Item</th>
                                        <th className="px-3 py-3 font-semibold">Unit</th>
                                        <th className="px-3 py-3 font-semibold">Size</th>
                                        <th className="px-3 py-3 text-right font-semibold">Qty</th>
                                        <th className="px-3 py-3 text-right font-semibold">Unit price</th>
                                        <th className="px-3 py-3 text-right font-semibold">Discount</th>
                                        <th className="px-3 py-3 font-semibold">Tax ID</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {items.map((item, index) => (
                                        <tr
                                            key={
                                                item.id ||
                                                `${item.productId || "item"}-${index}`
                                            }
                                            className="border-b border-slate-100 last:border-0"
                                        >
                                            <td className="px-3 py-3">
                                                <p className="text-sm font-medium text-slate-800">
                                                    {item.description ||
                                                        item.productName ||
                                                        item.productId ||
                                                        `Item ${index + 1}`}
                                                </p>

                                                {item.productId && (
                                                    <p className="mt-1 text-xs text-slate-400">
                                                        Product ID: {item.productId}
                                                    </p>
                                                )}
                                            </td>

                                            <td className="px-3 py-3 text-sm text-slate-600">
                                                {toDisplay(item.unitName || item.unitId)}
                                            </td>

                                            <td className="px-3 py-3 text-sm text-slate-600">
                                                {toDisplay(item.sizeName || item.sizeId)}
                                            </td>

                                            <td className="px-3 py-3 text-right text-sm text-slate-700">
                                                {toDisplay(item.quantity)}
                                            </td>

                                            <td className="px-3 py-3 text-right text-sm text-slate-700">
                                                {formatMoney(item.unitPrice, currency)}
                                            </td>

                                            <td className="px-3 py-3 text-right text-sm text-slate-700">
                                                {formatMoney(item.discountAmount, currency)}
                                            </td>

                                            <td className="px-3 py-3 text-sm text-slate-600">
                                                {toDisplay(
                                                    item.taxMasterName ||
                                                    item.taxMasterId
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-10 text-center">
                            <Package
                                size={28}
                                className="mx-auto text-slate-300"
                            />

                            <p className="mt-3 text-sm font-medium text-slate-600">
                                No invoice items found
                            </p>

                            <p className="mt-1 text-sm text-slate-400">
                                This invoice does not contain any saved line items.
                            </p>
                        </div>
                    )}
                </Section>
            )}

            {/* Full invoice preview — stays on the current page */}
            {activeTab === "preview" && (
                <Section
                    title="Invoice Preview"
                    description="Invoice preview and associated company information"
                    action={
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={handlePreview}
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 
                                px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                            >
                                <View size={14} />
                                Open Preview Page
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab("overview")}
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                            >
                                <X size={14} />
                                Close Preview
                            </button>
                        </div>
                    }
                >
                    {/* NEW: Company, bank and signature details */}
                    <div className="mb-5">
                        <InvoiceCompanyBankSignature
                            invoice={currentInvoice}
                        />
                    </div>

                    {/* <div className="w-full min-w-0 overflow-auto rounded-lg bg-slate-100 p-2 sm:p-4">
                        <div className="mx-auto w-full max-w-[950px] bg-white shadow-md">
                            <InvoiceTemplate1
                                invoice={currentInvoice}
                                preview={true}
                            />
                        </div>
                    </div> */}
                </Section>
            )}

            {/* Activities */}
            {activeTab === "activities" && (
                <Section
                    title="Invoice activities"
                    description="Chronological history of profile updates"
                >
                    {allActivities.length ? (
                        <div className="space-y-5">
                            {allActivities.map((activity, index) => (
                                <div
                                    key={`${activity.createdAt ||
                                        activity.date ||
                                        "activity"
                                        }-${index}`}
                                    className="flex gap-3"
                                >
                                    <span className="mt-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                        <History size={15} />
                                    </span>

                                    <div className="min-w-0 flex-1 border-b border-slate-100 pb-4">
                                        <p className="text-sm font-medium text-slate-800">
                                            {activity.title ||
                                                activity.description ||
                                                activity.type ||
                                                "Invoice activity"}
                                        </p>

                                        {activity.description &&
                                            activity.title && (
                                                <p className="mt-1 text-sm text-slate-500">
                                                    {activity.description}
                                                </p>
                                            )}

                                        <p className="mt-1 text-xs text-slate-400">
                                            {toDisplay(
                                                activity.createdAt ||
                                                activity.date
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="py-6 text-center text-sm text-slate-400">
                            No activities available for this invoice.
                        </p>
                    )}
                </Section>
            )}
        </div>
    );
}
