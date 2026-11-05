
import React, {
    useCallback,
    useMemo,
} from "react";

import {
    useDispatch,
    useSelector,
} from "react-redux";

import { useNavigate } from "react-router-dom";

import {
    Eye,
    Wallet,
    CalendarDays,
    Building2,
    CreditCard,
    FileText,
    Edit,
    Trash2,
} from "lucide-react";

import toast from "react-hot-toast";

import {
    fetchAllClearance,
    deleteClearance,
} from "../thunks/clearanceThunks";

import {
    setExistingClearance,
} from "../slices/clearanceSlice";

import Pagination from "../../../common/pagination/table/Pagination";
import ToolTipText from "../../../common/toolTip/ToolTipText";

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

const CLEARANCE_STATUS_COLORS = {
    ACTIVE: "bg-green-100 text-green-700",
    INACTIVE: "bg-gray-100 text-gray-700",
    DRAFT: "bg-yellow-100 text-yellow-700",
};

const PAYMENT_METHOD_COLORS = {
    CASH: "bg-green-100 text-green-700",
    UPI: "bg-blue-100 text-blue-700",
    BANK_TRANSFER: "bg-purple-100 text-purple-700",
    CARD: "bg-indigo-100 text-indigo-700",
    CHEQUE: "bg-orange-100 text-orange-700",
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
            .toUpperCase() || "CC"
    );
};

const getAvatarColor = (value = "") => {
    const index = String(value)
        .split("")
        .reduce(
            (acc, char) => acc + char.charCodeAt(0),
            0
        ) % AVATAR_COLORS.length;

    return AVATAR_COLORS[index];
};

const formatAmount = (amount, currencyCode = "INR") => {
    const value = Number(amount ?? 0);

    return `${currencyCode ? `${currencyCode} ` : ""}${value.toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    )}`;
};

const formatDate = (date) => {
    if (!date) return "—";

    // API clearanceDate is YYYY-MM-DD.
    // Avoid timezone shifts when displaying date-only values.
    const dateValue = String(date).split("T")[0];

    const parts = dateValue.split("-");

    if (parts.length === 3) {
        const [year, month, day] = parts;

        const parsedDate = new Date(
            Number(year),
            Number(month) - 1,
            Number(day)
        );

        if (!Number.isNaN(parsedDate.getTime())) {
            return parsedDate.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
        }
    }

    return date;
};

