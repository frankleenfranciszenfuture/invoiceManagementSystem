import React, { useCallback, useMemo } from "react";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
    Eye,
    Wallet,
    CalendarDays,
    Pencil,
    Trash2,
    Banknote,
} from "lucide-react";

import toast from "react-hot-toast";

import {
    fetchAllCashAccounts,
    deleteCashAccount,
} from "../thunks/cashAccountThunks";

import {
    setExistingCashAccount,
} from "../slices/cashAccountSlice";

import {
    openModal,
} from "../../../../module/ui/uiSlice";

import Pagination from "../../../../common/pagination/table/Pagination";
import ToolTipText from "../../../../common/toolTip/ToolTipText";

/* =========================================================
   CONSTANTS
========================================================= */

const EMPTY_ARRAY = [];

const AVATAR_COLORS = [
    "bg-pink-500 text-white",
    "bg-green-500 text-white",
    "bg-blue-500 text-white",
    "bg-purple-500 text-white",
    "bg-orange-500 text-white",
    "bg-cyan-500 text-white",
    "bg-indigo-500 text-white",
];

const CASH_ACCOUNT_STATUS_COLORS = {
    ACTIVE: "bg-green-100 text-green-700",
    INACTIVE: "bg-red-100 text-red-700",
};

/* =========================================================
   HELPERS
========================================================= */

const getInitials = (value = "") => {
    return (
        String(value)
            .split(/[\s-]+/)
            .filter(Boolean)
            .map((word) => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "CA"
    );
};

const getAvatarColor = (value = "") => {
    const index = String(value)
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0)
        % AVATAR_COLORS.length;

    return AVATAR_COLORS[index];
};

const formatAmount = (amount, currencyCode = "INR") => {
    const value = Number(amount ?? 0);

    return `${currencyCode} ${value.toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    )}`;
};

/* =========================================================
   COMPONENT
========================================================= */

