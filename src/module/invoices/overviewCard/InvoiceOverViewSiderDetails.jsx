import React, { useMemo } from "react";
import {
    useDispatch,
    useSelector,
} from "react-redux";
import {
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    setExistingInvoice,
} from "../slices/invoiceSlice";

export default function InvoiceOverViewSiderDetails() {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();

    /* =========================================================
       INVOICE STATE
    ========================================================= */

    const invoices = useSelector(
        (state) => state.invoice?.invoices ?? []
    );

    const existingInvoice = useSelector(
        (state) => state.invoice?.existingInvoice
    );

    /* =========================================================
       INVOICE VIEW STATE
    ========================================================= */

    const invoiceStatus = useSelector(
        (state) => state.invoiceView?.invoiceStatus ?? "ALL"
    );

    /* =========================================================
       STATUS COLORS
    ========================================================= */

    const statusColor = {
        DRAFT: "bg-yellow-100 text-yellow-700",
        SENT: "bg-blue-100 text-blue-700",
        PAID: "bg-green-100 text-green-700",
        PARTIALLY_PAID: "bg-orange-100 text-orange-700",
        PENDING: "bg-yellow-100 text-yellow-700",
        OVERDUE: "bg-red-100 text-red-700",
        CANCELLED: "bg-red-100 text-red-700",
        APPROVED: "bg-green-100 text-green-700",
        REJECTED: "bg-red-100 text-red-700",
    };

    /* =========================================================
       FILTER INVOICES
    ========================================================= */

    const filteredInvoices = useMemo(() => {

        if (!Array.isArray(invoices)) {
            return [];
        }

        const status =
            invoiceStatus?.toUpperCase() || "ALL";

        if (status === "ALL") {
            return invoices;
        }

        return invoices.filter(
            (invoice) =>
                invoice.status?.toUpperCase() === status
        );

    }, [invoices, invoiceStatus]);

    /* =========================================================
       SORT INVOICES
    ========================================================= */

    const sortedInvoices = useMemo(() => {

        return [...filteredInvoices].sort(
            (a, b) =>
                Number(b.id) - Number(a.id)
        );

    }, [filteredInvoices]);

    /* =========================================================
       SELECT INVOICE
    ========================================================= */

    const handleInvoiceClick = (invoice) => {

        if (!invoice?.id) {
            return;
        }

        dispatch(
            setExistingInvoice(invoice)
        );

        navigate(
            `/invoices/view/${invoice.id}`
        );
    };

    /* =========================================================
       STATUS LABEL
    ========================================================= */

    const getStatusLabel = (status) => {

        return status || "DRAFT";

    };

    /* =========================================================
       CUSTOMER NAME
    ========================================================= */

    const getCustomerName = (invoice) => {

        return (
            invoice?.customerName ||
            invoice?.partyName ||
            invoice?.customer?.name ||
            invoice?.party?.name ||
            "Walk-in Customer"
        );

    };

    /* =========================================================
       TOTAL
    ========================================================= */

    const getInvoiceTotal = (invoice) => {

        return Number(
            invoice?.grandTotal ??
            invoice?.totalAmount ??
            invoice?.total ??
            0
        );

    };

    /* =========================================================
       INVOICE DATE
    ========================================================= */

    const getInvoiceDate = (invoice) => {

        const date =
            invoice?.invoiceDate ||
            invoice?.date ||
            invoice?.createdAt;

        if (!date) {
            return "";
        }

        try {

            return new Date(date).toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                }
            );

        } catch {

            return date;

        }

    };

    /* =========================================================
       RENDER
    ========================================================= */

    return (
        <div className="w-full border-b border-gray-200 bg-white">

            {sortedInvoices.length > 0 ? (

                <div className="w-full">

                    {sortedInvoices.map((invoice) => {

                        const isSelected =
                            String(id) ===
                            String(invoice.id) ||
                            String(
                                existingInvoice?.id
                            ) ===
                            String(invoice.id);

                        const normalizedStatus =
                            invoice.status?.toUpperCase();

                        return (

                            <div
                                key={invoice.id}
                                onClick={() =>
                                    handleInvoiceClick(
                                        invoice
                                    )
                                }
                                className={`w-full cursor-pointer border-b border-gray-100 px-4 py-4 transition-all ${isSelected
                                    ? "border-l-4 border-l-blue-600 bg-blue-50"
                                    : "hover:bg-gray-50"
                                    }`}
                            >

                                {/* =================================================
                                    INVOICE ROW
                                ================================================= */}

                                <div className="flex items-start justify-between">

                                    {/* =================================================
                                        LEFT SIDE
                                    ================================================= */}

                                    <div className="flex gap-3">

                                        {/* Checkbox */}

                                        <input
                                            type="checkbox"
                                            onClick={(event) =>
                                                event.stopPropagation()
                                            }
                                            className="mt-1"
                                        />

                                        {/* Invoice Information */}

                                        <div className="min-w-0">

                                            {/* Invoice Number */}

                                            <h3 className="font-semibold text-gray-800">
                                                {invoice.invoiceNumber ||
                                                    `INV-${invoice.id}`}
                                            </h3>

                                            {/* ID */}

                                            <p className="text-sm text-gray-500">
                                                #{invoice.id}
                                            </p>

                                            {/* Customer */}

                                            <p className="mt-1 truncate text-sm text-gray-600">
                                                {getCustomerName(
                                                    invoice
                                                )}
                                            </p>

                                            {/* Invoice Date */}

                                            {getInvoiceDate(
                                                invoice
                                            ) && (
                                                    <p className="mt-1 text-xs text-gray-400">
                                                        {getInvoiceDate(
                                                            invoice
                                                        )}
                                                    </p>
                                                )}

                                            {/* Status */}

                                            <span
                                                className={`mt-2 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${statusColor[
                                                    normalizedStatus
                                                ] ||
                                                    "bg-gray-100 text-gray-700"
                                                    }`}
                                            >
                                                {getStatusLabel(
                                                    invoice.status
                                                )}
                                            </span>

                                        </div>

                                    </div>

                                    {/* =================================================
                                        RIGHT SIDE - TOTAL
                                    ================================================= */}

                                    <div className="ml-3 shrink-0 text-right">

                                        <p className="font-semibold text-gray-800">
                                            ₹
                                            {getInvoiceTotal(
                                                invoice
                                            ).toFixed(2)}
                                        </p>

                                    </div>

                                </div>

                            </div>
                        );
                    })}

                </div>

            ) : (

                /* =====================================================
                   EMPTY STATE
                ===================================================== */

                <div className="flex min-h-[200px] items-center justify-center text-gray-500">
                    No invoices found.
                </div>

            )}

        </div>
    );
}