const formatPaymentMethod = (method = "") => {
    return String(method)
        .toLowerCase()
        .split("_")
        .map(
            (word) =>
                word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join(" ");
};

/* =========================================================
   COMPONENT
========================================================= */

export default function ClearanceTable({
    clearances,
    fetchParams = {},
}) {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    /* =====================================================
       REDUX STATE
    ===================================================== */

    const {
        clearances: reduxClearances = EMPTY_ARRAY,
        loading = false,
        actionLoading = false,
        error = null,
        pagination = {},
    } = useSelector((state) => state.clearance || {});

    const {
        pageNumber = 0,
        pageSize = 20,
        totalPages = 0,
        totalElements = 0,
    } = pagination;

    const currentClearances = Array.isArray(clearances)
        ? clearances
        : reduxClearances;

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

    const canViewClearance = hasPermission(
        "Credit Clearance",
        "VIEW"
    );

    const canEditClearance = hasPermission(
        "Credit Clearance",
        "EDIT"
    );

    const canDeleteClearance = hasPermission(
        "Credit Clearance",
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

    const refreshClearances = useCallback(
        (page = pageNumber, size = pageSize) => {
            dispatch(
                fetchAllClearance(
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
       VIEW CLEARANCE
    ===================================================== */

    const handleView = (clearance) => {

        if (!canViewClearance) {
            toast.error(
                "You do not have permission to view Credit Clearances."
            );
            return;
        }

        dispatch(setExistingClearance(clearance));

        navigate(
            `/parties/clearances/view/${clearance.id}`
        );
    };

    /* =====================================================
       EDIT CLEARANCE
    ===================================================== */

    const handleEdit = (clearance) => {

        if (!canEditClearance) {
            toast.error(
                "You do not have permission to edit Credit Clearances."
            );
            return;
        }

        dispatch(setExistingClearance(clearance));

        navigate(
            `/parties/clearances/edit/${clearance.id}`
        );
    };

    /* =====================================================
       DELETE CLEARANCE
    ===================================================== */

    const handleDelete = async (clearance) => {

        if (!canDeleteClearance) {
            toast.error(
                "You do not have permission to delete Credit Clearances."
            );
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete clearance ${clearance.clearanceNo || clearance.id}?`
        );

        if (!confirmed) {
            return;
        }

        try {

            await dispatch(
                deleteClearance(clearance.id)
            ).unwrap();

            toast.success(
                "Credit clearance deleted successfully."
            );

            refreshClearances();

        } catch (error) {

            toast.error(
                typeof error === "string"
                    ? error
                    : "Failed to delete credit clearance."
            );
        }
    };

    /* =====================================================
       SORTING
    ===================================================== */

    const sortedClearances = useMemo(
        () => [...currentClearances],
        [currentClearances]
    );

    /* =====================================================
       LOADING
    ===================================================== */

    if (loading && !currentClearances.length) {
        return (
            <div className="flex items-center justify-center py-10">
                <p className="text-sm text-gray-500">
                    Loading credit clearances...
                </p>
            </div>
        );
    }

    /* =====================================================
       ERROR
    ===================================================== */

    if (error && !currentClearances.length) {
        return (
            <div className="
                rounded-xl border border-red-200
                bg-white p-8 text-center
            ">
                <p className="text-sm text-red-500">
                    {typeof error === "string"
                        ? error
                        : "Failed to fetch credit clearances"}
                </p>

                <button
                    type="button"
                    onClick={() => refreshClearances()}
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

    if (!currentClearances.length) {
        return (
            <div className="
                rounded-2xl border border-gray-200
                bg-white p-8 text-center
            ">
                <Wallet className="
                    mx-auto mb-3 h-10 w-10 text-gray-300
                " />

                <p className="text-sm text-gray-500">
                    No credit clearances found.
                </p>
            </div>
        );
    }

    /* =====================================================
       TABLE
    ===================================================== */

    return (

        <>
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
                                "Clearance",
                                "Party",
                                "Party Type",
                                "Payment Method",
                                "Clearanace",
                                "Remaining",
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

                        {sortedClearances.map((clearance) => {

                            const clearanceStatus = String(
                                clearance.status || ""
                            ).toUpperCase();

                            const paymentMethod = String(
                                clearance.paymentMethod || ""
                            ).toUpperCase();

                            const partyName =
                                clearance.partyName || "—";

                            const currencyCode =
                                clearance.currencyCode || "INR";

                            return (

                                <tr
                                    key={clearance.id}
                                    className="
                                    border-b border-gray-100
                                    text-xs transition-colors
                                    hover:bg-gray-50
                                "
                                >

                                    {/* CLEARANCE */}

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
                                                    clearance.clearanceNo
                                                )}
                                            `}
                                            >
                                                {getInitials(
                                                    clearance.clearanceNo
                                                )}
                                            </div>

                                            <div className="min-w-0">

                                                <p className="
                                                truncate font-medium
                                                text-gray-800
                                            ">
                                                    {clearance.clearanceNo || "—"}
                                                </p>

                                                <p className="
                                                mt-0.5 text-xs text-gray-500
                                            ">
                                                    ID: {clearance.id}
                                                </p>

                                            </div>

                                        </div>

                                    </td>

                                    {/* PARTY */}

                                    <td className="px-3 py-3">

                                        <div className="min-w-0">

                                            <p
                                                className="
                                                max-w-[180px] truncate
                                                font-medium text-gray-700
                                            "
                                                title={partyName}
                                            >
                                                {partyName}
                                            </p>

                                            <p className="
                                            mt-0.5 text-xs text-gray-500
                                        ">
                                                {clearance.partyCode || "—"}
                                            </p>

                                        </div>

                                    </td>

                                    {/* PARTY TYPE */}

                                    <td className="px-3 py-3">

                                        <span className={`
                                        inline-block whitespace-nowrap
                                        rounded-full px-2.5 py-1
                                        text-xs font-medium
                                        ${clearance.partyType === "CUSTOMER"
                                                ? "bg-blue-100 text-blue-700"
                                                : clearance.partyType === "SUPPLIER"
                                                    ? "bg-purple-100 text-purple-700"
                                                    : "bg-gray-100 text-gray-700"
                                            }
                                    `}>
                                            {clearance.partyType || "—"}
                                        </span>

                                    </td>

                                    {/* CLEARANCE DATE */}


                                    {/* PAYMENT METHOD */}

                                    <td className="px-3 py-3">

                                        <div className="
                                        flex flex-col items-start gap-1
                                    ">

                                            <span className={`
                                            inline-block whitespace-nowrap
                                            rounded-full px-2.5 py-1
                                            text-xs font-medium
                                            ${PAYMENT_METHOD_COLORS[paymentMethod] ||
                                                "bg-gray-100 text-gray-700"}
                                        `}>
                                                {formatPaymentMethod(paymentMethod) || "—"}
                                            </span>

                                            {clearance.paymentReferenceNumber && (
                                                <span className="
                                                max-w-[150px] truncate
                                                text-xs text-gray-400
                                            "
                                                    title={clearance.paymentReferenceNumber}
                                                >
                                                    {clearance.paymentReferenceNumber}
                                                </span>
                                            )}

                                        </div>

                                    </td>

                                    {/* CLEARANCE AMOUNT */}

                                    <td className="px-3 py-3">
                                        <div className="flex items-center gap-2 whitespace-nowrap">

                                            <Wallet
                                                size={14}
                                                className="text-green-500"
                                            />
                                            <span className="
                                            font-semibold text-green-700
                                        ">
                                                {formatAmount(
                                                    clearance.clearanceAmount,
                                                    currencyCode
                                                )}
                                            </span>

                                        </div>
                                        <div className="
                                        flex items-center gap-2 whitespace-nowrap
                                    ">

                                            <CalendarDays
                                                size={14}
                                                className="text-gray-500"
                                            />

                                            <span className="
                                            font-semibold text-gray-500
                                        ">
                                                {formatDate(
                                                    clearance.clearanceDate
                                                )}
                                            </span>

                                        </div>

                                    </td>



                                    {/* REMAINING OUTSTANDING */}

                                    <td className="px-3 py-3">

                                        <p className={`
                                        whitespace-nowrap font-semibold
                                        ${Number(
                                            clearance.remainingOutstandingCredit || 0
                                        ) > 0
                                                ? "text-orange-600"
                                                : "text-green-600"
                                            }
                                    `}>
                                            {formatAmount(
                                                clearance.remainingOutstandingCredit,
                                                currencyCode
                                            )}
                                        </p>

                                    </td>

                                    {/* STATUS */}

                                    <td className="px-3 py-3">

                                        <span className={`
                                        inline-block whitespace-nowrap
                                        rounded-full px-2.5 py-1
                                        text-xs font-medium
                                        ${CLEARANCE_STATUS_COLORS[clearanceStatus] ||
                                            "bg-gray-100 text-gray-700"}
                                    `}>
                                            {clearance.status || "—"}
                                        </span>

                                    </td>

                                    {/* ACTIONS */}

                                    <td className="px-4 py-3">

                                        <div className="
                                        relative flex items-center
                                        justify-end gap-2
                                    ">

                                            {canViewClearance && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleView(clearance)
                                                    }
                                                    className="
                                                    group relative flex h-8 w-8
                                                    items-center justify-center
                                                    rounded-lg bg-blue-50
                                                    text-blue-600 transition
                                                    hover:bg-blue-100
                                                    hover:text-blue-700
                                                "
                                                >
                                                    <Eye size={16} />

                                                    <ToolTipText
                                                        text="View"
                                                        position="bottom"
                                                    />
                                                </button>
                                            )}

                                            {canEditClearance && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleEdit(clearance)
                                                    }
                                                    className="
                                                    group relative flex h-8 w-8
                                                    items-center justify-center
                                                    rounded-lg bg-green-50
                                                    text-green-600 transition
                                                    hover:bg-green-100
                                                    hover:text-green-700
                                                "
                                                >
                                                    <Edit size={16} />

                                                    <ToolTipText
                                                        text="Edit"
                                                        position="bottom"
                                                    />
                                                </button>
                                            )}

                                            {canDeleteClearance && (
                                                <button
                                                    type="button"
                                                    disabled={actionLoading}
                                                    onClick={() =>
                                                        handleDelete(clearance)
                                                    }
                                                    className="
                                                    group relative flex h-8 w-8
                                                    items-center justify-center
                                                    rounded-lg bg-red-50
                                                    text-red-600 transition
                                                    hover:bg-red-100
                                                    hover:text-red-700
                                                    disabled:cursor-not-allowed
                                                    disabled:opacity-50
                                                "
                                                >
                                                    <Trash2 size={16} />

                                                    <ToolTipText
                                                        text="Delete"
                                                        position="bottom"
                                                    />
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

                {/* PAGINATION */}

                <Pagination
                    page={Number(pageNumber) || 0}
                    size={Number(pageSize) || 20}
                    totalElements={Number(totalElements) || 0}
                    totalPages={Number(totalPages) || 0}
                    loading={loading}
                    label="clearances"
                    onPageChange={(nextPage) => {
                        refreshClearances(
                            nextPage,
                            Number(pageSize) || 20
                        );
                    }}
                    onPageSizeChange={(nextSize) => {
                        refreshClearances(
                            0,
                            Number(nextSize) || 20
                        );
                    }}
                />

            </div>
        </>
    );
}