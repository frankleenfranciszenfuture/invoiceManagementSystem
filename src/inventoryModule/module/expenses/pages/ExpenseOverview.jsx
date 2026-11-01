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
    XCircle,
    Ban,
} from "lucide-react";

import {
    setExpensesStatus,
    setSelectedExpensesView,
} from "../../expenses/slices/expensesViewSlice";

// ============================================================
// CONSTANTS
// ============================================================

const EMPTY_ARRAY = [];

// ============================================================
// STATUS CARDS
// ============================================================

const STATUS_CARDS = [
    {
        label: "Total Expenses",
        value: "ALL",
        icon: Receipt,
        color: "blue",
    },
    {
        label: "Draft Expenses",
        value: "DRAFT",
        icon: FileText,
        color: "yellow",
    },
    {
        label: "Approved Expenses",
        value: "APPROVED",
        icon: CheckCircle,
        color: "green",
    },
    {
        label: "Rejected Expenses",
        value: "REJECTED",
        icon: XCircle,
        color: "red",
    },
    {
        label: "Cancelled Expenses",
        value: "CANCELLED",
        icon: Ban,
        color: "gray",
    },
];

// ============================================================
// STATUS LABELS
// ============================================================

const STATUS_LABELS = {
    ALL: "All Expenses",
    DRAFT: "Draft Expenses",
    APPROVED: "Approved Expenses",
    REJECTED: "Rejected Expenses",
    CANCELLED: "Cancelled Expenses",
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

export default function ExpenseOverview() {

    const dispatch = useDispatch();

    const navigate = useNavigate();

    // ========================================================
    // REDUX STATE
    // ========================================================

    const expenses = useSelector(
        (state) =>
            Array.isArray(state.expense?.expenses)
                ? state.expense.expenses
                : EMPTY_ARRAY
    );

    const selectedStatus = useSelector(
        (state) =>
            state.expenseView?.expensesStatus || "ALL"
    );

    // ========================================================
    // STATUS SYNCHRONIZATION
    // ========================================================

    useEffect(() => {

        const params = new URLSearchParams(
            window.location.search
        );

        const urlStatus = (
            params.get("expenseStatus") || "ALL"
        ).trim().toUpperCase();

        const status = STATUS_LABELS[urlStatus]
            ? urlStatus
            : "ALL";

        dispatch(setExpensesStatus(status));

        dispatch(
            setSelectedExpensesView(
                STATUS_LABELS[status]
            )
        );

    }, [dispatch]);

    // ========================================================
    // STATISTICS
    // ========================================================

    const statistics = useMemo(() => {

        const result = {
            ALL: expenses.length,
            DRAFT: 0,
            APPROVED: 0,
            REJECTED: 0,
            CANCELLED: 0,
        };

        expenses.forEach((expense) => {

            const status = String(
                expense?.expenseStatus || ""
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

    }, [expenses]);

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

        dispatch(setExpensesStatus(status));

        dispatch(
            setSelectedExpensesView(
                STATUS_LABELS[status]
            )
        );

        navigate(
            `/expenses?expenseStatus=${status}`,
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
                                        : "View expenses"
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
                    {expenses.length} total records
                </p>

            </div>

        </div>
    );
}