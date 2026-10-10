
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    useDispatch,
    useSelector,
} from "react-redux";

import {
    openModal,
} from "../../ui/uiSlice";

import {
    fetchAllBankAccounts,
    deleteBankAccount,
} from "../thunks/bankAccountThunks";

import {
    setExsistingBankAccount,
} from "../slices/bankAccountSlice";

import {
    ChevronDown,
    Edit,
    Trash2,
    Landmark,
    Star,
    Eye,
} from "lucide-react";

import toast from "react-hot-toast";


export default function BankAccountTable({
    bankAccounts = [],
}) {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showEdit, setShowEdit] = useState(false);
    const [showView, setShowView] = useState(false);
    /* =====================================================
       REDUX STATE
    ===================================================== */

    const {
        loading,
        error,
    } = useSelector(
        (state) =>
            state.bankAccount || {}
    );


    const currentBankAccounts =
        bankAccounts || [];


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


    /* =====================================================
       PERMISSION CHECK

       Supports both:

       FLAT:
       {
           moduleName: "Bank Accounts",
           actionName: "EDIT",
           allowed: true
       }

       GROUPED:
       {
           moduleName: "Bank Accounts",
           actions: [
               {
                   actionName: "EDIT",
                   allowed: true
               }
           ]
       }
    ===================================================== */

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
       BANK ACCOUNT PERMISSIONS
    ===================================================== */

    const canViewBankAccount =
        hasPermission(
            "Bank Accounts",
            "VIEW"
        );


    const canEditBankAccount =
        hasPermission(
            "Bank Accounts",
            "EDIT"
        );


    const canDeleteBankAccount =
        hasPermission(
            "Bank Accounts",
            "DELETE"
        );


    /* =====================================================
       DELETE BANK ACCOUNT
    ===================================================== */

    const handleDelete = async (
        id
    ) => {

        /* =================================================
           PERMISSION SAFETY CHECK
        ================================================= */

        if (!canDeleteBankAccount) {

            toast.error(
                "You do not have permission to delete bank accounts."
            );

            return;
        }


        if (
            !window.confirm(
                "Delete this bank account?"
            )
        ) {
            return;
        }


        try {

            await dispatch(
                deleteBankAccount(id)
            ).unwrap();


            toast.success(
                "Bank account deleted successfully"
            );


            dispatch(
                fetchAllBankAccounts()
            );

        } catch (error) {

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    "Failed to delete bank account"
            );

        }

    };


    /* =====================================================
       VIEW BANK ACCOUNT
    ===================================================== */

    const handleView = (
        bankAccount
    ) => {

        /* =================================================
           PERMISSION SAFETY CHECK
        ================================================= */

        if (!canViewBankAccount) {

            toast.error(
                "You do not have permission to view bank accounts."
            );

            return;
        }


        try {

            /*
             * Keep the existing bank account
             * in Redux for the overview/details page.
             */
            dispatch(
                setExsistingBankAccount(
                    bankAccount
                )
            );


            /*
             * If you already have a bank-account
             * overview route, navigate here.
             *
             * Otherwise this can be removed.
             */
            // navigate(`/bank-accounts/view/${bankAccount.id}`);

        } catch (error) {

            toast.error(
                "Failed to open bank account"
            );

        }

    };


    /* =====================================================
       EDIT BANK ACCOUNT
    ===================================================== */

    const handleEdit = (
        bankAccount
    ) => {

        /* =================================================
           PERMISSION SAFETY CHECK
        ================================================= */

        if (!canEditBankAccount) {

            toast.error(
                "You do not have permission to edit bank accounts."
            );

            return;
        }


        try {

            dispatch(
                setExsistingBankAccount(
                    bankAccount
                )
            );


            dispatch(
                openModal({
                    type: "editBankAccount",
                    data: bankAccount,
                })
            );

        } catch (error) {

            toast.error(
                "Failed to open bank account"
            );

        }

    };


    /* =====================================================
       ACCOUNT INITIALS
    ===================================================== */

    const initials = (
        accountName
    ) => {

        if (!accountName) {
            return "BA";
        }


        return accountName
            ?.split(" ")
            .filter(Boolean)
            .map(
                (word) =>
                    word[0]
            )
            .join("")
            .slice(0, 2)
            .toUpperCase() || "BA";

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
       MASK ACCOUNT NUMBER
    ===================================================== */

    const maskAccountNumber = (
        accountNumber
    ) => {

        if (!accountNumber) {
            return "—";
        }


        const value =
            String(accountNumber);


        if (value.length <= 4) {
            return value;
        }


        return (
            "•••• " +
            value.slice(-4)
        );

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
                    Loading bank accounts...
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

    if (!currentBankAccounts.length) {

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

                <Landmark
                    className="
                        mx-auto
                        mb-3
                        h-10
                        w-10
                        text-gray-300
                    "
                />

                <p className="text-gray-500">
                    No bank accounts found.
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
                    <thead className="bg-[#ECE6D5]/90 border-b border-gray-300">

                        <tr>

                            {[
                                "Account",
                                "Bank Name",
                                "Account no",
                                "Type",
                                "Status",
                                "Actions",
                            ].map((header) => (

                                <th
                                    key={header}
                                    className={`
                                    px-5
                                    py-3
                                    font-medium
                                    text-sm
                                    text-[#0F4659]/90
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

                        {[...currentBankAccounts]
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
                                    bankAccount,
                                    index
                                ) => (

                                    <tr
                                        key={
                                            bankAccount.id ||
                                            index
                                        }
                                        className="
                                            border-b
                                            border-gray-100
                                            hover:bg-gray-50
                                            text-sm
                                            cursor-pointer
                                            transition-colors
                                        "
                                    >

                                        {/* =================================
                                            ACCOUNT
                                        ================================= */}

                                        <td
                                            className="
                                                px-2
                                                py-3
                                                overflow-hidden
                                            "
                                        >

                                            <div
                                                className="
                                                    flex
                                                    items-center
                                                    gap-2
                                                    min-w-0
                                                "
                                            >

                                                <div
                                                    className={`
                                                        w-9
                                                        h-9
                                                        min-w-[36px]
                                                        rounded-full
                                                        flex
                                                        items-center
                                                        justify-center
                                                        text-sm
                                                        font-bold
                                                        ${getAvatarColor(
                                                        bankAccount.accountName
                                                    )}
                                                    `}
                                                >

                                                    {
                                                        initials(
                                                            bankAccount.accountName
                                                        )
                                                    }

                                                </div>


                                                <div
                                                    className="
                                                        min-w-0
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            flex
                                                            items-center
                                                            gap-1.5
                                                        "
                                                    >

                                                        <p
                                                            className="
                                                                font-medium
                                                                text-gray-800
                                                                truncate
                                                            "
                                                            title={
                                                                bankAccount.accountName ||
                                                                ""
                                                            }
                                                        >
                                                            {
                                                                bankAccount.accountName ||
                                                                "—"
                                                            }
                                                        </p>


                                                        {bankAccount.primaryAccount && (

                                                            <span
                                                                className="
                                                                    inline-flex
                                                                    items-center
                                                                    gap-1
                                                                    px-1.5
                                                                    py-0.5
                                                                    rounded-full
                                                                    bg-yellow-100
                                                                    text-yellow-700
                                                                    text-[10px]
                                                                    font-medium
                                                                    shrink-0
                                                                "
                                                            >

                                                                <Star
                                                                    size={10}
                                                                    fill="currentColor"
                                                                />

                                                                Primary

                                                            </span>

                                                        )}

                                                    </div>


                                                    <p
                                                        className="
                                                            text-xs
                                                            text-gray-500
                                                        "
                                                    >

                                                        ID: #
                                                        {
                                                            bankAccount.id
                                                        }

                                                    </p>

                                                </div>

                                            </div>

                                        </td>


                                        {/* =================================
                                            BANK
                                        ================================= */}

                                        <td
                                            className="
                                                px-2
                                                py-3
                                                overflow-hidden
                                            "
                                        >

                                            <div
                                                className="
                                                    min-w-0
                                                "
                                            >

                                                <p
                                                    className="
                                                        truncate
                                                        font-medium
                                                        text-gray-700
                                                    "
                                                    title={
                                                        bankAccount.bankName ||
                                                        ""
                                                    }
                                                >
                                                    {
                                                        bankAccount.bankName ||
                                                        "—"
                                                    }
                                                </p>


                                                <p
                                                    className="
                                                        text-xs
                                                        text-gray-500
                                                    "
                                                >
                                                    {
                                                        bankAccount.ifsc ||
                                                        "—"
                                                    }
                                                </p>

                                            </div>

                                        </td>


                                        {/* =================================
                                            ACCOUNT NUMBER
                                        ================================= */}

                                        <td
                                            className="
                                                px-2
                                                py-3
                                                overflow-hidden
                                            "
                                        >

                                            <p
                                                className="
                                                    text-gray-700
                                                    font-medium
                                                    tracking-wide
                                                "
                                                title={
                                                    bankAccount.accountNumber ||
                                                    ""
                                                }
                                            >
                                                {
                                                    maskAccountNumber(
                                                        bankAccount.accountNumber
                                                    )
                                                }
                                            </p>

                                        </td>



                                        {/* =================================
                                            ACCOUNT TYPE
                                        ================================= */}

                                        <td
                                            className="
                                                px-2
                                                py-3
                                                overflow-hidden
                                            "
                                        >

                                            <span
                                                className="
                                                    inline-block
                                                    px-2
                                                    py-1
                                                    rounded-full
                                                    bg-blue-100
                                                    text-blue-700
                                                    text-xs
                                                    font-medium
                                                "
                                            >
                                                {
                                                    bankAccount.accountType ||
                                                    "—"
                                                }
                                            </span>

                                        </td>


                                        {/* =================================
                                            STATUS
                                        ================================= */}

                                        <td
                                            className="
                                                px-2
                                                py-3
                                                overflow-hidden
                                        "
                                        >

                                            <span
                                                className={`
                                                    inline-block
                                                    px-2
                                                    py-1
                                                    rounded-full
                                                    text-xs
                                                    font-medium
                                                    ${statusColor[
                                                    String(
                                                        bankAccount.status ||
                                                        ""
                                                    ).toUpperCase()
                                                    ] ||
                                                    "bg-gray-100 text-gray-700"
                                                    }
                                                `}
                                            >
                                                {
                                                    bankAccount.status ||
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
                                                        dispatch(setExsistingBankAccount(bankAccount));
                                                        navigate(`/bankAccount/view/${bankAccount.id}`);
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
                                                        dispatch(setExsistingBankAccount(bankAccount));
                                                        navigate(`/bankAccount/editSimple/${bankAccount.id}`);

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
                                                        handleDelete(bankAccount.id);
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

                <div
                    className="
                        p-4
                        border-t
                        border-gray-100
                        flex
                        items-center
                        justify-between
                    "
                >

                    <p
                        className="
                            text-sm
                            text-gray-500
                        "
                    >

                        Showing{" "}

                        {
                            currentBankAccounts.length
                        }

                        {" "}of{" "}

                        {
                            currentBankAccounts.length
                        }

                        {" "}bank accounts

                    </p>


                    <div
                        className="
                            flex
                            items-center
                            gap-3
                        "
                    >

                        {/* PREVIOUS */}

                        <button
                            type="button"
                            disabled={true}
                            className="
                            text-sm
                           text-[#0F4659] 
                           hover:text-[#0F4659]/90
                          disabled:cursor-not-allowed
                          disabled:opacity-50"
                        >
                            Previous
                        </button>


                        {/* CURRENT PAGE */}

                        <span
                            className="
                            w-8
                            h-8
                            flex
                            items-center
                            justify-center
                            rounded-lg
                            bg-[#0F4659]
                            text-white
                            text-sm
                            font-medium
                            "
                        >
                            1
                        </span>


                        {/* NEXT */}

                        <button
                            type="button"
                            disabled={true}
                            className="
                            text-sm
                            text-[#0F4659]
                            hover:text-[#0F4659]/90
                             disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >
                            Next
                        </button>

                    </div>

                </div>

            </div>

        </div >

    );

}
