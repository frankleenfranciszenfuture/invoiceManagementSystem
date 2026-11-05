
import React, { useMemo } from "react";

import {
    useSelector,
} from "react-redux";

import {
    useLocation,
    useNavigate,
} from "react-router-dom";

import {
    Tags,
    CheckCircle,
    XCircle,
} from "lucide-react";

// ============================================================
// STATUS CARDS
// ============================================================

const STATUS_CARDS = [
    {
        label: "Total Categories",
        value: "ALL",
        icon: Tags,
        color: "blue",
    },
    {
        label: "Active Categories",
        value: "ACTIVE",
        icon: CheckCircle,
        color: "green",
    },
    {
        label: "Inactive Categories",
        value: "INACTIVE",
        icon: XCircle,
        color: "red",
    },
];

// ============================================================
// STATUS LABELS
// ============================================================

const STATUS_LABELS = {
    ALL: "All Categories",
    ACTIVE: "Active Categories",
    INACTIVE: "Inactive Categories",
    DRAFT: "Draft Categories",
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
};

// ============================================================
// COMPONENT
// ============================================================

export default function CategoryOverview() {
    const navigate = useNavigate();
    const location = useLocation();

    // ========================================================
    // REDUX STATE
    // ========================================================

    const categoriesFromRedux = useSelector(
        (state) => state.category?.categories
    );

    const categories = Array.isArray(categoriesFromRedux)
        ? categoriesFromRedux
        : [];

    const selectedStatus = useSelector(
        (state) => {
            const status = String(
                state.categoryView?.status || "ALL"
            ).trim().toUpperCase();

            return STATUS_LABELS[status]
                ? status
                : "ALL";
        }
    );

    // ========================================================
    // STATISTICS
    // ========================================================

    const statistics = useMemo(() => {
        return {
            ALL: categories.length,

            ACTIVE: categories.filter(
                (category) =>
                    String(category?.status || "")
                        .trim()
                        .toUpperCase() === "ACTIVE"
            ).length,

            INACTIVE: categories.filter(
                (category) =>
                    String(category?.status || "")
                        .trim()
                        .toUpperCase() === "INACTIVE"
            ).length,
        };
    }, [categories]);

    // ========================================================
    // STATUS CARD CLICK
    // ========================================================

    const handleStatusChange = (status) => {
        if (!STATUS_LABELS[status]) {
            return;
        }

        if (status === selectedStatus) {
            return;
        }

        const params = new URLSearchParams(location.search);

        if (status === "ALL") {
            params.delete("categoryStatus");
        } else {
            params.set("categoryStatus", status);
        }

        navigate({
            pathname: location.pathname,
            search: params.toString()
                ? `?${params.toString()}`
                : "",
        });
    };

    // ========================================================
    // RENDER
    // ========================================================

    return (
        <div className="w-full space-y-5">

            {/* STATUS CARDS */}

            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

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
                            aria-pressed={active}
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
                            <div className="flex items-center justify-between">

                                <div>
                                    <p className="text-sm font-medium text-gray-500">
                                        {card.label}
                                    </p>

                                    <h3 className="mt-3 text-2xl font-bold text-gray-800">
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

                            <div className="mt-4 flex items-center justify-between">

                                <span className="text-xs text-gray-400">
                                    {active
                                        ? "Currently selected"
                                        : "View categories"
                                    }
                                </span>

                                <span className="text-xs font-semibold text-blue-500 transition-transform group-hover:translate-x-1">
                                    View →
                                </span>

                            </div>
                        </button>
                    );
                })}

            </div>

            {/* SELECTED STATUS */}

            <div className="flex flex-wrap items-center justify-between gap-2">

                <p className="text-sm text-gray-500">
                    Showing:{" "}
                    <span className="font-semibold text-gray-800">
                        {STATUS_LABELS[selectedStatus]}
                    </span>
                </p>

                <p className="text-xs text-gray-400">
                    {categories.length} records loaded
                </p>

            </div>

        </div>
    );
}
