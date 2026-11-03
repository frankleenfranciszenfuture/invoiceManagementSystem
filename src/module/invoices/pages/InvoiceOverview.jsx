
import React, {
    useEffect,
    useMemo,
} from "react";

import {
    useSelector,
    useDispatch,
} from "react-redux";

import {
    useNavigate,
} from "react-router-dom";

import {
    FileText,
    CheckCircle,
    Clock,
    Send,
    CircleDollarSign,
    AlertCircle,
    Ban,
} from "lucide-react";

import {
    setInvoiceStatus,
    setSelectedInvoiceView,
} from "../slices/invoiceViewSlice";

/* =========================================================
   CONSTANTS
========================================================= */

const EMPTY_ARRAY = [];

const STATUS_CARDS = [
    {
        label: "Total Invoices",
        value: "ALL",
        icon: FileText,
        color: "blue",
    },
    {
        label: "Approved Invoices",
        value: "APPROVED",
        icon: CheckCircle,
        color: "green",
    },
    {
        label: "Draft Invoices",
        value: "DRAFT",
        icon: Clock,
        color: "yellow",
    },
    {
        label: "Sent Invoices",
        value: "SENT",
        icon: Send,
        color: "purple",
    },
    {
        label: "Paid Invoices",
        value: "PAID",
        icon: CircleDollarSign,
        color: "green",
    },
    {
        label: "Overdue Invoices",
        value: "OVERDUE",
        icon: AlertCircle,
        color: "red",
    },
    {
        label: "Cancelled Invoices",
        value: "CANCELLED",
        icon: Ban,
        color: "gray",
    },
];

const STATUS_LABELS = {
    ALL: "All Invoices",
    APPROVED: "Active Invoices",
    DRAFT: "Draft Invoices",
    SENT: "Sent Invoices",
    PAID: "Paid Invoices",
    OVERDUE: "Overdue Invoices",
    CANCELLED: "Cancel Invoices",
};

const CARD_STYLES = {
    blue: {
        icon: "bg-blue-50 text-blue-600",
        active: "border-blue-500 ring-2 ring-blue-100",
        hover: "hover:border-blue-400",
    },
    green: {
        icon: "bg-green-50 text-green-600",
        active: "border-green-500 ring-2 ring-green-100",
        hover: "hover:border-green-400",
    },
    yellow: {
        icon: "bg-yellow-50 text-yellow-600",
        active: "border-yellow-500 ring-2 ring-yellow-100",
        hover: "hover:border-yellow-400",
    },
    purple: {
        icon: "bg-purple-50 text-purple-600",
        active: "border-purple-500 ring-2 ring-purple-100",
        hover: "hover:border-purple-400",
    },
    red: {
        icon: "bg-red-50 text-red-500",
        active: "border-red-500 ring-2 ring-red-100",
        hover: "hover:border-red-400",
    },
    gray: {
        icon: "bg-gray-100 text-gray-600",
        active: "border-gray-500 ring-2 ring-gray-100",
        hover: "hover:border-gray-400",
    },
};

/* =========================================================
   HELPERS
========================================================= */

const getInvoiceStatus = (invoice) =>
    String(
        invoice?.invoiceStatus ||
        invoice?.status ||
        ""
    ).trim().toUpperCase();

/* =========================================================
   COMPONENT
========================================================= */

