import React, { useState } from "react";

import {
    useDispatch,
    useSelector,
} from "react-redux";

import {
    useNavigate,
} from "react-router-dom";

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
    ChevronDown,
    Edit,
    Trash2,
    Building2,
    Eye,
} from "lucide-react";

import toast from "react-hot-toast";
import Pagination from "../../../common/pagination/table/Pagination";


export default function CurrencyTable({ currency = [] }) {

    const dispatch = useDispatch();

    const navigate =
        useNavigate();

    const [showEdit, setShowEdit] = useState(false);
    const [showView, setShowView] = useState(false);
    /* =====================================================
       REDUX STATE
    ===================================================== */

    const {
        loading,
        error,
        pagination,
    } = useSelector(
        (state) =>
            state.currency
    );


    const {
        pageNumber,
        pageSize,
        totalPages,
        totalElements,
    } = pagination || {};


    const currentCurrencies =
        currency || [];


    /* =====================================================
       AUTH STATE
    ===================================================== */

    const user = useSelector(
        (state) =>
            state.auth?.user
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


    const normalizedRole =
        String(roleName)
            .trim()
            .toUpperCase();


    const isSuperAdmin =
        normalizedRole === "SUPER_ADMIN";


    const isAdmin =
        normalizedRole === "ADMIN";


    const hasFullAccess =
        isSuperAdmin ||
        isAdmin;




    const hasPermission = (
        moduleName,
        actionName
    ) => {

        /* =================================================
           SUPER ADMIN / ADMIN
        ================================================= */

        if (hasFullAccess) {
            return true;
        }


        /* =================================================
           INVALID PERMISSION STATE
        ================================================= */

        if (!Array.isArray(permissions)) {
            return false;
        }


        const requestedModule =
            String(moduleName)
                .trim()
                .toLowerCase();


        const requestedAction =
            String(actionName)
                .trim()
                .toUpperCase();


        /* =================================================
           SEARCH PERMISSIONS
        ================================================= */

        return permissions.some(
            (permission) => {

                /* =========================================
                   MODULE
                ========================================= */

                const permissionModule =
                    String(
                        permission?.moduleName ||
                        permission?.module?.moduleName ||
                        permission?.module?.name ||
                        ""
                    )
                        .trim()
                        .toLowerCase();


                if (
                    permissionModule !==
                    requestedModule
                ) {
                    return false;
                }


                /* =========================================
                   PERMISSION STATUS
                ========================================= */

                if (
                    permission?.active === false
                ) {
                    return false;
                }


                if (
                    String(
                        permission?.status || ""
                    )
                        .trim()
                        .toUpperCase() ===
                    "INACTIVE"
                ) {
                    return false;
                }


                /* =========================================
                   GROUPED ACTIONS
                ========================================= */

                if (
                    Array.isArray(
                        permission?.actions
                    )
                ) {

                    return permission.actions.some(
                        (action) => {

                            const permissionAction =
                                String(
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
                                permissionAction ===
                                requestedAction &&
                                allowed
                            );

                        }
                    );

                }


                /* =========================================
                   FLAT ACTION
                ========================================= */

                const permissionAction =
                    String(
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
                    permissionAction ===
                    requestedAction &&
                    allowed
                );

            }
        );

    };


    /* =====================================================
       CURRENCY PERMISSIONS
    ===================================================== */

    const canEditCurrency =
        hasPermission(
            "Currency Detail",
            "EDIT"
        );


    const canDeleteCurrency =
        hasPermission(
            "Currency Detail",
            "DELETE"
        );

    const canViewCurrency =
        hasPermission(
            "Currency Detail",
            "VIEW"
        );


    /* =====================================================
       DELETE CURRENCY
    ===================================================== */

    const handleDelete = async (
        id
    ) => {

        /* =================================================
           PERMISSION SAFETY CHECK
        ================================================= */

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
                fetchAllCurrencies()
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

    const handleView = (
        currency
    ) => {


        try {

            if (!canViewCurrency) {

                toast.error(
                    "You do not have permission to view currencies."
                );

                return;
            }

            dispatch(
                setExistingCurrency(
                    currency
                )
            );


            navigate(
                `/currencies/view/${currency.id}`
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

    const handleEdit = (
        salesPerson
    ) => {

        /* =================================================
           PERMISSION SAFETY CHECK
        ================================================= */

        if (!canEditCurrency) {

            toast.error(
                "You do not have permission to edit currencies."
            );

            return;
        }


        console.log(
            "EDIT CURRENCY:",
            currency
        );


        try {

            dispatch(
                openModal({
                    type: "editCurrency",
                    data: currency,
                })
            );


            console.log(
                "CURRENCY MODAL OPEN DISPATCHED"
            );

        } catch (error) {

            console.error(
                "CURRENCY EDIT ERROR:",
                error
            );


            toast.error(
                error?.message ||
                "Failed to open currency"
            );

        }

    };


    /* =====================================================
       CURRENCY INITIALS
    ===================================================== */

    const initials = (
        name
    ) => {

        if (!name) {
            return "CUR";
        }


        return name
            ?.split(" ")
            .filter(Boolean)
            .map(
                (word) =>
                    word[0]
            )
            .join("")
            .slice(0, 2)
            .toUpperCase() || "SP";

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
       SALES PERSON AVATAR COLORS
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


    const getAvatarColor = (
        name = ""
    ) => {

        const index =
            name
                .split("")
                .reduce(
                    (
                        acc,
                        char
                    ) =>
                        acc +
                        char.charCodeAt(0),
                    0
                ) %
            avatarColors.length;


        return avatarColors[index];

    };


    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {

        return (

            <div
                className="
                    flex
                    items-center
                    justify-center
                    py-10
                "
            >

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
                    bg-white
                    rounded-xl
                    border
                    border-red-200
                    p-8
                    text-center
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
                    bg-white
                    rounded-2xl
                    border
                    border-gray-200
                    p-8
                    text-center
                "
            >

                <Building2
                    className="
                        mx-auto
                        mb-3
                        h-10
                        w-10
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

        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto overflow-y-visible">
            <div className="overflow-x-auto overflow-y-visible">
                <table className="w-full">
                    <thead className="bg-[#FEFEFD] border-b border-gray-300">

                        <tr>

                            {[
                                "CurrencyName",
                                "CurrencyCode",
                                "symbol",
                                "decimalPlaces",
                                "Status",
                                "Actions",
                            ].map((header) => (

                                <th
                                    key={header}
                                    className={`
                                    px-5
                                    py-3
                                    font-medium
                                    text-md
                                    text-gray-400
                                    uppercase
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



                    {/* =================================================
                    TABLE BODY
                ================================================= */}

                    <tbody>

                        {[
                            ...currentCurrencies,
                        ]
                            .sort(
                                (
                                    a,
                                    b
                                ) =>
                                    (
                                        a.id || 0
                                    ) -
                                    (
                                        b.id || 0
                                    )
                            )
                            .map(
                                (
                                    currency,
                                    index
                                ) => (

                                    <tr
                                        key={
                                            currency.id ||
                                            index
                                        }
                                        onClick={() =>
                                            handleView(
                                                currency
                                            )
                                        }
                                        className="
                                        border-b
                                        border-gray-100
                                        hover:bg-gray-50
                                        text-xs
                                        cursor-pointer
                                        transition-colors
                                    "
                                    >

                                        {/* =================================
                                        CURRENCY
                                    ================================= */}

                                        <td
                                            className="
                                            px-2
                                            py-3
                                        "
                                        >

                                            <div
                                                className="
                                                flex
                                                items-center
                                                gap-3
                                            "
                                            >

                                                <div
                                                    className={`
                                                    w-10
                                                    h-10
                                                    rounded-full
                                                    flex
                                                    items-center
                                                    justify-center
                                                    text-md
                                                    font-bold
                                                    ${getAvatarColor(
                                                        currency.currencyName
                                                    )}
                                                `}
                                                >

                                                    {initials(
                                                        currency.currencyName
                                                    )}

                                                </div>


                                                <div>

                                                    <p
                                                        className="
                                                        font-medium
                                                        text-gray-800
                                                    "
                                                    >
                                                        {
                                                            currency.currencyName ||
                                                            "—"
                                                        }
                                                    </p>


                                                    <p
                                                        className="
                                                        text-sm
                                                        text-gray-500
                                                    "
                                                    >
                                                        ID: #
                                                        {
                                                            currency.id
                                                        }
                                                    </p>

                                                </div>

                                            </div>

                                        </td>


                                        {/* =================================
                                        CURRENCY code
                                    ================================= */}

                                        <td
                                            className="
                                            px-4
                                            py-3
                                        "
                                        >
                                            {
                                                currency.currencyCode ||
                                                "—"
                                            }
                                        </td>


                                        {/* =================================
                                        CURRENCY SYMBOL
                                    ================================= */}

                                        <td
                                            className="
                                            px-4
                                            py-3
                                        "
                                        >
                                            {
                                                currency.symbol ||
                                                "—"
                                            }
                                        </td>



                                        {/* =================================
                                        DECIMAL PLACES
                                    ================================= */}

                                        <td
                                            className="
                                            px-4
                                            py-3
                                        "
                                        >
                                            {
                                                currency.decimalPlaces ||
                                                "—"
                                            }
                                        </td>




                                        {/* =================================
                                        STATUS
                                    ================================= */}

                                        <td
                                            className="
                                            px-5
                                            py-3
                                            font-semibold
                                        "
                                        >

                                            <span
                                                className={`
                                                px-2
                                                py-1
                                                rounded-full
                                                text-xs
                                                font-medium
                                                ${statusColor[
                                                    currency.status
                                                    ] ||
                                                    "bg-gray-100 text-gray-700"
                                                    }
                                            `}
                                            >

                                                {
                                                    currency.status ||
                                                    "—"
                                                }

                                            </span>

                                        </td>


                                        {/* =================================
                                        ACTIONS
                                    ================================= */}

                                        {/* Actions */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">

                                                {/* View */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowView(true);
                                                        dispatch(setExistingCurrency(currency));
                                                        navigate(`/settings/currencies/view/${currency.id}`);
                                                    }}
                                                    title="View"
                                                    className="
                                                            flex h-8 w-8 items-center justify-center
                                                            rounded-lg
                                                            bg-blue-50
                                                            text-blue-600
                                                            transition
                                                            hover:bg-blue-100
                                                            hover:text-blue-700
                                                        "
                                                >
                                                    <Eye size={16} />
                                                </button>

                                                {/* Edit */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowEdit(true);
                                                        dispatch(setExistingCurrency(currency));
                                                        navigate(`/settings/currencies/edit/${currency.id}`);
                                                    }}
                                                    title="Edit"
                                                    className="
                                                        flex h-8 w-8 items-center justify-center
                                                        rounded-lg
                                                        bg-amber-50
                                                        text-amber-600
                                                        transition
                                                        hover:bg-amber-100
                                                        hover:text-amber-700
                                                    "
                                                >
                                                    <Edit size={16} />
                                                </button>

                                                {/* Delete */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();

                                                        // Your delete confirmation logic
                                                        handleDelete(currency.id);
                                                    }}
                                                    title="Delete"
                                                    className="
                                                        flex h-8 w-8 items-center justify-center
                                                        rounded-lg
                                                        bg-red-50
                                                        text-red-600
                                                        transition
                                                        hover:bg-red-100
                                                        hover:text-red-700
                                                    "
                                                >
                                                    <Trash2 size={16} />
                                                </button>

                                            </div>
                                        </td>


                                    </tr>

                                )
                            )}

                    </tbody>

                </table>


                {/* =====================================================
                PAGINATION
            ===================================================== */}

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

        </div >
    );

}