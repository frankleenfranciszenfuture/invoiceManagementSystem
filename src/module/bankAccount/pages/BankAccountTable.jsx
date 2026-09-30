import React from "react";
import { useDispatch, useSelector } from "react-redux";

import {
    fetchAllBankAccounts,
    deleteBankAccount,
} from "../thunks/bankAccountThunks";

import {
    setExsistingBankAccount,
} from "../slices/bankAccountSlice";

import { openModal } from "../../ui/uiSlice";

import {
    ChevronDown,
    Edit,
    Trash2,
    Landmark,
    Star,
} from "lucide-react";

import toast from "react-hot-toast";

export default function BankAccountTable({
    bankAccounts = [],
}) {

    const dispatch = useDispatch();

    /* =====================================================
       REDUX STATE
    ===================================================== */

    const {
        loading,
        error,
    } = useSelector(
        (state) => state.bankAccount || {}
    );

    const currentBankAccounts =
        bankAccounts || [];

    /* =====================================================
       DELETE BANK ACCOUNT
    ===================================================== */

    const handleDelete = async (id) => {

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
       EDIT BANK ACCOUNT
    ===================================================== */

    const handleEdit = (bankAccount) => {

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

        return accountName
            ?.split(" ")
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

        <div
            className="
                bg-white
                rounded-xl
                border
                border-gray-200
                overflow-visible
                w-full
            "
        >

            {/* =================================================
                TABLE CONTAINER
            ================================================= */}

            <div
                className="
                    w-full
                    overflow-visible
                "
            >

                <table
                    className="
                        w-full
                        table-fixed
                        border-collapse
                    "
                >

                    {/* =================================================
                        TABLE HEADER
                    ================================================= */}

                    <thead
                        className="
                            bg-gray-100
                            border-b
                            border-gray-300
                        "
                    >

                        <tr>

                            {/* ACCOUNT */}

                            <th
                                className="
                                    w-[25%]
                                    px-2
                                    py-3
                                    font-medium
                                    text-sm
                                    text-gray-600
                                    uppercase
                                    text-left
                                "
                            >
                                Account
                            </th>

                            {/* BANK */}

                            <th
                                className="
                                    w-[20%]
                                    px-2
                                    py-3
                                    font-medium
                                    text-sm
                                    text-gray-600
                                    uppercase
                                    text-left
                                "
                            >
                                Bank
                            </th>

                            {/* ACCOUNT NUMBER */}

                            <th
                                className="
                                    w-[20%]
                                    px-2
                                    py-3
                                    font-medium
                                    text-sm
                                    text-gray-600
                                    uppercase
                                    text-left
                                "
                            >
                                Account Number
                            </th>

                            {/* TYPE */}

                            <th
                                className="
                                    w-[12%]
                                    px-2
                                    py-3
                                    font-medium
                                    text-sm
                                    text-gray-600
                                    uppercase
                                    text-left
                                "
                            >
                                Type
                            </th>

                            {/* STATUS */}

                            <th
                                className="
                                    w-[13%]
                                    px-2
                                    py-3
                                    font-medium
                                    text-sm
                                    text-gray-600
                                    uppercase
                                    text-left
                                "
                            >
                                Status
                            </th>

                            {/* ACTIONS */}

                            <th
                                className="
                                    w-[10%]
                                    px-2
                                    py-3
                                    font-medium
                                    text-sm
                                    text-gray-600
                                    uppercase
                                    text-right
                                "
                            >
                                Actions
                            </th>

                        </tr>

                    </thead>

                    {/* =================================================
                        TABLE BODY
                    ================================================= */}

                    <tbody>

                        {[...currentBankAccounts]
                            .sort(
                                (a, b) =>
                                    (a.id || 0) -
                                    (b.id || 0)
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

                                                {/* AVATAR */}

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

                                                {/* NAME */}

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

                                                        {/* PRIMARY */}

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

                                        <td
                                            className="
                                                relative
                                                overflow-visible
                                                px-2
                                                py-3
                                            "
                                            onClick={(e) =>
                                                e.stopPropagation()
                                            }
                                        >

                                            <div
                                                className="
                                                    flex
                                                    justify-end
                                                "
                                            >

                                                <div
                                                    className="
                                                        relative
                                                        group
                                                        inline-block
                                                    "
                                                >

                                                    {/* ACTION BUTTON */}

                                                    <button
                                                        type="button"
                                                        className="
                                                            p-1
                                                            rounded-full
                                                            bg-blue-500
                                                            text-white
                                                            hover:bg-blue-600
                                                            transition-colors
                                                        "
                                                    >

                                                        <ChevronDown
                                                            size={16}
                                                        />

                                                    </button>

                                                    {/* =========================
                                                        ACTION MENU
                                                    ========================= */}

                                                    <div
                                                        className="
                                                            absolute
                                                            right-0
                                                            top-full
                                                            mt-1
                                                            z-[9999]
                                                            opacity-0
                                                            invisible
                                                            group-hover:opacity-100
                                                            group-hover:visible
                                                            transition-all
                                                            duration-150
                                                        "
                                                    >

                                                        <div
                                                            className="
                                                                w-36
                                                                rounded-md
                                                                bg-blue-500
                                                                shadow-lg
                                                                overflow-hidden
                                                            "
                                                        >

                                                            {/* EDIT */}

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        bankAccount
                                                                    )
                                                                }
                                                                className="
                                                                    flex
                                                                    w-full
                                                                    items-center
                                                                    gap-2
                                                                    px-4
                                                                    py-2
                                                                    text-sm
                                                                    text-white
                                                                    hover:bg-blue-600
                                                                    transition-colors
                                                                "
                                                            >

                                                                <Edit
                                                                    size={16}
                                                                />

                                                                Edit

                                                            </button>

                                                            {/* DELETE */}

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        bankAccount.id
                                                                    )
                                                                }
                                                                className="
                                                                    flex
                                                                    w-full
                                                                    items-center
                                                                    gap-2
                                                                    px-4
                                                                    py-2
                                                                    text-sm
                                                                    text-white
                                                                    hover:bg-red-600
                                                                    transition-colors
                                                                "
                                                            >

                                                                <Trash2
                                                                    size={16}
                                                                />

                                                                Delete

                                                            </button>

                                                        </div>

                                                    </div>

                                                </div>

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

                        {currentBankAccounts.length}

                        {" "}of{" "}

                        {currentBankAccounts.length}

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
                                text-gray-400
                                hover:text-gray-600
                                disabled:opacity-50
                                disabled:cursor-not-allowed
                            "
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
                                bg-blue-500
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
                                text-gray-400
                                hover:text-gray-600
                                disabled:opacity-50
                                disabled:cursor-not-allowed
                            "
                        >
                            Next
                        </button>

                    </div>

                </div>

            </div>

        </div>

    );
}