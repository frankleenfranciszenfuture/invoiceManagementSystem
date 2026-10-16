
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
    fetchInvoices,
    removeInvoice,
} from "../thunks/invoiceThunks";

import {
    setExistingInvoice,
} from "../slices/invoiceSlice";

import { openModal } from "../../ui/uiSlice";

import {
    ChevronDown,
    Edit,
    Trash2,
    Receipt,
    Eye,
} from "lucide-react";

import toast from "react-hot-toast";

export default function InvoiceTable({
    invoices = [],
}) {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [showEdit, setShowEdit] = useState(false);
    const [showView, setShowView] = useState(false);
    /* =====================================================
       REDUX STATE
    ===================================================== */

    const {
        loading,
        error,
        pagination,
    } = useSelector(
        (state) => state.invoice || {}
    );

    const {
        pageNumber,
        pageSize,
        totalPages,
        totalElements,
    } = pagination || {};

    const currentInvoices =
        invoices || [];

    /* =====================================================
       DELETE INVOICE
    ===================================================== */

    const handleDelete = async (id) => {

        if (
            !window.confirm(
                "Delete this invoice?"
            )
        ) {
            return;
        }

        try {

            await dispatch(
                removeInvoice(id)
            ).unwrap();

            toast.success(
                "Invoice deleted successfully"
            );

            dispatch(
                fetchInvoices({
                    page: Number(pageNumber) || 0,
                    size: Number(pageSize) || 20,
                })
            );

        } catch (error) {

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    "Failed to delete invoice"
            );
        }
    };

    /* =====================================================
       VIEW INVOICE
    ===================================================== */

    const handleView = (invoice) => {

        try {

            dispatch(
                setExistingInvoice(
                    invoice
                )
            );

            navigate(
                `/invoices/view/${invoice.id}`
            );

        } catch (error) {

            toast.error(
                "Failed to open invoice"
            );
        }
    };

    /* =====================================================
       EDIT INVOICE
    ===================================================== */

    const handleEditInvoice = (invoice) => {
        const invoiceType = invoice.invoiceType;

        const editRoutes = {
            PRODUCT_INVOICE: `/invoices/product/edit/${invoice.id}`,
            SERVICE_INVOICE: `/invoices/service/edit/${invoice.id}`,
            SALE_INVOICE: `/invoices/sale/edit/${invoice.id}`,
            PURCHASE_INVOICE: `/invoices/purchase/edit/${invoice.id}`,
            TAX_INVOICE: `/invoices/tax/edit/${invoice.id}`,
        };

        const path = editRoutes[invoiceType];

        if (!path) {
            toast.error("Invalid invoice type");
            return;
        }

        navigate(path, {
            state: { invoiceType },
        });
    };

    /* =====================================================
       INVOICE INITIALS
    ===================================================== */

    const initials = (
        invoiceNumber
    ) =>
        invoiceNumber
            ?.split(" ")
            .map(
                (word) =>
                    word[0]
            )
            .join("")
            .slice(0, 2)
            .toUpperCase() ||
        "IN";

    /* =====================================================
       STATUS COLORS
    ===================================================== */

    const statusColor = {

        DRAFT:
            "bg-yellow-100 text-yellow-700",

        SENT:
            "bg-blue-100 text-blue-700",

        PENDING:
            "bg-orange-100 text-orange-700",

        ACTIVE:
            "bg-green-100 text-green-700",

        INACTIVE:
            "bg-gray-100 text-gray-700",

        PAID:
            "bg-green-100 text-green-700",

        OVERDUE:
            "bg-red-100 text-red-700",

        CANCELLED:
            "bg-red-100 text-red-700",

        CLOSED:
            "bg-gray-100 text-gray-700",

        APPROVED:
            "bg-blue-100 text-blue-700",

    };

    /* =====================================================
       INVOICE TYPE COLORS
    ===================================================== */

    const invoiceTypeColor = {

        SALE:
            "bg-green-100 text-green-700",

        SALE_INVOICE:
            "bg-green-100 text-green-700",

        PURCHASE:
            "bg-blue-100 text-blue-700",

        PURCHASE_INVOICE:
            "bg-blue-100 text-blue-700",

        STOCK_TRANSFER:
            "bg-purple-100 text-purple-700",

    };

    /* =====================================================
       AVATAR COLORS
    ===================================================== */

    const avatarColors = [

        "bg-pink-500 text-white",
        "bg-green-500 text-white",
        "bg-blue-500 text-white",
        "bg-purple-500 text-white",
        "bg-orange-500 text-white",
        "bg-cyan-500 text-white",
        "bg-indigo-500 text-white",

    ];

    const getAvatarColor = (
        name = ""
    ) => {

        const index =
            name
                .split("")
                .reduce(
                    (
                        acc,
                        char
                    ) =>
                        acc +
                        char.charCodeAt(0),
                    0
                ) %
            avatarColors.length;

        return avatarColors[index];
    };

    /* =====================================================
       FORMAT MONEY
    ===================================================== */

    const formatAmount = (
        value
    ) => {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "0.00";
        }

        return Number(value).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        );
    };

    /* =====================================================
       FORMAT DATE
    ===================================================== */

    const formatDate = (
        value
    ) => {

        if (!value) {
            return "—";
        }

        try {

            return new Date(
                value
            ).toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                }
            );

        } catch {

            return value;
        }
    };

    /* =====================================================
       CUSTOMER NAME
    ===================================================== */

    const getCustomerName = (
        invoice
    ) => {

        return (
            invoice.customerName ||
            invoice.customer?.customerName ||
            invoice.customer?.name ||
            invoice.partyName ||
            invoice.party?.partyName ||
            invoice.party?.name ||
            "—"
        );
    };

    /* =====================================================
       INVOICE NUMBER
    ===================================================== */

    const getInvoiceNumber = (
        invoice
    ) => {

        return (
            invoice.invoiceNumber ||
            invoice.invoiceNo ||
            invoice.code ||
            `INV-${invoice.id || "—"}`
        );
    };

    /* =====================================================
       TOTAL AMOUNT
    ===================================================== */

    const getTotalAmount = (
        invoice
    ) => {

        return (
            invoice.totalAmount ??
            invoice.grandTotal ??
            invoice.netAmount ??
            invoice.total ??
            0
        );
    };



    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {

        return (

            <div
                className="
                    flex
                    items-center
                    justify-center
                    py-10
                "
            >

                <p className="text-gray-500">
                    Loading invoices...
                </p>

            </div>
        );
    }

    /* =====================================================
       ERROR
    ===================================================== */

    if (error) {

        return (

            <div
                className="
                    bg-white
                    rounded-xl
                    border
                    border-red-200
                    p-8
                    text-center
                "
            >

                <p className="text-red-500">
                    {error}
                </p>

            </div>
        );
    }

    /* =====================================================
       EMPTY STATE
    ===================================================== */

    if (!currentInvoices.length) {

        return (

            <div
                className="
                    bg-white
                    rounded-2xl
                    border
                    border-gray-200
                    p-8
                    text-center
                "
            >

                <Receipt
                    className="
                        mx-auto
                        mb-3
                        h-10
                        w-10
                        text-gray-300
                    "
                />

                <p className="text-gray-500">
                    No invoices found.
                </p>

            </div>
        );
    }


    /* =====================================================
       TABLE
    ===================================================== */

    return (

        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto overflow-y-visible">
            <div className="overflow-x-auto overflow-y-visible">


                <table className="w-full min-w-[1200px] border-collapse table-fixed">


                    <thead className="bg-[#E5DFD6]/20 border-b border-gray-300">

                        <tr>

                            {[
                                "Invoice",
                                "Customer",
                                "Invoice Type",
                                "Invoice Date",
                                "Taxable",
                                "Total",
                                "Status",
                                "Actions",
                            ].map((header) => (

                                <th
                                    key={header}
                                    className={`
                                    px-5
                                    py-3
                                    font-medium
                                    text-sm
                                    text-[#0F4659]/90
                                    uppercase
                                    ${header === "Actions"
                                            ? "text-right"
                                            : "text-left"
                                        }
                                `}
                                >
                                    {header}
                                </th>

                            ))}

                        </tr>

                    </thead>


                    {/* =================================================
        TABLE BODY
    ================================================= */}

                    <tbody>

                        {[...currentInvoices]
                            .sort(
                                (a, b) =>
                                    (a.id || 0) -
                                    (b.id || 0)
                            )
                            .map((invoice, index) => {

                                const invoiceNumber =
                                    getInvoiceNumber(invoice);

                                const customerName =
                                    getCustomerName(invoice);

                                const totalAmount =
                                    getTotalAmount(invoice);

                                const taxableAmount =
                                    invoice.taxableAmount ??
                                    invoice.subTotal ??
                                    invoice.subtotal ??
                                    0;

                                const taxAmount =
                                    invoice.totalTax ??
                                    invoice.taxAmount ??
                                    (
                                        Number(invoice.cgstAmount || 0) +
                                        Number(invoice.sgstAmount || 0) +
                                        Number(invoice.igstAmount || 0)
                                    );

                                const invoiceStatus =
                                    invoice.status ||
                                    invoice.invoiceStatus ||
                                    "DRAFT";

                                const currencyCode = String(
                                    invoice?.currency?.code ||
                                    invoice?.currencyCode ||
                                    invoice?.currency?.currencyCode ||
                                    "INR"
                                ).toUpperCase();

                                const currencySymbol =
                                    invoice?.currency?.symbol ||
                                    invoice?.currencySymbol ||
                                    ({
                                        INR: "₹",
                                        USD: "$",
                                        EUR: "€",
                                        GBP: "£",
                                        AED: "د.إ",
                                        JPY: "¥",
                                        AUD: "A$",
                                        CAD: "C$",
                                    }[currencyCode] || currencyCode);

                                const currencyColor = {
                                    INR: "text-blue-700",
                                    "₹": "text-blue-700",

                                    USD: "text-emerald-700",
                                    "$": "text-emerald-700",

                                    EUR: "text-violet-700",
                                    "€": "text-violet-700",

                                    GBP: "text-rose-700",
                                    "£": "text-rose-700",

                                    AED: "text-amber-700",
                                    "د.إ": "text-amber-700",

                                    JPY: "text-pink-700",
                                    "¥": "text-pink-700",

                                    AUD: "text-teal-700",
                                    "A$": "text-teal-700",

                                    CAD: "text-indigo-700",
                                    "C$": "text-indigo-700",
                                };

                                const symbolColor =
                                    currencyColor[currencyCode] ||
                                    currencyColor[currencySymbol] ||
                                    "text-gray-600";

                                return (
                                    <tr
                                        key={
                                            invoice.id ||
                                            index
                                        }
                                        onClick={() => handleView(invoice)}
                                        className="
                                                border-b
                                                border-gray-100
                                                hover:bg-gray-50
                                                text-sm
                                                cursor-pointer
                                                transition-colors
                                            "
                                    >

                                        {/* INVOICE */}

                                        <td className="px-3 py-3 align-middle">
                                            <div className="flex items-center gap-2 min-w-0">

                                                <div
                                                    className={`
                                    w-9
                                    h-9
                                    min-w-[36px]
                                    rounded-full
                                    flex
                                    items-center
                                    justify-center
                                    text-sm
                                    font-bold
                                    ${getAvatarColor(
                                                        invoiceNumber
                                                    )}
                                `}
                                                >
                                                    {initials(invoiceNumber)}
                                                </div>

                                                <div className="min-w-0">

                                                    <p
                                                        className="
                                        font-medium
                                        text-gray-800
                                        truncate
                                    "
                                                        title={invoiceNumber}
                                                    >
                                                        {invoiceNumber}
                                                    </p>

                                                    <p className="text-xs text-gray-500 truncate">
                                                        ID: #{invoice.id}
                                                    </p>

                                                </div>

                                            </div>
                                        </td>


                                        {/* CUSTOMER */}

                                        <td className="px-3 py-3 align-middle">
                                            <div className="min-w-0">

                                                <p
                                                    className="
                                    font-medium
                                    text-gray-800
                                    truncate
                                "
                                                    title={customerName}
                                                >
                                                    {customerName}
                                                </p>

                                                <p className="text-xs text-gray-500 truncate">
                                                    {
                                                        invoice.customerCode ||
                                                        invoice.customer?.customerCode ||
                                                        invoice.partyCode ||
                                                        "—"
                                                    }
                                                </p>

                                            </div>
                                        </td>


                                        {/* TYPE */}

                                        <td className="px-3 py-3 align-middle">

                                            <span
                                                className={`
                                inline-flex
                                max-w-full
                                px-2.5
                                py-1
                                rounded-full
                                text-xs
                                font-medium
                                whitespace-nowrap
                                overflow-hidden
                                text-ellipsis
                                ${invoiceTypeColor[
                                                    invoice.invoiceType
                                                    ] ||
                                                    "bg-gray-100 text-gray-700"
                                                    }
                            `}
                                                title={
                                                    invoice.invoiceType || ""
                                                }
                                            >
                                                {invoice.invoiceType || "—"}
                                            </span>

                                        </td>


                                        {/* DATE */}

                                        <td className="px-3 py-3 align-middle whitespace-nowrap">
                                            {formatDate(
                                                invoice.invoiceDate ||
                                                invoice.date ||
                                                invoice.createdAt
                                            )}
                                        </td>


                                        {/* TAXABLE */}

                                        <td className="px-3 py-3 align-middle whitespace-nowrap">
                                            <span className={`font-medium ${symbolColor}`}>
                                                {currencySymbol}
                                            </span>{" "}
                                            {formatAmount(taxableAmount)}
                                        </td>




                                        {/* TOTAL */}

                                        <td
                                            className="
                                            px-3
                                            py-3
                                            align-middle
                                        
                                            whitespace-nowrap
                                            font-medium
                                        "
                                        >

                                            <span className={`font-medium ${symbolColor}`}>
                                                {currencySymbol}
                                            </span>{" "}
                                            {formatAmount(totalAmount)}
                                        </td>


                                        {/* STATUS */}

                                        <td

                                            className="
                            px-3
                            py-3
                            align-middle
                         
                            whitespace-nowrap
                        "
                                        >
                                            <span
                                                className={`
                                                        inline-flex
                                                        items-center
                                                        justify-center
                                                        min-w-[80px]
                                                        px-2.5
                                                        py-1
                                                        rounded-full
                                                        text-xs
                                                        font-medium
                                                        whitespace-nowrap
                                                        ${statusColor[invoiceStatus] ||
                                                    "bg-gray-100 text-gray-700"}
                                                     `}
                                            >
                                                {invoiceStatus}
                                            </span>
                                        </td>
                                        {/* ACTIONS */}

                                        {/* Actions */}
                                        <td className="px-2 py-2">
                                            <div className="flex items-center justify-end gap-2">

                                                {/* View */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowView(true);
                                                        dispatch(setExistingInvoice(invoice));
                                                        navigate(`/invoices/view/${invoice.id}`);
                                                    }}
                                                    title="View"
                                                    className="
                                                    flex h-8 w-8 items-center justify-center
                                                    rounded-lg
                                                    bg-blue-50
                                                    text-blue-600
                                                    transition
                                                    hover:bg-blue-100
                                                    hover:text-blue-700
                                                "
                                                >
                                                    <Eye size={16} />
                                                </button>

                                                {/* Edit */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowEdit(true);
                                                        dispatch(setExistingInvoice(invoice));
                                                        handleEditInvoice(invoice);
                                                    }}
                                                    title="Edit"
                                                    className="
                                                        flex h-8 w-8 items-center justify-center
                                                        rounded-lg
                                                        bg-amber-50
                                                        text-amber-600
                                                        transition
                                                        hover:bg-amber-100
                                                        hover:text-amber-700
                                                    "
                                                >
                                                    <Edit size={16} />
                                                </button>

                                                {/* Delete */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();

                                                        // Your delete confirmation logic
                                                        handleDelete(invoice.id);
                                                    }}
                                                    title="Delete"
                                                    className="
                                                        flex h-8 w-8 items-center justify-center
                                                        rounded-lg
                                                        bg-red-50
                                                        text-red-600
                                                        transition
                                                        hover:bg-red-100
                                                        hover:text-red-700
                                                    "
                                                >
                                                    <Trash2 size={16} />
                                                </button>

                                            </div>
                                        </td>

                                    </tr>
                                );
                            })}

                    </tbody>



                </table>

                {/* =====================================================
                    PAGINATION
                ===================================================== */}

                <div
                    className="
                        p-4
                        border-t
                        border-gray-100
                        flex
                        items-center
                        justify-between
                    "
                >

                    <p
                        className="
                            text-sm
                            text-gray-500
                        "
                    >

                        Showing{" "}

                        {currentInvoices.length}

                        {" "}of{" "}

                        {totalElements || 0}

                        {" "}invoices

                    </p>


                    <div
                        className="
                            flex
                            items-center
                            gap-3
                        "
                    >

                        {/* PREVIOUS */}

                        <button
                            type="button"
                            disabled={
                                Number(pageNumber) <= 0
                            }
                            onClick={() => {

                                const nextPage =
                                    Math.max(
                                        0,
                                        (
                                            Number(
                                                pageNumber
                                            ) || 0
                                        ) - 1
                                    );

                                dispatch(
                                    fetchInvoices({
                                        page: nextPage,
                                        size:
                                            Number(
                                                pageSize
                                            ) || 20,
                                    })
                                );

                            }}
                            className="
                                text-sm
                                text-gray-400
                                hover:text-gray-600
                                disabled:opacity-50
                                disabled:cursor-not-allowed
                            "
                        >
                            Previous
                        </button>


                        {/* CURRENT PAGE */}

                        <span
                            className="
                                w-8
                                h-8
                                flex
                                items-center
                                justify-center
                                rounded-lg
                               bg-[#754DD2]
                                text-white
                                text-sm
                                font-medium
                            "
                        >

                            {(Number(pageNumber) || 0) + 1}

                        </span>


                        {/* NEXT */}

                        <button
                            type="button"
                            disabled={
                                (Number(pageNumber) || 0) >=
                                (Number(totalPages) || 1) - 1
                            }
                            onClick={() => {

                                const nextPage =
                                    (
                                        Number(
                                            pageNumber
                                        ) || 0
                                    ) + 1;

                                dispatch(
                                    fetchInvoices({
                                        page: nextPage,
                                        size:
                                            Number(
                                                pageSize
                                            ) || 20,
                                    })
                                );

                            }}
                            className="
                                text-sm
                                text-gray-400
                                hover:text-gray-600
                                disabled:opacity-50
                                disabled:cursor-not-allowed
                            "
                        >
                            Next
                        </button>

                    </div>

                </div>

            </div>

        </div >
    );
}
