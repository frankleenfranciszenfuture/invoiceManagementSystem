
import React, { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
    Edit,
    Eye,
    Receipt,
    CalendarDays,
    UserRound,
    Wallet,
    CheckCircle,
    X,
} from "lucide-react";

import toast from "react-hot-toast";

import {
    fetchAllExpenses,
    approveExpense,
    rejectExpense,
} from "../thunks/expenseThunks";

import {
    setExistingExpense,
} from "../slices/expenseSlice";

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

const EXPENSE_STATUS_COLORS = {
    DRAFT: "bg-yellow-100 text-yellow-700",
    PENDING: "bg-orange-100 text-orange-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
    CANCELLED: "bg-gray-100 text-gray-700",
};

const PAYMENT_STATUS_COLORS = {
    UNPAID: "bg-red-100 text-red-700",
    PARTIAL: "bg-orange-100 text-orange-700",
    PAID: "bg-green-100 text-green-700",
};

/* =========================================================
   HELPERS
========================================================= */

const getInitials = (name = "") => {
    return (
        String(name)
            .split(" ")
            .filter(Boolean)
            .map((word) => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "EX"
    );
};

const getAvatarColor = (name = "") => {
    const index = String(name)
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0)
        % AVATAR_COLORS.length;

    return AVATAR_COLORS[index];
};

