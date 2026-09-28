
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
    fetchInvoices,
    removeInvoice,
} from "../thunks/invoiceThunks";

import {
    setExistingInvoice,
} from "../slices/invoiceSlices";

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

    const handleEdit = (invoice) => {

        try {

            dispatch(
                openModal({
                    type: "editInvoice",
                    data: invoice,
                })
            );

        } catch (error) {

            toast.error(
                "Failed to open invoice"
            );
        }
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

        <div
            className="
                bg-white
                rounded-xl
                border
                border-gray-200
                overflow-visible
                w-full
            "
        >

            <div
                className="
                    w-full
                    overflow-visible
                "
            >

                <table
                    className="
                        w-full
                        table-fixed
                        border-collapse
                    "
                >

                    {/* =================================================
                        TABLE HEADER
                    ================================================= */}

                    <thead
                        className="
                            bg-gray-100
                            border-b
                            border-gray-300
                        "
                    >

                        <tr>

                            <th
                                className="
                                    w-[18%]
                                    px-2
                                    py-3
                                    font-medium
                                    text-sm
                                    text-gray-600
                                    uppercase
                                    text-left
                                "
                            >
                                Invoice
                            </th>

                            <th
                                className="
                                    w-[16%]
                                    px-2
                                    py-3
                                    font-medium
                                    text-sm
                                    text-gray-600
                                    uppercase
                                    text-left
                                "
                            >
                                Customer
                            </th>

                            <th
                                className="
                                    w-[11%]
                                    px-2
                                    py-3
                                    font-medium
                                    text-sm
                                    text-gray-600
                                    uppercase
                                    text-left
                                "
                            >
                                Invoice Type
                            </th>

                            <th
                                className="
                                    w-[11%]
                                    px-2
                                    py-3
                                    font-medium
                                    text-sm
                                    text-gray-600
                                    uppercase
                                    text-left
                                "
                            >
                                Invoice Date
                            </th>

                            <th
                                className="
                                    w-[10%]
                                    px-2
                                    py-3
                                    font-medium
                                    text-sm
                                    text-gray-600
                                    uppercase
                                    text-right
                                "
                            >
                                Taxable
                            </th>

                            <th
                                className="
                                    w-[9%]
                                    px-2
                                    py-3
                                    font-medium
                                    text-sm
                                    text-gray-600
                                    uppercase
                                    text-right
                                "
                            >
                                Tax
                            </th>

                            <th
                                className="
                                    w-[11%]
                                    px-2
                                    py-3
                                    font-medium
                                    text-sm
                                    text-gray-600
                                    uppercase
                                    text-right
                                "
                            >
                                Total
                            </th>

                            <th
                                className="
                                    w-[9%]
                                    px-2
                                    py-3
                                    font-medium
                                    text-sm
                                    text-gray-600
                                    uppercase
                                    text-left
                                "
                            >
                                Status
                            </th>

                            <th
                                className="
                                    w-[5%]
                                    px-2
                                    py-3
                                    font-medium
                                    text-sm
                                    text-gray-600
                                    uppercase
                                    text-right
                                "
                            >
                                Actions
                            </th>

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
                            .map(
                                (
                                    invoice,
                                    index
                                ) => {

                                    const invoiceNumber =
                                        getInvoiceNumber(
                                            invoice
                                        );

                                    const customerName =
                                        getCustomerName(
                                            invoice
                                        );

                                    const totalAmount =
                                        getTotalAmount(
                                            invoice
                                        );

                                    const taxableAmount =
                                        invoice.taxableAmount ??
                                        invoice.subTotal ??
                                        invoice.subtotal ??
                                        0;

                                    const taxAmount =
                                        invoice.totalTax ??
                                        invoice.taxAmount ??
                                        (
                                            Number(
                                                invoice.cgstAmount || 0
                                            ) +
                                            Number(
                                                invoice.sgstAmount || 0
                                            ) +
                                            Number(
                                                invoice.igstAmount || 0
                                            )
                                        );

                                    return (

                                        <tr
                                            key={
                                                invoice.id ||
                                                index
                                            }
                                            className="
                                                border-b
                                                border-gray-100
                                                hover:bg-gray-50
                                                text-sm
                                                cursor-pointer
                                                transition-colors
                                            "
                                        >

                                            {/* =================================
                                                INVOICE
                                            ================================= */}

                                            <td
                                                className="
                                                    px-2
                                                    py-3
                                                    overflow-hidden
                                                "
                                            >

                                                <div
                                                    className="
                                                        flex
                                                        items-center
                                                        gap-2
                                                        min-w-0
                                                    "
                                                >

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
                                                        {
                                                            initials(
                                                                invoiceNumber
                                                            )
                                                        }
                                                    </div>

                                                    <div
                                                        className="
                                                            min-w-0
                                                        "
                                                    >

                                                        <p
                                                            className="
                                                                font-medium
                                                                text-gray-800
                                                                truncate
                                                            "
                                                            title={
                                                                invoiceNumber
                                                            }
                                                        >
                                                            {
                                                                invoiceNumber
                                                            }
                                                        </p>

                                                        <p
                                                            className="
                                                                text-xs
                                                                text-gray-500
                                                            "
                                                        >
                                                            ID: #
                                                            {
                                                                invoice.id
                                                            }
                                                        </p>

                                                    </div>

                                                </div>

                                            </td>


                                            {/* =================================
                                                CUSTOMER
                                            ================================= */}

                                            <td
                                                className="
                                                    px-2
                                                    py-3
                                                    overflow-hidden
                                                "
                                            >

                                                <p
                                                    className="
                                                        font-medium
                                                        text-gray-800
                                                        truncate
                                                    "
                                                    title={
                                                        customerName
                                                    }
                                                >
                                                    {
                                                        customerName
                                                    }
                                                </p>

                                                <p
                                                    className="
                                                        text-xs
                                                        text-gray-500
                                                        truncate
                                                    "
                                                >
                                                    {
                                                        invoice.customerCode ||
                                                        invoice.customer?.customerCode ||
                                                        invoice.partyCode ||
                                                        "—"
                                                    }
                                                </p>

                                            </td>


                                            {/* =================================
                                                INVOICE TYPE
                                            ================================= */}

                                            <td
                                                className="
                                                    px-2
                                                    py-3
                                                    overflow-hidden
                                                "
                                            >

                                                <span
                                                    className={`
                                                        inline-block
                                                        max-w-full
                                                        px-2
                                                        py-1
                                                        rounded-full
                                                        text-xs
                                                        font-medium
                                                        truncate
                                                        ${invoiceTypeColor[
                                                        invoice.invoiceType
                                                        ] ||
                                                        "bg-gray-100 text-gray-700"
                                                        }
                                                    `}
                                                    title={
                                                        invoice.invoiceType ||
                                                        ""
                                                    }
                                                >
                                                    {
                                                        invoice.invoiceType ||
                                                        "—"
                                                    }
                                                </span>

                                            </td>


                                            {/* =================================
                                                DATE
                                            ================================= */}

                                            <td
                                                className="
                                                    px-2
                                                    py-3
                                                    whitespace-nowrap
                                                "
                                            >
                                                {
                                                    formatDate(
                                                        invoice.invoiceDate ||
                                                        invoice.date ||
                                                        invoice.createdAt
                                                    )
                                                }
                                            </td>


                                            {/* =================================
                                                TAXABLE AMOUNT
                                            ================================= */}

                                            <td
                                                className="
                                                    px-2
                                                    py-3
                                                    text-right
                                                    whitespace-nowrap
                                                "
                                            >
                                                ₹
                                                {formatAmount(
                                                    taxableAmount
                                                )}
                                            </td>


                                            {/* =================================
                                                TAX
                                            ================================= */}

                                            <td
                                                className="
                                                    px-2
                                                    py-3
                                                    text-right
                                                    whitespace-nowrap
                                                "
                                            >
                                                ₹
                                                {formatAmount(
                                                    taxAmount
                                                )}
                                            </td>


                                            {/* =================================
                                                TOTAL
                                            ================================= */}

                                            <td
                                                className="
                                                    px-2
                                                    py-3
                                                    text-right
                                                    font-medium
                                                    whitespace-nowrap
                                                "
                                            >
                                                ₹
                                                {formatAmount(
                                                    totalAmount
                                                )}
                                            </td>


                                            {/* =================================
                                                STATUS
                                            ================================= */}

                                            <td
                                                className="
                                                    px-2
                                                    py-3
                                                    overflow-hidden
                                                "
                                            >

                                                <span
                                                    className={`
                                                        inline-block
                                                        px-2
                                                        py-1
                                                        rounded-full
                                                        text-xs
                                                        font-medium
                                                        ${statusColor[
                                                        invoice.status
                                                        ] ||
                                                        "bg-gray-100 text-gray-700"
                                                        }
                                                    `}
                                                >
                                                    {
                                                        invoice.status ||
                                                        "—"
                                                    }
                                                </span>

                                            </td>


                                            {/* =================================
                                                ACTIONS
                                            ================================= */}

                                            <td
                                                className="
                                                    relative
                                                    overflow-visible
                                                    px-2
                                                    py-3
                                                "
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >

                                                <div
                                                    className="
                                                        flex
                                                        justify-end
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            relative
                                                            group
                                                            inline-block
                                                        "
                                                    >

                                                        {/* ACTION BUTTON */}

                                                        <button
                                                            type="button"
                                                            className="
                                                                p-1
                                                                rounded-full
                                                                bg-blue-500
                                                                text-white
                                                                hover:bg-blue-600
                                                                transition-colors
                                                            "
                                                        >

                                                            <ChevronDown
                                                                size={16}
                                                            />

                                                        </button>


                                                        {/* =========================
                                                            ACTION MENU
                                                        ========================= */}

                                                        <div
                                                            className="
                                                                absolute
                                                                right-0
                                                                top-full
                                                                mt-1
                                                                z-[9999]
                                                                opacity-0
                                                                invisible
                                                                group-hover:opacity-100
                                                                group-hover:visible
                                                                transition-all
                                                                duration-150
                                                            "
                                                        >

                                                            <div
                                                                className="
                                                                    w-36
                                                                    rounded-md
                                                                    bg-blue-500
                                                                    shadow-lg
                                                                    overflow-hidden
                                                                "
                                                            >

                                                                {/* VIEW */}

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleView(
                                                                            invoice
                                                                        )
                                                                    }
                                                                    className="
                                                                        flex
                                                                        w-full
                                                                        items-center
                                                                        gap-2
                                                                        px-4
                                                                        py-2
                                                                        text-sm
                                                                        text-white
                                                                        hover:bg-blue-600
                                                                        transition-colors
                                                                    "
                                                                >

                                                                    <Eye
                                                                        size={16}
                                                                    />

                                                                    View

                                                                </button>


                                                                {/* EDIT */}

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleEdit(
                                                                            invoice
                                                                        )
                                                                    }
                                                                    className="
                                                                        flex
                                                                        w-full
                                                                        items-center
                                                                        gap-2
                                                                        px-4
                                                                        py-2
                                                                        text-sm
                                                                        text-white
                                                                        hover:bg-blue-600
                                                                        transition-colors
                                                                    "
                                                                >

                                                                    <Edit
                                                                        size={16}
                                                                    />

                                                                    Edit

                                                                </button>


                                                                {/* DELETE */}

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            invoice.id
                                                                        )
                                                                    }
                                                                    className="
                                                                        flex
                                                                        w-full
                                                                        items-center
                                                                        gap-2
                                                                        px-4
                                                                        py-2
                                                                        text-sm
                                                                        text-white
                                                                        hover:bg-red-600
                                                                        transition-colors
                                                                    "
                                                                >

                                                                    <Trash2
                                                                        size={16}
                                                                    />

                                                                    Delete

                                                                </button>

                                                            </div>

                                                        </div>

                                                    </div>

                                                </div>

                                            </td>

                                        </tr>

                                    );
                                }
                            )}

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
                                bg-indigo-600
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

        </div>
    );
}
