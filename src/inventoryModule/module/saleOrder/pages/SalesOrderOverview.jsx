import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
    ShoppingCart,
    FileText,
    CheckCircle,
    XCircle,
} from "lucide-react";

import {
    setSalesOrderStatus,
    setSelectedSalesOrderView,
} from "../slices/saleOrderViewSlice";

const STATUS_CARDS = [
    {
        label: "Total Orders",
        value: "ALL",
        icon: ShoppingCart,
        color: "blue",
    },
    {
        label: "Draft Orders",
        value: "DRAFT",
        icon: FileText,
        color: "gray",
    },
    {
        label: "Confirmed Orders",
        value: "CONFIRMED",
        icon: CheckCircle,
        color: "green",
    },
    {
        label: "Cancelled Orders",
        value: "CANCELLED",
        icon: XCircle,
        color: "red",
    },
];

const STATUS_LABELS = {
    ALL: "All Sales Orders",
    DRAFT: "Draft Sales Orders",
    CONFIRMED: "Confirmed Sales Orders",
    DISPATCHED: "Dispatched Sales Orders",
    CANCELLED: "Cancelled Sales Orders",
};

const CARD_STYLES = {
    blue: {
        icon: "bg-blue-50 text-blue-600",
        active: "border-blue-500 ring-2 ring-blue-100",
        hover: "hover:border-blue-400",
    },
    gray: {
        icon: "bg-gray-100 text-gray-600",
        active: "border-gray-500 ring-2 ring-gray-100",
        hover: "hover:border-gray-400",
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

export default function SalesOrderOverview({
    salesOrders = [],
    pagination = {},
    loading = false,
}) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const selectedStatus = useSelector(
        (state) => state.saleOrderView?.salesOrderStatus || "ALL"
    );

    const getOrderStatus = (order) =>
        String(
            order?.status ||
            order?.salesOrderStatus ||
            ""
        ).trim().toUpperCase();

    /*
     * Prefer server-provided status counts if available.
     * Otherwise, status counts represent the currently loaded page.
     */
    const statistics = {
        ALL: pagination.totalElements ?? salesOrders.length,

        DRAFT:
            pagination.statusCounts?.DRAFT ??
            pagination.draftCount ??
            salesOrders.filter(
                (order) => getOrderStatus(order) === "DRAFT"
            ).length,

        CONFIRMED:
            pagination.statusCounts?.CONFIRMED ??
            pagination.confirmedCount ??
            salesOrders.filter(
                (order) => getOrderStatus(order) === "CONFIRMED"
            ).length,

        CANCELLED:
            pagination.statusCounts?.CANCELLED ??
            pagination.cancelledCount ??
            salesOrders.filter(
                (order) => getOrderStatus(order) === "CANCELLED"
            ).length,
    };

    const handleStatusChange = (status) => {
        if (
            !STATUS_LABELS[status] ||
            status === selectedStatus ||
            loading
        ) {
            return;
        }

        dispatch(setSalesOrderStatus(status));
        dispatch(
            setSelectedSalesOrderView(STATUS_LABELS[status])
        );

        const params = new URLSearchParams(searchParams);

        params.set("salesOrderStatus", status);
        params.delete("page");

        navigate(
            `/inventory/salesOrders?${params.toString()}`,
            { replace: false }
        );
    };

    return (
        <div className="space-y-5">

            {/* STATUS CARDS */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                {STATUS_CARDS.map((card) => {
                    const Icon = card.icon;
                    const active = selectedStatus === card.value;
                    const style = CARD_STYLES[card.color];

                    return (
                        <button
                            type="button"
                            key={card.value}
                            onClick={() => handleStatusChange(card.value)}
                            disabled={loading}
                            className={`
                                group relative overflow-hidden rounded-xl border
                                bg-white p-4 text-left shadow-sm
                                transition-all duration-300
                                hover:-translate-y-1 hover:shadow-lg
                                disabled:cursor-wait disabled:opacity-60
                                ${active ? style.active : "border-gray-100"}
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
                                        : "View orders"}
                                </span>

                                <span className="text-xs font-semibold text-blue-500">
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
                    {pagination.totalElements ?? salesOrders.length} total records
                </p>

            </div>

        </div>
    );
}