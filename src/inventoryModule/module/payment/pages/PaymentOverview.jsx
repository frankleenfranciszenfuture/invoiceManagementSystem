import React, { useEffect, useMemo } from "react";

import {
    useDispatch,
    useSelector,
} from "react-redux";

import { useNavigate } from "react-router-dom";

import {
    Receipt,
    FileText,
    CheckCircle,
    Clock,
    XCircle,
    RotateCcw,
} from "lucide-react";

import {
    setPaymentsStatus,
    setSelectedPaymentsView,
} from "../slices/paymentsViewSlice";

// ============================================================
// CONSTANTS
// ============================================================

const EMPTY_ARRAY = [];

// ============================================================
// STATUS CARDS
// ============================================================

const STATUS_CARDS = [
    {
        label: "Total Payments",
        value: "ALL",
        icon: Receipt,
        color: "blue",
    },
    {
        label: "Completed Payments",
        value: "COMPLETED",
        icon: CheckCircle,
        color: "green",
    },
    {
        label: "Pending Payments",
        value: "PENDING",
        icon: Clock,
        color: "yellow",
    },
    {
        label: "Failed Payments",
        value: "FAILED",
        icon: XCircle,
        color: "red",
    },
    {
        label: "Reversed Payments",
        value: "REVERSED",
        icon: RotateCcw,
        color: "gray",
    },
];

// ============================================================
// STATUS LABELS
// ============================================================

const STATUS_LABELS = {
    ALL: "All Payments",
    COMPLETED: "Completed Payments",
    PENDING: "Pending Payments",
    FAILED: "Failed Payments",
    REVERSED: "Reversed Payments",
};

// ============================================================
// CARD STYLES
// ============================================================

const CARD_STYLES = {
    blue: {
        icon: "bg-blue-50 text-blue-600",
        active: "border-blue-500 ring-2 ring-blue-100",
        hover: "hover:border-blue-400",
    },
    yellow: {
        icon: "bg-yellow-50 text-yellow-600",
        active: "border-yellow-500 ring-2 ring-yellow-100",
        hover: "hover:border-yellow-400",
    },
    green: {
        icon: "bg-green-50 text-green-600",
        active: "border-green-500 ring-2 ring-green-100",
        hover: "hover:border-green-400",
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

// ============================================================
// COMPONENT
// ============================================================

export default function PaymentOverview() {

    const dispatch = useDispatch();

    const navigate = useNavigate();

    // ========================================================
    // REDUX STATE
    // ========================================================

    const payments = useSelector(
        (state) =>
            Array.isArray(state.payment?.payments)
                ? state.payment.payments
                : EMPTY_ARRAY
    );

    const selectedStatus = useSelector(
        (state) =>
            state.paymentsView?.paymentsStatus || "ALL"
    );

    // ========================================================
    // STATUS SYNCHRONIZATION
    // ========================================================

    useEffect(() => {

        const params = new URLSearchParams(
            window.location.search
        );

        const urlStatus = (
            params.get("paymentStatus") || "ALL"
        ).trim().toUpperCase();

        const status = STATUS_LABELS[urlStatus]
            ? urlStatus
            : "ALL";

        dispatch(setPaymentsStatus(status));

        dispatch(
            setSelectedPaymentsView(
                STATUS_LABELS[status]
            )
        );

    }, [dispatch]);

    // ========================================================
    // STATISTICS
    // ========================================================

    const statistics = useMemo(() => {

        const result = {
            ALL: payments.length,
            COMPLETED: 0,
            PENDING: 0,
            FAILED: 0,
            REVERSED: 0,
        };

        payments.forEach((payment) => {

            const status = String(
                payment?.paymentStatus || ""
            )
                .trim()
                .toUpperCase();

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

    }, [payments]);

    // ========================================================
    // STATUS CARD CLICK
    // ========================================================

    const handleStatusChange = (status) => {

        if (
            !STATUS_LABELS[status] ||
            status === selectedStatus
        ) {
            return;
        }

        dispatch(setPaymentsStatus(status));

        dispatch(
            setSelectedPaymentsView(
                STATUS_LABELS[status]
            )
        );

        navigate(
            `/invoice/payments?paymentStatus=${status}`,
            { replace: false }
        );
    };

    // ========================================================
    // RENDER
    // ========================================================

    return (

        <div className="w-full space-y-5">

            {/* STATUS CARDS */}

            <div className="
                grid w-full grid-cols-1 gap-4
                sm:grid-cols-2 lg:grid-cols-3
                xl:grid-cols-5
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
                                        : "View payments"
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
                    {payments.length} total records
                </p>

            </div>

        </div>
    );
}