const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
        return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const formatAmount = (amount, currencySymbol = "") => {
    const value = Number(amount ?? 0);

    return `${currencySymbol ? `${currencySymbol} ` : ""}${value.toLocaleString(
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

export default function ExpenseTable({
    expenses,
    fetchParams = {},
}) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    /* =====================================================
       REDUX STATE
    ===================================================== */

    const {
        expenses: reduxExpenses = EMPTY_ARRAY,
        loading = false,
        error = null,
        pagination = {},
    } = useSelector((state) => state.expense || {});

    const {
        pageNumber = 0,
        pageSize = 20,
        totalPages = 0,
        totalElements = 0,
    } = pagination;

    const currentExpenses = Array.isArray(expenses)
        ? expenses
        : reduxExpenses;

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

    const canViewExpense = hasPermission("Expenses", "VIEW");
    const canEditExpense = hasPermission("Expenses", "EDIT");

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

    const refreshExpenses = useCallback(
        (page = pageNumber, size = pageSize) => {
            dispatch(
                fetchAllExpenses(
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
       VIEW EXPENSE
    ===================================================== */

    const handleView = (expense) => {
        if (!canViewExpense) {
            toast.error(
                "You do not have permission to view Expenses."
            );
            return;
        }

        dispatch(setExistingExpense(expense));

        navigate(`/invoice/expenses/view/${expense.id}`);
    };

    /* =====================================================
       EDIT EXPENSE
    ===================================================== */

    const handleEdit = (expense) => {
        if (!canEditExpense) {
            toast.error(
                "You do not have permission to edit Expenses."
            );
            return;
        }

        dispatch(setExistingExpense(expense));

        navigate(`/invoice/expenses/edit/${expense.id}`);
    };


    const handleConfirmExpense = async (expense) => {
        try {
            await dispatch(approveExpense(expense.id)).unwrap();

            toast.success("Expenses confirmed successfully");

            // Refresh the current purchase order list
            dispatch(fetchAllExpenses({
                page: pagination?.page ?? 0,
                size: pagination?.size ?? 10,
            }));
        } catch (error) {
            toast.error(
                error?.message || "Failed to confirm purchase order"
            );
        }
    };


    const handleRejectExpense = async (expense) => {
        try {
            await dispatch(
                rejectExpense({
                    id: expense.id,
                    reason: "Expense rejected",
                })
            ).unwrap();

            toast.success("Expenses rejected successfully");

            // Refresh the current purchase order list
            dispatch(fetchAllExpenses({
                page: pagination?.page ?? 0,
                size: pagination?.size ?? 10,
            }));
        } catch (error) {
            console.log("Backend error:", error);

            const message =
                typeof error === "string"
                    ? error
                    : error?.message ||
                    error?.data?.message ||
                    "Unable to save purchase order";

            toast.error(message);
        }
    };

    /* =====================================================
       SORTING
    ===================================================== */

    const sortedExpenses = useMemo(
        () => [...currentExpenses],
        [currentExpenses]
    );


    const getExpenseStatus = (order) => {
        return String(
            order?.status ||
            order?.expenseStatus ||
            ""
        )
            .trim()
            .toUpperCase();
    };

    const statusColor = {
        DRAFT: "bg-yellow-100 text-yellow-700",
        CONFIRMED: "bg-blue-100 text-blue-700",
        PARTIALLY_RECEIVED: "bg-amber-100 text-amber-700",
        RECEIVED: "bg-green-100 text-green-700",
        CANCELLED: "bg-red-100 text-red-700",
    };

    /* =====================================================
       LOADING
    ===================================================== */

    if (loading && !currentExpenses.length) {
        return (
            <div className="flex items-center justify-center py-10">
                <p className="text-sm text-gray-500">
                    Loading expenses...
                </p>
            </div>
        );
    }

    /* =====================================================
       ERROR
    ===================================================== */

    if (error && !currentExpenses.length) {
        return (
            <div className="
                rounded-xl border border-red-200
                bg-white p-8 text-center
            ">
                <p className="text-sm text-red-500">
                    {typeof error === "string"
                        ? error
                        : "Failed to fetch expenses"}
                </p>

                <button
                    type="button"
                    onClick={() => refreshExpenses()}
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

    if (!currentExpenses.length) {
        return (
            <div className="
                rounded-2xl border border-gray-200
                bg-white p-8 text-center
            ">
                <Receipt className="
                    mx-auto mb-3 h-10 w-10 text-gray-300
                " />

                <p className="text-sm text-gray-500">
                    No expenses found.
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
            <table className="w-full min-w-[950px]">

                {/* TABLE HEADER */}

                <thead className="
                    border-b border-gray-300
                    bg-[#FAF9F7]/20
                ">
                    <tr>
                        {[
                            "Expense",
                            "Category",
                            "Expense Date",
                            "Vendor",
                            "Total Amount",
                            "Ex-Status",
                            "Pay-Status",
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
                    {sortedExpenses.map((expense, index) => {
                        const status = getExpenseStatus(expense);
                        const isDraft = status === "DRAFT";

                        return (
                            <tr
                                key={expense.id || index}
                                className="
                                    border-b border-gray-100
                                    text-xs transition-colors
                                    hover:bg-gray-50
                                "
                            >

                                {/* EXPENSE */}

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
                                                expense.expenseNo
                                            )}
                                            `}
                                        >
                                            {getInitials(expense.expenseNo)}
                                        </div>

                                        <div className="min-w-0">
                                            <p
                                                className="
                                                    truncate font-medium
                                                    text-gray-800
                                                    whitespace-nowrap
                                                "
                                                title={expense.expenseNo || ""}
                                            >
                                                {expense.expenseNo || "—"}
                                            </p>

                                            <p className="
                                                mt-0.5 text-xs text-gray-500
                                            ">
                                                {expense.expenseType || "—"}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                {/* CATEGORY */}

                                <td className="px-3 py-3">
                                    <p
                                        className="
                                            max-w-[180px] truncate
                                            font-medium text-gray-700
                                            
                                        "
                                        title={expense.categoryName}
                                    >
                                        {expense.categoryName}
                                    </p>

                                    <p className="
                                        mt-0.5 text-xs text-gray-400
                                    ">
                                        {expense.categoryCode || "—"}
                                    </p>
                                </td>

                                {/* EXPENSE DATE */}

                                <td className="px-3 py-3">
                                    <div className="
                                        flex items-center gap-2
                                        whitespace-nowrap text-gray-700
                                    ">
                                        <CalendarDays
                                            size={14}
                                            className="text-gray-400"
                                        />

                                        {formatDate(expense.expenseDate)}
                                    </div>
                                </td>

                                {/* VENDOR */}

                                <td className="px-3 py-3">
                                    <div className="
                                        flex min-w-0 items-center gap-2
                                    ">
                                        <UserRound
                                            size={14}
                                            className="shrink-0 text-gray-400"
                                        />
                                        <span className="flex ">
                                            {expense.vendorName}
                                        </span>
                                        {/* <p
                                            className="
                                                max-w-[160px] truncate
                                                font-medium text-gray-700
                                            "
                                            title={expense.vendorName}
                                        >
                                            {expense.vendorName}
                                        </p> */}
                                    </div>
                                </td>

                                {/* TOTAL AMOUNT */}

                                <td className="px-3 py-3">
                                    <div className="
                                        flex items-center gap-2
                                        whitespace-nowrap
                                    ">
                                        <Wallet
                                            size={14}
                                            className="text-gray-400"
                                        />

                                        <div>
                                            <p className="
                                                font-semibold text-gray-800
                                            ">
                                                {formatAmount(
                                                    expense.totalAmount,
                                                    expense.currencySymbol
                                                )}
                                            </p>

                                            <p className="
                                                mt-0.5 text-xs text-gray-400
                                            ">
                                                Due: {formatAmount(
                                                    expense.dueAmount,
                                                    expense.currencySymbol
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                {/* EXPENSE STATUS */}

                                <td className="px-3 py-3">
                                    <span
                                        className={`
                                            inline-block whitespace-nowrap
                                            rounded-full px-2.5 py-1
                                            text-xs font-medium
                                            ${EXPENSE_STATUS_COLORS[
                                            getExpenseStatus
                                            ] ||
                                            "bg-gray-100 text-gray-700"
                                            }
                                        `}
                                    >
                                        {expense.expenseStatus || "—"}
                                    </span>
                                </td>

                                {/* PAYMENT STATUS */}

                                <td className="px-3 py-3">
                                    <span
                                        className={`
                                            inline-block whitespace-nowrap
                                            rounded-full px-2.5 py-1
                                            text-xs font-medium
                                            ${PAYMENT_STATUS_COLORS[
                                            expense.paymentStatus
                                            ] ||
                                            "bg-gray-100 text-gray-700"
                                            }
                                        `}
                                    >
                                        {expense.paymentStatus || "—"}
                                    </span>
                                </td>

                                {/* ACTIONS */}

                                <td className="px-4 py-3">
                                    <div className="
                                        flex items-center justify-end gap-2
                                    ">
                                        {canViewExpense && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleView(expense)
                                                }

                                                className="
                                                group
                                                relative
                                                    flex h-8 w-8
                                                    items-center justify-center
                                                    rounded-lg bg-blue-50
                                                    text-blue-600 transition
                                                    hover:bg-blue-100
                                                    hover:text-blue-700
                                                "
                                            >
                                                <Eye size={16} />
                                                <ToolTipText text="View" position="bottom" />
                                            </button>
                                        )}

                                        {/* CONFIRM */}
                                        {canEditExpense && isDraft && (
                                            <button
                                                type="button"
                                                onClick={() => handleConfirmExpense(expense)}

                                                className="
                                                    group relative
                                                    flex h-8 w-8
                                                    items-center justify-center
                                                    rounded-lg
                                                    bg-green-50 text-green-600
                                                    transition
                                                    hover:bg-green-100
                                                    hover:text-green-700
                                                "
                                            >
                                                <CheckCircle size={16} />
                                                <ToolTipText text="Confirm Expenses" position="bottom" />
                                            </button>
                                        )}


                                        {/* Reject */}
                                        {canEditExpense && isDraft && (
                                            <button
                                                type="button"
                                                onClick={() => handleRejectExpense(expense)}
                                                className="
                                                group relative
                                                flex h-8 w-8
                                                items-center justify-center
                                                rounded-lg
                                                bg-red-50 text-red-600
                                                transition
                                                hover:bg-red-100
                                                hover:text-red-700
                                            "
                                            >
                                                <X size={16} />
                                                <ToolTipText text="Reject Expense" position="bottom" />
                                            </button>
                                        )}

                                        {canEditExpense && isDraft && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleEdit(expense)
                                                }

                                                className="
                                                group
                                                relative
                                                    flex h-8 w-8
                                                    items-center justify-center
                                                    rounded-lg bg-amber-50
                                                    text-amber-600 transition
                                                    hover:bg-amber-100
                                                    hover:text-amber-700
                                                "
                                            >
                                                <Edit size={16} />
                                                <ToolTipText text="Edit" position="bottom" />
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
                label="expenses"
                onPageChange={(nextPage) => {
                    refreshExpenses(
                        nextPage,
                        Number(pageSize) || 20
                    );
                }}
                onPageSizeChange={(nextSize) => {
                    refreshExpenses(0, nextSize);
                }}
            />
        </div>
    );
}