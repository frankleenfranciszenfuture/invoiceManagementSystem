
import React, { useMemo } from "react";

import { useSelector } from "react-redux";

import {
    Tags,
    CheckCircle,
    XCircle,
} from "lucide-react";

/* =========================================================
   CONSTANTS
========================================================= */

const EMPTY_ARRAY = [];

/* =========================================================
   COMPONENT
========================================================= */

export default function SubCategoryOverview({
    canViewSubCategory = true,
    isAuthenticated = false,
    authChecking = false,
}) {
    /* =====================================================
       REDUX STATE
    ===================================================== */

    const subCategoriesFromRedux = useSelector(
        (state) => state.subCategory?.subCategories
    );

    const subCategories = Array.isArray(subCategoriesFromRedux)
        ? subCategoriesFromRedux
        : EMPTY_ARRAY;

    const loading = useSelector(
        (state) => state.subCategory?.loading === true
    );

    const pagination = useSelector(
        (state) => state.subCategory?.pagination || {}
    );

    /* =====================================================
       COUNTS
    ===================================================== */

    const counts = useMemo(() => {
        const active = subCategories.filter(
            (item) =>
                String(item?.status || "").toUpperCase() === "ACTIVE"
        ).length;

        const inactive = subCategories.filter(
            (item) =>
                String(item?.status || "").toUpperCase() === "INACTIVE"
        ).length;

        return {
            total: Number(pagination?.totalElements) || 0,
            active,
            inactive,
        };
    }, [
        subCategories,
        pagination,
    ]);

    /* =====================================================
       AUTH CHECK
    ===================================================== */

    if (
        authChecking ||
        !isAuthenticated ||
        !canViewSubCategory
    ) {
        return null;
    }

    /* =====================================================
       OVERVIEW CARDS
    ===================================================== */

    const overviewCards = [
        {
            title: "Total Subcategories",
            count: counts.total,
            icon: Tags,
            iconBg: "bg-blue-50",
            iconColor: "text-blue-600",
            borderColor: "border-blue-200",
        },
        {
            title: "Active Subcategories",
            count: counts.active,
            icon: CheckCircle,
            iconBg: "bg-green-50",
            iconColor: "text-green-600",
            borderColor: "border-green-200",
        },
        {
            title: "Inactive Subcategories",
            count: counts.inactive,
            icon: XCircle,
            iconBg: "bg-red-50",
            iconColor: "text-red-600",
            borderColor: "border-red-200",
        },
    ];

    /* =====================================================
       UI
    ===================================================== */

    return (
        <div className="mb-5 mt-5">

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

                {overviewCards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <div
                            key={card.title}
                            className={`
                                rounded-xl border border-gray-200
                                bg-white p-4 shadow-sm
                                transition-all duration-200
                                hover:-translate-y-0.5
                                hover:shadow-md
                            `}
                        >
                            <div className="flex items-center justify-between">

                                {/* CARD INFORMATION */}

                                <div className="min-w-0">

                                    <p className="text-sm font-medium text-gray-500">
                                        {card.title}
                                    </p>

                                    <p className="mt-2 text-2xl font-semibold text-gray-800">
                                        {loading && !subCategories.length
                                            ? "—"
                                            : card.count.toLocaleString("en-IN")
                                        }
                                    </p>

                                </div>

                                {/* CARD ICON */}

                                <div
                                    className={`
                                        flex h-12 w-12 shrink-0
                                        items-center justify-center
                                        rounded-xl ${card.iconBg}
                                    `}
                                >
                                    <Icon
                                        size={23}
                                        strokeWidth={1.8}
                                        className={card.iconColor}
                                    />
                                </div>

                            </div>
                        </div>
                    );
                })}

            </div>

        </div>
    );
}
