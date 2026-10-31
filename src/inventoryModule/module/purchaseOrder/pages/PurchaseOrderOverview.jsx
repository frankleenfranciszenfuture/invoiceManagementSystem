import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
    ShoppingCart,
    FileText,
    CheckCircle,
    PackageCheck,
    Truck,
    XCircle,
} from "lucide-react";

import toast from "react-hot-toast";

import { fetchAllPurchaseOrders } from "../thunks/purchaseOrderThunks";

import {
    setPurchaseOrderStatus,
    setSelectedPurchaseOrderView,
} from "../slices/purchaseOrderViewSlice";

/* ============================================================
   STATUS CARDS
============================================================ */

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
        label: "Partially Received",
        value: "PARTIALLY_RECEIVED",
        icon: Truck,
        color: "purple",
    },
    {
        label: "Received Orders",
        value: "RECEIVED",
        icon: PackageCheck,
        color: "green",
    },
    {
        label: "Cancelled Orders",
        value: "CANCELLED",
        icon: XCircle,
        color: "red",
    },
];

/* ============================================================
   STATUS LABELS
============================================================ */

const STATUS_LABELS = {
    ALL: "All Purchase Orders",
    DRAFT: "Draft Purchase Orders",
    CONFIRMED: "Confirmed Purchase Orders",
    PARTIALLY_RECEIVED: "Partially Received Purchase Orders",
    RECEIVED: "Received Purchase Orders",
    CANCELLED: "Cancelled Purchase Orders",
};

/* ============================================================
   INITIAL FILTERS
============================================================ */

const INITIAL_FILTERS = {
    orderNo: "",
    partyId: "",
    warehouseId: "",
    fromDate: "",
    toDate: "",
    page: 0,
    size: 10,
};

/* ============================================================
   CARD STYLES
============================================================ */

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
};

/* ============================================================
   COMPONENT
============================================================ */

