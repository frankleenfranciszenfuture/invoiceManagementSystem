import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
    fetchAllUsers,
    deleteUser,
} from "../thunks/userThunks";

import {
    setExsistingUser,
} from "../slices/userSlice";

import { openModal } from "../../ui/uiSlice";

import {
    ChevronDown,
    Edit,
    Trash2,
    UserRound,
} from "lucide-react";

import toast from "react-hot-toast";

export default function UserTable({
    users = [],
}) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    /* =====================================================
       REDUX STATE
    ===================================================== */

    const {
        loading,
        error,
        pagination = {},
    } = useSelector(
        (state) => state.user || {}
    );

    const {
        search = "",
    } = useSelector(
        (state) => state.userView || {}
    );

    const currentUsers = users || [];

    const {
        pageNumber = 0,
        pageSize = 10,
        totalElements = currentUsers.length,
        totalPages = 1,
        last = true,
    } = pagination;

    /* =====================================================
       DELETE USER
    ===================================================== */

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this user?")) {
            return;
        }

        try {
            await dispatch(
                deleteUser(id)
            ).unwrap();

            toast.success(
                "User deleted successfully"
            );

            dispatch(
                fetchAllUsers({
                    page: pageNumber,
                    size: pageSize,
                    search,
                })
            );
        } catch (error) {
            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    "Failed to delete user"
            );
        }
    };

    /* =====================================================
       EDIT USER
    ===================================================== */

    const handleEdit = (user) => {
        try {
            dispatch(
                setExsistingUser(user)
            );

            dispatch(
                openModal({
                    type: "editUser",
                    data: user,
                })
            );
        } catch (error) {
            toast.error(
                "Failed to open user"
            );
        }
    };

    /* =====================================================
       VIEW USER
    ===================================================== */

    const handleView = (user) => {
        try {
            dispatch(
                setExsistingUser(user)
            );

            navigate(
                `/users/view/${user.id}`
            );
        } catch (error) {
            toast.error(
                "Failed to open user"
            );
        }
    };

    /* =====================================================
       USER INITIALS
    ===================================================== */

    const initials = (name) => {
        if (!name) {
            return "US";
        }

        return name
            .trim()
            .split(/\s+/)
            .map(
                (word) => word[0]
            )
            .join("")
            .slice(0, 2)
            .toUpperCase();
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
       ACCOUNT VERIFIED
    ===================================================== */

    const getVerificationColor = (
        verified
    ) => {
        return verified
            ? "bg-green-100 text-green-700"
            : "bg-yellow-100 text-yellow-700";
    };

    /* =====================================================
       PAGINATION
    ===================================================== */

    const handlePrevious = () => {
        if (pageNumber <= 0) {
            return;
        }

        dispatch(
            fetchAllUsers({
                page: pageNumber - 1,
                size: pageSize,
                search,
            })
        );
    };

    const handleNext = () => {
        if (
            last ||
            pageNumber >= totalPages - 1
        ) {
            return;
        }

        dispatch(
            fetchAllUsers({
                page: pageNumber + 1,
                size: pageSize,
                search,
            })
        );
    };

    /* =====================================================
       SHOWING RANGE
    ===================================================== */

    const showingFrom =
        totalElements === 0
            ? 0
            : pageNumber * pageSize + 1;

    const showingTo =
        Math.min(
            (pageNumber + 1) * pageSize,
            totalElements
        );

    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {
        return (
            <div className="flex items-center justify-center py-10">
                <p className="text-sm text-gray-500">
                    Loading users...
                </p>
            </div>
        );
    }

    /* =====================================================
       ERROR
    ===================================================== */

    if (error) {
        return (
            <div className="rounded-xl border border-red-200 bg-white p-8 text-center">
                <p className="text-sm text-red-500">
                    {error}
                </p>
            </div>
        );
    }

    /* =====================================================
       EMPTY STATE
    ===================================================== */

    if (!currentUsers.length) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
                <UserRound className="mx-auto mb-3 h-10 w-10 text-gray-300" />

                <p className="text-sm text-gray-500">
                    No users found.
                </p>
            </div>
        );
    }

    /* =====================================================
       TABLE
    ===================================================== */

    return (
        <div className="w-full overflow-visible rounded-xl border border-gray-200 bg-white">

            {/* =================================================
                TABLE
            ================================================= */}

            <div className="w-full overflow-visible">

                <table className="w-full table-fixed border-collapse">

                    {/* =================================================
                        TABLE HEADER
                    ================================================= */}

                    <thead className="border-b border-gray-300 bg-gray-100">
                        <tr>

                            {/* USER */}

                            <th
                                className="
                                    w-[28%]
                                    px-2
                                    py-3
                                    text-left
                                    text-sm
                                    font-medium
                                    uppercase
                                    text-gray-600
                                "
                            >
                                User
                            </th>

                            {/* EMAIL */}

                            <th
                                className="
                                    w-[25%]
                                    px-2
                                    py-3
                                    text-left
                                    text-sm
                                    font-medium
                                    uppercase
                                    text-gray-600
                                "
                            >
                                Email
                            </th>

                            {/* ROLE */}

                            <th
                                className="
                                    w-[15%]
                                    px-2
                                    py-3
                                    text-left
                                    text-sm
                                    font-medium
                                    uppercase
                                    text-gray-600
                                "
                            >
                                Role
                            </th>

                            {/* STATUS */}

                            <th
                                className="
                                    w-[12%]
                                    px-2
                                    py-3
                                    text-left
                                    text-sm
                                    font-medium
                                    uppercase
                                    text-gray-600
                                "
                            >
                                Status
                            </th>

                            {/* VERIFIED */}

                            <th
                                className="
                                    w-[10%]
                                    px-2
                                    py-3
                                    text-left
                                    text-sm
                                    font-medium
                                    uppercase
                                    text-gray-600
                                "
                            >
                                Verified
                            </th>

                            {/* ACTIONS */}

                            <th
                                className="
                                    w-[10%]
                                    px-2
                                    py-3
                                    text-right
                                    text-sm
                                    font-medium
                                    uppercase
                                    text-gray-600
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
                        {currentUsers.map(
                            (
                                user,
                                index
                            ) => (
                                <tr
                                    key={
                                        user.id ||
                                        index
                                    }
                                    onClick={() =>
                                        handleView(user)
                                    }
                                    className="
                                        cursor-pointer
                                        border-b
                                        border-gray-100
                                        text-sm
                                        transition-colors
                                        hover:bg-gray-50
                                    "
                                >

                                    {/* =================================
                                        USER
                                    ================================= */}

                                    <td className="overflow-hidden px-2 py-3">
                                        <div className="flex min-w-0 items-center gap-2">

                                            {/* AVATAR */}

                                            <div
                                                className={`
                                                    flex
                                                    h-9
                                                    w-9
                                                    min-w-[36px]
                                                    items-center
                                                    justify-center
                                                    rounded-full
                                                    text-sm
                                                    font-bold
                                                    ${getAvatarColor(
                                                    user.name
                                                )}
                                                `}
                                            >
                                                {initials(
                                                    user.name
                                                )}
                                            </div>

                                            {/* NAME */}

                                            <div className="min-w-0">
                                                <p
                                                    className="
                                                        truncate
                                                        font-medium
                                                        text-gray-800
                                                    "
                                                    title={
                                                        user.name ||
                                                        ""
                                                    }
                                                >
                                                    {user.name ||
                                                        "—"}
                                                </p>

                                                <p
                                                    className="
                                                        truncate
                                                        text-xs
                                                        text-gray-500
                                                    "
                                                    title={
                                                        user.userId ||
                                                        ""
                                                    }
                                                >
                                                    ID: #
                                                    {user.id ??
                                                        "—"}
                                                </p>
                                            </div>

                                        </div>
                                    </td>

                                    {/* =================================
                                        EMAIL
                                    ================================= */}

                                    <td className="overflow-hidden px-2 py-3">
                                        <p
                                            className="truncate text-gray-700"
                                            title={
                                                user.email ||
                                                ""
                                            }
                                        >
                                            {user.email ||
                                                "—"}
                                        </p>
                                    </td>

                                    {/* =================================
                                        ROLE
                                    ================================= */}

                                    <td className="overflow-hidden px-2 py-3">
                                        <span
                                            className="
                                                inline-block
                                                max-w-full
                                                truncate
                                                rounded-full
                                                bg-purple-100
                                                px-2
                                                py-1
                                                text-xs
                                                font-medium
                                                text-purple-700
                                            "
                                            title={
                                                user.role ||
                                                ""
                                            }
                                        >
                                            {user.role ||
                                                "—"}
                                        </span>
                                    </td>

                                    {/* =================================
                                        STATUS
                                    ================================= */}

                                    <td className="overflow-hidden px-2 py-3">
                                        <span
                                            className={`
                                                inline-block
                                                rounded-full
                                                px-2
                                                py-1
                                                text-xs
                                                font-medium
                                                ${statusColor[
                                                String(
                                                    user.status ||
                                                    ""
                                                ).toUpperCase()
                                                ] ||
                                                "bg-gray-100 text-gray-700"
                                                }
                                            `}
                                        >
                                            {user.status ||
                                                "—"}
                                        </span>
                                    </td>

                                    {/* =================================
                                        VERIFIED
                                    ================================= */}

                                    <td className="overflow-hidden px-2 py-3">
                                        <span
                                            className={`
                                                inline-block
                                                rounded-full
                                                px-2
                                                py-1
                                                text-xs
                                                font-medium
                                                ${getVerificationColor(
                                                user.accountVerified
                                            )}
                                            `}
                                        >
                                            {user.accountVerified
                                                ? "Yes"
                                                : "No"}
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
                                        <div className="flex justify-end">

                                            <div className="group relative inline-block">

                                                {/* ACTION BUTTON */}

                                                <button
                                                    type="button"
                                                    className="
                                                        rounded-full
                                                        bg-blue-500
                                                        p-1
                                                        text-white
                                                        transition-colors
                                                        hover:bg-blue-600
                                                    "
                                                >
                                                    <ChevronDown
                                                        size={16}
                                                    />
                                                </button>

                                                {/* ACTION MENU */}

                                                <div
                                                    className="
                                                        invisible
                                                        absolute
                                                        right-0
                                                        top-full
                                                        z-[9999]
                                                        mt-1
                                                        opacity-0
                                                        transition-all
                                                        duration-150
                                                        group-hover:visible
                                                        group-hover:opacity-100
                                                    "
                                                >
                                                    <div
                                                        className="
                                                            w-36
                                                            overflow-hidden
                                                            rounded-md
                                                            bg-blue-500
                                                            shadow-lg
                                                        "
                                                    >

                                                        {/* EDIT */}

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleEdit(
                                                                    user
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
                                                                transition-colors
                                                                hover:bg-blue-600
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
                                                                    user.id
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
                                                                transition-colors
                                                                hover:bg-red-600
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
                        flex
                        items-center
                        justify-between
                        border-t
                        border-gray-100
                        p-4
                    "
                >

                    {/* SHOWING */}

                    <p className="text-sm text-gray-500">
                        Showing{" "}
                        <span className="font-medium text-gray-700">
                            {showingFrom}
                        </span>{" "}
                        to{" "}
                        <span className="font-medium text-gray-700">
                            {showingTo}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-gray-700">
                            {totalElements}
                        </span>{" "}
                        users
                    </p>

                    {/* PAGINATION BUTTONS */}

                    <div className="flex items-center gap-3">

                        {/* PREVIOUS */}

                        <button
                            type="button"
                            onClick={
                                handlePrevious
                            }
                            disabled={
                                pageNumber <= 0 ||
                                loading
                            }
                            className="
                                text-sm
                                text-gray-500
                                transition-colors
                                hover:text-gray-700
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >
                            Previous
                        </button>

                        {/* CURRENT PAGE */}

                        <span
                            className="
                                flex
                                h-8
                                w-8
                                items-center
                                justify-center
                                rounded-lg
                                bg-blue-500
                                text-sm
                                font-medium
                                text-white
                            "
                        >
                            {pageNumber + 1}
                        </span>

                        {/* NEXT */}

                        <button
                            type="button"
                            onClick={
                                handleNext
                            }
                            disabled={
                                last ||
                                loading ||
                                totalPages <= 1
                            }
                            className="
                                text-sm
                                text-gray-500
                                transition-colors
                                hover:text-gray-700
                                disabled:cursor-not-allowed
                                disabled:opacity-50
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