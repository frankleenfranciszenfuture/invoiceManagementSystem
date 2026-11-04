
import React, {
    useMemo,
    useCallback,
} from "react";

import {
    useDispatch,
    useSelector,
} from "react-redux";

import { useNavigate } from "react-router-dom";

import {
    Receipt,
    CheckCircle,
    XCircle,
    FileText,
} from "lucide-react";

import {
    setTaxMasterStatus,
} from "../slices/taxMasterViewSlice";

/* =========================================================
   CONSTANTS
========================================================= */

const EMPTY_ARRAY = [];

const VALID_STATUSES = [
    "ALL",
    "ACTIVE",
    "INACTIVE",
    "DRAFT",
];

const STATUS_LABELS = {
    ALL: "All Tax Masters",
    ACTIVE: "Active Tax Masters",
    INACTIVE: "Inactive Tax Masters",
    DRAFT: "Draft Tax Masters",
};

const STATUS_CARDS = [
    {
        label: "Total Tax Masters",
        value: "ALL",
        icon: Receipt,
        color: "blue",
    },
    {
        label: "Active Tax Masters",
        value: "ACTIVE",
        icon: CheckCircle,
        color: "green",
    },
    {
        label: "Inactive Tax Masters",
        value: "INACTIVE",
        icon: XCircle,
        color: "red",
    },
    {
        label: "Draft Tax Masters",
        value: "DRAFT",
        icon: FileText,
        color: "purple",
    },
];

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
    purple: {
        icon: "bg-purple-50 text-purple-600",
        active: "border-purple-500 ring-2 ring-purple-100",
        hover: "hover:border-purple-400",
    },
};

/* =========================================================
   HELPERS
========================================================= */

const normalizeStatus = (value) => {
    const status = String(value ?? "")
        .trim()
        .toUpperCase();

    return VALID_STATUSES.includes(status)
        ? status
        : "ALL";
};

/* =========================================================
   GET TAX MASTER STATUS

   Priority:
   1. DRAFT explicit status
   2. active
   3. audit.active
   4. ACTIVE / INACTIVE status fallback
========================================================= */

const getTaxMasterStatus = (taxMaster) => {
    const status = String(taxMaster?.status ?? "")
        .trim()
        .toUpperCase();

    if (status === "DRAFT") {
        return "DRAFT";
    }

    if (typeof taxMaster?.active === "boolean") {
        return taxMaster.active ? "ACTIVE" : "INACTIVE";
    }

    if (typeof taxMaster?.audit?.active === "boolean") {
        return taxMaster.audit.active
            ? "ACTIVE"
            : "INACTIVE";
    }

    if (
        status === "ACTIVE" ||
        status === "INACTIVE"
    ) {
        return status;
    }

    return "UNKNOWN";
};

/* =========================================================
   COMPONENT
========================================================= */

export default function TaxMasterOverview() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    /* =====================================================
       REDUX STATE
    ===================================================== */

    const taxMastersFromRedux = useSelector(
        (state) => state.taxMaster?.taxMasters
    );

    const taxMasters = Array.isArray(taxMastersFromRedux)
        ? taxMastersFromRedux
        : EMPTY_ARRAY;

    const selectedStatus = useSelector(
        (state) => state.taxMasterView?.taxMasterStatus
    );

    /* =====================================================
       ACTIVE STATUS
    ===================================================== */

    const activeStatus = normalizeStatus(selectedStatus);

    /* =====================================================
       STATISTICS
    ===================================================== */

    const statistics = useMemo(() => {
        const result = {
            ALL: taxMasters.length,
            ACTIVE: 0,
            INACTIVE: 0,
            DRAFT: 0,
        };

        taxMasters.forEach((taxMaster) => {
            const status = getTaxMasterStatus(taxMaster);

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
    }, [taxMasters]);

    /* =====================================================
       STATUS CARD CLICK
    ===================================================== */

    const handleStatusChange = useCallback((status) => {
        const normalizedStatus = normalizeStatus(status);

        dispatch(setTaxMasterStatus(normalizedStatus));

        navigate(
            `/settings/taxes?status=${normalizedStatus}`
        );
    }, [dispatch, navigate]);

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div className="w-full space-y-5">

            {/* STATUS CARDS */}

            <div
                className="
                    grid w-full grid-cols-1 gap-4
                    sm:grid-cols-2 lg:grid-cols-4
                "
            >
                {STATUS_CARDS.map((card) => {
                    const Icon = card.icon;

                    const active =
                        activeStatus === card.value;

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
                                group relative overflow-hidden rounded-xl
                                border bg-white p-4 text-left shadow-sm
                                transition-all duration-300
                                hover:-translate-y-1 hover:shadow-lg
                                focus:outline-none focus:ring-2
                                focus:ring-blue-200
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
                                        flex h-12 w-12 items-center
                                        justify-center rounded-xl
                                        transition-all duration-300
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
                                        : "View tax masters"
                                    }
                                </span>

                                <span className="
                                    text-xs font-semibold text-blue-500
                                    transition-transform
                                    group-hover:translate-x-1
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
                        {STATUS_LABELS[activeStatus]}
                    </span>
                </p>

                <p className="text-xs text-gray-400">
                    {taxMasters.length} total records
                </p>
            </div>
        </div>
    );
}
