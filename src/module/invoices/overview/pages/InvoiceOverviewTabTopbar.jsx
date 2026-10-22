
import React, { useState } from "react";
import {
    FileText,
    RefreshCw,
    SquareX,
    Trash2,
    View,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { setExistingInvoice } from "../../slices/invoiceSlice";
import {
    fetchInvoiceById,
    removeInvoice,
} from "../../thunks/invoiceThunks";

export default function InvoiceOverviewTabTopbar() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();

    const {
        invoice,
        existingInvoice,
        loading = false,
    } = useSelector((state) => state.invoice || {});

    const [deleting, setDeleting] = useState(false);
    const [editing, setEditing] = useState(false);
    const [saveError, setSaveError] = useState("");

    // Prefer the fetched invoice; use the selected invoice as fallback.
    const currentInvoice = invoice || existingInvoice;

    const invoiceId =
        currentInvoice?.id ??
        currentInvoice?.invoiceId ??
        id;

    const status = String(
        currentInvoice?.invoiceStatus ||
        currentInvoice?.status ||
        "DRAFT"
    ).toUpperCase();

    const getStatusStyles = (value) => {
        if (["PAID", "ACTIVE", "COMPLETED"].includes(value)) {
            return "bg-emerald-50 text-emerald-700 ring-emerald-200";
        }

        if (["OVERDUE", "CANCELLED", "REJECTED"].includes(value)) {
            return "bg-rose-50 text-rose-700 ring-rose-200";
        }

        if (["SENT", "PARTIAL", "PARTIALLY_PAID"].includes(value)) {
            return "bg-blue-50 text-blue-700 ring-blue-200";
        }

        return "bg-amber-50 text-amber-700 ring-amber-200";
    };

    const toDisplay = (value) => {
        if (value === null || value === undefined || value === "") {
            return "—";
        }

        if (typeof value === "object") {
            return (
                value.addressLine1 ||
                value.address ||
                value.name ||
                "—"
            );
        }

        return String(value);
    };


    // Edit invoice

    const getInvoiceEditRoute = (invoice, recordId) => {
        const type = String(
            invoice?.invoiceType || invoice?.type || ""
        ).toUpperCase();

        switch (type) {
            case "PRODUCT":
            case "PRODUCT_INVOICE":
                return `/invoices/product/edit/${recordId} `;

            case "SERVICE":
            case "SERVICE_INVOICE":
                return `/invoices/service/edit/${recordId} `;

            case "SALE":
            case "SALES":
            case "SALE_INVOICE":
            case "SALES_INVOICE":
                return `/invoices/sale/edit/${recordId} `;

            case "TAX":
            case "TAX_INVOICE":
                return `/invoices/tax/edit/${recordId} `;

            default:
                return `/invoices `;
        }
    };

    const handleEdit = () => {
        if (deleting) return;

        const selectedInvoice =
            invoice || existingInvoice || selectedInvoiceFromRedux;

        const recordId =
            selectedInvoice?.id ??
            selectedInvoice?.invoiceId ??
            id;

        if (!recordId) {
            setSaveError("This invoice has no ID, so it cannot be edited.");
            return;
        }

        if (!selectedInvoice) {
            setSaveError("Please select an invoice before editing.");
            return;
        }

        setSaveError("");

        dispatch(setExistingInvoice(selectedInvoice));

        navigate(getInvoiceEditRoute(selectedInvoice, recordId));
    };


    // Refresh invoice
    const handleRefresh = async () => {
        if (!invoiceId || loading) {
            toast.error("Please select an invoice first");
            return;
        }

        try {
            await dispatch(fetchInvoiceById(invoiceId)).unwrap();
        } catch (error) {
            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message || "Failed to refresh invoice"
            );
        }
    };

    // Preview selected invoice
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

    // Delete selected invoice
    const handleDelete = async () => {
        if (!invoiceId || deleting) {
            toast.error("Please select an invoice first");
            return;
        }

        const confirmed = window.confirm(
            `Delete invoice ${currentInvoice?.invoiceNumber || ""
            }? This action cannot be undone.`
        );

        if (!confirmed) return;

        setDeleting(true);

        try {
            await dispatch(removeInvoice(invoiceId)).unwrap();

            toast.success("Invoice deleted successfully");
            navigate("/invoices");
        } catch (error) {
            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message || "Couldn't delete invoice"
            );
        } finally {
            setDeleting(false);
        }
    };

    // Loading / missing invoice
    if (!currentInvoice && loading) {
        return (
            <div className="flex items-center justify-between border border-gray-100 bg-white px-4 py-4">
                <p className="text-sm text-gray-500">
                    Loading invoice...
                </p>
            </div>
        );
    }

    if (!currentInvoice) {
        return (
            <div className="flex items-center justify-between border border-gray-100 bg-white px-4 py-4">
                <p className="text-sm text-gray-500">
                    No invoice selected.
                </p>

                <button
                    type="button"
                    onClick={() => navigate("/invoices")}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                >
                    Back to invoices
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 border border-gray-100 bg-white px-3 py-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Invoice header */}
            <div className="flex flex-wrap items-start justify-between gap-5 px-2.5">
                <div className="flex min-w-0 items-center gap-4">

                    <div className="min-w-0 ">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="break-words text-2xl font-bold text-slate-800">
                                {invoice.invoiceNumber || "Invoice"}
                            </h1>
                            <span
                                className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide ring-1 ring-inset ${getStatusStyles(status)}`}
                            >
                                {status.replaceAll("_", " ")}
                            </span>
                        </div>
                        <p className="mt-1 text-lg text-green-500">
                            {invoice.invoiceType || "Invoice"}
                        </p>

                    </div>
                </div>

            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => id && dispatch(fetchInvoiceById(id))}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
                    </button>
                    <button
                        type="button"
                        onClick={handleEdit}
                        disabled={editing}
                        className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                    >
                        <Trash2 size={14} /> {editing ? "Editing..." : "Edit"}
                    </button>


                    <button
                        type="button"
                        onClick={handlePreview}
                        disabled={!invoiceId}
                        className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <View size={14} />
                        Preview
                    </button>


                    <button
                        type="button"
                        onClick={() => navigate("/invoices")}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                    >
                        <SquareX size={14} />

                    </button>
                </div>
            </div>
        </div>
    );
}