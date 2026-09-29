import React, { useState } from "react";
import { useSelector } from "react-redux";

import {
    ChevronDown,
    FileText,
} from "lucide-react";

export default function InvoicePayDueOverviewCard() {

    const [showInvoiceDetails, setShowInvoiceDetails] =
        useState(false);

    /* =========================================================
       INVOICE
    ========================================================= */

    const invoice = useSelector(
        (state) => state.invoice?.invoice
    );

    const existingInvoice = useSelector(
        (state) => state.invoice?.existingInvoice
    );

    const currentInvoice =
        invoice || existingInvoice;

    /* =========================================================
       FORMAT DATE
    ========================================================= */

    const formatDate = (date) => {

        if (!date) {
            return "-";
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
       CUSTOMER
    ========================================================= */

    const customerName =
        currentInvoice?.customerName ||
        currentInvoice?.partyName ||
        currentInvoice?.customer?.name ||
        currentInvoice?.party?.name ||
        "Walk-in Customer";

    /* =========================================================
       TOTAL
    ========================================================= */

    const totalAmount = Number(
        currentInvoice?.grandTotal ??
        currentInvoice?.totalAmount ??
        currentInvoice?.total ??
        0
    );

    /* =========================================================
       PAID
    ========================================================= */

    const paidAmount = Number(
        currentInvoice?.paidAmount ??
        currentInvoice?.totalPaid ??
        currentInvoice?.amountPaid ??
        0
    );

    /* =========================================================
       DUE
    ========================================================= */

    const dueAmount = Number(
        currentInvoice?.dueAmount ??
        currentInvoice?.balanceAmount ??
        totalAmount - paidAmount
    );

    /* =========================================================
       STATUS
    ========================================================= */

    const status =
        currentInvoice?.status ||
        "DRAFT";

    const paymentStatus =
        currentInvoice?.paymentStatus ||
        "PENDING";

    /* =========================================================
       RENDER
    ========================================================= */

    if (!currentInvoice) {

        return (
            <div className="w-full rounded-md border border-gray-100 bg-white">

                <div className="flex min-h-[150px] items-center justify-center text-sm text-gray-400">
                    Loading invoice...
                </div>

            </div>
        );

    }

    return (

        <div className="w-full rounded-md border border-gray-100 bg-white">

            {/* =================================================
                INVOICE DETAILS HEADER
            ================================================= */}

            <div className="mb-2 flex items-center justify-left border border-gray-50 px-5">

                <button
                    type="button"
                    onClick={() =>
                        setShowInvoiceDetails(
                            (prev) => !prev
                        )
                    }
                    className="
                        flex
                        w-full
                        cursor-pointer
                        items-center
                        justify-left
                        gap-1
                        border-b
                        border-gray-200
                        py-2
                        text-sm
                        font-semibold
                        uppercase
                        text-gray-600
                        hover:text-gray-700
                    "
                >

                    Invoice Details

                    <ChevronDown
                        size={14}
                        className={`
                            transition-transform
                            ${showInvoiceDetails
                                ? "rotate-180"
                                : ""
                            }
                        `}
                    />

                </button>

            </div>

            {/* =================================================
                DETAILS CONTENT
            ================================================= */}

            {!showInvoiceDetails && (

                <div
                    className="
                        space-y-1
                        border-b
                        border-gray-200
                        px-5
                        py-3
                        text-sm
                        text-gray-600
                    "
                >

                    <div
                        className="
                            rounded-lg
                            border
                            border-gray-200
                            bg-gray-50
                            px-3
                            py-3
                        "
                    >

                        {/* =================================================
                            INVOICE ICON + NUMBER
                        ================================================= */}

                        <div className="mb-4 flex items-center gap-3">

                            <div
                                className="
                                    flex
                                    h-12
                                    w-12
                                    items-center
                                    justify-center
                                    rounded-lg
                                    bg-blue-100
                                    text-blue-600
                                "
                            >

                                <FileText
                                    size={25}
                                />

                            </div>

                            <div>

                                <p className="text-xs text-gray-500">
                                    Invoice Number
                                </p>

                                <p className="font-semibold text-gray-800">
                                    {currentInvoice.invoiceNumber ||
                                        `INV-${currentInvoice.id}`}
                                </p>

                            </div>

                        </div>

                        {/* =================================================
                            CUSTOMER
                        ================================================= */}

                        <div className="space-y-3">

                            <div className="flex items-center justify-between gap-4">

                                <span className="text-gray-500">
                                    Customer
                                </span>

                                <span className="text-right font-medium text-gray-800">
                                    {customerName}
                                </span>

                            </div>

                            {/* DATE */}

                            <div className="flex items-center justify-between gap-4">

                                <span className="text-gray-500">
                                    Invoice Date
                                </span>

                                <span className="text-right font-medium text-gray-800">
                                    {formatDate(
                                        currentInvoice.invoiceDate ||
                                        currentInvoice.date ||
                                        currentInvoice.createdAt
                                    )}
                                </span>

                            </div>

                            {/* STATUS */}

                            <div className="flex items-center justify-between gap-4">

                                <span className="text-gray-500">
                                    Status
                                </span>

                                <span
                                    className="
                                        rounded-md
                                        bg-blue-100
                                        px-2
                                        py-1
                                        text-xs
                                        font-medium
                                        text-blue-700
                                    "
                                >
                                    {status}
                                </span>

                            </div>

                            {/* PAYMENT STATUS */}

                            <div className="flex items-center justify-between gap-4">

                                <span className="text-gray-500">
                                    Payment Status
                                </span>

                                <span
                                    className={`
                                        rounded-md
                                        px-2
                                        py-1
                                        text-xs
                                        font-medium
                                        ${paymentStatus === "PAID"
                                            ? "bg-green-100 text-green-700"
                                            : paymentStatus === "PARTIALLY_PAID"
                                                ? "bg-orange-100 text-orange-700"
                                                : "bg-yellow-100 text-yellow-700"
                                        }
                                    `}
                                >
                                    {paymentStatus}
                                </span>

                            </div>

                        </div>

                        {/* =================================================
                            AMOUNT SUMMARY
                        ================================================= */}

                        <div className="mt-4 border-t border-gray-200 pt-3">

                            <div className="flex items-center justify-between">

                                <span className="text-gray-500">
                                    Total
                                </span>

                                <span className="font-semibold text-gray-800">
                                    ₹{totalAmount.toFixed(2)}
                                </span>

                            </div>

                            <div className="mt-2 flex items-center justify-between">

                                <span className="text-gray-500">
                                    Paid
                                </span>

                                <span className="font-medium text-green-600">
                                    ₹{paidAmount.toFixed(2)}
                                </span>

                            </div>

                            <div className="mt-2 flex items-center justify-between">

                                <span className="font-medium text-gray-600">
                                    Due
                                </span>

                                <span className="font-semibold text-red-600">
                                    ₹{dueAmount.toFixed(2)}
                                </span>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}