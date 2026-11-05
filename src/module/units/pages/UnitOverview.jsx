
import React, {
    useEffect,
    useMemo,
} from "react";

import {
    useDispatch,
    useSelector,
} from "react-redux";

import {
    useNavigate,
} from "react-router-dom";

import {
    Ruler,
    CheckCircle,
    XCircle,
    FileText,
} from "lucide-react";

import {
    setUnitStatus,
    setSelectedUnitView,
} from "../slices/unitViewSlice";

// ============================================================
// STATUS CARDS
// ============================================================

const STATUS_CARDS = [
    {
        label: "Total Units",
        value: "ALL",
        icon: Ruler,
        color: "blue",
    },
    {
        label: "Active Units",
        value: "ACTIVE",
        icon: CheckCircle,
        color: "green",
    },
    {
        label: "Inactive Units",
        value: "INACTIVE",
        icon: XCircle,
        color: "red",
    },
    {
        label: "Draft Units",
        value: "DRAFT",
        icon: FileText,
        color: "orange",
    },
];

// ============================================================
// STATUS LABELS
// ============================================================

const STATUS_LABELS = {
    ALL: "All Units",
    ACTIVE: "Active Units",
    INACTIVE: "Inactive Units",
    DRAFT: "Draft Units",
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
    orange: {
        icon: "bg-orange-50 text-orange-600",
        active: "border-orange-500 ring-2 ring-orange-100",
        hover: "hover:border-orange-400",
    },
};

// ============================================================
// COMPONENT
// ============================================================

export default function UnitOverview() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // ========================================================
    // REDUX STATE
    // ========================================================

    const units = useSelector(
        (state) => state.unit?.units || []
    );

    const selectedStatus = useSelector(
        (state) => state.unitView?.unitStatus || "ALL"
    );

    // ========================================================
    // STATUS SYNCHRONIZATION
    // ========================================================

    useEffect(() => {
        const params = new URLSearchParams(
            window.location.search
        );

        const urlStatus = (
            params.get("unitStatus") || "ALL"
        ).toUpperCase();

        const status = STATUS_LABELS[urlStatus]
            ? urlStatus
            : "ALL";

        dispatch(setUnitStatus(status));

        dispatch(
            setSelectedUnitView(STATUS_LABELS[status])
        );
    }, [dispatch]);

    // ========================================================
    // STATISTICS
    // ========================================================

    const statistics = useMemo(() => ({
        ALL: units.length,

        ACTIVE: units.filter(
            (unit) =>
                String(unit?.status || "").toUpperCase() === "ACTIVE"
        ).length,

        INACTIVE: units.filter(
            (unit) =>
                String(unit?.status || "").toUpperCase() === "INACTIVE"
        ).length,

        DRAFT: units.filter(
            (unit) =>
                String(unit?.status || "").toUpperCase() === "DRAFT"
        ).length,
    }), [units]);

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

        dispatch(setUnitStatus(status));

        dispatch(
            setSelectedUnitView(STATUS_LABELS[status])
        );

        navigate(
            `/settings/units?unitStatus=${status}`,
            { replace: false }
        );
    };

    // ========================================================
    // RENDER
    // ========================================================

    return (
        <div className="w-full space-y-5">

            {/* STATUS CARDS */}

            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

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
                                        : "View units"
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
                        {STATUS_LABELS[selectedStatus] || STATUS_LABELS.ALL}
                    </span>
                </p>

                <p className="text-xs text-gray-400">
                    {units.length} total records
                </p>

            </div>
        </div>
    );
}
