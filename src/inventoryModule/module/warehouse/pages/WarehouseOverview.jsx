
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
    Warehouse,
    CheckCircle,
    XCircle,
} from "lucide-react";

import {
    setWarehousesStatus,
    setSelectedWarehousesView,
} from "../../warehouse/slices/warehouseViewSlice";

// ============================================================
// STATUS CARDS
// ============================================================

const STATUS_CARDS = [
    {
        label: "Total Warehouses",
        value: "ALL",
        icon: Warehouse,
        color: "blue",
    },
    {
        label: "Active Warehouses",
        value: "ACTIVE",
        icon: CheckCircle,
        color: "green",
    },
    {
        label: "Inactive Warehouses",
        value: "INACTIVE",
        icon: XCircle,
        color: "red",
    },
];

// ============================================================
// STATUS LABELS
// ============================================================

const STATUS_LABELS = {
    ALL: "All Warehouses",
    ACTIVE: "Active Warehouses",
    INACTIVE: "Inactive Warehouses",
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

export default function WarehouseOverview() {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    // ========================================================
    // REDUX STATE
    // ========================================================

    const warehouses = useSelector(
        (state) => state.warehouse?.warehouses || []
    );

    const selectedStatus = useSelector(
        (state) => state.warehouseView?.warehouseStatus || "ALL"
    );

    // ========================================================
    // STATUS SYNCHRONIZATION
    // ========================================================

    useEffect(() => {

        const params = new URLSearchParams(
            window.location.search
        );

        const urlStatus = (
            params.get("warehouseStatus") || "ALL"
        ).toUpperCase();

        const status = STATUS_LABELS[urlStatus]
            ? urlStatus
            : "ALL";

        dispatch(setWarehousesStatus(status));

        dispatch(
            setSelectedWarehousesView(
                STATUS_LABELS[status]
            )
        );

    }, [dispatch]);

    // ========================================================
    // STATISTICS
    // ========================================================

    const statistics = {
        ALL: warehouses.length,

        ACTIVE: warehouses.filter(
            (warehouse) =>
                String(warehouse?.status || "").toUpperCase() === "ACTIVE"
        ).length,

        INACTIVE: warehouses.filter(
            (warehouse) =>
                String(warehouse?.status || "").toUpperCase() === "INACTIVE"
        ).length,
    };

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

        dispatch(setWarehousesStatus(status));

        dispatch(
            setSelectedWarehousesView(
                STATUS_LABELS[status]
            )
        );

        navigate(
            `/inventory/warehouses?warehouseStatus=${status}`,
            { replace: false }
        );
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
                            onClick={() => handleStatusChange(card.value)}
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
                                        : "View warehouses"
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
                    {warehouses.length} total records
                </p>

            </div>

        </div>
    );
}
