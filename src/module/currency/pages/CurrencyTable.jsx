
import React from "react";

import {
    useDispatch,
    useSelector,
} from "react-redux";

import { useNavigate } from "react-router-dom";

import {
    openModal,
} from "../../ui/uiSlice";

import {
    fetchAllCurrencies,
    deleteCurrency,
} from "../thunks/currencyThunks";

import {
    setExistingCurrency,
} from "../slices/currencySlice";

import {
    Edit,
    Trash2,
    Coins,
    Eye,
    Hash,
    CircleDollarSign,
} from "lucide-react";

import toast from "react-hot-toast";

import Pagination from "../../../common/pagination/table/Pagination";


export default function CurrencyTable({
    currencies = [],
}) {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    /* =====================================================
       REDUX STATE
    ===================================================== */

    const {
        loading,
        error,
        pageNumber = 0,
        pageSize = 10,
        totalPages = 0,
        totalElements = 0,
    } = useSelector((state) => state.currency || {});

    const currentCurrencies = currencies || [];

    /* =====================================================
       AUTH STATE
    ===================================================== */

    const user = useSelector(
        (state) => state.auth?.user
    );

    /* =====================================================
       PERMISSION STATE
    ===================================================== */

    const permissions = useSelector(
        (state) =>
            state.menuPermission?.userPermissions || []
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

    const isSuperAdmin =
        normalizedRole === "SUPER_ADMIN";

    const isAdmin =
        normalizedRole === "ADMIN";

    const hasFullAccess =
        isSuperAdmin || isAdmin;

    /* =====================================================
       PERMISSION CHECK
    ===================================================== */

    const hasPermission = (
        moduleName,
        actionName
    ) => {

        if (hasFullAccess) {
            return true;
        }

        if (!Array.isArray(permissions)) {
            return false;
        }

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
                String(permission?.status || "")
                    .trim()
                    .toUpperCase() === "INACTIVE"
            ) {
                return false;
            }

            /* GROUPED ACTIONS */

            if (Array.isArray(permission?.actions)) {

                return permission.actions.some((action) => {

                    if (typeof action === "string") {
                        return (
                            action.trim().toUpperCase() ===
                            requestedAction
                        );
                    }

                    const permissionAction = String(
                        action?.actionName ||
                        action?.action?.actionName ||
                        action?.action?.name ||
                        action?.name ||
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
                        String(action?.status || "")
                            .trim()
                            .toUpperCase() === "INACTIVE"
                    ) {
                        return false;
                    }

                    return (
                        permissionAction === requestedAction &&
                        allowed
                    );

                });
            }

            /* FLAT ACTION */

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

    };

    /* =====================================================
       CURRENCY PERMISSIONS
    ===================================================== */

    const canViewCurrency = hasPermission(
        "Currencies",
        "VIEW"
    );

    const canEditCurrency = hasPermission(
        "Currencies",
        "EDIT"
    );

    const canDeleteCurrency = hasPermission(
        "Currencies",
        "DELETE"
    );

    /* =====================================================
       DELETE CURRENCY
    ===================================================== */

    const handleDelete = async (id) => {

        if (!canDeleteCurrency) {

            toast.error(
                "You do not have permission to delete currencies."
            );

            return;
        }

        if (
            !window.confirm(
                "Delete this currency?"
            )
        ) {
            return;
        }

        try {

            await dispatch(
                deleteCurrency(id)
            ).unwrap();

            toast.success(
                "Currency deleted successfully"
            );

            dispatch(
                fetchAllCurrencies({
                    page: Number(pageNumber) || 0,
                    size: Number(pageSize) || 10,
                })
            );

        } catch (error) {

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    "Failed to delete currency"
            );

        }

    };

    /* =====================================================
       VIEW CURRENCY
    ===================================================== */

    const handleView = (currency) => {

        if (!canViewCurrency) {

            toast.error(
                "You do not have permission to view currencies."
            );

            return;
        }

        try {

            dispatch(
                setExistingCurrency(currency)
            );

            navigate(
                `/settings/currencies/view/${currency.id}`
            );

        } catch (error) {

            toast.error(
                "Failed to open currency"
            );

        }

    };

    /* =====================================================
       EDIT CURRENCY
    ===================================================== */

    const handleEdit = (currency) => {

        if (!canEditCurrency) {

            toast.error(
                "You do not have permission to edit currencies."
            );

            return;
        }

        try {

            dispatch(
                setExistingCurrency(currency)
            );

            navigate(
                `/settings/currencies/edit/${currency.id}`
            );

        } catch (error) {

            toast.error(
                "Failed to open currency"
            );

        }

    };

    /* =====================================================
       CURRENCY INITIALS
    ===================================================== */

    const initials = (currencyName) => {

        if (!currencyName) {
            return "CU";
        }

        return currencyName
            .split(" ")
            .filter(Boolean)
            .map((word) => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "CU";

    };

    /* =====================================================
       STATUS COLORS
    ===================================================== */

    const statusColor = {

        ACTIVE:
            "bg-green-100 text-green-700",

        INACTIVE:
            "bg-gray-100 text-gray-700",

        DRAFT:
            "bg-yellow-100 text-yellow-700",

    };

    /* =====================================================
       AVATAR COLORS
    ===================================================== */

    const avatarColors = [

        "bg-pink-500 text-white",
        "bg-green-500 text-white",
        "bg-blue-500 text-white",
        "bg-purple-500 text-white",
        "bg-orange-500 text-white",
        "bg-cyan-500 text-white",
        "bg-indigo-500 text-white",

    ];

    const getAvatarColor = (name = "") => {

        const index = name
            .split("")
            .reduce(
                (acc, char) =>
                    acc + char.charCodeAt(0),
                0
            ) % avatarColors.length;

        return avatarColors[index];

    };

    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {

        return (

            <div className="flex items-center justify-center py-10">

                <p className="text-gray-500">
                    Loading currencies...
                </p>

            </div>

        );

    }

    /* =====================================================
       ERROR
    ===================================================== */

    if (error) {

        return (

            <div
                className="
                    rounded-xl border border-red-200
                    bg-white p-8 text-center
                "
            >

                <p className="text-red-500">
                    {error}
                </p>

            </div>

        );

    }

    /* =====================================================
       EMPTY STATE
    ===================================================== */

    if (!currentCurrencies.length) {

        return (

            <div
                className="
                    rounded-2xl border border-gray-200
                    bg-white p-8 text-center
                "
            >

                <Coins
                    className="
                        mx-auto mb-3 h-10 w-10
                        text-gray-300
                    "
                />

                <p className="text-gray-500">
                    No currencies found.
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

            <div className="overflow-x-auto overflow-y-visible">

                <table className="w-full">

                    {/* TABLE HEADER */}

                    <thead className="
                        border-b border-gray-300
                        bg-[#FAF9F7]/20
                    ">

                        <tr>

                            {[
                                "Currency",
                                "Currency Code",
                                "Symbol",
                                "Decimal Places",
                                "Status",
                                "Actions",
                            ].map((header) => (

                                <th
                                    key={header}
                                    className={`
                                        px-5 py-3
                                        text-md font-medium
                                        uppercase text-gray-400
                                        ${header === "Actions"
                                            ? "text-right"
                                            : "text-left"
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

                        {[...currentCurrencies]
                            .sort(
                                (a, b) =>
                                    (a.id || 0) - (b.id || 0)
                            )
                            .map((currency, index) => (

                                <tr
                                    key={currency.id || index}
                                    className="
                                        cursor-pointer border-b
                                        border-gray-100 text-xs
                                        transition-colors hover:bg-gray-50
                                    "
                                >

                                    {/* CURRENCY */}

                                    <td className="overflow-hidden px-2 py-3">

                                        <div className="
                                            flex min-w-0 items-center gap-2
                                        ">

                                            <div className={`
                                                flex h-9 min-w-[36px]
                                                w-9 items-center justify-center
                                                rounded-full text-sm font-bold
                                                ${getAvatarColor(
                                                currency.currencyName
                                            )}
                                            `}>

                                                {initials(currency.currencyName)}

                                            </div>

                                            <div className="min-w-0">

                                                <p
                                                    className="
                                                        truncate font-medium
                                                        text-gray-800
                                                    "
                                                    title={currency.currencyName || ""}
                                                >
                                                    {currency.currencyName || "—"}
                                                </p>

                                                <p className="text-xs text-gray-500">
                                                    ID: #{currency.id}
                                                </p>

                                            </div>

                                        </div>

                                    </td>

                                    {/* CURRENCY CODE */}

                                    <td className="overflow-hidden px-2 py-3">

                                        <div className="
                                            flex items-center gap-1.5
                                        ">

                                            <Hash
                                                size={13}
                                                className="text-gray-400"
                                            />

                                            <p
                                                className="
                                                    font-medium text-gray-700
                                                "
                                                title={currency.currencyCode || ""}
                                            >
                                                {currency.currencyCode || "—"}
                                            </p>

                                        </div>

                                    </td>

                                    {/* SYMBOL */}

                                    <td className="overflow-hidden px-2 py-3">

                                        <div className="
                                            flex items-center gap-1.5
                                        ">

                                            <CircleDollarSign
                                                size={14}
                                                className="text-gray-400"
                                            />

                                            <p
                                                className="
                                                    font-medium text-gray-700
                                                "
                                                title={currency.symbol || ""}
                                            >
                                                {currency.symbol || "—"}
                                            </p>

                                        </div>

                                    </td>

                                    {/* DECIMAL PLACES */}

                                    <td className="overflow-hidden px-2 py-3">

                                        <p className="
                                            font-medium text-gray-700
                                        ">
                                            {currency.decimalPlaces ?? "—"}
                                        </p>

                                    </td>

                                    {/* STATUS */}

                                    <td className="overflow-hidden px-2 py-3">

                                        <span className={`
                                            inline-block rounded-full
                                            px-2 py-1 text-xs font-medium
                                            ${statusColor[
                                            String(
                                                currency.status || ""
                                            ).toUpperCase()
                                            ] ||
                                            "bg-gray-100 text-gray-700"
                                            }
                                        `}>
                                            {currency.status || "—"}
                                        </span>

                                    </td>

                                    {/* ACTIONS */}

                                    <td className="px-4 py-3">

                                        <div className="
                                            flex items-center justify-end gap-2
                                        ">

                                            {/* VIEW */}

                                            {canViewCurrency && (

                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleView(currency);
                                                    }}
                                                    title="View"
                                                    className="
                                                        flex h-8 w-8 items-center
                                                        justify-center rounded-lg
                                                        bg-blue-50 text-blue-600
                                                        transition hover:bg-blue-100
                                                        hover:text-blue-700
                                                    "
                                                >
                                                    <Eye size={16} />
                                                </button>

                                            )}

                                            {/* EDIT */}

                                            {canEditCurrency && (

                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEdit(currency);
                                                    }}
                                                    title="Edit"
                                                    className="
                                                        flex h-8 w-8 items-center
                                                        justify-center rounded-lg
                                                        bg-amber-50 text-amber-600
                                                        transition hover:bg-amber-100
                                                        hover:text-amber-700
                                                    "
                                                >
                                                    <Edit size={16} />
                                                </button>

                                            )}

                                            {/* DELETE */}

                                            {canDeleteCurrency && (

                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(currency.id);
                                                    }}
                                                    title="Delete"
                                                    className="
                                                        flex h-8 w-8 items-center
                                                        justify-center rounded-lg
                                                        bg-red-50 text-red-600
                                                        transition hover:bg-red-100
                                                        hover:text-red-700
                                                    "
                                                >
                                                    <Trash2 size={16} />
                                                </button>

                                            )}

                                        </div>

                                    </td>

                                </tr>

                            ))}

                    </tbody>

                </table>

                {/* PAGINATION */}

                <Pagination
                    page={Number(pageNumber) || 0}
                    size={Number(pageSize) || 10}
                    totalElements={Number(totalElements) || 0}
                    totalPages={Number(totalPages) || 0}
                    loading={loading}
                    label="currencies"
                    onPageChange={(nextPage) => {
                        dispatch(
                            fetchAllCurrencies({
                                page: nextPage,
                                size: Number(pageSize) || 10,
                            })
                        );
                    }}
                    onPageSizeChange={(nextSize) => {
                        dispatch(
                            fetchAllCurrencies({
                                page: 0,
                                size: nextSize,
                            })
                        );
                    }}
                />

            </div>

        </div>

    );
}