export default function PurchaseOrderOverview({
    canViewPurchaseOrder,
    isAuthenticated,
    authChecking,
}) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    /* ========================================================
       REDUX STATE
    ======================================================== */

    const purchaseOrders = useSelector(
        (state) => state.purchaseOrder?.purchaseOrders || []
    );

    const loading = useSelector(
        (state) => state.purchaseOrder?.loading || false
    );

    const pagination = useSelector(
        (state) => state.purchaseOrder?.pagination || {}
    );

    const selectedStatus = useSelector(
        (state) => state.purchaseOrderView?.purchaseOrderStatus || "ALL"
    );

    /* ========================================================
       FILTER STATE
    ======================================================== */

    const [filters, setFilters] = useState(INITIAL_FILTERS);

    // Filters that have actually been applied.
    const [appliedFilters, setAppliedFilters] = useState(INITIAL_FILTERS);

    /* ========================================================
       LOAD PURCHASE ORDERS
    ======================================================== */

    const loadPurchaseOrders = useCallback(
        (filterValues = appliedFilters, status = selectedStatus) => {
            if (
                authChecking ||
                !isAuthenticated ||
                !canViewPurchaseOrder
            ) {
                return;
            }

            dispatch(
                fetchAllPurchaseOrders({
                    ...filterValues,

                    orderNo: filterValues.orderNo || undefined,

                    partyId: filterValues.partyId
                        ? Number(filterValues.partyId)
                        : undefined,

                    warehouseId: filterValues.warehouseId
                        ? Number(filterValues.warehouseId)
                        : undefined,

                    // Your purchaseOrder thunk expects `status`,
                    // not `purchaseOrderStatus`.
                    status: status === "ALL" ? undefined : status,
                })
            );
        },
        [
            dispatch,
            appliedFilters,
            selectedStatus,
            authChecking,
            isAuthenticated,
            canViewPurchaseOrder,
        ]
    );

    /* ========================================================
       INITIAL FETCH + STATUS CHANGE FETCH
    ======================================================== */

    useEffect(() => {
        if (
            authChecking ||
            !isAuthenticated ||
            !canViewPurchaseOrder
        ) {
            return;
        }

        loadPurchaseOrders(appliedFilters, selectedStatus);
    }, [
        authChecking,
        isAuthenticated,
        canViewPurchaseOrder,
        selectedStatus,
        appliedFilters,
        loadPurchaseOrders,
    ]);

    /* ========================================================
       ORDER STATUS
    ======================================================== */

    const getOrderStatus = (order) =>
        String(
            order?.status ||
            order?.purchaseOrderStatus ||
            ""
        ).toUpperCase();

    /* ========================================================
       STATISTICS
    ======================================================== */

    const statistics = {
        ALL: pagination.totalElements ?? purchaseOrders.length,

        DRAFT: purchaseOrders.filter(
            (order) => getOrderStatus(order) === "DRAFT"
        ).length,

        CONFIRMED: purchaseOrders.filter(
            (order) => getOrderStatus(order) === "CONFIRMED"
        ).length,

        PARTIALLY_RECEIVED: purchaseOrders.filter(
            (order) => getOrderStatus(order) === "PARTIALLY_RECEIVED"
        ).length,

        RECEIVED: purchaseOrders.filter(
            (order) => getOrderStatus(order) === "RECEIVED"
        ).length,

        CANCELLED: purchaseOrders.filter(
            (order) => getOrderStatus(order) === "CANCELLED"
        ).length,
    };

    /* ========================================================
       STATUS CARD CLICK
    ======================================================== */

    const handleStatusChange = (status) => {
        const label = STATUS_LABELS[status];

        if (!label || status === selectedStatus) return;

        dispatch(setPurchaseOrderStatus(status));
        dispatch(setSelectedPurchaseOrderView(label));

        // Reset pagination when changing status.
        const updatedFilters = {
            ...appliedFilters,
            page: 0,
        };

        setFilters(updatedFilters);
        setAppliedFilters(updatedFilters);

        // Update URL.
        navigate(
            `/inventory/purchaseOrders?purchaseOrderStatus=${status}`,
            { replace: false }
        );

        // The useEffect fetches when selectedStatus changes.
    };

    /* ========================================================
       FILTER INPUT CHANGE
    ======================================================== */

    const handleFilterChange = (event) => {
        const { name, value } = event.target;

        setFilters((previous) => ({
            ...previous,
            [name]: value,
            page: 0,
        }));
    };

    /* ========================================================
       APPLY FILTERS
    ======================================================== */

    const handleApplyFilters = () => {
        if (
            filters.fromDate &&
            filters.toDate &&
            filters.fromDate > filters.toDate
        ) {
            toast.error("From date cannot be after To date.");
            return;
        }

        const updatedFilters = {
            ...filters,
            page: 0,
        };

        setAppliedFilters(updatedFilters);

        // Fetch is triggered by appliedFilters change.
    };

    /* ========================================================
       RESET FILTERS
    ======================================================== */

    const handleResetFilters = () => {
        const resetFilters = {
            ...INITIAL_FILTERS,
        };

        setFilters(resetFilters);
        setAppliedFilters(resetFilters);

        // Fetch is triggered by appliedFilters change.
    };

    /* ========================================================
       REFRESH
    ======================================================== */

    const handleRefresh = () => {
        loadPurchaseOrders(appliedFilters, selectedStatus);
    };

    /* ========================================================
       RENDER
    ======================================================== */

    return (
        <div className="space-y-5">

            {/* HEADER */}

            <div className="flex flex-wrap items-center justify-between gap-3">

            </div>

            {/* STATUS CARDS */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">

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
                                disabled:cursor-wait
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
                                        : "View orders"}
                                </span>

                                <span className="text-xs font-semibold text-blue-500 transition-transform group-hover:translate-x-1">
                                    View →
                                </span>
                            </div>
                        </button>
                    );
                })}

            </div>

            {/* FILTER SECTION */}

            {/* SELECTED STATUS */}

            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-gray-500">
                    Showing:{" "}
                    <span className="font-semibold text-gray-800">
                        {STATUS_LABELS[selectedStatus] || STATUS_LABELS.ALL}
                    </span>
                </p>

                <p className="text-xs text-gray-400">
                    {pagination.totalElements ?? purchaseOrders.length} total records
                </p>
            </div>

        </div>
    );
}