export default function CashAccountTable({
    cashAccounts,
    fetchParams = {},
}) {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    /* =====================================================
       REDUX STATE
    ===================================================== */

    const {
        cashAccounts: reduxCashAccounts = EMPTY_ARRAY,
        loading = false,
        actionLoading = false,
        error = null,
        pagination = {},
    } = useSelector((state) => state.cashAccount || {});

    const {
        pageNumber = 0,
        pageSize = 20,
        totalPages = 0,
        totalElements = 0,
    } = pagination;

    const currentCashAccounts = Array.isArray(cashAccounts)
        ? cashAccounts
        : reduxCashAccounts;

    /* =====================================================
       AUTH STATE
    ===================================================== */

    const user = useSelector(
        (state) => state.auth?.user
    );

    const permissions = useSelector(
        (state) =>
            state.menuPermission?.userPermissions || EMPTY_ARRAY
    );

    /* =====================================================
       ROLE
    ===================================================== */

    const roleName =
        user?.roleName ||
        user?.role?.roleName ||
        user?.role?.name ||
        user?.role ||
        user?.authority ||
        "";

    const normalizedRole = String(roleName)
        .trim()
        .toUpperCase();

    const hasFullAccess =
        normalizedRole === "SUPER_ADMIN" ||
        normalizedRole === "ADMIN";

    /* =====================================================
       PERMISSION CHECK
    ===================================================== */

    const hasPermission = useCallback(
        (moduleName, actionName) => {

            if (hasFullAccess) return true;

            if (!Array.isArray(permissions)) return false;

            const requestedModule = String(moduleName)
                .trim()
                .toLowerCase();

            const requestedAction = String(actionName)
                .trim()
                .toUpperCase();

            return permissions.some((permission) => {

                const permissionModule = String(
                    permission?.moduleName ||
                    permission?.module?.moduleName ||
                    permission?.module?.name ||
                    ""
                )
                    .trim()
                    .toLowerCase();

                if (permissionModule !== requestedModule) {
                    return false;
                }

                if (permission?.active === false) {
                    return false;
                }

                if (
                    String(permission?.status || "").toUpperCase() ===
                    "INACTIVE"
                ) {
                    return false;
                }

                if (Array.isArray(permission?.actions)) {

                    return permission.actions.some((action) => {

                        const permissionAction = String(
                            action?.actionName ||
                            action?.action?.actionName ||
                            action?.action?.name ||
                            ""
                        )
                            .trim()
                            .toUpperCase();

                        const allowed =
                            action?.allowed === true ||
                            action?.allowed === "true";

                        if (action?.active === false) {
                            return false;
                        }

                        if (
                            String(action?.status || "").toUpperCase() ===
                            "INACTIVE"
                        ) {
                            return false;
                        }

                        return (
                            permissionAction === requestedAction &&
                            allowed
                        );
                    });
                }

                const permissionAction = String(
                    permission?.actionName ||
                    permission?.action?.actionName ||
                    permission?.action?.name ||
                    ""
                )
                    .trim()
                    .toUpperCase();

                const allowed =
                    permission?.allowed === true ||
                    permission?.allowed === "true";

                return (
                    permissionAction === requestedAction &&
                    allowed
                );
            });
        },
        [hasFullAccess, permissions]
    );

    const canViewCashAccount = hasPermission(
        "Cash Accounts",
        "VIEW"
    );

    const canEditCashAccount = hasPermission(
        "Cash Accounts",
        "EDIT"
    );

    const canDeleteCashAccount = hasPermission(
        "Cash Accounts",
        "DELETE"
    );

    /* =====================================================
       FETCH PARAMS
    ===================================================== */

    const getFetchParams = useCallback(
        (page, size) => ({
            ...fetchParams,
            page,
            size,
        }),
        [fetchParams]
    );

    const refreshCashAccounts = useCallback(
        (page = pageNumber, size = pageSize) => {

            dispatch(
                fetchAllCashAccounts(
                    getFetchParams(page, size)
                )
            );

        },
        [
            dispatch,
            getFetchParams,
            pageNumber,
            pageSize,
        ]
    );

    /* =====================================================
       VIEW CASH ACCOUNT
    ===================================================== */

    const handleView = (account) => {

        if (!canViewCashAccount) {
            toast.error(
                "You do not have permission to view cash accounts."
            );
            return;
        }

        dispatch(setExistingCashAccount(account));

        navigate(`/inventory/cash-accounts/view/${account.id}`);
    };

    /* =====================================================
       EDIT CASH ACCOUNT
    ===================================================== */

    const handleEdit = (account) => {

        if (!canEditCashAccount) {
            toast.error(
                "You do not have permission to edit cash accounts."
            );
            return;
        }

        dispatch(setExistingCashAccount(account));

        navigate(`/inventory/cash-accounts/edit/${account.id}`);
    };

    /* =====================================================
       DELETE CASH ACCOUNT
    ===================================================== */

    const handleDelete = async (account) => {

        if (!canDeleteCashAccount) {
            toast.error(
                "You do not have permission to delete cash accounts."
            );
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete "${account.accountName}"?`
        );

        if (!confirmed) {
            return;
        }

        try {

            await dispatch(
                deleteCashAccount(account.id)
            ).unwrap();

            toast.success(
                "Cash account deleted successfully."
            );

            refreshCashAccounts();

        } catch (error) {

            toast.error(
                typeof error === "string"
                    ? error
                    : "Failed to delete cash account."
            );
        }
    };

    /* =====================================================
       SORTING
    ===================================================== */

    const sortedCashAccounts = useMemo(
        () => [...currentCashAccounts],
        [currentCashAccounts]
    );

    /* =====================================================
       LOADING
    ===================================================== */

    if (loading && !currentCashAccounts.length) {

        return (
            <div className="flex items-center justify-center py-10">
                <p className="text-sm text-gray-500">
                    Loading cash accounts...
                </p>
            </div>
        );
    }

    /* =====================================================
       ERROR
    ===================================================== */

    if (error && !currentCashAccounts.length) {

        return (
            <div className="
                rounded-xl border border-red-200
                bg-white p-8 text-center
            ">

                <p className="text-sm text-red-500">
                    {typeof error === "string"
                        ? error
                        : "Failed to fetch cash accounts"}
                </p>

                <button
                    type="button"
                    onClick={() => refreshCashAccounts()}
                    className="
                        mt-3 rounded-lg bg-blue-600
                        px-4 py-2 text-sm text-white
                        transition hover:bg-blue-700
                    "
                >
                    Retry
                </button>

            </div>
        );
    }

    /* =====================================================
       EMPTY STATE
    ===================================================== */

    if (!currentCashAccounts.length) {

        return (
            <div className="
                rounded-2xl border border-gray-200
                bg-white p-8 text-center
            ">

                <Wallet className="
                    mx-auto mb-3 h-10 w-10 text-gray-300
                " />

                <p className="text-sm text-gray-500">
                    No cash accounts found.
                </p>

            </div>
        );
    }

    /* =====================================================
       TABLE
    ===================================================== */

    return (

        <div className="
            overflow-x-auto overflow-y-visible
            rounded-xl border border-gray-200 bg-white
        ">

            <table className="w-full">

                {/* TABLE HEADER */}

                <thead className="
                    border-b border-gray-300
                    bg-[#FAF9F7]/20
                ">

                    <tr>

                        {[
                            "Cash Account",
                            "Account Code",
                            "Currency",
                            "Opening Balance",
                            "Current Balance",
                            "Description",
                            "Status",
                            "Actions",
                        ].map((header) => (

                            <th
                                key={header}
                                className={`
                                    whitespace-nowrap px-5 py-3
                                    text-left text-xs font-medium
                                    uppercase text-gray-400
                                    ${header === "Actions"
                                        ? "text-right"
                                        : ""
                                    }
                                `}
                            >
                                {header}
                            </th>

                        ))}

                    </tr>

                </thead>

                {/* TABLE BODY */}

                <tbody>

                    {sortedCashAccounts.map((account) => {

                        const accountStatus = String(
                            account.status || ""
                        ).toUpperCase();

                        const currencyCode =
                            account.currency || "INR";

                        return (

                            <tr
                                key={account.id}
                                className="
                                    border-b border-gray-100
                                    text-xs transition-colors
                                    hover:bg-gray-50
                                "
                            >

                                {/* CASH ACCOUNT */}

                                <td className="px-3 py-3">

                                    <div className="
                                        flex min-w-0 items-center gap-2
                                    ">

                                        <div
                                            className={`
                                                flex h-9 w-9 min-w-[36px]
                                                items-center justify-center
                                                rounded-full text-sm font-bold
                                                ${getAvatarColor(
                                                account.accountName
                                            )}
                                            `}
                                        >
                                            {getInitials(account.accountName)}
                                        </div>

                                        <div className="min-w-0">

                                            <p
                                                className="
                                                    truncate font-medium
                                                    text-gray-800
                                                "
                                                title={account.accountName || ""}
                                            >
                                                {account.accountName || "—"}
                                            </p>

                                            <p className="
                                                mt-0.5 text-xs text-gray-500
                                            ">
                                                ID: {account.id}
                                            </p>

                                        </div>

                                    </div>

                                </td>

                                {/* ACCOUNT CODE */}

                                <td className="px-3 py-3">

                                    <p className="
                                        whitespace-nowrap font-medium
                                        text-gray-700
                                    ">
                                        {account.accountCode || "—"}
                                    </p>

                                </td>

                                {/* CURRENCY */}

                                <td className="px-3 py-3">

                                    <span className="
                                        inline-flex items-center gap-1
                                        rounded-full bg-blue-50 px-2.5 py-1
                                        font-medium text-blue-700
                                    ">
                                        {currencyCode}
                                    </span>

                                </td>

                                {/* OPENING BALANCE */}

                                <td className="px-3 py-3">

                                    <p className="
                                        whitespace-nowrap font-medium
                                        text-gray-700
                                    ">
                                        {formatAmount(
                                            account.openingBalance,
                                            currencyCode
                                        )}
                                    </p>

                                </td>

                                {/* CURRENT BALANCE */}

                                <td className="px-3 py-3">

                                    <div className="
                                        flex items-center gap-2
                                        whitespace-nowrap
                                    ">

                                        <Banknote
                                            size={15}
                                            className="text-gray-400"
                                        />

                                        <p className="
                                            font-semibold text-gray-800
                                        ">
                                            {formatAmount(
                                                account.currentBalance,
                                                currencyCode
                                            )}
                                        </p>

                                    </div>

                                </td>

                                {/* DESCRIPTION */}

                                <td className="px-3 py-3">

                                    <p
                                        className="
                                            max-w-[220px] truncate
                                            text-gray-600
                                        "
                                        title={account.description || ""}
                                    >
                                        {account.description || "—"}
                                    </p>

                                </td>

                                {/* STATUS */}

                                <td className="px-3 py-3">

                                    <span
                                        className={`
                                            inline-block whitespace-nowrap
                                            rounded-full px-2.5 py-1
                                            text-xs font-medium
                                            ${CASH_ACCOUNT_STATUS_COLORS[accountStatus] ||
                                            "bg-gray-100 text-gray-700"}
                                        `}
                                    >
                                        {account.status || "—"}
                                    </span>

                                </td>

                                {/* ACTIONS */}

                                <td className="px-4 py-3">

                                    <div className=" relative
                                        flex items-center justify-end gap-2
                                    ">

                                        {/* VIEW */}

                                        {canViewCashAccount && (

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleView(account)
                                                }

                                                className="
                                                    group relative
                                                    flex h-8 w-8
                                                    items-center justify-center
                                                    rounded-lg bg-blue-50
                                                    text-blue-600 transition
                                                    hover:bg-blue-100
                                                "
                                            >
                                                <Eye size={16} />
                                                <ToolTipText text="view" position="bottom" />
                                            </button>

                                        )}

                                        {/* EDIT */}

                                        {canEditCashAccount && (

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleEdit(account)
                                                }

                                                className="
                                                    group relative
                                                    flex h-8 w-8
                                                    items-center justify-center
                                                    rounded-lg bg-amber-50
                                                    text-amber-600 transition
                                                    hover:bg-amber-100
                                                "
                                            >
                                                <Pencil size={16} />
                                                <ToolTipText text="Edit" position="bottom" />
                                            </button>

                                        )}

                                        {/* DELETE */}

                                        {canDeleteCashAccount && (

                                            <button
                                                type="button"
                                                disabled={actionLoading}
                                                onClick={() =>
                                                    handleDelete(account)
                                                }

                                                className="
                                                    group relative
                                                    flex h-8 w-8
                                                    items-center justify-center
                                                    rounded-lg bg-red-50
                                                    text-red-600 transition
                                                    hover:bg-red-100
                                                    disabled:cursor-not-allowed
                                                    disabled:opacity-50
                                                "
                                            >
                                                <Trash2 size={16} />
                                                <ToolTipText text="Delete" position="bottom" />
                                            </button>

                                        )}

                                    </div>

                                </td>

                            </tr>

                        );

                    })}

                </tbody>

            </table>

            {/* PAGINATION */}

            <Pagination
                page={Number(pageNumber) || 0}
                size={Number(pageSize) || 20}
                totalElements={Number(totalElements) || 0}
                totalPages={Number(totalPages) || 0}
                loading={loading}
                label="cash accounts"
                onPageChange={(nextPage) => {
                    refreshCashAccounts(
                        nextPage,
                        Number(pageSize) || 20
                    );
                }}
                onPageSizeChange={(nextSize) => {
                    refreshCashAccounts(0, nextSize);
                }}
            />

        </div>
    );
}