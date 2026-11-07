
import React, { useMemo } from "react";

import {
    useDispatch,
    useSelector,
} from "react-redux";

import { useNavigate } from "react-router-dom";

import {
    Package,
    CheckCircle,
    XCircle,
    FileText,
} from "lucide-react";

import {
    setProductsStatus,
    setSelectedProductsView,
} from "../slices/productViewSlice";

// ============================================================
// CONSTANTS
// ============================================================

const EMPTY_ARRAY = [];

const STATUS_LABELS = {
    ALL: "All Products",
    ACTIVE: "Active Products",
    INACTIVE: "Inactive Products",
    DRAFT: "Draft Products",
};

// ============================================================
// STATUS CARDS
// ============================================================

const STATUS_CARDS = [
    {
        label: "Total Products",
        value: "ALL",
        icon: Package,
        color: "blue",
    },
    {
        label: "Active Products",
        value: "ACTIVE",
        icon: CheckCircle,
        color: "green",
    },
    {
        label: "Inactive Products",
        value: "INACTIVE",
        icon: XCircle,
        color: "red",
    },
    {
        label: "Draft Products",
        value: "DRAFT",
        icon: FileText,
        color: "gray",
    },
];

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
    gray: {
        icon: "bg-gray-100 text-gray-600",
        active: "border-gray-500 ring-2 ring-gray-100",
        hover: "hover:border-gray-400",
    },
};

// ============================================================
// COMPONENT
// ============================================================

export default function ProductOverview() {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    // ========================================================
    // REDUX STATE
    // ========================================================

    const products = useSelector(
        (state) =>
            Array.isArray(state.product?.products)
                ? state.product.products
                : EMPTY_ARRAY
    );

    const selectedStatus = useSelector(
        (state) =>
            state.productsView?.productsStatus || "ALL"
    );

    const pagination = useSelector(
        (state) => state.product?.pagination
    );

    // ========================================================
    // STATISTICS
    // ========================================================

    const statistics = useMemo(() => {

        const result = {
            ALL: 0,
            ACTIVE: 0,
            INACTIVE: 0,
            DRAFT: 0,
        };

        products.forEach((product) => {

            const status = String(
                product?.status || ""
            ).trim().toUpperCase();

            if (
                Object.prototype.hasOwnProperty.call(
                    result,
                    status
                )
            ) {
                result[status] += 1;
            }

            result.ALL += 1;
        });

        return result;

    }, [products]);

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

        dispatch(setProductsStatus(status));

        dispatch(
            setSelectedProductsView(
                STATUS_LABELS[status]
            )
        );

        navigate(
            `/invoice/items?productStatus=${status}`
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
                                        : "View products"
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
                    {pagination?.totalElements ?? products.length} total records
                </p>

            </div>

        </div>
    );
}