export default function InvoiceOverview() {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    /* =====================================================
       REDUX STATE
    ===================================================== */

    const invoices = useSelector(
        (state) =>
            Array.isArray(state.invoice?.invoices)
                ? state.invoice.invoices
                : EMPTY_ARRAY
    );

    const pagination = useSelector(
        (state) => state.invoice?.pagination
    );

    const selectedStatus = useSelector(
        (state) =>
            state.invoiceView?.invoiceStatus || "ALL"
    );

    /* =====================================================
       STATUS SYNCHRONIZATION
    ===================================================== */

    useEffect(() => {

        const params = new URLSearchParams(
            window.location.search
        );

        const urlStatus = (
            params.get("invoiceStatus") || "ALL"
        )
            .trim()
            .toUpperCase();

        const status = STATUS_LABELS[urlStatus]
            ? urlStatus
            : "ALL";

        dispatch(setInvoiceStatus(status));

        dispatch(
            setSelectedInvoiceView(
                STATUS_LABELS[status]
            )
        );

    }, [dispatch]);

    /* =====================================================
       STATISTICS
    ===================================================== */

    const statistics = useMemo(() => {

        const result = {
            ALL: pagination?.totalElements ?? invoices.length,
            APPROVED: 0,
            DRAFT: 0,
            SENT: 0,
            PAID: 0,
            OVERDUE: 0,
            CANCELLED: 0,
        };

        invoices.forEach((invoice) => {

            const status = getInvoiceStatus(invoice);

            if (
                Object.prototype.hasOwnProperty.call(
                    result,
                    status
                )
            ) {
                result[status] += 1;
            }

        });

        return result;

    }, [invoices, pagination?.totalElements]);

    /* =====================================================
       STATUS CARD CLICK
    ===================================================== */

    const handleStatusChange = (status) => {

        if (
            !STATUS_LABELS[status] ||
            status === selectedStatus
        ) {
            return;
        }

        dispatch(setInvoiceStatus(status));

        dispatch(
            setSelectedInvoiceView(
                STATUS_LABELS[status]
            )
        );

        navigate(
            `/invoices?invoiceStatus=${status}`
        );

    };

    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <div className="w-full space-y-5">

            {/* STATUS CARDS */}

            <div className="
                grid w-full grid-cols-1 gap-4
                sm:grid-cols-2 lg:grid-cols-3
                xl:grid-cols-4
            ">

                {STATUS_CARDS.map((card) => {

                    const Icon = card.icon;

                    const active =
                        selectedStatus === card.value;

                    const style =
                        CARD_STYLES[card.color];

                    return (

                        <button
                            type="button"
                            key={card.value}
                            onClick={() =>
                                handleStatusChange(card.value)
                            }
                            className={`
                                group relative overflow-hidden rounded-xl border
                                bg-white p-4 text-left shadow-sm
                                transition-all duration-300
                                hover:-translate-y-1 hover:shadow-lg
                                ${active
                                    ? style.active
                                    : "border-gray-100"
                                }
                                ${style.hover}
                            `}
                        >

                            <div className="
                                flex items-center justify-between
                            ">

                                <div>

                                    <p className="
                                        text-sm font-medium text-gray-500
                                    ">
                                        {card.label}
                                    </p>

                                    <h3 className="
                                        mt-3 text-2xl font-bold text-gray-800
                                    ">
                                        {statistics[card.value] ?? 0}
                                    </h3>

                                </div>

                                <div
                                    className={`
                                        flex h-12 w-12 items-center justify-center
                                        rounded-xl transition-all duration-300
                                        group-hover:scale-110
                                        group-hover:rotate-6
                                        ${style.icon}
                                    `}
                                >
                                    <Icon size={23} />
                                </div>

                            </div>

                            <div className="
                                mt-4 flex items-center justify-between
                            ">

                                <span className="
                                    text-xs text-gray-400
                                ">
                                    {active
                                        ? "Currently selected"
                                        : "View invoices"
                                    }
                                </span>

                                <span className="
                                    text-xs font-semibold text-blue-500
                                    transition-transform group-hover:translate-x-1
                                ">
                                    View →
                                </span>

                            </div>

                        </button>

                    );

                })}

            </div>

            {/* SELECTED STATUS */}

            <div className="
                flex flex-wrap items-center justify-between gap-2
            ">

                <p className="text-sm text-gray-500">

                    Showing:{" "}

                    <span className="
                        font-semibold text-gray-800
                    ">
                        {
                            STATUS_LABELS[selectedStatus] ||
                            STATUS_LABELS.ALL
                        }
                    </span>

                </p>

                <p className="text-xs text-gray-400">
                    {statistics.ALL} total records
                </p>

            </div>

        </div>
    );
}
