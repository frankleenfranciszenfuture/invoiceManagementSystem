import React, { useState } from "react";
import { useSelector } from "react-redux";

import {
    ChevronDown,
    FileText,
    Settings,
} from "lucide-react";

export default function InvoiceSubDetailsOverviewCard() {

    const invoice = useSelector(
        (state) => state.invoice?.invoice
    );

    const existingInvoice = useSelector(
        (state) => state.invoice?.existingInvoice
    );

    const currentInvoice =
        invoice || existingInvoice;

    const [
        showBasicDetails,
        setShowBasicDetails,
    ] = useState(false);

    const [
        showPaymentDetails,
        setShowPaymentDetails,
    ] = useState(false);

    const [
        showInvoiceDetails,
        setShowInvoiceDetails,
    ] = useState(false);

    /* =========================================================
       LOADING
    ========================================================= */

    if (!currentInvoice) {

        return (
            <div className="w-full rounded-md border border-gray-200 bg-white p-5">

                <p className="text-sm text-gray-500">
                    Loading invoice...
                </p>

            </div>
        );

    }

    /* =========================================================
       FORMAT AMOUNT
    ========================================================= */

    const formatAmount = (amount) => {

        if (
            amount === null ||
            amount === undefined ||
            amount === ""
        ) {
            return "₹0.00";
        }

        return `₹${Number(amount).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        )}`;

    };

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
       STATUS
    ========================================================= */

    const statusColor = {

        DRAFT:
            "bg-yellow-100 text-yellow-700",

        SENT:
            "bg-blue-100 text-blue-700",

        PAID:
            "bg-green-100 text-green-700",

        PARTIALLY_PAID:
            "bg-orange-100 text-orange-700",

        PENDING:
            "bg-yellow-100 text-yellow-700",

        OVERDUE:
            "bg-red-100 text-red-700",

        CANCELLED:
            "bg-red-100 text-red-700",

        APPROVED:
            "bg-green-100 text-green-700",

        REJECTED:
            "bg-red-100 text-red-700",

    };

    const status =
        currentInvoice.status?.toUpperCase() ||
        "DRAFT";

    /* =========================================================
       CUSTOMER
    ========================================================= */

    const customerName =
        currentInvoice.customerName ||
        currentInvoice.partyName ||
        currentInvoice.customer?.name ||
        currentInvoice.party?.name ||
        "Walk-in Customer";

    /* =========================================================
       AMOUNTS
    ========================================================= */

    const totalAmount = Number(
        currentInvoice.grandTotal ??
        currentInvoice.totalAmount ??
        currentInvoice.total ??
        0
    );

    const paidAmount = Number(
        currentInvoice.paidAmount ??
        currentInvoice.totalPaid ??
        currentInvoice.amountPaid ??
        0
    );

    const dueAmount = Number(
        currentInvoice.dueAmount ??
        currentInvoice.balanceAmount ??
        totalAmount - paidAmount
    );

    /* =========================================================
       PAYMENT STATUS
    ========================================================= */

    const paymentStatus =
        currentInvoice.paymentStatus ||
        "PENDING";

    /* =========================================================
       INVOICE DATE
    ========================================================= */

    const invoiceDate =
        currentInvoice.invoiceDate ||
        currentInvoice.date ||
        currentInvoice.createdAt;

    /* =========================================================
       RENDER
    ========================================================= */

    return (

        <div className="w-full rounded-md border border-gray-100 bg-white shadow-sm">

            {/* =====================================================
                INVOICE HEADER
            ===================================================== */}

            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">

                <h2 className="text-base font-medium text-gray-800 underline decoration-dotted decoration-gray-300 underline-offset-4">

                    Invoice Overview

                </h2>

                <button
                    type="button"
                    className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                >

                    <FileText
                        className="h-4 w-4 rounded-full bg-blue-600 p-0.5 text-white"
                    />

                    New

                </button>

            </div>

            {/* =====================================================
                INVOICE BASIC INFO
            ===================================================== */}

            <div className="flex items-center gap-3 px-5 pb-4 pt-5">

                {/* Invoice Icon */}

                <div className="flex shrink-0 justify-left">

                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500">

                        <FileText
                            className="h-7 w-7 text-white"
                        />

                    </div>

                </div>

                {/* Invoice Info */}

                <div className="min-w-0 flex-1">

                    <p className="truncate text-xl text-gray-900">

                        {currentInvoice.invoiceNumber ||
                            `INV-${currentInvoice.id}`}

                    </p>

                    <p className="text-sm text-gray-500">

                        {customerName}

                    </p>

                    <p className="text-sm text-gray-500">

                        {formatDate(invoiceDate)}

                    </p>

                </div>

                {/* Settings */}

                <button
                    type="button"
                    className="mb-6 mr-1 flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                >

                    <Settings
                        className="h-5 w-5 cursor-pointer rounded-lg bg-blue-600 p-0.5 text-white"
                    />

                </button>

            </div>

            {/* =====================================================
                STATUS
            ===================================================== */}

            <div className="border-b border-gray-200 px-5 pb-4">

                <span
                    className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${statusColor[status] ||
                        "bg-gray-100 text-gray-700"
                        }`}
                >

                    {currentInvoice.status || "DRAFT"}

                </span>

            </div>

            {/* =====================================================
                DETAILS
            ===================================================== */}

            <div className="rounded-xl border border-gray-100 bg-white">

                {/* =================================================
                    BASIC DETAILS
                ================================================= */}

                <div className="mb-2 flex items-center justify-left border border-gray-50 px-5">

                    <button
                        type="button"
                        onClick={() =>
                            setShowBasicDetails(
                                !showBasicDetails
                            )
                        }
                        className="flex w-full cursor-pointer items-center justify-left gap-1 border-b border-gray-200 py-2 text-sm font-semibold uppercase text-gray-600 hover:text-gray-700"
                    >

                        Basic Details

                        <ChevronDown
                            size={14}
                            className={`transition-transform ${showBasicDetails
                                ? "rotate-180"
                                : ""
                                }`}
                        />

                    </button>

                </div>

                {!showBasicDetails && (

                    <div className="space-y-1 border-b border-gray-200 px-5 py-3 text-sm text-gray-600">

                        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-3">

                            <div className="space-y-4">

                                {/* Invoice Number */}

                                <div className="flex justify-between gap-4">

                                    <span className="font-medium text-gray-700">
                                        Invoice Number
                                    </span>

                                    <span className="text-right text-gray-600">
                                        {currentInvoice.invoiceNumber ||
                                            `INV-${currentInvoice.id}`}
                                    </span>

                                </div>

                                {/* Customer */}

                                <div className="flex justify-between gap-4">

                                    <span className="font-medium text-gray-700">
                                        Customer
                                    </span>

                                    <span className="text-right text-gray-600">
                                        {customerName}
                                    </span>

                                </div>

                                {/* Invoice Date */}

                                <div className="flex justify-between gap-4">

                                    <span className="font-medium text-gray-700">
                                        Invoice Date
                                    </span>

                                    <span className="text-right text-gray-600">
                                        {formatDate(
                                            invoiceDate
                                        )}
                                    </span>

                                </div>

                                {/* Due Date */}

                                <div className="flex justify-between gap-4">

                                    <span className="font-medium text-gray-700">
                                        Due Date
                                    </span>

                                    <span className="text-right text-gray-600">
                                        {formatDate(
                                            currentInvoice.dueDate
                                        )}
                                    </span>

                                </div>

                            </div>

                        </div>

                    </div>

                )}

                {/* =================================================
                    PAYMENT DETAILS
                ================================================= */}

                <div className="mb-2 flex items-center justify-left border border-gray-50 px-5">

                    <button
                        type="button"
                        onClick={() =>
                            setShowPaymentDetails(
                                !showPaymentDetails
                            )
                        }
                        className="flex w-full cursor-pointer items-center justify-left gap-1 border-b border-gray-200 py-2 text-sm font-semibold uppercase text-gray-600 hover:text-gray-700"
                    >

                        Payment Details

                        <ChevronDown
                            size={14}
                            className={`transition-transform ${showPaymentDetails
                                ? "rotate-180"
                                : ""
                                }`}
                        />

                    </button>

                </div>

                {!showPaymentDetails && (

                    <div className="space-y-1 border-b border-gray-200 px-5 py-3 text-sm text-gray-600">

                        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-3">

                            <div className="space-y-4">

                                {/* Total */}

                                <div className="flex justify-between gap-4">

                                    <span className="font-medium text-gray-700">
                                        Total Amount
                                    </span>

                                    <span className="font-medium text-gray-800">
                                        {formatAmount(
                                            totalAmount
                                        )}
                                    </span>

                                </div>

                                {/* Paid */}

                                <div className="flex justify-between gap-4">

                                    <span className="font-medium text-gray-700">
                                        Paid Amount
                                    </span>

                                    <span className="font-medium text-green-600">
                                        {formatAmount(
                                            paidAmount
                                        )}
                                    </span>

                                </div>

                                {/* Due */}

                                <div className="flex justify-between gap-4">

                                    <span className="font-medium text-gray-700">
                                        Due Amount
                                    </span>

                                    <span className="font-medium text-red-600">
                                        {formatAmount(
                                            dueAmount
                                        )}
                                    </span>

                                </div>

                                {/* Payment Status */}

                                <div className="flex justify-between gap-4">

                                    <span className="font-medium text-gray-700">
                                        Payment Status
                                    </span>

                                    <span
                                        className={`rounded-md px-2 py-1 text-xs font-medium ${paymentStatus === "PAID"
                                            ? "bg-green-100 text-green-700"
                                            : paymentStatus ===
                                                "PARTIALLY_PAID"
                                                ? "bg-orange-100 text-orange-700"
                                                : "bg-yellow-100 text-yellow-700"
                                            }`}
                                    >
                                        {paymentStatus}
                                    </span>

                                </div>

                            </div>

                        </div>

                    </div>

                )}

                {/* =================================================
                    INVOICE DETAILS
                ================================================= */}

                <div className="mb-2 flex items-center justify-left border border-gray-50 px-5">

                    <button
                        type="button"
                        onClick={() =>
                            setShowInvoiceDetails(
                                !showInvoiceDetails
                            )
                        }
                        className="flex w-full cursor-pointer items-center justify-left gap-1 border-b border-gray-200 py-2 text-sm font-semibold uppercase text-gray-600 hover:text-gray-700"
                    >

                        Invoice Details

                        <ChevronDown
                            size={14}
                            className={`transition-transform ${showInvoiceDetails
                                ? "rotate-180"
                                : ""
                                }`}
                        />

                    </button>

                </div>

                {!showInvoiceDetails && (

                    <div className="space-y-2 border-gray-200 px-5 py-3 text-sm text-gray-600">

                        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-3">

                            <div className="space-y-4">

                                {/* Invoice Type */}

                                <div className="flex justify-between gap-4">

                                    <span className="font-medium text-gray-700">
                                        Invoice Type
                                    </span>

                                    <span className="text-gray-600">
                                        {currentInvoice.invoiceType ||
                                            currentInvoice.type ||
                                            "-"}
                                    </span>

                                </div>

                                {/* Tax */}

                                <div className="flex justify-between gap-4">

                                    <span className="font-medium text-gray-700">
                                        Tax
                                    </span>

                                    <span className="text-gray-600">
                                        {formatAmount(
                                            currentInvoice.taxAmount
                                        )}
                                    </span>

                                </div>

                                {/* Discount */}

                                <div className="flex justify-between gap-4">

                                    <span className="font-medium text-gray-700">
                                        Discount
                                    </span>

                                    <span className="text-gray-600">
                                        {formatAmount(
                                            currentInvoice.discountAmount
                                        )}
                                    </span>

                                </div>

                                {/* Sub Total */}

                                <div className="flex justify-between gap-4">

                                    <span className="font-medium text-gray-700">
                                        Sub Total
                                    </span>

                                    <span className="font-medium text-gray-800">
                                        {formatAmount(
                                            currentInvoice.subTotal ??
                                            currentInvoice.subtotal
                                        )}
                                    </span>

                                </div>

                                {/* Status */}

                                <div className="flex justify-between gap-4">

                                    <span className="font-medium text-gray-700">
                                        Status
                                    </span>

                                    <span
                                        className={`rounded-md px-2 py-1 text-xs font-medium ${statusColor[status] ||
                                            "bg-gray-100 text-gray-700"
                                            }`}
                                    >

                                        {currentInvoice.status || "-"}

                                    </span>

                                </div>

                            </div>

                        </div>

                    </div>

                )}

            </div>

        </div>
    );
}