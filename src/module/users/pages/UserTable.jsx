
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
                setExsistingUser(
                    user
                )
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
                setExsistingUser(
                    user
                )
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
                (word) =>
                    word[0]
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

        if (last || pageNumber >= totalPages - 1) {
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

            <div
                className="
                    flex
                    items-center
                    justify-center
                    py-10
                "
            >

                <p className="text-gray-500">
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

    if (!currentUsers.length) {

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

                <UserRound
                    className="
                        mx-auto
                        mb-3
                        h-10
                        w-10
                        text-gray-300
                    "
                />

                <p className="text-gray-500">
                    No users found.
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

                            {/* USER */}

                            <th
                                className="
                                    w-[28%]
                                    px-2
                                    py-3
                                    font-medium
                                    text-sm
                                    text-gray-600
                                    uppercase
                                    text-left
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
                                    font-medium
                                    text-sm
                                    text-gray-600
                                    uppercase
                                    text-left
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
                                    font-medium
                                    text-sm
                                    text-gray-600
                                    uppercase
                                    text-left
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
                                    font-medium
                                    text-sm
                                    text-gray-600
                                    uppercase
                                    text-left
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
                                    font-medium
                                    text-sm
                                    text-gray-600
                                    uppercase
                                    text-left
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
                                        handleView(
                                            user
                                        )
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
                                        USER
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
w - 9
h - 9
min - w - [36px]
rounded - full
flex
items - center
justify - center
text - sm
font - bold
                                                    ${getAvatarColor(
                                                    user.name
                                                )
                                                    }
`}
                                            >

                                                {
                                                    initials(
                                                        user.name
                                                    )
                                                }

                                            </div>

                                            {/* NAME */}

                                            <div
                                                className="
                                                    min-w-0
                                                "
                                            >

                                                <p
                                                    className="
                                                        font-medium
                                                        text-gray-800
                                                        truncate
                                                    "
                                                    title={
                                                        user.name ||
                                                        ""
                                                    }
                                                >
                                                    {
                                                        user.name ||
                                                        "—"
                                                    }
                                                </p>

                                                <p
                                                    className="
                                                        text-xs
                                                        text-gray-500
                                                        truncate
                                                    "
                                                    title={
                                                        user.userId ||
                                                        ""
                                                    }
                                                >
                                                    ID: #
                                                    {
                                                        user.id ??
                                                        "—"
                                                    }
                                                </p>

                                            </div>

                                        </div>

                                    </td>

                                    {/* =================================
                                        EMAIL
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
                                                truncate
                                                text-gray-700
                                            "
                                            title={
                                                user.email ||
                                                ""
                                            }
                                        >
                                            {
                                                user.email ||
                                                "—"
                                            }
                                        </p>

                                    </td>

                                    {/* =================================
                                        ROLE
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
                                                max-w-full
                                                truncate
                                                px-2
                                                py-1
                                                rounded-full
                                                text-xs
                                                font-medium
                                                bg-purple-100
                                                text-purple-700
                                            "
                                            title={
                                                user.role ||
                                                ""
                                            }
                                        >
                                            {
                                                user.role ||
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
inline - block
px - 2
py - 1
rounded - full
text - xs
font - medium
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
                                            {
                                                user.status ||
                                                "—"
                                            }
                                        </span>

                                    </td>

                                    {/* =================================
                                        VERIFIED
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
inline - block
px - 2
py - 1
rounded - full
text - xs
font - medium
                                                ${getVerificationColor(
                                                user.accountVerified
                                            )
                                                }
`}
                                        >

                                            {
                                                user.accountVerified
                                                    ? "Yes"
                                                    : "No"
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

                    {/* SHOWING */}

                    <p
                        className="
                            text-sm
                            text-gray-500
                        "
                    >

                        Showing{" "}

                        <span className="font-medium text-gray-700">
                            {showingFrom}
                        </span>

                        {" "}to{" "}

                        <span className="font-medium text-gray-700">
                            {showingTo}
                        </span>

                        {" "}of{" "}

                        <span className="font-medium text-gray-700">
                            {totalElements}
                        </span>

                        {" "}users

                    </p>

                    {/* PAGINATION BUTTONS */}

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
                                hover:text-gray-700
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
                                hover:text-gray-700
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
