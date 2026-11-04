
import React, { useEffect, useMemo } from "react";

import {
    useDispatch,
    useSelector,
} from "react-redux";

import {
    useNavigate,
    useSearchParams,
} from "react-router-dom";

import {
    Landmark,
    CheckCircle,
    XCircle,
} from "lucide-react";

import {
    setBankAccountStatus,
    setSelectedBankAccountView,
} from "../slices/bankAccountViewSlice";

// ============================================================
// CONSTANTS
// ============================================================

const EMPTY_ARRAY = [];

const STATUS_CARDS = [
    {
        label: "Total Bank Accounts",
        value: "ALL",
        icon: Landmark,
        color: "blue",
    },
    {
        label: "Active Bank Accounts",
        value: "ACTIVE",
        icon: CheckCircle,
        color: "green",
    },
    {
        label: "Inactive Bank Accounts",
        value: "INACTIVE",
        icon: XCircle,
        color: "red",
    },
];

const STATUS_LABELS = {
    ALL: "All Bank Accounts",
    ACTIVE: "Active Bank Accounts",
    INACTIVE: "Inactive Bank Accounts",
    PRIMARY: "Primary Bank Accounts",
};

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
// HELPERS
// ============================================================

const getAccountStatus = (account) => {
    const status = String(account?.status || "")
        .trim()
        .toUpperCase();

    if (status === "ACTIVE" || status === "INACTIVE") {
        return status;
    }

    if (typeof account?.audit?.active === "boolean") {
        return account.audit.active ? "ACTIVE" : "INACTIVE";
    }

    if (typeof account?.active === "boolean") {
        return account.active ? "ACTIVE" : "INACTIVE";
    }

    return "UNKNOWN";
};

// ============================================================
// COMPONENT
// ============================================================

export default function BankAccountOverview() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // ========================================================
    // BANK ACCOUNT DATA
    // ========================================================

    const bankAccounts = useSelector(
        (state) =>
            Array.isArray(state.bankAccount?.bankAccounts)
                ? state.bankAccount.bankAccounts
                : EMPTY_ARRAY
    );

    // ========================================================
    // BANK ACCOUNT VIEW STATE
    // ========================================================

    const selectedStatus = useSelector(
        (state) =>
            state.bankAccountView?.bankAccountStatus || "ALL"
    );

    // ========================================================
    // URL STATUS SYNCHRONIZATION
    // ========================================================

    useEffect(() => {
        const urlStatus = String(
            searchParams.get("bankAccountStatus") ||
            searchParams.get("status") ||
            "ALL"
        )
            .trim()
            .toUpperCase();

        const status = STATUS_LABELS[urlStatus]
            ? urlStatus
            : "ALL";

        dispatch(setBankAccountStatus(status));

        dispatch(
            setSelectedBankAccountView(
                STATUS_LABELS[status]
            )
        );
    }, [searchParams, dispatch]);

    // ========================================================
    // STATISTICS
    // ========================================================

    const statistics = useMemo(() => {
        const result = {
            ALL: bankAccounts.length,
            ACTIVE: 0,
            INACTIVE: 0,
        };

        bankAccounts.forEach((account) => {
            const status = getAccountStatus(account);

            if (status === "ACTIVE") {
                result.ACTIVE += 1;
            }

            if (status === "INACTIVE") {
                result.INACTIVE += 1;
            }
        });

        return result;
    }, [bankAccounts]);

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

        dispatch(setBankAccountStatus(status));

        dispatch(
            setSelectedBankAccountView(
                STATUS_LABELS[status]
            )
        );

        navigate(
            `/settings/bankAccount?bankAccountStatus=${status}`
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
                                        : "View bank accounts"
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
                    {bankAccounts.length} total records
                </p>
            </div>
        </div>
    );
}
